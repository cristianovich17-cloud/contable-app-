# 🔧 Configurar DATABASE_URL en Vercel

## ¿Por qué el error de Prisma?

Vercel intentó compilar sin la variable `DATABASE_URL`. Aunque el `.env.production` está en gitignore (correcto por seguridad), Vercel necesita que la configures.

## ✅ Solución: Configurar en Vercel Dashboard

### **Paso 1: Abre Vercel Dashboard**
```
https://vercel.com/dashboard
```

### **Paso 2: Click en "contable-app"**

### **Paso 3: Ve a "Settings"**

### **Paso 4: Click en "Environment Variables"**

### **Paso 5: Agrega DATABASE_URL**

Haz click en "Add New" y configura:

```
Name:  DATABASE_URL
Value: file:./data/db.json
```

Selecciona los ambientes (Environment): **Production**

### **Paso 6: Click "Save"**

---

## 📋 Variables Recomendadas para Vercel

| Nombre | Valor | Ambiente |
|--------|-------|----------|
| `DATABASE_URL` | `file:./data/db.json` | Production |
| `JWT_SECRET` | `tu-secreto-largo-aleatorio` | Production |
| `NODE_ENV` | `production` | Production |

---

## 🔄 Después de configurar

1. Ve al deployment y haz click en **[Redeploy]**
2. Vercel compilará nuevamente con las variables
3. En 2-3 minutos debería estar online

---

## 📊 Opción de Upgrade Futuro

Para producción con datos persistentes reales, migra a:
- **PostgreSQL en Vercel** (con Prisma)
- **Railway.app** (hosting + DB)
- **Supabase** (PostgreSQL + Auth)

Por ahora, SQLite local es suficiente para desarrollo y demo.
