# CHECKLIST_FASE3.md

## Fase 3: Auditoría y Gráficos — Checklist de Verificación

### ✅ Implementación Completada

- [x] **Modelo AuditLog** en Prisma schema
  - Campos: usuarioId, accion, tabla, registroId, cambioAnterior, cambioNuevo, ip, userAgent, createdAt
  - Estado: Migración 20251117015550 aplicada

- [x] **Helper de Auditoría** (`src/lib/audit.ts`)
  - Función `logAudit()` con captura de IP y User-Agent
  - Falla silenciosa (no rompe operación principal)

- [x] **Instrumentación de Endpoints**
  - [x] POST /api/transacciones/ingresos — crea + auditoría
  - [x] POST /api/transacciones/egresos — crea + auditoría
  - [x] PUT /api/transacciones/[id] — edita + before/after
  - [x] DELETE /api/transacciones/[id] — elimina + snapshot
  - [x] POST /api/socios — crea + auditoría (reescrito con Prisma)
  - [x] PUT /api/socios/[numero] — edita + before/after
  - [x] DELETE /api/socios/[numero] — elimina + snapshot
  - [x] GET /api/socios/[numero] — fetch individual socio

- [x] **Endpoint de Retrieval**
  - [x] GET /api/auditoria/logs
  - Filtros: usuarioId, tabla, accion, desde, hasta
  - Paginación: page, limit
  - Requiere permiso `ver_auditoria`

- [x] **Componente de Gráfico**
  - [x] IngresoEgresoChart.tsx (Chart.js Line chart)
  - Props: labels, ingresos, egresos
  - Responsive con leyenda

- [x] **Dashboard Ejecutivo**
  - [x] /app/dashboard/page.tsx
  - Agregación últimos 12 meses
  - Renderiza IngresoEgresoChart
  - Datos desde Prisma.transaccion.aggregate

- [x] **Página de Auditoría (Admin)**
  - [x] /app/auditoria/page.tsx
  - Tabla filtrable y paginada
  - Controles: filtros (tabla, accion), límite de registros, pagination
  - Requiere permiso `ver_auditoria`

- [x] **Actualización de Navegación**
  - [x] /app/layout.tsx — links a Dashboard, Auditoría, Transacciones

- [x] **Permisos y Roles**
  - [x] Agregado `ver_auditoria` en ROLE_PERMISSIONS
  - [x] Admin puede ver auditoría
  - [x] Contador: can create/edit transacciones y socios (sin delete/audit view)
  - [x] Visor: read-only reportes

---

### ⚠️ Verificaciones Pendientes (Pre-Deploy)

#### Compilación y Tests

- [ ] Ejecutar `npm run build` — validar zero fatal errors
  - Actualmente 8 errores TS preexistentes (no-Fase3)
  - Todos los nuevos ficheros deben compilar

- [ ] Ejecutar `npm run dev` localmente
  - [ ] Verificar que app inicia sin errores

- [ ] Pruebas manuales:
  - [ ] Login con usuario admin/contador/visor
  - [ ] Crear ingreso/egreso
  - [ ] Verificar que se registró en AuditLog
  - [ ] Filtrar auditoria por tabla/accion
  - [ ] Ver dashboard con gráfico

#### Seguridad

- [ ] `npm audit` — revisar vulnerabilidades (7 reportadas post-install)
  - Correr `npm audit fix` si es safe
  - Documentar exceptions si no se pueden fix

- [ ] JWT_SECRET — verificar en `.env.local` (no hardcodeado en prod)

- [ ] Middleware — auditoría endpoint solo accessible con permiso admin

- [ ] Rate limiting — considerar agregar en producción

#### Base de Datos

- [ ] Prisma migrations — verificar que `AuditLog` model está synced
  - Ejecutar: `npx prisma db push` o `npx prisma migrate dev`

- [ ] Seed data — crear usuario demo admin para test auditoría
  - Verificar en `prisma/seed.ts`

#### UI/UX

- [ ] Dashboard — gráfico renderiza correctamente
- [ ] Auditoría page — tabla paginada funciona
- [ ] Filtros — aplican correctamente
- [ ] Links en navbar — apuntan a URLs correctas
- [ ] Mobile responsiveness — tabla y gráfico adaptables

---

### 📋 Checklist de Funcionalidad (por Role)

#### Admin
- [ ] Puede crear transacciones (ingresos/egresos)
- [ ] Puede editar transacciones
- [ ] Puede eliminar transacciones
- [ ] Puede crear/editar/eliminar socios
- [ ] Accede a /auditoria
- [ ] Filtra logs por tabla/accion
- [ ] Ve dashboard con gráficos

#### Contador
- [ ] Puede crear transacciones
- [ ] Puede editar transacciones
- [ ] NO puede eliminar transacciones
- [ ] Puede crear/editar socios
- [ ] NO puede eliminar socios
- [ ] NO accede a /auditoria (403)
- [ ] Ve dashboard

#### Visor
- [ ] NO puede crear transacciones
- [ ] NO puede editar transacciones
- [ ] NO puede eliminar transacciones
- [ ] NO puede crear/editar socios
- [ ] Solo accede a /reportes y /dashboard
- [ ] NO accede a /auditoria

---

### 🔧 Troubleshooting

**Error: "No se encuentra el módulo '@/lib/audit'"**
- Solución: Verificar que `src/lib/audit.ts` existe y fue creado correctamente

**Error: "Object is possibly 'undefined'" en socios endpoints**
- Solución: Verificar que Prisma schema tiene campos que se usan (numero, nombre, email, telefono, estado)
- NO usar: rut, calidadJuridica (no existen en schema actual)

**Error: "Property 'token' does not exist on type 'User'"**
- Solución: En useAuth hook, token está separado: `const { user, token, ... } = useAuth()`

**Gráfico no renderiza en Dashboard**
- Verificar: Chart.js y react-chartjs-2 instaladas (`npm list chart.js react-chartjs-2`)
- Verificar: Datos se calculan correctamente (12 meses, ingresos/egresos arrays)

---

### 📊 Test Data

Para probar manualmente, usar las credenciales demo (seed):

```json
{
  "admin": { "email": "admin@test.com", "password": "admin123", "rol": "admin" },
  "contador": { "email": "contador@test.com", "password": "contador123", "rol": "contador" },
  "visor": { "email": "visor@test.com", "password": "visor123", "rol": "visor" }
}
```

---

### 🚀 Deployment Checklist

Antes de llevar a producción:

- [ ] All TypeScript errors resolved
- [ ] `npm audit` vulnerabilities addressed
- [ ] Database backups automated
- [ ] Environment variables configured (.env.production)
- [ ] Audit logs retention policy defined
- [ ] Admin dashboard monitored for suspicious activity
- [ ] Rate limiting + DDOS protection
- [ ] HTTPS enforced
- [ ] Logging infrastructure (e.g., Sentry) integrated

---

**Estado Actual:** Fase 3 Core Implementation ✅ — Pendiente validación completa en dev local.
