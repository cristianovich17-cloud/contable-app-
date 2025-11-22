# Guía de Deployment en Fly.io

## 1. Crear cuenta en Fly.io (GRATIS)

1. Ve a https://fly.io
2. Haz clic en **Sign Up**
3. Completa el registro (puedes usar GitHub para más rápido)
4. Verifica tu email

## 2. Instalar CLI de Fly.io localmente

```bash
curl -L https://fly.io/install.sh | sh
```

## 3. Autenticarse con Fly.io

```bash
flyctl auth login
```

Esto abrirá una ventana del navegador. Completa el login.

## 4. Crear el proyecto en Fly.io

```bash
cd /Users/cristianvivarvera/Vscode_Proyectos/contable-app
flyctl launch --no-deploy
```

Responde a las preguntas:
- **App name**: `contable-app-staging` (o similar)
- **Region**: elige la más cercana a ti
- **Postgres database**: `n` (usamos SQLite por ahora)
- **Redis**: `n`

Esto generará/actualizará el `fly.toml`.

## 5. Obtener el Token de Fly.io

```bash
flyctl tokens create deploy --read-org
```

Copia el token que se imprime (largo, tipo JWT).

## 6. Añadir el Secret en GitHub

1. Ve a: https://github.com/cristianovich17-cloud/contable-app-/settings/secrets/actions
2. Haz clic en **New repository secret**
3. **Name**: `FLY_API_TOKEN`
4. **Secret**: pega el token que copiaste
5. Haz clic en **Add secret**

## 7. Verificar que los otros secrets existen

Asegúrate que tienes estos 3 secrets YA AÑADIDOS:
- `DATABASE_URL` ✅
- `JWT_SECRET` ✅
- `REDIS_URL` ✅

Si NO están, añádelos ahora con los mismos valores de antes.

## 8. Hacer commit y push

```bash
cd /Users/cristianvivarvera/Vscode_Proyectos/contable-app
git add -A
git commit -m "feat: switch to Fly.io deployment"
git push origin main
```

El workflow `fly-deploy.yml` se ejecutará automáticamente.

## 9. Monitorear el deploy

En GitHub Actions → busca el workflow **"Deploy to Fly.io"** → verifica que sea ✅ verde.

Una vez completado, la app estará en: `https://contable-app-staging.fly.dev` (o la URL que Fly.io asigne).

## 10. Validar que funciona

```bash
curl https://contable-app-staging.fly.dev/api/health
```

Deberías ver un JSON con `{ok: true}` o similar.

---

**¿Necesitas ayuda con alguno de estos pasos?** Avísame y ejecuto lo que sea localmente o desde aquí.
