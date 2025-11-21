# Guía de Inicio Rápido - Sistema de Contabilidad v1.0

## 🎯 ¿Qué es esto?

Sistema integral de contabilidad para asociación de socios con:
- Gestión de socios (importación masiva, búsqueda, filtrado)
- Cuotas y descuentos mensuales
- Registro de ingresos/egresos categorizados
- Reportes mensuales y anuales con análisis comparativo
- Envío automático de boletas por email (background)
- Exportación a CSV/Excel

---

## 🚀 Inicio Rápido (5 minutos)

### 1. Prerequisites
```bash
✅ Node.js 18+ instalado
✅ Git
✅ Docker (opcional, para Redis)
```

### 2. Clonar y setup
```bash
cd /Users/cristianvivarvera/Vscode_Proyectos/contable-app
npm install
```

### 3. Setup de Base de Datos
```bash
# Crear archivo .env.local con:
DATABASE_URL="file:./prisma/dev.db"
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
```

### 4. Inicializar BD (si es primera vez)
```bash
npx prisma migrate deploy
```

### 5. Iniciar en Desarrollo
```bash
# Terminal 1: Next.js server
npm run dev

# Terminal 2: Redis (si quieres envío de boletas)
docker run -p 6379:6379 -d --name contable-redis redis:7

# Terminal 3: Worker (opcional, para background jobs)
npm run dev:worker
```

### 6. Acceder
```
Frontend: http://localhost:3000
Páginas clave:
  - Socios: http://localhost:3000/socios
  - Transacciones: http://localhost:3000/transacciones
  - Reportes: http://localhost:3000/reportes
```

---

## 📖 Flujos Principales

### 1️⃣ Crear Ingreso/Egreso

```
1. Navegar a /transacciones
2. Seleccionar tipo: "Ingresos" o "Egresos"
3. Llenar formulario:
   - Categoría (validada según tipo)
   - Mes (1-12)
   - Año (ej: 2025)
   - Monto ($)
   - Concepto (opcional, ej: "Depósito banco ABC")
   - Referencia (opcional, ej: "Comprobante #12345")
4. Hacer clic "Guardar"
5. Se agrega a tabla automáticamente
```

**Categorías Ingresos:** cuotas, donaciones, actividades, intereses, otros
**Categorías Egresos:** administrativos, proveedores, bienestar, salarios, otros

### 2️⃣ Ver Reporte Mensual

```
1. Navegar a /reportes
2. Seleccionar tab "Mensual"
3. Elegir mes y año
4. Automáticamente se muestra:
   - 4 tarjetas con KPIs (ingresos, egresos, balance, morosos)
   - Tabla: Ingresos por categoría
   - Tabla: Egresos por categoría
   - Tabla: Descuentos por socio
   - Alerta de socios morosos (si aplica)
```

### 3️⃣ Ver Reporte Anual + Comparativa

```
1. Navegar a /reportes
2. Seleccionar tab "Anual"
3. Elegir año
4. Automáticamente se muestra:
   - 3 tarjetas con KPIs del año
   - Tabla: Resumen mensual (12 meses)
   - Análisis de variación vs. año anterior
```

### 4️⃣ Descargar Reporte como CSV

```
1. Desde /reportes (mensual o anual)
2. Hacer clic en botón "Descargar CSV"
3. Se descarga archivo (ej: reporte_mensual_2025.csv)
4. Abrir en Excel o editor de texto
```

---

## 🔌 API Endpoints (para integración)

### Transacciones - Ingresos

**POST** `/api/transacciones/ingresos`
```json
{
  "categoria": "cuotas",
  "mes": 11,
  "año": 2025,
  "monto": 5000,
  "concepto": "Cuotas noviembre",
  "referencia": "Depósito banco"
}
```
Respuesta: 201 con objeto transacción creado

**GET** `/api/transacciones/ingresos?mes=11&año=2025&categoria=cuotas`
Respuesta: 200 con array de ingresos + resumen

### Transacciones - Egresos

**POST** `/api/transacciones/egresos`
Misma estructura que ingresos

**GET** `/api/transacciones/egresos?mes=11&año=2025`
Respuesta: 200 con array de egresos + resumen

### Reportes

**GET** `/api/reportes/mensual?mes=11&año=2025`
Respuesta: Reporte completo mensual con:
- Ingresos por categoría
- Egresos por categoría
- Descuentos por socio
- Socios morosos
- Resumen ejecutivo

**GET** `/api/reportes/anual?año=2025&formato=json|csv`
Respuesta: Reporte anual con comparativa
- Si `formato=csv`: Descarga archivo CSV
- Si `formato=json`: Retorna JSON

---

## 📊 Estructura de Datos

### Transacción
```json
{
  "id": 1,
  "tipo": "ingreso",
  "categoria": "cuotas",
  "mes": 11,
  "año": 2025,
  "monto": 5000,
  "concepto": "Cuotas mes",
  "referencia": "Banco ABC",
  "createdAt": "2025-11-16T10:30:00Z",
  "updatedAt": "2025-11-16T10:30:00Z"
}
```

### Reporte Mensual
```json
{
  "ok": true,
  "periodo": { "mes": 11, "año": 2025 },
  "ingresos": {
    "porCategoria": { "cuotas": 50000, "donaciones": 2000 },
    "total": 52000,
    "cantidad": 5
  },
  "egresos": {
    "porCategoria": { "administrativos": 5000, "bienestar": 3000 },
    "total": 8000,
    "cantidad": 2
  },
  "balance": 44000,
  "descuentosPorSocio": [...],
  "morosos": [...]
}
```

---

## ⚙️ Configuración

### Variables de Entorno (.env.local)

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"

# Redis (para background jobs)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=       # Dejar vacío si no hay password

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
SMTP_FROM="Sistema Contable <noreply@asociacion.cl>"

# App
NODE_ENV=development
```

### Obtener App Password de Gmail
1. Habilitar 2FA en tu cuenta Google
2. Ir a: https://myaccount.google.com/apppasswords
3. Seleccionar "Mail" y "Otras opciones"
4. Copiar el password generado
5. Usar en SMTP_PASSWORD

---

## 🧪 Tests Manual

### Test 1: Crear Ingreso
```bash
curl -X POST http://localhost:3000/api/transacciones/ingresos \
  -H "Content-Type: application/json" \
  -d '{
    "categoria": "cuotas",
    "mes": 11,
    "año": 2025,
    "monto": 5000
  }'
```
Esperado: 201 con objeto creado

### Test 2: Listar Ingresos
```bash
curl http://localhost:3000/api/transacciones/ingresos?mes=11&año=2025
```
Esperado: 200 con array + resumen

### Test 3: Reporte Mensual
```bash
curl http://localhost:3000/api/reportes/mensual?mes=11&año=2025
```
Esperado: 200 con estructura completa

### Test 4: Descargar CSV
```bash
curl http://localhost:3000/api/reportes/anual?año=2025&formato=csv \
  -o reporte_2025.csv && cat reporte_2025.csv
```
Esperado: Archivo CSV válido

---

## 🐛 Troubleshooting

### ❌ Error: "database.db is locked"
**Causa:** Múltiples procesos accediendo BD
**Solución:**
```bash
# Cerrar todos los procesos
lsof | grep "dev.db"
kill -9 <PID>
# Reiniciar
npm run dev
```

### ❌ Error: "REDIS connection refused"
**Causa:** Redis no está corriendo
**Solución:**
```bash
# Iniciar Redis
docker run -p 6379:6379 -d --name contable-redis redis:7

# O si está instalado localmente
redis-server
```

### ❌ Error: "Cannot POST /api/transacciones/ingresos"
**Causa:** Headers incorrectos o JSON mal formado
**Solución:**
```bash
# Verificar headers
curl -X POST http://localhost:3000/api/transacciones/ingresos \
  -H "Content-Type: application/json" \
  -d '{"categoria":"cuotas","mes":11,"año":2025,"monto":5000}'
```

### ❌ Error: "Categoría inválida"
**Causa:** Categoría no está en lista predefinida
**Solución:**
Usar una de:
- Ingresos: cuotas, donaciones, actividades, intereses, otros
- Egresos: administrativos, proveedores, bienestar, salarios, otros

---

## 📚 Documentación Completa

| Documento | Para qué |
|---|---|
| `ARCHITECTURE.md` | Arquitectura técnica completa |
| `IMPLEMENTATION_SUMMARY.md` | Resumen de lo implementado |
| `QUICKSTART.md` | Setup inicial |
| `MIGRATION.md` | Cambios de migración Prisma |
| `PROJECT_STATUS.md` | Estado del proyecto |
| `OPTIMIZATION.md` | Optimizaciones recomendadas |

---

## 🚀 Deploy a Producción

### Build para Producción
```bash
npm run build

# Verificar que compiló sin errores
ls -la .next/
```

### Ejecutar en Producción
```bash
npm start

# En terminal separada
npm run worker
```

### Con PM2 (recomendado)
```bash
npm install -g pm2

# Iniciar
pm2 start npm --name "contable" -- start
pm2 start "npm run worker" --name "contable-worker"

# Ver estado
pm2 status

# Ver logs
pm2 logs contable
```

### Con Docker (futuro)
```bash
docker build -t contable-app .
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./prisma/dev.db" \
  -e REDIS_HOST=redis \
  contable-app
```

---

## ✅ Checklist de Deployment

- [ ] `.env.local` configurado correctamente
- [ ] `npm install` completado
- [ ] `npx prisma migrate deploy` ejecutado
- [ ] `npm run build` sin errores
- [ ] Redis corriendo (si usas worker)
- [ ] `npm start` iniciado
- [ ] `npm run worker` iniciado (si envías boletas)
- [ ] Acceso a http://localhost:3000 funciona
- [ ] Crear/listar ingreso funciona (Test 1 + 2)
- [ ] Reporte mensual funciona (Test 3)
- [ ] Descargar CSV funciona (Test 4)

---

## 🎓 Notas Importantes

1. **Base de Datos**
   - SQLite en desarrollo (cambiar a PostgreSQL en producción)
   - Archivos de migración están en `prisma/migrations/`
   - Schema en `prisma/schema.prisma`

2. **Validaciones**
   - Se validan en API (nunca confiar en frontend)
   - Categorías son fijas (no son libres)
   - Mes debe ser 1-12, año >= 2020

3. **Background Jobs**
   - Envío de boletas es asincrónico (usa queue)
   - Reintentos automáticos (5 intentos, exponential backoff)
   - Ver logs en `npm run dev:worker`

4. **Reportes**
   - Se calculan en tiempo real (pueden tomar algunos segundos)
   - Usa índices en BD para optimización
   - CSV se genera dinámica mente

---

## 📞 Soporte

### Documentos de Referencia
- Endpoints: Ver `ARCHITECTURE.md` sección "API Endpoints"
- Troubleshooting: Ver `OPTIMIZATION.md`
- Setup detallado: Ver `QUICKSTART.md`

### Logs Útiles
```bash
# Ver logs del dev server
npm run dev

# Ver logs del worker
npm run dev:worker

# Ver logs de Prisma
DATABASE_URL="file:./prisma/dev.db" npx prisma studio
```

---

## 🎉 ¡Listo!

Tu sistema de contabilidad está completamente funcional. Puedes:

✅ Registrar ingresos y egresos
✅ Ver reportes mensuales y anuales
✅ Exportar a CSV
✅ Analizar socios morosos
✅ Comparar períodos

**Próximas fases:**
- Autenticación de usuarios
- Sistema de permisos
- Upload de comprobantes
- Gráficos interactivos

¡A disfrutar! 🚀

---

**Versión:** 1.0.0 | **Fecha:** 16 de noviembre de 2025
