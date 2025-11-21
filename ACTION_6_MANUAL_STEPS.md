# ⚡ ACCIÓN 6 PARTE B — MANUAL STEPS FOR GITHUB/VERCEL

## 🎯 ESTADO ACTUAL

✅ **Parte A (Local):** COMPLETADA
- Git repo inicializado
- 132 archivos en commit
- Todo listo para push

⏳ **Parte B (Manual):** PENDING
- Crear GitHub repo
- Configurar secrets
- Hacer push

---

## 🚀 EJECUTA ESTOS 3 PASOS EN ORDEN

### PASO 1️⃣ - Crear Repo en GitHub (2 minutos)

```
1. Ve a: https://github.com/new
2. Repository name: contable-app
3. Description: Sistema Contable Integral
4. Visibility: Private (o Public si lo prefieres)
5. ⚠️ NO marques "Add a README file"
6. ⚠️ NO marques "Add .gitignore" (ya lo tenemos)
7. ⚠️ NO marques "Choose a license"
8. Click: "Create repository"
9. Copia la URL: https://github.com/TU_USUARIO/contable-app.git
```

### PASO 2️⃣ - Push a GitHub (3 minutos)

```bash
cd /Users/cristianvivarvera/Vscode_Proyectos/contable-app

# Agregar remote
git remote add origin https://github.com/TU_USUARIO/contable-app.git

# Verificar
git remote -v

# Hacer push
git push -u origin main

# Debería mostrar:
# Enumerating objects: 132, done.
# Compressing objects: 100% (90/90), done.
# Writing objects: 100% (132/132), 2.50 MiB | 1.25 MiB/s, done.
# To https://github.com/TU_USUARIO/contable-app.git
#  * [new branch]      main -> main
# Branch 'main' set up to track remote tracking branch 'main' from 'origin'.
```

### PASO 3️⃣ - Configurar GitHub Secrets (5 minutos)

Ve a: `https://github.com/TU_USUARIO/contable-app/settings/secrets/actions`

**Agrega 3 secrets:**

#### A) VERCEL_TOKEN
```
Name: VERCEL_TOKEN
Value: (obtén de Vercel)
  1. Ve a: https://vercel.com/account/tokens
  2. Click: "Create Token"
  3. Name: GitHub Actions
  4. Copia el token
  5. Pégalo en GitHub Secret
```

#### B) VERCEL_ORG_ID
```
Name: VERCEL_ORG_ID
Value: (obtén de Vercel)
  1. Ve a: https://vercel.com/dashboard
  2. Click Settings → General
  3. Busca "Team ID" o "Org ID"
  4. Cópialo
  5. Pégalo en GitHub Secret
```

#### C) VERCEL_PROJECT_ID
```
Name: VERCEL_PROJECT_ID
Value: (obtén de Vercel)
  1. Ve a: https://vercel.com/dashboard
  2. Click en tu proyecto "contable-app"
  3. Click Settings → General
  4. Busca "Project ID"
  5. Cópialo
  6. Pégalo en GitHub Secret
```

---

## ⏱️ QUÉ PASA DESPUÉS

Cuando hagas el push en PASO 2, automáticamente:

1. **GitHub Actions CI** ejecuta (~3-5 minutos)
   - Checkout code
   - Setup Node.js
   - npm ci (install)
   - npx tsc --noEmit (TypeScript check)
   - npm run build (Next.js build)

2. **Si CI pasa**, Vercel Deploy ejecuta (~2-3 minutos)
   - Conecta con Vercel usando secrets
   - Deploy a staging
   - Genera URL: `https://contable-app-staging.vercel.app`

3. **Total:** 5-8 minutos hasta URL live

---

## 📊 MONITOREAR

### Ver Workflows en GitHub
```
Tu Repo → Actions → Ver el "Run" en ejecución
```

### Ver Deployment en Vercel
```
https://vercel.com/dashboard → contable-app → Deployments
```

---

## ✅ VERIFICAR QUE FUNCIONA

Una vez que todo esté live:

```bash
# 1. Health check
curl https://contable-app-staging.vercel.app/api/health

# Esperado:
# {"ok":true,"db":"ok"}

# 2. Test login
curl -X POST https://contable-app-staging.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Esperado:
# {"ok":true,"data":{"token":"eyJhbGci...","usuario":{"id":1,"email":"admin@example.com"...}}}
```

---

## 🎯 RESULT

Cuando completes estos 3 pasos:

✅ Repo en GitHub  
✅ Código pusheado  
✅ CI/CD workflows configurados  
✅ Secrets configurados  
✅ Vercel auto-deploy activo  
✅ Staging URL live  

**ACCIÓN 6 COMPLETADA ✅**

Luego: **ACCIÓN 7 — Validate Staging Environment**

---

*Sistema Contable Integral — Fase 4*  
*21 Noviembre 2025*
