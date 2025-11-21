# Migración a Prisma + SQLite

## Resumen Ejecutivo

Se ha migrado la aplicación contable-app de un almacenamiento basado en JSON (`data/db.json`) a **Prisma ORM + SQLite** para mejorar:

- **Robustez**: Evita race conditions y corrupción de datos al escribir desde múltiples procesos (servidor HTTP + worker).
- **Escalabilidad**: SQLite es más performante que JSON para queries y permite índices.
- **Mantenibilidad**: Prisma proporciona type-safety y migraciones automáticas.
- **Concurrencia**: El worker BullMQ puede ejecutarse sin bloquear el servidor HTTP.

## Cambios Realizados

### 1. Instalación de Dependencias

```bash
npm install @prisma/client prisma --save-dev
```

### 2. Esquema Prisma

Se creó `prisma/schema.prisma` con las tablas:

- **Socio**: Miembros de la asociación (id, numero, nombre, email, telefono, estado, createdAt, updatedAt)
- **CuotaConfig**: Configuración mensual de cuotas (mes, año, cuotaBienestar, cuotaOrdinaria, cuotaSocioAFUT)
- **Descuento**: Descuentos por socio/mes/año
- **Credito**: Créditos de socios
- **Pago**: Pagos registrados
- **Recibo**: Recibos generados
- **Transaccion**: Ingresos/egresos
- **SentEmail**: Historial de boletas enviadas por email

Cada tabla tiene índices apropiados para optimizar queries comunes.

### 3. Capa de Base de Datos (`src/lib/prisma-db.ts`)

Nueva capa que:
- Expone un singleton de Prisma Client
- Implementa `getDb()` que retorna un objeto con estructura compatible con el código existente
- Proporciona helpers para operaciones CRUD (createSocio, updateSentEmail, etc.)
- Mapea nombres antiguos (credits → creditos, discounts → descuentos) para compatibilidad

### 4. Actualización de `src/lib/db.ts`

Ahora es un wrapper que re-exporta desde `prisma-db.ts`, manteniendo la interfaz compatible para no romper código existente.

### 5. Endpoints Migrrados a Prisma

- `/api/socios/enviar-boletas-mes` — Usa Prisma para obtener socios, descuentos y crear registros SentEmail
- `/api/socios/sent-emails` — Obtiene historial de envíos desde BD
- `/api/socios/sent-emails/export` — Exporta CSV desde Prisma
- `/api/socios/retry-failed-boletas` — Reintentos usando Prisma
- `src/worker/bull-worker.ts` — Worker refactorizado para usar Prisma

### 6. Configuración

#### Prisma/.env.local

```
DATABASE_URL="file:./dev.db"
```

#### .env.local (raíz)

```
DATABASE_URL="file:./prisma/dev.db"
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### 7. Inicialización de la BD

```bash
DATABASE_URL="file:./prisma/dev.db" npx prisma generate
DATABASE_URL="file:./prisma/dev.db" npx prisma migrate dev --name init
```

Se creó el archivo `prisma/dev.db` (SQLite).

## Ventajas

### Eliminación de Race Conditions

**Antes (JSON):**
```
Server HTTP  ──► write data/db.json ◄── Worker
   └─ Posible corrupción si escribe simultáneamente
```

**Ahora (SQLite/Prisma):**
```
Server HTTP  ──► SQLite (ACID transactions) ◄── Worker
   └─ Transacciones atómicas, sin corrupción
```

### Performance

- **Queries filtradas**: `prisma.descuento.findMany({ where: { socioId, mes, año } })` es más rápido que filtrar JSON en memoria.
- **Índices**: Queries por (socioId, mes, año) son O(log N) en lugar de O(N).

### Escalabilidad

- **Múltiples workers**: Pueden coexistir sin problemas.
- **Backup y restore**: SQLite permite backups simples (`cp prisma/dev.db backup.db`).
- **Migración futura a PostgreSQL**: Cambiar `prisma/schema.prisma` y migrations de provider a PostgreSQL es trivial.

## Scripts Agregados

En `package.json`:

```json
{
  "scripts": {
    "dev:worker": "npx ts-node-esm src/worker/bull-worker.ts",
    "worker": "node ./dist/worker/bull-worker.js"
  }
}
```

### Uso

**Desarrollo:**
```bash
# Terminal 1
npm run dev

# Terminal 2 (en otro terminal)
npm run dev:worker
```

**Producción:**
```bash
npm run build
npm start    # servidor HTTP
npm run worker & # worker en background
```

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `package.json` | Añadidos scripts dev:worker, worker; dependencias prisma |
| `prisma/schema.prisma` | Creado esquema Prisma completo |
| `prisma/.env.local` | DATABASE_URL para Prisma |
| `.env.local` | Añadida DATABASE_URL y Redis config |
| `src/lib/db.ts` | Refactorizado para usar Prisma |
| `src/lib/prisma-db.ts` | Nuevo archivo con capa Prisma |
| `src/lib/queue.ts` | Corregido import de bullmq |
| `src/worker/bull-worker.ts` | Actualizado para usar Prisma |
| `src/app/api/socios/enviar-boletas-mes/route.ts` | Usa Prisma |
| `src/app/api/socios/sent-emails/route.ts` | Usa Prisma |
| `src/app/api/socios/sent-emails/export/route.ts` | Usa Prisma |
| `src/app/api/socios/retry-failed-boletas/route.ts` | Usa Prisma |
| `EMAIL_SETUP.md` | Añadidas instrucciones de worker y Redis |

## Migración de Datos Existentes (Futuro)

Si tienes `data/db.json` con datos existentes, se puede importar a Prisma:

```javascript
// script para importar (no incluido, crear si es necesario)
import { readFileSync } from 'fs';
import { prisma } from './src/lib/prisma-db';

const db = JSON.parse(readFileSync('data/db.json', 'utf8'));

// Insertar socios
for (const socio of db.socios || []) {
  await prisma.socio.create({ data: socio });
}

// Insertar descuentos, etc.
```

## Testing

Los endpoints existentes siguen funcionando sin cambios en el cliente. Valida:

1. **Crear socio**: `POST /api/socios` debe insertar en SQLite
2. **Enviar boleta**: `POST /api/socios/1/enviar-boleta` debe registrar en `sentEmails`
3. **Historial**: `GET /api/socios/sent-emails` debe retornar desde Prisma
4. **Worker**: `npm run dev:worker` debe procesar jobs de Redis sin errores

## Próximos Pasos

1. **Rate limiting SMTP**: Añadir throttling en worker para respetar límites del proveedor email.
2. **Caching de reportes**: Cachear resultados por (mes, año) con invalidación al escribir transacciones.
3. **Monitoreo**: Métricas de jobs procesados, fallos, latencia con Sentry o Prometheus.
4. **Autenticación**: Proteger endpoints administrativos con JWT/OAuth.
5. **Persistencia de PDFs**: Guardar PDFs generados en S3 o storage local para descargas posteriores.

## Referencias

- [Prisma Docs](https://www.prisma.io/docs/)
- [SQLite Limits](https://www.sqlite.org/limits.html) (~1GB recomendado; si crece más, migrar a PostgreSQL)
- [BullMQ Redis Docs](https://docs.bullmq.io/)
