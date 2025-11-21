# 🚀 PRÓXIMOS PASOS INMEDIATOS — SCRIPT DE ACCIÓN

**Creado:** 19 Noviembre 2025
**Objetivo:** Llevar proyecto de 85% a 100% completado y deployar a staging

---

## ⚡ ACCIÓN 1: COMPLETAR E2E TESTS (15-20 minutos)

### Paso 1: Levantar servidor
```bash
npm run dev
# En terminal separada, esperar "ready - started server on 0.0.0.0:3000"
```

### Paso 2: Verificar usuarios demo existen
```bash
node scripts/seed-runner.js
# Output esperado: "✅ Usuario admin@example.com ya existe..."
```

### Paso 3: Ejecutar E2E completo (crear script para evitar terminal issues)

Crear `scripts/e2e-test.sh`:
```bash
#!/bin/bash

# Variables
API="http://localhost:3000/api"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASS="AdminPassword123!"

echo "🧪 E2E Test Suite"
echo "===================="

# 1. Login
echo "1️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi
echo "✅ Login successful (Token: ${TOKEN:0:20}...)"

# 2. Create Credit
echo ""
echo "2️⃣  Testing Create Credit..."
CREATE_RESPONSE=$(curl -s -X POST "$API/socios/1/creditos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "monto": 1000,
    "cuotas": 12,
    "descripcion": "Crédito E2E Test",
    "fechaInicio": "'$(date -u +%Y-%m-%d)'",
    "interes": 5
  }')

CREDIT_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
if [ -z "$CREDIT_ID" ]; then
  echo "❌ Create failed"
  echo "Response: $CREATE_RESPONSE"
  exit 1
fi
echo "✅ Credit created (ID: $CREDIT_ID)"

# 3. Edit Credit
echo ""
echo "3️⃣  Testing Edit Credit..."
EDIT_RESPONSE=$(curl -s -X PUT "$API/socios/1/creditos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": '$CREDIT_ID',
    "monto": 1500,
    "cuotas": 12,
    "descripcion": "Crédito E2E Test - Edited",
    "fechaInicio": "'$(date -u +%Y-%m-%d)'",
    "interes": 6
  }')

if echo $EDIT_RESPONSE | grep -q '"monto":1500'; then
  echo "✅ Credit edited successfully"
else
  echo "⚠️  Edit response: $EDIT_RESPONSE"
fi

# 4. Check Audit Log
echo ""
echo "4️⃣  Testing Audit Log..."
AUDIT_RESPONSE=$(curl -s -X GET "$API/auditoria/logs?tabla=Credito&limit=5" \
  -H "Authorization: Bearer $TOKEN")

if echo $AUDIT_RESPONSE | grep -q "CREAR\|EDITAR"; then
  echo "✅ Audit logs found"
  # Show last 2 entries
  echo "Recent audit entries:"
  echo $AUDIT_RESPONSE | grep -o '"accion":"[^"]*' | head -2
else
  echo "⚠️  Audit response: $AUDIT_RESPONSE"
fi

# 5. Delete Credit
echo ""
echo "5️⃣  Testing Delete Credit..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API/socios/1/creditos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id": '$CREDIT_ID'}'
)

if echo $DELETE_RESPONSE | grep -q '"success":true\|"ok":true'; then
  echo "✅ Credit deleted successfully"
else
  echo "⚠️  Delete response: $DELETE_RESPONSE"
fi

echo ""
echo "===================="
echo "🎉 E2E Test Complete!"
```

Luego ejecutar:
```bash
chmod +x scripts/e2e-test.sh
bash scripts/e2e-test.sh
```

---

## ⚡ ACCIÓN 2: CONFIGURAR JWT_SECRET SEGURO (5 minutos)

```bash
# 1. Generar secret seguro
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "JWT_SECRET=$JWT_SECRET"

# 2. Actualizar .env.local
echo "JWT_SECRET=$JWT_SECRET" >> .env.local

# 3. Verificar
grep JWT_SECRET .env.local

# 4. Reiniciar servidor (Ctrl+C, npm run dev)
```

---

## ⚡ ACCIÓN 3: EJECUTAR MIGRACIONES PRISMA (5 minutos)

```bash
# 1. Generar migration inicial
npx prisma migrate dev --name "init"

# 2. Generar Prisma client
npm run prisma:generate

# 3. Verificar migration creada
ls -la prisma/migrations/

# 4. Ver estado de Prisma
npx prisma db push --skip-generate
```

---

## ⚡ ACCIÓN 4: VALIDAR BUILD Y TEMAS (10 minutos)

```bash
# 1. TypeScript validation
npx tsc --noEmit
# Esperado: 0 errors

# 2. Build production
npm run build
# Esperado: ✓ Compiled successfully

# 3. Test health endpoint
npm run dev
# En otra terminal:
curl http://localhost:3000/api/health
# Esperado: {"ok":true,"db":"ok","redis":"not-configured"}
```

---

## ⚡ ACCIÓN 5: PREPARAR VERCEL DEPLOY (10 minutos)

### 5a. Crear `.env.production`

```bash
# Copiar .env.local a .env.production
cp .env.local .env.production

# Actualizar con valores de producción:
# DATABASE_URL=postgresql://user:password@host/dbname (get from Vercel)
# JWT_SECRET=<use same as .env.local>
# REDIS_URL=<get from Upstash>
```

### 5b. Configurar GitHub Secrets

En GitHub repo → Settings → Secrets and variables → Actions:

1. **VERCEL_TOKEN** — Get from https://vercel.com/account/tokens
2. **VERCEL_ORG_ID** — Get from Vercel team settings
3. **VERCEL_PROJECT_ID** — Get from Vercel project settings

```bash
# Template para agregar secrets
gh secret set VERCEL_TOKEN --body "$(cat ~/.vercel/token.txt)"
```

### 5c. Crear Vercel project (si no existe)

```bash
npm install -g vercel
vercel link
vercel env pull

# Verify:
cat .vercel/.gitignore
cat .vervel/project.json
```

---

## ⚡ ACCIÓN 6: DEPLOY A STAGING (10 minutos)

### Opción A: Vercel (Recomendado)

```bash
# 1. Push a GitHub
git add .
git commit -m "Prepare for staging deployment"
git push origin main

# 2. Vercel auto-deploys via CI workflow
# Esperar ~2-3 minutos

# 3. Verificar deployment en:
# https://contable-app-staging.vercel.app (o tu URL)
```

### Opción B: Fly.io

```bash
# 1. Login a Fly
fly auth login

# 2. Create app
fly launch

# 3. Deploy
fly deploy
```

---

## ⚡ ACCIÓN 7: VALIDAR EN STAGING (15 minutos)

```bash
# Test URLs de staging
STAGING_URL="https://contable-app-staging.vercel.app"

# 1. Health check
curl $STAGING_URL/api/health

# 2. Login
curl -X POST $STAGING_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"AdminPassword123!"}'

# 3. Access dashboard
curl -L $STAGING_URL/dashboard  # Should redirect to /login or show dashboard

# 4. Test an endpoint with token
TOKEN=$(curl -s -X POST $STAGING_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"AdminPassword123!"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

curl $STAGING_URL/api/socios \
  -H "Authorization: Bearer $TOKEN"
```

---

## ⚡ ACCIÓN 8: AGREGAR RATE LIMITING (20 minutos)

Instalar dependencia:
```bash
npm install next-rate-limit
```

Crear middleware en `src/middleware.ts`:
```typescript
import { rateLimit } from 'next-rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  tokens: 30, // 30 requests per minute
});

export async function middleware(request: NextRequest) {
  // Apply rate limiting to login endpoint
  if (request.nextUrl.pathname === '/api/auth/login') {
    const response = await limiter(request);
    if (response) return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
```

---

## ⚡ ACCIÓN 9: AGREGAR SECURITY HEADERS (10 minutos)

Actualizar `next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## ⚡ ACCIÓN 10: EJECUTAR TESTS AUTOMATIZADOS (Opcional, +30 minutos)

### Scaffold Jest:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npx jest --init
```

### Sample test (tests/auth.test.ts):
```typescript
import { validateJWT } from '@/lib/auth';

describe('JWT Auth', () => {
  it('should validate valid token', () => {
    const token = 'valid.jwt.token';
    const result = validateJWT(token);
    expect(result).toBeDefined();
  });
});
```

### Run tests:
```bash
npm run test
```

---

## 📊 TABLA DE PROGRESO

| # | Acción | Duración | Estado | Bloqueador |
|---|--------|----------|--------|-----------|
| 1 | E2E Tests | 20 min | ⏳ Pendiente | NO |
| 2 | JWT_SECRET | 5 min | ⏳ Pendiente | NO |
| 3 | Migraciones | 5 min | ⏳ Pendiente | NO |
| 4 | Build Validate | 10 min | ⏳ Pendiente | NO |
| 5 | Vercel Setup | 10 min | ⏳ Pendiente | NO |
| 6 | Deploy Staging | 10 min | ⏳ Pendiente | Sí (5) |
| 7 | Validate Staging | 15 min | ⏳ Pendiente | Sí (6) |
| 8 | Rate Limiting | 20 min | ⏳ Pendiente | NO |
| 9 | Security Headers | 10 min | ⏳ Pendiente | NO |
| 10 | Tests Auto | 30 min | ⏳ Pendiente | NO |

**Tiempo Total Crítico:** ~65 minutos (acciones 1-7)
**Tiempo Total Completo:** ~150 minutos (todas)

---

## ✨ CRITERIOS DE ÉXITO

Después de completar este plan:

- [x] E2E tests ejecutados sin errores
- [x] JWT_SECRET configurado seguro
- [x] Migraciones Prisma generadas
- [x] Build producción exitoso
- [x] Deployed a staging exitosamente
- [x] Login funciona en staging
- [x] Endpoints responden en staging
- [x] Rate limiting activo
- [x] Security headers configurados
- [x] Listo para production

---

## 🎯 RECOMENDACIÓN

**Completar acciones 1-7 HOY** (total ~65 minutos)

Esto te llevará al estado:
- ✅ Staging deployed
- ✅ Todos los tests validados
- ✅ Listo para QA

Luego:
- **Mañana:** Acciones 8-9 (Rate limiting + Security)
- **Semana próxima:** Action 10 (Tests auto) + Production deployment

---

*Proyecto: Sistema Contable Integral*
*Fase: 4 — Hardening & Staging*
*Estimación a Producción: 3-5 días*
