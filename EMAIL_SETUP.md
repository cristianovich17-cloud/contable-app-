# Guía: Envío de Boletas por Email

## Configuración de Email

### Requisitos

1. **Instalar dependencias** (ya completadas):
   ```bash
   npm install nodemailer @types/nodemailer @types/pdfkit
   ```

2. **Configurar variables de entorno** en `.env.local`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASSWORD=tu-contraseña-aplicacion
   SMTP_FROM_EMAIL=tu-email@gmail.com
   SMTP_FROM_NAME=Contable App
   ```

### Pasos para Gmail

#### 1. Habilitar Contraseñas de Aplicación

- Ve a tu cuenta de Google: [myaccount.google.com](https://myaccount.google.com)
- Selecciona **Seguridad** en el menú izquierdo
- Busca **Contraseñas de aplicación** (si no aparece, activa 2FA primero)
- Selecciona **Correo** y **Windows** (o tu sistema)
- Google generará una contraseña de 16 caracteres
- Copia esa contraseña y úsala en `SMTP_PASSWORD`

#### 2. Usar Contraseña de Aplicación

```env
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # (la generada por Google, sin espacios)
```

### Archivos Creados

#### 1. **Librería de Email** (`src/lib/email.ts`)
   - `getEmailTransporter()`: Configura conexión SMTP
   - `enviarBoleta()`: Envía boleta con PDF adjunto

#### 2. **Generador de PDF de Boleta** (`src/lib/pdf-boleta.ts`)
   - `generarPDFBoleta()`: Crea PDF con descuentos del mes

#### 3. **Endpoint API** (`src/app/api/socios/[numero]/enviar-boleta/route.ts`)
   - `POST /api/socios/:numero/enviar-boleta`
   - Parámetros: `{ mes, año, email }`
   - Retorna: Estado de envío y resumen de descuentos

#### 4. **UI de Socios** (actualizado `src/app/socios/page.tsx`)
   - Nuevo botón **Boleta** en la fila de acciones
   - Formulario para seleccionar mes, año y email
   - Envío con confirmación

## Uso

### Desde la UI

1. Ve a **Gestión de Socios** (/socios)
2. Haz clic en el botón **Boleta** para un socio
3. Selecciona:
   - **Mes**: Enero a Diciembre
   - **Año**: 2024, 2025, etc.
   - **Email**: Correo del socio
4. Haz clic en **Enviar**
5. Recibirás confirmación con el número de descuentos y monto total

### Desde API (cURL)

```bash
curl -X POST http://localhost:3000/api/socios/1/enviar-boleta \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 11,
    "año": 2025,
    "email": "socio@example.com"
  }'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "mensaje": "Boleta enviada exitosamente a socio@example.com",
  "descuentos": {
    "cantidad": 2,
    "total": 50000
  }
}
```

## Contenido del Email

### Asunto
```
Boleta de Descuentos - [Nombre Socio] (Noviembre 2025)
```

### Cuerpo HTML
- Información del socio (nombre, número, email)
- Período (mes y año)
- Tabla de descuentos registrados
- PDF adjunto con boleta detallada

### PDF Adjunto
- Encabezado del sistema
- Información del socio
- Tabla de descuentos con fechas
- Total de descuentos
- Fecha de generación

## Solución de Problemas

### "Email no configurado"
- Verifica que `.env.local` existe y tiene todas las variables
- Reinicia el servidor: `npm run dev`

### "Error de autenticación SMTP"
- Verifica que `SMTP_USER` y `SMTP_PASSWORD` son correctos
- Para Gmail, usa **Contraseña de Aplicación**, no tu contraseña de cuenta
- Asegúrate de tener 2FA habilitado

### "Error: 451 Temporary service unavailable"
- Espera unos minutos y reintenta
- Verifica tu conexión a Internet

### PDF no se adjunta
- Asegúrate que `pdfkit` está instalado correctamente
- Verifica permisos en el sistema de archivos

## Próximas Mejoras

- [ ] Envío masivo de boletas a todos los socios del mes
- [ ] Plantillas de email personalizables
- [ ] Historial de emails enviados
- [ ] Reintento automático en caso de fallo
- [ ] Soporte para otros proveedores SMTP (SendGrid, AWS SES, etc.)

## Ejecutar el Worker (BullMQ)

Para evitar que el servidor se "pegue" al enviar boletas masivas, el procesamiento de generación de PDF y envío de correos debe ocurrir fuera del proceso HTTP. El proyecto incluye un worker BullMQ en `src/worker/bull-worker.ts`.

### Requisitos
- Redis en ejecución (local o remoto)
- Variables de entorno de Redis: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` (si aplica)

### Docker (Redis) rápido para desarrollo

```bash
# Ejecuta Redis en docker (puerto 6379)
docker run -p 6379:6379 -d --name contable-redis redis:7
```

### Comandos disponibles

```bash
# Ejecutar worker en desarrollo (usa ts-node vía npx)
npm run dev:worker

# En producción: compilar la app y ejecutar el worker compilado
npm run build
npm run worker
```

> Nota: `npm run dev:worker` usa `npx ts-node-esm` y no requiere instalar `ts-node` globalmente.

### Variables de entorno necesarias para el worker

- `REDIS_HOST` (ej. `127.0.0.1`)
- `REDIS_PORT` (ej. `6379`)
- `REDIS_PASSWORD` (si tu instancia requiere auth)
- Las mismas variables SMTP ya configuradas en `.env.local` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`)

### Flujo recomendado

- El endpoint de envío masivo encola jobs en Redis y devuelve inmediatamente un resumen y/o job id.
- El worker (proceso separado) consume la cola, genera el PDF y envía el email.
- Los resultados (éxito/fallo) se registran en `data/db.json` (temporal) o en la DB cuando se migre a SQL.

## Referencia Técnica

### Variables de Entorno Disponibles

| Variable | Valor Predeterminado | Descripción |
|----------|----------------------|-------------|
| SMTP_HOST | smtp.gmail.com | Servidor SMTP |
| SMTP_PORT | 587 | Puerto (587 TLS, 465 SSL) |
| SMTP_USER | - | Usuario/email para autenticación |
| SMTP_PASSWORD | - | Contraseña de aplicación |
| SMTP_FROM_EMAIL | SMTP_USER | Email de origen |
| SMTP_FROM_NAME | Contable App | Nombre que aparece en "De:" |
| REDIS_HOST | 127.0.0.1 | Host de Redis para la cola |
| REDIS_PORT | 6379 | Puerto de Redis |
| REDIS_PASSWORD | - | Contraseña de Redis (si aplica) |

### Flujo de Datos

```
Usuario hace clic "Boleta"
    ↓
Frontend envía POST /api/socios/:numero/enviar-boleta (o /enviar-boletas-mes para masivo)
    ↓
Backend encola job en Redis (rápido, no bloqueante)
    ↓
Worker consume job -> obtiene descuentos -> genera PDF -> envía email
    ↓
Worker actualiza registro en DB (sentEmails) y anota estado
    ↓
Frontend muestra progreso/resultado al consultar endpoint de historial
```

## Recomendación importante (producción)

- Migrar de `data/db.json` a una base SQL (Postgres o SQLite con Prisma) antes de ejecutar múltiples procesos que escriben en la misma DB. Las escrituras concurrentes a `data/db.json` pueden corromper los datos si hay varios procesos (server + worker) escribiendo simultáneamente.
- Alternativa temporal: usar un mecanismo de locking de archivo o una cola local para serializar escrituras, pero la migración a SQL es la solución robusta.

***

*** End Patch