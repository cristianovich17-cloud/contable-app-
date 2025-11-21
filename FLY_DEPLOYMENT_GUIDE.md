# STAGING DEPLOYMENT GUIDE - FLY.IO

## Pre-requisitos

1. **Fly.io Account:** https://fly.io (crear si no existe)
2. **Fly CLI:** `npm install -g @flydotio/fly` (o ver: https://fly.io/docs/hands-on/install-flyctl/)
3. **GitHub Account:** Tener el repo (opcional, puede ser manual)
4. **PostgreSQL & Redis:** Se crean como add-ons en Fly.io
5. **Gmail Account:** Con "Contraseñas de aplicación" habilitadas

---

## Paso 1: Instalar Fly CLI

```bash
# Instalar globalmente
npm install -g @flydotio/fly

# O si usas Homebrew (macOS)
brew install flyctl

# Verificar instalación
fly version
```

---

## Paso 2: Preparar Aplicación

### 2.1. Actualizar `fly.toml` (crear si no existe)

```bash
cd /Users/cristianvivarvera/Vscode_Proyectos/contable-app

# Generar configuración inicial
fly launch --generate-name

# O si ya existe, editarlo manualmente
```

**Contenido recomendado de `fly.toml`:**

```toml
app = "contable-app-staging"
kill_signal = "SIGINT"
kill_timeout = 5
processes = []

[env]
NODE_ENV = "production"

[build]
builder = "heroku"
buildpacks = ["heroku/nodejs"]

[[services]]
protocol = "tcp"
internal_port = 3000
processes = ["app"]

  [[services.ports]]
  number = 80
  handlers = ["http"]
  force_https = true

  [[services.ports]]
  number = 443
  handlers = ["tls", "http"]

[checks]
  [checks.status]
  grace_period = "5s"
  interval = "15s"
  method = "GET"
  path = "/api/hello"  # Cambiar a un endpoint que siempre funciona
  protocol = "http"
  timeout = "5s"
  type = "http"
```

### 2.2. Crear `.dockerignore`

```bash
cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.next
.git
.gitignore
README.md
.env
.env.local
.vercel
EOF
```

### 2.3. Crear `Dockerfile` (opcional, pero recomendado para más control)

```bash
cat > Dockerfile << 'EOF'
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "start"]
EOF
```

---

## Paso 3: Autenticarse en Fly.io

```bash
# Login
fly auth login

# Seguir las instrucciones en el navegador
```

---

## Paso 4: Crear Proyecto en Fly.io

```bash
# Crear nuevo proyecto
fly apps create contable-app-staging

# O si quieres que Fly lo nombre automáticamente
fly launch --generate-name
```

---

## Paso 5: Crear Add-ons (PostgreSQL & Redis)

### 5.1. PostgreSQL

```bash
# Crear base de datos PostgreSQL
fly postgres create --name contable-staging-db

# Seguir prompts:
# - Organization: [tu-org]
# - Region: [elige región cercana]
# - VM Size: shared-cpu-1x 256MB (suficiente para staging)

# Esperar a que se cree...

# Obtener connection string
fly postgres attach contable-staging-db --app contable-app-staging
```

La connection string se agregará automáticamente como `DATABASE_URL` en los secrets.

### 5.2. Redis (opcional, para BullMQ)

```bash
# Crear Redis
fly redis create --name contable-staging-redis

# Seguir prompts:
# - Organization: [tu-org]
# - Region: [misma región que PostgreSQL]
# - VM Size: shared-cpu-1x 256MB
# - Evicted policy: allkeys-lfu (política de evicción)

# Esperar a que se cree...

# Obtener connection string
fly redis attach contable-staging-redis --app contable-app-staging
```

La connection string se agregará automáticamente como `REDIS_URL` en los secrets.

---

## Paso 6: Configurar Environment Variables

```bash
# Ver secrets actuales
fly secrets list --app contable-app-staging

# Generar JWT_SECRET fuerte
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Agregar secrets
fly secrets set --app contable-app-staging \
  JWT_SECRET="$JWT_SECRET" \
  SMTP_HOST="smtp.gmail.com" \
  SMTP_PORT="587" \
  SMTP_USER="tu-email@gmail.com" \
  SMTP_PASSWORD="contraseña-app-gmail" \
  SMTP_FROM_EMAIL="tu-email@gmail.com" \
  SMTP_FROM_NAME="Contable App Staging" \
  NODE_ENV="production"

# Verificar que se agregaron
fly secrets list --app contable-app-staging
```

---

## Paso 7: Ejecutar Migraciones de Prisma

### 7.1. Conectar a la BD remota

```bash
# Obtener DATABASE_URL de Fly.io
fly secrets list --app contable-app-staging | grep DATABASE_URL

# Establecer localmente para ejecutar migraciones
export DATABASE_URL="postgresql://..."  # Copiar valor de arriba

# Ejecutar migraciones
npx prisma migrate deploy

# O si preferimos ejecutar seed en staging
npx prisma db seed
```

### 7.2 (Alternativa): Usar SSH para ejecutar en el servidor

```bash
# Conectarse a la máquina Fly.io
fly ssh console --app contable-app-staging

# Dentro de la consola remota
cd /app
npx prisma migrate deploy
exit
```

---

## Paso 8: Deploy a Fly.io

### 8.1. Hacer push del código

```bash
git add fly.toml .dockerignore Dockerfile
git commit -m "Preparar para Fly.io deployment"
git push origin main
```

### 8.2. Desplegar

```bash
# Desde la raíz del proyecto
fly deploy --app contable-app-staging

# O sin especificar app si ya está vinculada
fly deploy
```

Fly.io compilará el Dockerfile y desplegará automáticamente.

### 8.3. Monitorar deploy

```bash
# Ver logs en tiempo real
fly logs --app contable-app-staging

# Ver status de la app
fly status --app contable-app-staging

# Ver máquinas
fly machines list --app contable-app-staging
```

---

## Paso 9: Asignar Dominio

### 9.1. Fly.io proporciona dominio automático

Tu app estará disponible en: `https://contable-app-staging.fly.dev`

### 9.2. Agregar dominio personalizado (opcional)

```bash
# Agregar dominio
fly certs create --app contable-app-staging contable-staging.example.com

# Seguir instrucciones para agregar registros DNS

# Verificar certificado
fly certs show --app contable-app-staging contable-staging.example.com
```

---

## Paso 10: Pruebas Post-Deploy

```bash
# URL de la app
APP_URL="https://contable-app-staging.fly.dev"

# Test 1: Health check
curl "$APP_URL/api/hello"

# Test 2: Login
curl -X POST "$APP_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'

# Test 3: Verificar que dashboard requiere auth
curl "$APP_URL/dashboard"  # Debería redirigir a /login

# Test 4: Ver logs de la app
fly logs --app contable-app-staging --lines 50
```

---

## Scaling y Performance

### Aumentar recursos (si es necesario)

```bash
# Ver máquinas actuales
fly machines list --app contable-app-staging

# Aumentar memoria/CPU
fly machine update <machine-id> --memory 512  # Aumentar a 512MB

# O escalar a múltiples instancias
fly scale count 2 --app contable-app-staging
```

### Monitorar performance

```bash
# Ver métricas
fly metrics --app contable-app-staging

# Historial de deployment
fly releases --app contable-app-staging
```

---

## Rollback

Si necesitas revertir a un deploy anterior:

```bash
# Ver historial
fly releases --app contable-app-staging

# Rollback a versión anterior
fly releases rollback --app contable-app-staging
```

---

## Troubleshooting

### Error: `DATABASE_URL is not available`

**Solución:**
```bash
fly postgres attach contable-staging-db --app contable-app-staging
```

### Error: `SIGKILL` (app se reinicia constantemente)

**Solución:**
- Aumentar memoria: `fly machine update <id> --memory 512`
- Revisar logs: `fly logs --app contable-app-staging`
- Verificar que puertos están correctos en `fly.toml`

### Emails no se envían

**Solución:**
1. Verificar `SMTP_PASSWORD` es "Contraseña de Aplicación" (no contraseña normal)
2. Revisar logs: `fly logs --app contable-app-staging | grep -i email`

### Migraciones fallan

**Solución:**
```bash
# Conectar por SSH y ejecutar manualmente
fly ssh console --app contable-app-staging
npx prisma migrate status
npx prisma migrate deploy
```

---

## Crear alias para facilitar comandos

```bash
# En ~/.zshrc o ~/.bashrc, agregar:
alias fly-logs="fly logs --app contable-app-staging --lines 100"
alias fly-ssh="fly ssh console --app contable-app-staging"
alias fly-deploy="fly deploy --app contable-app-staging"

# Luego
source ~/.zshrc
fly-logs
fly-ssh
fly-deploy
```

---

## Siguientes Pasos

1. ✅ Deploy a Fly.io completado
2. ⏭️ Ejecutar pruebas integrales
3. ⏭️ Resolver bugs encontrados
4. ⏭️ Preparar para production

---

**Recursos:**
- Fly.io Docs: https://fly.io/docs
- PostgreSQL en Fly: https://fly.io/docs/postgres
- Redis en Fly: https://fly.io/docs/reference/redis
- Prisma + Fly: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-fly
