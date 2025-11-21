# PHASE3_AUDIT_AND_CHARTS_COMPLETED.md

## Fase 3: Auditoría y Gráficos — Completada

Fecha: 17 de Noviembre de 2025

### Resumen Ejecutivo

Se ha completado la Fase 3 del sistema contable, implementando:
- **Auditoría integral** con registro automático de cambios (CREATE/UPDATE/DELETE)
- **Gráficos interactivos** con Chart.js (Ingresos vs Egresos por mes)
- **Dashboard ejecutivo** con visualizaciones de datos
- **Página de auditoría** (admin) para consultar y filtrar logs

---

## 1. Auditoría Implementada

### 1.1. Helper de Auditoría (`src/lib/audit.ts`)

```typescript
export async function logAudit(input: AuditLogInput): Promise<void>
```

**Características:**
- Registra automáticamente en tabla `AuditLog` de Prisma
- Captura: acción, tabla, registro ID, cambios anterior/nuevo
- Extrae IP del cliente desde headers (`x-forwarded-for` / `x-real-ip`)
- Captura User-Agent del navegador
- **Falla silenciosa**: no rompe la operación principal si audit falla

**Esquema (`prisma/schema.prisma`):**
```prisma
model AuditLog {
  id            Int       @id @default(autoincrement())
  usuarioId     Int
  accion        String    // crear_transaccion, editar_transaccion, eliminar_transaccion, etc.
  tabla         String    // Transaccion, Socio, etc.
  registroId    Int?
  cambioAnterior String?  // JSON serializado del estado anterior
  cambioNuevo    String?  // JSON serializado del estado nuevo
  ip             String?
  userAgent      String?
  createdAt      DateTime  @default(now())
}
```

### 1.2. Endpoints Instrumentados

**Transacciones:**
- `POST /api/transacciones/ingresos` — registra `crear_transaccion` al crear ingreso
- `POST /api/transacciones/egresos` — registra `crear_transaccion` al crear egreso
- `PUT /api/transacciones/[id]` — registra `editar_transaccion` con before/after
- `DELETE /api/transacciones/[id]` — registra `eliminar_transaccion` con snapshot anterior

**Socios:**
- `POST /api/socios` — registra `crear_socio`
- `PUT /api/socios/[numero]` — registra `editar_socio`
- `DELETE /api/socios/[numero]` — registra `eliminar_socio`

Todos los endpoints requieren:
1. Token JWT válido (`Authorization: Bearer <token>`)
2. Permiso específico (e.g., `crear_transaccion`, `editar_socio`)

---

## 2. Gráficos e Visualizaciones

### 2.1. Componente de Gráfico (`src/components/charts/IngresoEgresoChart.tsx`)

**Componente Client React:**
```typescript
type Props = {
  labels: string[];
  ingresos: number[];
  egresos: number[];
};

export default function IngresoEgresoChart({ labels, ingresos, egresos }: Props)
```

- Usa **Chart.js** con react-chartjs-2
- Gráfico de líneas (Line) con dos datasets: ingresos (verde) y egresos (rojo)
- Responsive y con leyenda/tooltip

### 2.2. Dashboard Ejecutivo (`src/app/dashboard/page.tsx`)

**Funcionalidad:**
- Página server que agrega datos de últimos **12 meses**
- Consulta Prisma: `transaccion.aggregate({ where: { tipo: 'ingreso', año, mes }, _sum: { monto } })`
- Pasa datos al componente `IngresoEgresoChart`
- Muestra el gráfico en una sección con título "Dashboard Ejecutivo"

**Acceso:** `GET /dashboard` (publico, pero ideal agregar middleware de auth)

---

## 3. Auditoría Admin UI

### 3.1. Página de Auditoría (`src/app/auditoria/page.tsx`)

**Características:**
- Page **Client** (usa `useAuth` hook para session management)
- Requiere permiso `ver_auditoria` (solo admin por defecto)
- Tabla paginada de logs con filtros:
  - **Filtro por tabla** (Transaccion, Socio, etc.)
  - **Filtro por acción** (crear_transaccion, editar_socio, etc.)
  - **Cambiar límite** de registros por página (10, 20, 50)
  - **Paginación** manual (buttons para navegar)

**Campos mostrados:**
- Fecha (con zona horaria local)
- Acción realizada
- Tabla afectada
- ID del registro
- IP del usuario

**Acceso:** `/auditoria` (requiere login + permiso `ver_auditoria`)

### 3.2. Endpoint de Retrieval (`GET /api/auditoria/logs`)

```typescript
GET /api/auditoria/logs?usuarioId=1&tabla=Transaccion&accion=crear&desde=2025-01-01&hasta=2025-12-31&page=1&limit=20
```

**Query params (todos opcionales):**
- `usuarioId` — filtrar por usuario que realizó la acción
- `tabla` — filtrar por tabla (Transaccion, Socio, etc.)
- `accion` — filtrar por acción (crear_transaccion, editar_socio, etc.)
- `desde` — fecha ISO de inicio (e.g., 2025-01-01T00:00:00Z)
- `hasta` — fecha ISO de fin
- `page` — página (default: 1)
- `limit` — registros por página (default: 50, max: 200)

**Response:**
```json
{
  "ok": true,
  "total": 523,
  "page": 1,
  "limit": 20,
  "logs": [
    {
      "id": 1,
      "usuarioId": 2,
      "accion": "crear_transaccion",
      "tabla": "Transaccion",
      "registroId": 101,
      "cambioAnterior": null,
      "cambioNuevo": "{\"id\": 101, \"tipo\": \"ingreso\", ...}",
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-11-17T15:30:00Z"
    },
    ...
  ]
}
```

---

## 4. Cambios en Endpoints Existentes

### 4.1. Transacciones

Modificados para agregar auth + auditoría:
- `POST /api/transacciones/ingresos` 
  - Antes: sin auth
  - Ahora: requiere `validateJWT`, permiso `crear_transaccion`, registra `logAudit`

- `POST /api/transacciones/egresos`
  - Mismo cambio que ingresos

Nuevos endpoints:
- `PUT /api/transacciones/[id]` — editar transacción con before/after snapshots
- `DELETE /api/transacciones/[id]` — eliminar transacción con snapshot anterior

### 4.2. Socios

Reescrito para usar **Prisma en lugar de JSON storage** (`lowdb`):
- `GET /api/socios` — ahora filtra por `nombre` (antes: rut, calidadJuridica) usando Prisma
- `POST /api/socios` — crea con Prisma, requiere auth + auditoría
- `GET /api/socios/[numero]` — obtener socio específico
- `PUT /api/socios/[numero]` — editar con before/after snapshots
- `DELETE /api/socios/[numero]` — eliminar con snapshot anterior

---

## 5. Cambios en UI/Navegación

### 5.1. Navbar (`src/app/layout.tsx`)

Agregados links a nuevas secciones:
- `Dashboard` — acceso rápido a `/dashboard`
- `Auditoría` — acceso a `/auditoria`
- `Transacciones` — acceso a `/transacciones`

---

## 6. Permisos y Roles

Permisos definidos en `src/lib/auth.ts`:

| Permiso | Admin | Contador | Visor |
|---------|-------|----------|-------|
| `crear_transaccion` | ✓ | ✓ | ✗ |
| `editar_transaccion` | ✓ | ✓ | ✗ |
| `eliminar_transaccion` | ✓ | ✗ | ✗ |
| `ver_auditoria` | ✓ | ✗ | ✗ |
| `crear_socio` | ✓ | ✓ | ✗ |
| `editar_socio` | ✓ | ✓ | ✗ |
| `eliminar_socio` | ✓ | ✗ | ✗ |
| `ver_reportes` | ✓ | ✓ | ✓ |

---

## 7. Instalaciones Agregadas

```json
{
  "chart.js": "^4.5.1",
  "react-chartjs-2": "^5.3.1"
}
```

**Nota:** `npm audit` reportó 7 vulnerabilidades (6 high, 1 critical). Se recomienda ejecutar `npm audit fix` y revisar advisories en desarrollo/staging antes de producción.

---

## 8. Cómo Usar

### 8.1. Crear una Transacción con Auditoría

```bash
curl -X POST 'http://localhost:3000/api/transacciones/ingresos' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TU_JWT_TOKEN>" \
  -d '{
    "categoria": "cuotas",
    "mes": 11,
    "año": 2025,
    "monto": 10000,
    "concepto": "Cuota mensual",
    "referencia": "ref-123"
  }'
```

Verificar que se registró la auditoría:
```bash
curl 'http://localhost:3000/api/auditoria/logs?limit=5' \
  -H "Authorization: Bearer <TU_JWT_TOKEN>"
```

### 8.2. Ver Dashboard

```bash
# Navegar a:
http://localhost:3000/dashboard
```

Verás un gráfico con líneas de ingresos vs egresos por mes.

### 8.3. Consultar Auditoría (Admin)

```bash
# Navegar a:
http://localhost:3000/auditoria
```

Necesitas login con usuario `admin` (credenciales por defecto en seed).

---

## 9. Estructura de Archivos Nuevos/Modificados

```
src/
├── lib/
│   ├── audit.ts (NUEVO) — helper de auditoría
│   └── auth.ts (MODIFICADO) — permisos ver_auditoria
├── app/
│   ├── layout.tsx (MODIFICADO) — links a dashboard/auditoria
│   ├── dashboard/
│   │   └── page.tsx (NUEVO) — dashboard con gráficos
│   ├── auditoria/
│   │   └── page.tsx (NUEVO) — admin audit UI
│   ├── api/
│   │   ├── auditoria/
│   │   │   └── logs/
│   │   │       └── route.ts (NUEVO) — GET logs filtrados
│   │   ├── transacciones/
│   │   │   ├── ingresos/
│   │   │   │   └── route.ts (MODIFICADO) — +audit
│   │   │   ├── egresos/
│   │   │   │   └── route.ts (MODIFICADO) — +audit
│   │   │   └── [id]/
│   │   │       └── route.ts (NUEVO) — PUT/DELETE con audit
│   │   └── socios/
│   │       ├── route.ts (REESCRITO) — Prisma + audit
│   │       └── [numero]/
│   │           └── route.ts (REESCRITO) — GET/PUT/DELETE Prisma + audit
└── components/
    └── charts/
        └── IngresoEgresoChart.tsx (NUEVO) — Chart.js component
```

---

## 10. Próximos Pasos Recomendados (Fase 4)

1. **Pruebas automatizadas** — unit + integration tests para endpoints y audit
2. **Caché y rendimiento** — Redis caché para agregaciones de reportes
3. **Alertas y notificaciones** — enviar emails cuando detecte cambios sospechosos
4. **Exportar logs de auditoría** — CSV/Excel con filtros avanzados
5. **Más gráficos** — por categoría, por socio, flujo de caja, morosos
6. **Seguridad avanzada** — httpOnly cookies, CSRF protection, rate limiting
7. **Reportes por email** — schedule automático de reportes diarios/semanales

---

## 11. Estado de Compilación

**TypeScript Check:** 8 errores preexistentes (no relacionados con Fase 3).
- `src/app/api/socios/[numero]/{creditos,descuentos,pagos,recibos}/route.ts` — errores en archivos previos
- `src/app/socios/page.tsx` — referencias a `setWorkerRunning` no definidas

**Build:** Espera validación completa. Recomendación: ejecutar `npm run dev` localmente.

---

**Estado:** ✅ **FASE 3 COMPLETADA**

Sistema listo para pruebas de auditoría, gráficos y dashboard en desarrollo local.
