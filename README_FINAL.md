# 🎯 QUICK START - Sistema Contable Integral

## ✅ Estado: FUNCIONAL Y LISTO

**Build Status**: ✅ Éxito (0 errores)  
**CI/CD**: ✅ GitHub Actions pasando  
**Database**: ✅ Prisma 6 + SQLite  
**Auth**: ✅ JWT implementado  
**Deployment**: ✅ Fly.io configurado

---

## 🚀 Ejecutar en 30 Segundos

```bash
# Abrir Terminal 1
cd /Users/cristianvivarvera/Vscode_Proyectos/contable-app
npm run dev

# Abrir Terminal 2 (opcional, para background jobs)
npm run dev:worker

# En navegador:
http://localhost:3000
```

**Listo.** Ahora puedes:
- Registrar usuario: http://localhost:3000/login
- Ver dashboard: http://localhost:3000/dashboard
- Probar API: `curl http://localhost:3000/api/health`

---

## 📖 Flujos de Uso Básicos

### 1. Crear Usuario Nuevo
1. Ve a http://localhost:3000/login
2. Haz clic **"Registrarse"**
3. Completa: email, nombre, contraseña
4. Haz clic **"Registrar"** → ¡Listo!

### 2. Crear Socio
1. Obtén JWT token (después de login)
2. Usa API:
```bash
curl -X POST http://localhost:3000/api/socios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "numero": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com"
  }'
```

### 3. Generar Reportes
```bash
# Reporte mensual
curl "http://localhost:3000/api/reportes/mensual?month=11&year=2025" \
  -H "Authorization: Bearer <TOKEN>"

# Reporte anual
curl "http://localhost:3000/api/reportes/anual?year=2025" \
  -H "Authorization: Bearer <TOKEN>"

# Socios morosos
curl "http://localhost:3000/api/reportes/morosos?month=11&year=2025" \
  -H "Authorization: Bearer <TOKEN>"
```

### 4. Generar Recibo PDF
```bash
curl "http://localhost:3000/api/socios/1/recibos/pdf?month=11&year=2025" \
  -H "Authorization: Bearer <TOKEN>" \
  -o recibo.pdf
```

---

## 🧪 Tests E2E

```bash
./scripts/e2e-simple.sh
```

Ejecuta automáticamente:
- ✅ Health check
- ✅ Registro de usuario
- ✅ Login
- ✅ Crear socio
- ✅ Listar socios
- ✅ Generar reportes

---

## 🌐 Desplegar a Producción (Fly.io)

### Setup (primera vez, 5 min)

```bash
# 1. Crear cuenta en Fly.io
# https://fly.io/app/sign-up

# 2. Instalar CLI
curl -L https://fly.io/install.sh | sh

# 3. Login
flyctl auth login

# 4. Crear proyecto
cd /Users/cristianvivarvera/Vscode_Proyectos/contable-app
flyctl launch --no-deploy
# Responde: nombre "contable-app-staging", región, no a BD

# 5. Obtener token
DEPLOY_TOKEN=$(flyctl tokens create deploy --read-org)
echo $DEPLOY_TOKEN  # Copia este valor

# 6. Añadir en GitHub (en navegador)
# https://github.com/cristianovich17-cloud/contable-app-/settings/secrets/actions
# New → Name: FLY_API_TOKEN, Secret: <pega el token>

# 7. Deploy automático
git add -A
git commit -m "Deploy to Fly.io"
git push origin main
```

### Verificar
```bash
# Ver estado
flyctl status -a contable-app-staging

# Ver logs en vivo
flyctl logs -a contable-app-staging

# Probar
curl https://contable-app-staging.fly.dev/api/health
```

---

## 📊 Endpoints Clave

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/health` | GET | No | Verificar BD + Redis |
| `/api/auth/register` | POST | No | Registrar usuario |
| `/api/auth/login` | POST | No | Login y obtener token |
| `/api/auth/me` | GET | Sí | Perfil del usuario |
| `/api/socios` | GET/POST | Sí | Listar/crear socios |
| `/api/reportes/mensual` | GET | Sí | Reporte por mes |
| `/api/reportes/anual` | GET | Sí | Reporte anual |
| `/api/socios/[id]/recibos/pdf` | GET | Sí | Generar PDF |

---

## 🔐 Variables de Entorno

**`.env.local`** (desarrollo):
```
DATABASE_URL="file:./prisma/dev.db"
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
JWT_SECRET=826546baf462e0f19d8df9069dc896856cd86eab1a5dca6ab104ffe60ee8669b
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
```

**GitHub Secrets** (en `.github/settings/secrets`):
- `DATABASE_URL`
- `JWT_SECRET`
- `REDIS_URL`
- `FLY_API_TOKEN` (para Fly.io)

---

## 🛠️ Comandos

```bash
npm run dev          # Next.js dev server
npm run dev:worker  # Worker BullMQ
npm run dev:mac     # Ambos (macOS)
npm run build       # Compilar
npm run lint        # ESLint
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:migrate   # Ejecutar migraciones
npm run seed        # Datos de prueba
./scripts/e2e-simple.sh  # Tests E2E
```

---

## 🆘 Problemas Comunes

| Error | Solución |
|-------|----------|
| `Module not found: pdfkit` | `npm install` |
| Redis connection refused | `brew services start redis` |
| `PrismaClient not initialized` | Verifica `.env.local` con `DATABASE_URL` |
| Build falla en GitHub | Revisa secrets en repo settings |

---

**🎉 ¡Listo para usar!**

Documento actualizado: 21 de noviembre de 2025
