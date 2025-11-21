# Guía de Optimización y Rendimiento

## Estado Actual

✅ **Implementado:**
- Prisma + SQLite (elimina race conditions)
- BullMQ + Redis (cola de trabajos asincrónica)
- Worker separado (no bloquea servidor HTTP)
- Scripts de ejecución (dev:worker, worker)
- Compatibilidad con código existente

## Principales Cuellos de Botella y Soluciones

### 1. **SMTP Throttling (CRÍTICO)**

**Problema:** Si envías 100+ boletas simultáneamente, es posible que el proveedor SMTP (Gmail, etc.) rechace o ralentice las conexiones.

**Solución:**
```typescript
// src/lib/email.ts - Añadir rate limiter
import pLimit from 'p-limit';

const emailLimit = pLimit(5); // máximo 5 emails en paralelo

export async function enviarBoletasConLimite(emails: Array<{ email: string; pdf: Buffer }>) {
  return Promise.all(emails.map(e => emailLimit(() => enviarBoleta(e.email, e.pdf))));
}
```

O usar la opción de BullMQ:
```typescript
// src/lib/queue.ts
export async function enqueueBoleta(jobData: any) {
  return boletasQueue.add('enviar-boleta', jobData, {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    delay: Math.random() * 2000, // Stagger jobs
    removeOnComplete: true,
  });
}
```

### 2. **Reportes Pesados (Cache)**

**Problema:** Calcular reportes mensuales/anuales escanea toda la tabla de transacciones.

**Solución - Caché en memoria:**
```typescript
// src/lib/cache-reports.ts
const reportCache = new Map<string, { data: any; timestamp: number }>();

export function getCachedReport(key: string, maxAgeMs = 60000) {
  const cached = reportCache.get(key);
  if (cached && Date.now() - cached.timestamp < maxAgeMs) {
    return cached.data;
  }
  return null;
}

export function setCachedReport(key: string, data: any) {
  reportCache.set(key, { data, timestamp: Date.now() });
}

export function invalidateReportCache(mes?: number, año?: number) {
  // Invalidar cache al guardar transacciones
  for (const [key] of reportCache) {
    if (!mes || key.includes(`${mes}:${año}`)) reportCache.delete(key);
  }
}
```

Usarlo en endpoints de reportes:
```typescript
export async function GET(request: NextRequest) {
  const mes = ...;
  const año = ...;
  const cacheKey = `report:mensual:${mes}:${año}`;

  let data = getCachedReport(cacheKey);
  if (!data) {
    data = await prisma.transaccion.groupBy(...); // query pesada
    setCachedReport(cacheKey, data);
  }
  return NextResponse.json(data);
}
```

### 3. **Paginación de Resultados Grandes**

**Problema:** Endpoints como `/api/socios/sent-emails` retornan todo el historial (puede ser 10k+ registros).

**Solución:**
```typescript
export async function GET(request: NextRequest) {
  const page = Number(request.nextUrl.searchParams.get('page') || 1);
  const pageSize = 50;

  const sent = await prisma.sentEmail.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.sentEmail.count();

  return NextResponse.json({
    ok: true,
    sent,
    pagination: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
  });
}
```

Frontend:
```typescript
const [page, setPage] = useState(1);
const res = await fetch(`/api/socios/sent-emails?page=${page}`);
```

### 4. **Compresión de Respuestas HTTP**

Asegurar que Next.js comprime respuestas grandes. En `next.config.mjs`:
```javascript
export default {
  compress: true,
};
```

### 5. **Índices de Base de Datos**

El schema de Prisma ya incluye índices clave. Verificar con:
```bash
npx prisma studio
```

Si necesitas índices adicionales:
```prisma
model Transaccion {
  // ...
  @@index([tipo, mes, año])  // para reportes rápidos
  @@index([categoria])        // para filtros
}
```

## Monitoreo Recomendado

### Opción A: Sentry (Simple, Freemium)
```bash
npm install @sentry/nextjs
```

```javascript
// next.config.mjs
import * as Sentry from "@sentry/nextjs";

export default Sentry.withSentryConfig({}, {
  org: "tu-org",
  project: "tu-proyecto",
});
```

### Opción B: Prometheus + Grafana (Self-hosted)
```typescript
// src/lib/metrics.ts
export const jobCounter = new Counter({
  name: 'boleta_jobs_total',
  help: 'Total de jobs de boleta procesados',
  labelNames: ['status'],
});

export const jobDuration = new Histogram({
  name: 'boleta_job_duration_seconds',
  help: 'Duración de procesamiento de jobs',
});
```

## Recomendaciones Finales (por impacto/esfuerzo)

| Mejora | Impacto | Esfuerzo | Prioridad |
|--------|---------|----------|-----------|
| **SMTP Rate Limiting** | Alto | Bajo | 🔴 **AHORA** |
| **Caché de Reportes** | Alto | Medio | 🟡 Pronto |
| **Paginación** | Medio | Bajo | 🟡 Pronto |
| **Monitoreo Sentry** | Medio | Bajo | 🟢 Después |
| **PostgreSQL (si crece a >1GB)** | Medio | Alto | 🟢 Futuro |
| **Autenticación** | Alto | Medio | 🟢 Futuro |
| **Storage S3 para PDFs** | Bajo | Alto | 🟢 Futuro |

## Comando de Producción Recomendado

```bash
#!/bin/bash
# start-production.sh

# Compilar
npm run build

# Iniciar servidor HTTP (puerto 3000)
NODE_ENV=production node .next/standalone/server.js &

# Iniciar worker (procesa jobs de Redis)
NODE_ENV=production node ./dist/worker/bull-worker.js &

wait
```

O con PM2:
```bash
pm2 start 'npm start' --name app
pm2 start 'npm run worker' --name worker
pm2 save
pm2 startup
```

## Validación Post-Migración

```bash
# 1. Verificar BD
DATABASE_URL="file:./prisma/dev.db" npx prisma studio

# 2. Verificar compilación
npm run build

# 3. Probar en desarrollo
npm run dev    # Terminal 1
npm run dev:worker  # Terminal 2

# 4. Test de endpoints
curl http://localhost:3000/api/socios
curl -X POST http://localhost:3000/api/socios/1/enviar-boleta \
  -H "Content-Type: application/json" \
  -d '{"mes": 11, "año": 2025, "email": "test@example.com"}'
```

---

**Resultado final:** Aplicación robusta, sin race conditions, lista para producción con worker asincrónico.
