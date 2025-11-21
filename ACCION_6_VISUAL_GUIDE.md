# 🎬 ACCIÓN 6: DEPLOY A STAGING — GUÍA VISUAL

## 📍 ESTADO ACTUAL

```
✅ PARTE A (LOCAL) — COMPLETADA
├── ✅ E2E tests creados
├── ✅ JWT_SECRET configurado
├── ✅ Prisma bugs fixed
├── ✅ Build validado (0 TS errors)
├── ✅ .env.production ready
├── ✅ Git repo inicializado
├── ✅ 132 archivos en 2 commits
└── ✅ Listo para GitHub push

⏳ PARTE B (MANUAL) — PENDING
├── [ ] Crear repo en GitHub
├── [ ] Configurar GitHub Secrets
├── [ ] Git push a main
└── [ ] Esperar Vercel deployment
```

---

## 🚀 3 PASOS PARA COMPLETAR ACCIÓN 6

### PASO 1️⃣ — GitHub Repository Creation

**Tiempo:** 2 minutos  
**Dificultad:** ⭐ Muy fácil

```
1. Abre: https://github.com/new
2. Repository name: contable-app
3. Visibility: Private (o Public)
4. ⚠️ NO marques: README, .gitignore, license
5. Click: "Create repository"
6. Copia la URL que te muestra
```

**Resultado:**
```
GitHub URL: https://github.com/TU_USUARIO/contable-app.git
Ready for: Local push
```

---

### PASO 2️⃣ — GitHub Push

**Tiempo:** 3 minutos  
**Dificultad:** ⭐ Muy fácil

```bash
cd /Users/cristianvivarvera/Vscode_Proyectos/contable-app

# Reemplaza TU_USUARIO con tu nombre de usuario
git remote add origin https://github.com/TU_USUARIO/contable-app.git

# Verifica
git remote -v

# Push!
git push -u origin main
```

**Esperado:**
```
✅ Enumerating objects: 136, done.
✅ Compressing objects: 100% (94/94), done.
✅ Writing objects: 100% (136/136), 2.50 MiB | 1.50 MiB/s, done.
✅ To https://github.com/TU_USUARIO/contable-app.git
✅  * [new branch]      main -> main
```

---

### PASO 3️⃣ — GitHub Secrets Configuration

**Tiempo:** 5 minutos  
**Dificultad:** ⭐ Muy fácil

```
URL: https://github.com/TU_USUARIO/contable-app/settings/secrets/actions
```

**Agrega 3 secrets:**

#### Secret 1: VERCEL_TOKEN
```
URL: https://vercel.com/account/tokens
1. Click: "Create Token"
2. Name: GitHub Actions
3. Copy: El token completo
4. Paste: En GitHub Secret
```

#### Secret 2: VERCEL_ORG_ID
```
URL: https://vercel.com/dashboard
1. Click: Settings → General
2. Find: "Team ID" o "Org ID"
3. Copy it
4. Paste: En GitHub Secret
```

#### Secret 3: VERCEL_PROJECT_ID
```
URL: https://vercel.com/dashboard
1. Click: Tu proyecto "contable-app"
2. Click: Settings → General
3. Find: "Project ID"
4. Copy it
5. Paste: En GitHub Secret
```

**Resultado:**
```
✅ VERCEL_TOKEN: configured
✅ VERCEL_ORG_ID: configured
✅ VERCEL_PROJECT_ID: configured
```

---

## ⏱️ TIMELINE AUTOMÁTICO

Una vez completados los 3 pasos arriba:

```
T+0 min  → Git push completa
         ↓
T+1 min  → GitHub recibe código
         ↓
T+2 min  → GitHub Actions CI inicia
         ├─ Checkout code ✓
         ├─ Setup Node.js ✓
         ├─ npm ci (install) ✓
         ├─ npx tsc --noEmit ✓ (TypeScript check)
         └─ npm run build ✓ (Next.js build)
         ↓
T+5 min  → Si CI pasó → Vercel Deploy inicia
         ├─ Connect with secrets ✓
         ├─ Build app ✓
         ├─ Generate URL ✓
         └─ Deploy ✓
         ↓
T+8 min  → 🎉 STAGING URL LIVE
         └─ https://contable-app-staging.vercel.app
```

**Total:** ~8 minutos

---

## 📊 MONITOREAR EN VIVO

### GitHub Actions (Ver CI workflow)
```
https://github.com/TU_USUARIO/contable-app/actions
```

### Vercel Dashboard (Ver deployment)
```
https://vercel.com/dashboard/contable-app
```

---

## ✅ VERIFICAR QUE FUNCIONA

Una vez que veas la URL live en Vercel:

### Test 1: Health Endpoint
```bash
curl https://contable-app-staging.vercel.app/api/health

# Esperado:
{"ok":true,"db":"ok"}
```

### Test 2: Login
```bash
curl -X POST https://contable-app-staging.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Esperado:
{
  "ok": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "email": "admin@example.com",
      "rol": "admin"
    }
  }
}
```

### Test 3: Dashboard
```
Abre en navegador:
https://contable-app-staging.vercel.app/login

Ingresa:
- Email: admin@example.com
- Contraseña: admin123

Esperado: Dashboard carga correctamente
```

---

## 📋 CHECKLIST FINAL

```
PASO 1: GitHub Repo
├─ [ ] Repo creado
├─ [ ] URL copiada
└─ Status: Ready

PASO 2: Git Push
├─ [ ] git remote add origin ...
├─ [ ] git push -u origin main
└─ Status: Code en GitHub

PASO 3: GitHub Secrets
├─ [ ] VERCEL_TOKEN configurado
├─ [ ] VERCEL_ORG_ID configurado
├─ [ ] VERCEL_PROJECT_ID configurado
└─ Status: Secrets en GitHub

AUTOMÁTICO:
├─ [ ] GitHub Actions CI ejecuta
├─ [ ] TypeScript check pasa
├─ [ ] npm run build pasa
├─ [ ] Vercel deploy inicia
└─ [ ] Staging URL live

VALIDACIÓN:
├─ [ ] Health endpoint responde
├─ [ ] Login funciona
├─ [ ] Token generado
└─ [ ] Dashboard carga

ACCIÓN 6: ✅ COMPLETADA
```

---

## 🎯 RESULT

**Cuando completes los 3 pasos:**

```
✅ Código en GitHub
✅ CI/CD workflows activos
✅ Staging deployment automático
✅ URL live: https://contable-app-staging.vercel.app
✅ API respondiendo
✅ Listo para Acción 7

👉 NEXT: Acción 7 — Validate Staging Environment
```

---

## 📌 QUICK COMMANDS

```bash
# Después de crear GitHub repo, ejecuta esto:
cd /Users/cristianvivarvera/Vscode_Proyectos/contable-app

git remote add origin https://github.com/TU_USUARIO/contable-app.git
git push -u origin main

# Listo! Luego configura los 3 secrets en GitHub UI
# y espera 8 minutos para que Vercel deployee
```

---

## ⚠️ COMÚN ISSUES

### Issue: "fatal: remote origin already exists"
```bash
git remote remove origin
# Luego vuelve a hacer:
git remote add origin https://github.com/TU_USUARIO/contable-app.git
```

### Issue: "failed to push"
- ¿Creaste el repo en GitHub?
- ¿Es la URL correcta?
- ¿Tienes permisos?

### Issue: "GitHub Actions falla con TypeScript"
```bash
# Verifica localmente
npx tsc --noEmit

# Si hay errores, corrígelos localmente, 
# haz commit y push de nuevo
```

### Issue: "Vercel no deploya"
- Verifica que los 3 secrets estén en GitHub Settings
- Revisa los logs en GitHub Actions
- Verifica que `.env.production` esté correcto

---

## 📞 DOCUMENTACIÓN RELACIONADA

- **ACTION_6_MANUAL_STEPS.md** ← Más detalles
- **SESION_21NOV_RESUMEN.md** ← Resumen completo
- **VERCEL_STAGING_DEPLOY.md** ← Guía completa Vercel

---

**Sistema Contable Integral**  
*Fase 4 — Acción 6 Visual Guide*  
*21 Noviembre 2025*

---

## 🚀 INICIO AHORA

👉 **PASO 1:** Ve a https://github.com/new  
👉 **PASO 2:** Crea repo `contable-app`  
👉 **PASO 3:** Ejecuta `git push` desde terminal  
👉 **PASO 4:** Agrega 3 GitHub Secrets  
👉 **ESPERA:** ~8 minutos  
👉 **DISFRUTA:** Staging URL live ✅

**¡Vamos! 🎉**
