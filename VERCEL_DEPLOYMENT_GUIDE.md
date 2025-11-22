# 🚀 Deployment con Vercel (GRATUITO - Sin Tarjeta de Crédito)

## ✨ ¿Por qué Vercel?

- ✅ **Completamente GRATUITO** (sin tarjeta de crédito)
- ✅ Optimizado para Next.js 14
- ✅ Despliegue automático desde GitHub
- ✅ Base de datos SQLite incluida
- ✅ Dominio gratuito (tuapp.vercel.app)
- ✅ SSL/HTTPS automático
- ✅ CI/CD integrado
- ✅ Edge functions para mejor performance
- ✅ Analytics y logs incluidos

---

## 📋 Pasos de Deployment

### 1. **Preparar el repositorio (ya hecho)**
El proyecto ya tiene:
- ✅ `next.config.mjs` configurado
- ✅ `vercel.json` con configuración correcta
- ✅ Build pasando: `npm run build`
- ✅ Prisma con SQLite (persiste en `/data/db.json`)

### 2. **Ir a Vercel y conectar GitHub**

1. Abre https://vercel.com
2. Click en **"Sign Up"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza Vercel en GitHub
5. Click en **"Import Project"**

### 3. **Importar este repositorio**

1. En Vercel, busca: `contable-app` (o el nombre de tu repo)
2. Click en **"Import"**
3. Vercel detectará automáticamente Next.js

### 4. **Configurar variables de entorno**

En la sección **"Environment Variables"** en Vercel, agregar:

```
NODE_ENV = production
NEXT_PUBLIC_API_URL = (dejar vacío o tu dominio Vercel)
DATABASE_URL = (se genera automáticamente con SQLite)
```

### 5. **Deploy automático**

Vercel hará automáticamente:
- ✅ Build del proyecto
- ✅ Optimización de assets
- ✅ Despliegue en edge network global
- ✅ URL en formato: `contable-app.vercel.app`

---

## 🎯 Características Importantes

### Base de Datos (SQLite)
Vercel almacena archivos en `/data/`:
```
/data/db.json  ← Base de datos SQLite (persiste)
```

### Migraciones Automáticas
En el primer deploy, Vercel ejecutará:
```bash
npm run db:push  # Aplica esquema Prisma
npm run seed     # Siembra datos iniciales (opcional)
```

### Dominio Personalizado (Opcional)
Puedes conectar tu propio dominio:
1. En Vercel → Settings → Domains
2. Agregar tu dominio
3. Seguir instrucciones DNS

---

## 🔄 Despliegues Posteriores

Cada commit a `main` dispara automáticamente un nuevo deploy:

```bash
git add .
git commit -m "tu cambio"
git push origin main
```

Vercel detectará el push y desplegará automáticamente ✨

---

## 📊 Monitoreo

Vercel incluye:
- ✅ Dashboard en https://vercel.com/dashboard
- ✅ Logs en tiempo real
- ✅ Analytics de performance
- ✅ Errores automáticos por email

---

## 💰 Pricing

| Feature | Free | Pro |
|---------|------|-----|
| Deployments | ✅ Unlimited | ✅ Unlimited |
| Bandwidth | 100 GB/mes | 1 TB/mes |
| Build Time | ✅ | ✅ |
| Domains | ✅ | ✅ |
| **Costo** | **$0/mes** | $20/mes |

---

## 🆘 Troubleshooting

### Error: "Build failed"
```bash
# Local build test
npm run build

# Ver logs detallados en Vercel dashboard
```

### Base de datos no persiste
Vercel soporta archivos en `/data/`, `/tmp/`, etc.
Nuestro `db.json` se guarda correctamente en `/data/`

### API routes no funcionan
Vercel ejecuta todas las rutas `/api/` como serverless functions ✅

---

## 🎉 ¡Listo!

Una vez completados los pasos:

1. Tu app estará en: `https://contable-app.vercel.app` 🎊
2. Todos los cambios en GitHub se despliegan automáticamente
3. Sin cuota de pago, sin tarjeta de crédito requerida
4. Escalabilidad automática

---

## 📞 Soporte

- Docs Vercel: https://vercel.com/docs
- Next.js + Vercel: https://nextjs.org/docs/deployment/vercel
- Community: https://discord.gg/vercel
