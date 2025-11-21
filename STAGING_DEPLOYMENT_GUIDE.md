# STAGING DEPLOYMENT GUIDE - VERCEL

## Pre-requisitos

1. **Vercel Account:** https://vercel.com (crear si no existe)
2. **GitHub Account:** Tener el repo vinculado a GitHub
3. **PostgreSQL Database:** 
   - Opción A: Vercel Postgres (integrado)
   - Opción B: Railway.app, Supabase, o similar
4. **Redis (opcional):** Para queue de emails
5. **Gmail Account:** Con "Contraseñas de aplicación" habilitadas

---

## Paso 1: Preparar la Aplicación

### 1.1. Verificar que el build es exitoso

```bash
cd /Users/cristianvivarvera/Vscode_Proyectos/contable-app
npm run build
# ✅ Debe completar sin errores
```

### 1.2. Crear fichero `vercel.json` (opcional pero recomendado)

```bash
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "runtime": "nodejs18.x",
      "memory": 512,
      "maxDuration": 30
    }
  }
}
EOF
```

### 1.3. Actualizar `package.json` si es necesario

Verificar que `postinstall` ejecuta migraciones de Prisma:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

---

## Paso 2: Conectar GitHub a Vercel

### 2.1. En Vercel Dashboard

1. Ir a https://vercel.com/dashboard
2. Click en **"Add New"** → **"Project"**
3. Seleccionar **"Import Git Repository"**
4. Buscar el repositorio `contable-app`
5. Click en **"Import"**

### 2.2. Configurar proyecto

- **Project Name:** `contable-app-staging`
- **Framework Preset:** Next.js
- **Root Directory:** `.` (raíz del proyecto)
- Click **"Continue"**

---

## Paso 3: Configurar Variables de Ambiente

En Vercel Dashboard → Proyecto → Settings → Environment Variables

### 3.1. Agregar variables (Staging)

```bash
# Database
DATABASE_URL = postgresql://user:password@host:5432/contable_staging

# JWT
JWT_SECRET = [GENERAR: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]

# SMTP
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = tu-email@gmail.com
SMTP_PASSWORD = [contraseña de app de Gmail]
SMTP_FROM_EMAIL = tu-email@gmail.com
SMTP_FROM_NAME = Contable App Staging

# Redis (opcional, si tienes BullMQ)
REDIS_HOST = redis.staging.internal
REDIS_PORT = 6379
REDIS_PASSWORD = [tu-contraseña]

# Node
NODE_ENV = production
```

### 3.2. Seleccionar ambientes donde aplica

- ✅ Production
- ✅ Preview
- ✅ Development

---

## Paso 4: Configurar Base de Datos (PostgreSQL)

### Opción A: Vercel Postgres (Recomendado)

1. En Vercel Dashboard → Storage → **"Create Database"**
2. Seleccionar **"Postgres"**
3. Nombre: `contable-staging`
4. Region: Cercana a usuarios
5. Click **"Create"**
6. Copiar `DATABASE_URL`
7. Agregar a Environment Variables (ver Paso 3)

### Opción B: Railway.app

1. Ir a https://railway.app
2. Crear nuevo proyecto
3. Agregar plugin de PostgreSQL
4. Copiar connection string
5. Agregar como `DATABASE_URL` en Vercel

---

## Paso 5: Aplicar Migraciones

Una vez que el deploy inicial sea exitoso:

### 5.1. Conectar a la BD via Vercel CLI

```bash
npm install -g vercel
vercel link  # Vincular proyecto local a Vercel

# Ver variables
vercel env ls

# Descargar env vars locales
vercel env pull .env.production.local
```

### 5.2. Ejecutar migraciones

```bash
# Con Prisma
npx prisma migrate deploy --skip-generate

# O ejecutar seed para datos de demo
npx prisma db seed
```

---

## Paso 6: Iniciar Deploy

### 6.1. Hacer push a rama principal

```bash
git add .
git commit -m "Preparar para staging deployment"
git push origin main
```

**Nota:** Vercel se dispara automáticamente en cada push a `main`

### 6.2. Monitorar deploy

En Vercel Dashboard:
- Ver logs en tiempo real
- Detectar errores de build/deployment
- Revisar Build Duration

---

## Paso 7: Pruebas Post-Deploy

### 7.1. Acceder a la aplicación

```bash
# URL será algo como:
https://contable-app-staging.vercel.app

# O si configuraste dominio custom:
https://contable.staging.example.com
```

### 7.2. Ejecutar test básicos

```bash
# Test 1: Página de login
curl https://contable-app-staging.vercel.app/login

# Test 2: Login via API
curl -X POST 'https://contable-app-staging.vercel.app/api/auth/login' \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'

# Test 3: Acceder a dashboard (debe redirigir a login si no autenticado)
curl https://contable-app-staging.vercel.app/dashboard

# Test 4: Crear transacción con token
curl -X POST 'https://contable-app-staging.vercel.app/api/transacciones/ingresos' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "categoria": "cuotas",
    "mes": 11,
    "año": 2025,
    "monto": 10000,
    "concepto": "Test",
    "referencia": "test-001"
  }'
```

### 7.3. Verificar logs

En Vercel Dashboard → proyecto → **"Deployments"** → último deploy → **"Logs"**

---

## Paso 8: Configuración de Dominio Custom (Opcional)

Si deseas usar dominio personalizado:

1. Vercel Dashboard → Project Settings → **"Domains"**
2. Click **"Add"**
3. Ingresar dominio (ej: `contable-staging.example.com`)
4. Agregar registros DNS según instrucciones

---

## Troubleshooting

### Error: `DATABASE_URL is missing`

**Solución:**
```bash
# En Vercel Environment Variables, verificar que DATABASE_URL esté configurada
# Si faltan, agregar desde Storage > Postgres o pegar manualmente
```

### Error: `JWT_SECRET is missing`

**Solución:**
```bash
# Generar secret fuerte:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Agregar a Vercel Environment Variables
```

### Error: `Prisma migration failed`

**Solución:**
```bash
# En local, verificar migraciones:
npx prisma migrate status

# Si hay migraciones pendientes:
npx prisma migrate deploy
```

### Emails no se envían

**Solución:**
1. Verificar `SMTP_PASSWORD` es "Contraseña de Aplicación" de Gmail (no contraseña normal)
2. Verificar que Gmail está habilitado: https://myaccount.google.com/apppasswords
3. Verificar `SMTP_USER` y `SMTP_FROM_EMAIL` son iguales

---

## Rollback en caso de error

Si el deploy en staging rompe la aplicación:

```bash
# En Vercel Dashboard → Deployments
# Click en un deploy anterior exitoso
# Click "Promote to Production" (si era ese el último exitoso)
```

---

## Siguientes Pasos

1. ✅ Deploy exitoso a staging
2. ⏭️ Realizar pruebas integrales en staging
3. ⏭️ Resolver bugs encontrados
4. ⏭️ Preparar deploy a production

---

**Documentación oficial:**
- Vercel: https://vercel.com/docs
- Prisma: https://www.prisma.io/docs/guides/deployment
- PostgreSQL en Vercel: https://vercel.com/docs/storage/vercel-postgres
