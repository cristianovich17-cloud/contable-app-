# Vercel Deployment Instructions

Contable Pro está configurado para despliegue en **Vercel** (completamente gratuito).

## Quick Start

1. **Ve a** https://vercel.com/signup
2. **Sign up con GitHub** (autoriza la aplicación)
3. **Importa este repositorio**
4. **Vercel hará el deploy automático**

Tu app estará en: `contable-app.vercel.app` ✨

## Ventajas

- ✅ Gratuito (sin tarjeta de crédito)
- ✅ Despliegue automático desde GitHub
- ✅ Base de datos SQLite incluida
- ✅ SSL/HTTPS automático
- ✅ Performance optimizado
- ✅ Logs y analytics incluidos

## Flujo de Deployment

Cada vez que hagas push a `main`:
```bash
git add .
git commit -m "tu mensaje"
git push origin main
```

Vercel detecta el cambio y **despliega automáticamente** 🚀
