# 🚀 ACCIÓN 6: Deploy to Vercel Staging — INSTRUCCIONES

**Fecha:** 21 NOV 2025  
**Status:** Ready for deployment  
**Tiempo Estimado:** 15 minutos (+ espera de GitHub Actions)

---

## 📋 PRE-REQUISITOS

✅ **Verificados:**
- E2E tests completados
- JWT_SECRET configurado
- Prisma migrations ejecutadas
- Build validado (0 TypeScript errors)
- `.env.production` actualizado

---

## 🔧 PASO 1: Preparar GitHub

### 1a. Agregar GitHub Secrets

Ve a: `https://github.com/TU_USUARIO/contable-app/settings/secrets/actions`

Agrega estos 3 secrets:

1. **VERCEL_TOKEN**
   - Obtén de: https://vercel.com/account/tokens
   - Copia el token completo
   - Pégalo como secret

2. **VERCEL_ORG_ID**
   - Obtén de: https://vercel.com/dashboard (Settings → General)
   - Es el "Team ID" o "Org ID"

3. **VERCEL_PROJECT_ID**
   - Obtén de: https://vercel.com/dashboard
   - Entra a tu proyecto "contable-app"
   - Settings → General → Project ID

**Comandos rápidos si tienes Vercel CLI:**
```bash
vercel project list  # Ver project ID
vercel teams list    # Ver org ID
```

---

## 💾 PASO 2: Commit y Push de Cambios

Ejecuta estos comandos en terminal:

```bash
cd /Users/cristianvivarvera/Vscode_Proyectos/contable-app

# 1. Ver status de cambios
git status

# 2. Agregar archivos
git add .

# 3. Commit con mensaje descriptivo
git commit -m "Fase 4 Hito 1: E2E Tests + JWT_SECRET + Prisma Fix + Vercel Setup

Changes:
- Fixed Prisma orderBy syntax in src/lib/db.ts and src/lib/prisma-db.ts
- Created E2E test scripts (e2e-test.sh, e2e-simple.sh)
- Configured secure JWT_SECRET (826546baf462e0f19d8df9069dc896856cd86eab1a5dca6ab104ffe60ee8669b)
- Verified Prisma migrations
- Prepared .env.production for staging deployment
- All tests passing: 0 TypeScript errors, build successful

Ready for Vercel staging deployment"

# 4. Push a main branch
git push origin main
```

---

## 🔄 PASO 3: GitHub Actions CI Ejecutará Automáticamente

Cuando hagas push a `main`:

1. **GitHub Actions CI Workflow Inicia** (`.github/workflows/ci.yml`)
   - ✅ Checkout code
   - ✅ Setup Node.js
   - ✅ npm ci (install dependencies)
   - ✅ npx tsc --noEmit (TypeScript check)
   - ✅ npm run build (Next.js build)
   - **Tiempo:** ~3-5 minutos

2. **Si CI Pasa:** Vercel Workflow Inicia (`.github/workflows/vercel-deploy.yml`)
   - ✅ Deploy a Vercel staging
   - ✅ Genera URL: `https://contable-app-staging.vercel.app`
   - **Tiempo:** ~2-3 minutos

3. **Total Esperado:** 5-8 minutos

---

## 📊 MONITOREAR DEPLOYMENT

### Opción A: En GitHub
```
GitHub Repo → Actions → Latest Workflow Run
```

### Opción B: En Vercel
```
https://vercel.com/dashboard/contable-app
```

**Busca:**
- ✅ Build successful
- ✅ Deployment complete
- ✅ Production URL live

---

## ✅ PASO 4: Verificar Staging Live

Una vez que GitHub Actions y Vercel completen:

```bash
# 1. Test health endpoint
curl https://contable-app-staging.vercel.app/api/health

# Esperado: {"ok":true,"db":"ok","redis":"error"} (Redis error es normal sin config)

# 2. Test login
curl -X POST https://contable-app-staging.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Esperado: {"ok":true,"data":{"token":"eyJhbGci...","usuario":{...}}}
```

---

## 📝 NOTAS IMPORTANTES

1. **DATABASE_URL:** Vercel usará SQLite por defecto (mismo que dev). Para PostgreSQL, configura en Vercel project settings.

2. **Redis:** No es crítico para staging. Los errores de Redis son esperados sin configuración.

3. **Email/SMTP:** Opcional para staging. Configurar en Vercel environment variables si necesario.

4. **Secrets:** Los secrets en GitHub se pasan automáticamente a Vercel vía el workflow.

---

## 🎯 RESULTADO ESPERADO

```
✅ GitHub Actions CI passes
✅ Vercel deployment completes
✅ Staging URL live: https://contable-app-staging.vercel.app
✅ API endpoints responding
✅ Login flow working
✅ Ready for Acción 7: Validate in Staging Environment
```

---

## ⚠️ SI ALGO FALLA

1. **CI Workflow Falla:**
   - Revisa GitHub Actions logs
   - Verifica TypeScript errors: `npx tsc --noEmit`
   - Verifica build: `npm run build`

2. **Vercel Deployment Falla:**
   - Revisa Vercel deployment logs
   - Verifica `.env.production` tiene todos los valores
   - Verifica GitHub secrets están configurados

3. **Staging URL No Responde:**
   - Espera 2 minutos más (puede estar en build)
   - Revisa Vercel dashboard para status
   - Revisa error logs en Vercel console

---

## 📞 COMANDOS ÚTILES

```bash
# Ver logs de GitHub Actions
gh run list --repo TU_USUARIO/contable-app

# Ver status de workflow
gh run view --repo TU_USUARIO/contable-app

# Trigger workflow manualmente (si es necesario)
gh workflow run ci.yml --repo TU_USUARIO/contable-app
```

---

**Próximo paso después de staging live:**
- Acción 7: Validate in Staging Environment
- Test endpoints, login, audit logs
- Luego continuar con rate limiting + security headers

---

*Sistema Contable Integral*  
*Fase 4 — Staging Deployment*  
*21 Noviembre 2025*
