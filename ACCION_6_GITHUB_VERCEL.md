# 🔧 ACCIÓN 6: Deploy to Staging — PASOS PRÁCTICOS

**STATUS:** Git repository initialized. Initial commit completed.  
**Commit:** `42ccab9` - "🚀 Fase 4 Hito 1: E2E Tests + JWT_SECRET + Prisma Fix + Vercel Setup"

---

## 📋 PRÓXIMOS PASOS

### PASO 1: Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Crea un nuevo repositorio llamado `contable-app`
3. **NO** inicialices con README, .gitignore, ni license (ya lo hicimos)
4. Copia la URL del repositorio: `https://github.com/TU_USUARIO/contable-app.git`

### PASO 2: Conectar el Repositorio Local a GitHub

```bash
cd /Users/cristianvivarvera/Vscode_Proyectos/contable-app

# Agregar el remote (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/contable-app.git

# Verificar que se agregó correctamente
git remote -v

# Debería mostrar:
# origin  https://github.com/TU_USUARIO/contable-app.git (fetch)
# origin  https://github.com/TU_USUARIO/contable-app.git (push)
```

### PASO 3: Pushear a GitHub

```bash
# Renombrar rama local a 'main' si es necesario
git branch -M main

# Pushear los commits a GitHub
git push -u origin main

# Debería mostrar:
# Enumerating objects: 132, done.
# Writing objects: 100% (132/132), ...
# To https://github.com/TU_USUARIO/contable-app.git
#  * [new branch]      main -> main
# Branch 'main' set up to track remote tracking branch 'main' from 'origin'.
```

---

## ✅ VERIFICAR QUE TODO ESTÁ EN GITHUB

```bash
# Ver status
git status
# Debería mostrar: On branch main, nothing to commit, working tree clean

# Ver logs
git log --oneline
# Debería mostrar el commit inicial
```

---

## 🔐 PASO 4: Configurar GitHub Secrets

**Important:** Vercel necesita estos secrets en GitHub Actions para deployar automáticamente.

1. Ve a: `https://github.com/TU_USUARIO/contable-app/settings/secrets/actions`
2. Haz clic en "New repository secret"

**Agrega estos 3 secrets:**

#### Secret 1: VERCEL_TOKEN
- **Name:** `VERCEL_TOKEN`
- **Value:** (obtén de https://vercel.com/account/tokens)
  1. Ve a Vercel Dashboard
  2. Settings → Tokens
  3. Create new Token
  4. Dale un nombre: "GitHub Actions"
  5. Copia el token completo
  6. Pégalo en GitHub Secret

#### Secret 2: VERCEL_ORG_ID
- **Name:** `VERCEL_ORG_ID`
- **Value:** (obtén de Vercel Dashboard)
  1. Ve a https://vercel.com/dashboard
  2. Settings → General
  3. Busca "Team ID" o "Org ID"
  4. Cópialo y pégalo en GitHub Secret

#### Secret 3: VERCEL_PROJECT_ID
- **Name:** `VERCEL_PROJECT_ID`
- **Value:** (obtén de Vercel Dashboard)
  1. Ve a https://vercel.com/dashboard
  2. Haz clic en tu proyecto "contable-app"
  3. Settings → General
  4. Busca "Project ID"
  5. Cópialo y pégalo en GitHub Secret

**Alternativa rápida con CLI:**
```bash
# Si tienes Vercel CLI instalado
vercel link --project contable-app
vercel env list

# Esto también mostrará los IDs necesarios
```

---

## 🔄 PASO 5: GitHub Actions CI Ejecutará Automáticamente

Cuando hagas push a main:

1. **GitHub Actions CI Workflow** (`.github/workflows/ci.yml`)
   - Checklist de TypeScript ✓
   - Build de Next.js ✓
   - Tiempo: ~3-5 minutos

2. **Luego Vercel Deploy Workflow** (`.github/workflows/vercel-deploy.yml`)
   - Deploy a Vercel staging ✓
   - Genera URL staging ✓
   - Tiempo: ~2-3 minutos

**Total esperado:** 5-8 minutos

---

## 📊 MONITOREAR DEPLOYMENT

### En GitHub
```
Repositorio → Actions → Ver el workflow en ejecución
```

### En Vercel
```
https://vercel.com/dashboard → Tu proyecto → Ver deployment
```

---

## ✅ VERIFICAR QUE STAGING ESTÁ LIVE

Una vez que GitHub Actions y Vercel completen:

```bash
# 1. Test health endpoint (reemplaza con tu URL staging)
curl https://contable-app-staging.vercel.app/api/health

# Esperado: {"ok":true,"db":"ok"...}

# 2. Test login
curl -X POST https://contable-app-staging.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Esperado: {"ok":true,"data":{"token":"eyJhbGci...","usuario":{...}}}
```

---

## 🎯 CHECKLIST FINAL (ACCIÓN 6)

- [ ] Repositorio creado en GitHub
- [ ] Commits pusheados a main
- [ ] GitHub Secrets configurados (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
- [ ] GitHub Actions CI workflow ejecutado y pasó
- [ ] Vercel deployment completado
- [ ] Staging URL disponible
- [ ] API /api/health respondiendo
- [ ] Login flow funcionando
- [ ] JWT token siendo generado correctamente

---

## ⚠️ TROUBLESHOOTING

### Error: "Remotes already exists"
```bash
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/contable-app.git
```

### Error: "Push rejected"
- Verifica que creaste el repo en GitHub
- Verifica el usuario y la URL son correctos
- Si es el primer push, usa: `git push -u origin main`

### GitHub Actions falla con TypeScript errors
```bash
# Verifica localmente
npx tsc --noEmit

# Si hay errores, corrígelos y haz nuevo commit
git add .
git commit -m "Fix TypeScript errors"
git push origin main
```

### Vercel no deploya
1. Verifica que los GitHub Secrets estén configurados correctamente
2. Verifica los logs del workflow en GitHub Actions
3. Verifica que `.env.production` tenga todos los valores necesarios

---

## 📞 CONTACTO & PRÓXIMOS PASOS

Una vez que Acción 6 esté completa (staging URL live):

**Acción 7: Validate Staging Environment**
- Test endpoints en staging
- Verificar login, crear créditos, editar, auditoría, eliminar
- Confirmar que todo funciona igual que en desarrollo

**Acción 8-10: Security + Testing**
- Rate limiting
- Security headers
- Automated E2E tests en GitHub Actions

---

**Sistema Contable Integral**  
*Fase 4 — Deployment Guide*  
*21 Noviembre 2025*
