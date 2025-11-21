# PHASE3_TEST_GUIDE.md

## Guía de Testing — Fase 3 Auditoría y Gráficos

### 1. Preparación Local

#### 1.1. Iniciar el servidor dev

```bash
cd /Users/cristianvivarvera/Vscode_Proyectos/contable-app
npm run dev
```

Debería salir algo como:
```
  ▲ Next.js 14.2.3
  Local:        http://localhost:3000
  Environments: .env.local
```

#### 1.2. Verificar base de datos

Asegúrate de que tienes variables de entorno configuradas:

```bash
cat .env.local | grep DATABASE_URL
# Debería salir:
# DATABASE_URL=file:./prisma/dev.db
```

Si no existen datos, ejecuta seed:

```bash
npm run seed
```

Deberías ver:
```
Database connection successful
Seeded 3 demo users: admin, contador, visor
```

---

### 2. Tests de Auditoría Paso a Paso

#### Test 2.1: Login y obtener Token

**Objetivo:** Obtener JWT token para autenticarse

```bash
# Usar la interfaz web:
# 1. Ir a http://localhost:3000/login
# 2. Ingresar:
#    Email: admin@test.com
#    Contraseña: admin123
# 3. Se guardará token en localStorage

# O usar API directamente:
curl -X POST 'http://localhost:3000/api/auth/login' \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'

# Response esperado:
# {
#   "ok": true,
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": 1,
#     "email": "admin@test.com",
#     "nombre": "Admin",
#     "rol": "admin"
#   }
# }

# Guardar token en variable:
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Test 2.2: Crear una Transacción (Ingreso) — Debe registrarse en Auditoría

```bash
curl -X POST 'http://localhost:3000/api/transacciones/ingresos' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "categoria": "cuotas",
    "mes": 11,
    "año": 2025,
    "monto": 25000,
    "concepto": "Cuota de noviembre - Socio 1",
    "referencia": "ref-nov-2025-001"
  }'

# Response esperado:
# {
#   "ok": true,
#   "transaccion": {
#     "id": 1,
#     "tipo": "ingreso",
#     "categoria": "cuotas",
#     "mes": 11,
#     "año": 2025,
#     "monto": 25000,
#     "concepto": "Cuota de noviembre - Socio 1",
#     "referencia": "ref-nov-2025-001",
#     "createdAt": "2025-11-17T15:30:00.000Z"
#   }
# }
```

#### Test 2.3: Crear un Egreso — Debe registrarse en Auditoría

```bash
curl -X POST 'http://localhost:3000/api/transacciones/egresos' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "categoria": "servicios",
    "mes": 11,
    "año": 2025,
    "monto": 5000,
    "concepto": "Pago de electricidad",
    "referencia": "fact-elec-001"
  }'
```

#### Test 2.4: Consultar Auditoría — Debe mostrar las 2 transacciones creadas

```bash
curl 'http://localhost:3000/api/auditoria/logs?limit=10' \
  -H "Authorization: Bearer $TOKEN"

# Response esperado:
# {
#   "ok": true,
#   "total": 2,
#   "page": 1,
#   "limit": 10,
#   "logs": [
#     {
#       "id": 2,
#       "usuarioId": 1,
#       "accion": "crear_transaccion",
#       "tabla": "Transaccion",
#       "registroId": 2,
#       "cambioAnterior": null,
#       "cambioNuevo": "{\"id\":2,\"tipo\":\"egreso\",...}",
#       "ip": "::1",
#       "userAgent": "curl/...",
#       "createdAt": "2025-11-17T15:31:00.000Z"
#     },
#     {
#       "id": 1,
#       "usuarioId": 1,
#       "accion": "crear_transaccion",
#       "tabla": "Transaccion",
#       "registroId": 1,
#       "cambioAnterior": null,
#       "cambioNuevo": "{\"id\":1,\"tipo\":\"ingreso\",...}",
#       "ip": "::1",
#       "userAgent": "curl/...",
#       "createdAt": "2025-11-17T15:30:00.000Z"
#     }
#   ]
# }
```

#### Test 2.5: Filtrar Auditoría por Acción

```bash
curl 'http://localhost:3000/api/auditoria/logs?accion=crear_transaccion&limit=20' \
  -H "Authorization: Bearer $TOKEN"

# Debería mostrar solo los 2 registros con accion="crear_transaccion"
```

#### Test 2.6: Editar una Transacción — Debe capturar before/after

```bash
# Primero, obtener el ID de una transacción existente (del test anterior: id=1)

curl -X PUT 'http://localhost:3000/api/transacciones/1' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "monto": 26000,
    "concepto": "Cuota de noviembre ACTUALIZADA"
  }'

# Response esperado:
# {
#   "ok": true,
#   "transaccion": {
#     "id": 1,
#     "tipo": "ingreso",
#     "monto": 26000,
#     "concepto": "Cuota de noviembre ACTUALIZADA",
#     ...
#   }
# }

# Verificar que se registró edición:
curl 'http://localhost:3000/api/auditoria/logs?accion=editar_transaccion&limit=5' \
  -H "Authorization: Bearer $TOKEN"

# Debería haber un registro con accion="editar_transaccion", cambioAnterior (monto=25000), cambioNuevo (monto=26000)
```

#### Test 2.7: Eliminar una Transacción — Debe capturar snapshot anterior

```bash
# Crear una transacción temporal para eliminar:
curl -X POST 'http://localhost:3000/api/transacciones/ingresos' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "categoria": "donaciones",
    "mes": 11,
    "año": 2025,
    "monto": 1000,
    "concepto": "Temporal para eliminar",
    "referencia": "temp-001"
  }'

# Asumir que se creó con id=3

curl -X DELETE 'http://localhost:3000/api/transacciones/3' \
  -H "Authorization: Bearer $TOKEN"

# Response esperado:
# { "ok": true }

# Verificar que se registró eliminación:
curl 'http://localhost:3000/api/auditoria/logs?accion=eliminar_transaccion&limit=5' \
  -H "Authorization: Bearer $TOKEN"

# Debería haber un registro con cambioAnterior (la transacción completa) y cambioNuevo=null
```

---

### 3. Tests de Gráficos y Dashboard

#### Test 3.1: Acceder al Dashboard

```bash
# En navegador:
http://localhost:3000/dashboard

# Debería mostrar:
# - Título "Dashboard Ejecutivo"
# - Gráfico de líneas con:
#   - Eje X: últimos 12 meses (etiquetas como "nov 2024", "dic 2024", etc.)
#   - Eje Y: monto ($)
#   - Línea verde: Ingresos
#   - Línea roja: Egresos
```

#### Test 3.2: Verificar que Gráfico tiene Datos

Crea más transacciones en diferentes meses:

```bash
# Ingreso para octubre 2025
curl -X POST 'http://localhost:3000/api/transacciones/ingresos' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "categoria": "cuotas",
    "mes": 10,
    "año": 2025,
    "monto": 15000,
    "concepto": "Cuota octubre",
    "referencia": "ref-oct-2025-001"
  }'

# Egreso para octubre 2025
curl -X POST 'http://localhost:3000/api/transacciones/egresos' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "categoria": "mantenimiento",
    "mes": 10,
    "año": 2025,
    "monto": 3000,
    "concepto": "Mantenimiento octubre",
    "referencia": "fact-mant-oct"
  }'

# Recargar dashboard en navegador
# http://localhost:3000/dashboard

# Debería ver líneas que varían según los meses
```

---

### 4. Tests de UI de Auditoría

#### Test 4.1: Acceder a Página de Auditoría (Admin)

```bash
# En navegador (después de hacer login como admin):
http://localhost:3000/auditoria

# Debería mostrar:
# - Tabla con logs de auditoría
# - Filtros: "Tabla..." (input), "Acción..." (input)
# - Selector: "10 por página / 20 / 50"
# - Paginación (si hay más de 10)
```

#### Test 4.2: Filtrar por Tabla

```bash
# En la página /auditoria:
# 1. En el input "Tabla...", escribe "Transaccion"
# 2. Debería filtrar y mostrar solo logs con tabla="Transaccion"
```

#### Test 4.3: Filtrar por Acción

```bash
# En la página /auditoria:
# 1. En el input "Acción...", escribe "crear_transaccion"
# 2. Debería filtrar y mostrar solo logs con accion="crear_transaccion"
```

#### Test 4.4: Paginación

```bash
# En la página /auditoria:
# 1. Cambiar selector a "10 por página"
# 2. Si hay más de 10 logs, debería aparecer botones de página (1, 2, 3, ...)
# 3. Hacer click en página 2, debería mostrar siguiente lote
```

---

### 5. Tests de Permisos (Roles)

#### Test 5.1: Contador — No puede acceder a Auditoría

```bash
# 1. Login como contador:
#    Email: contador@test.com
#    Contraseña: contador123

# 2. Intentar acceder a /auditoria
#    Debería ser redirigido o mostrar error 403

# 3. API call directo debe fallar:
curl 'http://localhost:3000/api/auditoria/logs' \
  -H "Authorization: Bearer $CONTADOR_TOKEN"

# Response esperado:
# { "ok": false, "error": "Permiso denegado" }  (status 403)
```

#### Test 5.2: Contador — Puede crear transacciones

```bash
curl -X POST 'http://localhost:3000/api/transacciones/ingresos' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONTADOR_TOKEN" \
  -d '{
    "categoria": "cuotas",
    "mes": 11,
    "año": 2025,
    "monto": 10000,
    "concepto": "Contador test",
    "referencia": "contador-test"
  }'

# Response esperado:
# { "ok": true, "transaccion": { ... } }  (status 201)
```

#### Test 5.3: Contador — No puede eliminar transacciones

```bash
curl -X DELETE 'http://localhost:3000/api/transacciones/1' \
  -H "Authorization: Bearer $CONTADOR_TOKEN"

# Response esperado:
# { "ok": false, "error": "Permiso denegado" }  (status 403)
```

#### Test 5.4: Visor — Solo lectura

```bash
# Login as visor: visor@test.com / visor123

# 1. NO puede crear transacciones:
curl -X POST 'http://localhost:3000/api/transacciones/ingresos' \
  -H "Authorization: Bearer $VISOR_TOKEN" \
  -d '...'
# Response: { "ok": false, "error": "Permiso denegado" }

# 2. Puede acceder a reportes (si implementado):
curl 'http://localhost:3000/api/reportes/mensual?mes=11&año=2025' \
  -H "Authorization: Bearer $VISOR_TOKEN"
# Response: { "ok": true, ... }
```

---

### 6. Tests de Socios (Modernizados a Prisma)

#### Test 6.1: Crear Socio con Auditoría

```bash
curl -X POST 'http://localhost:3000/api/socios' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "numero": 101,
    "nombre": "Socio Test 1",
    "email": "socio1@example.com",
    "telefono": "+56912345678",
    "estado": "activo"
  }'

# Response esperado:
# {
#   "ok": true,
#   "socio": {
#     "id": 1,
#     "numero": 101,
#     "nombre": "Socio Test 1",
#     "email": "socio1@example.com",
#     "telefono": "+56912345678",
#     "estado": "activo",
#     "createdAt": "2025-11-17T15:40:00.000Z",
#     "updatedAt": "2025-11-17T15:40:00.000Z"
#   }
# }

# Verificar auditoría:
curl 'http://localhost:3000/api/auditoria/logs?tabla=Socio&accion=crear_socio' \
  -H "Authorization: Bearer $TOKEN"
# Debería haber un registro con tabla="Socio", accion="crear_socio"
```

#### Test 6.2: Editar Socio con Auditoría (before/after)

```bash
curl -X PUT 'http://localhost:3000/api/socios/101' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nombre": "Socio Test 1 EDITADO",
    "email": "socio1_updated@example.com"
  }'

# Response esperado:
# {
#   "ok": true,
#   "socio": {
#     "id": 1,
#     "numero": 101,
#     "nombre": "Socio Test 1 EDITADO",
#     "email": "socio1_updated@example.com",
#     ...
#   }
# }

# Verificar auditoría con before/after:
curl 'http://localhost:3000/api/auditoria/logs?tabla=Socio&accion=editar_socio&limit=1' \
  -H "Authorization: Bearer $TOKEN"
# Debería mostrar cambioAnterior y cambioNuevo con los cambios
```

---

### 7. Troubleshooting

#### Problema: "No se puede conectar a localhost:3000"

**Solución:**
```bash
# Verificar que npm run dev está ejecutándose
ps aux | grep "next dev"

# Si no, reinicia:
cd /Users/cristianvivarvera/Vscode_Proyectos/contable-app
npm run dev
```

#### Problema: "Error: ENOENT: no such file or directory '/Users/.../prisma/dev.db'"

**Solución:**
```bash
# DB no existe. Ejecutar seed:
npm run seed

# Si falla, resetear DB:
npx prisma db push --force-reset
npm run seed
```

#### Problema: "401 No autorizado" incluso con token válido

**Solución:**
- Verificar que el token no expiró (JWT_EXPIRES_IN = '7d')
- Verificar header: `Authorization: Bearer <TOKEN>` (sin comillas)
- Verificar que JWT_SECRET en `.env.local` coincide

#### Problema: Gráfico no renderiza en Dashboard

**Solución:**
```bash
# Verificar que Chart.js está instalado:
npm list chart.js react-chartjs-2

# Si no, instalar:
npm install chart.js react-chartjs-2

# Recargar navegador (Ctrl+Shift+R para hard refresh)
```

#### Problema: "Object is possibly 'undefined'" en TypeScript

**Solución:**
- Errores preexistentes. No afectan a Fase 3.
- Para custom fix, revisar archivos en `/src/app/api/socios/[numero]/` si es crítico.

---

### 8. Resumen de Pruebas Críticas

| Test | Comando / Paso | Resultado Esperado |
|------|---------------|--------------------|
| Login Admin | POST /auth/login con admin@test.com | Token JWT retornado |
| Crear Transacción | POST /transacciones/ingresos | 201 OK + auditoría registrada |
| Consultar Auditoría | GET /auditoria/logs | Array de logs con before/after |
| Editar Transacción | PUT /transacciones/[id] | 200 OK + before/after en auditLog |
| Eliminar Transacción | DELETE /transacciones/[id] | 200 OK + snapshot anterior en auditLog |
| Dashboard | Visitar /dashboard en navegador | Gráfico renderiza con 12 meses |
| Auditoría UI | Visitar /auditoria en navegador | Tabla paginada y filtrable |
| Permiso Contador | GET /auditoria/logs con contador token | 403 Permiso denegado |
| Crear Socio | POST /socios | 201 OK + auditoría registrada |
| Editar Socio | PUT /socios/[numero] | 200 OK + before/after en auditLog |

---

**Status:** ✅ Todos los tests deben pasar para validar Fase 3 completada.

Ejecuta estos tests y reporta cualquier fallo a través de los logs de la app.
