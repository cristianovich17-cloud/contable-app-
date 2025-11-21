# QuickStart: Ejecutar la Aplicación

## Requisitos Previos

- Node.js 18+ installed
- Redis en ejecución (para worker)
- Archivo `.env.local` configurado con SMTP

## 1. Instalación Inicial (Primera vez)

```bash
# Clonar/abrir proyecto
cd /Users/cristianvivarvera/Vscode_Proyectos/contable-app

# Instalar dependencias
npm install

# Inicializar BD Prisma
DATABASE_URL="file:./prisma/dev.db" npx prisma generate
DATABASE_URL="file:./prisma/dev.db" npx prisma migrate dev --name init

# Verificar BD
npx prisma studio  # Abre interfaz web en http://localhost:5555
```

## 2. Configurar Variables de Entorno

Crear/actualizar `.env.local`:

```env
# Base de Datos
DATABASE_URL="file:./prisma/dev.db"

# Redis (para BullMQ)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
# REDIS_PASSWORD=opcional

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-contraseña-app (NO tu contraseña de Gmail)
SMTP_FROM_EMAIL=tu-email@gmail.com
SMTP_FROM_NAME=Contable App
```

### Obtener Contraseña de Gmail

1. Ve a [myaccount.google.com](https://myaccount.google.com)
2. **Seguridad** → **Contraseñas de aplicación**
3. Selecciona **Correo** y **Mac** (o tu sistema)
4. Copia la contraseña de 16 caracteres → pégala en `SMTP_PASSWORD`

## 3. Levantar Redis (Necesario)

### Opción A: Docker (Recomendado)

```bash
docker run -p 6379:6379 -d --name contable-redis redis:7
```

Verificar:
```bash
docker logs contable-redis
```

### Opción B: Instalado Localmente

```bash
redis-cli ping
# Debe retornar: PONG
```

## 4. Ejecutar en Desarrollo

### Terminal 1: Servidor HTTP

```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

### Terminal 2: Worker (en otra terminal)

```bash
npm run dev:worker
```

Deberías ver:
```
🚀 Worker BullMQ iniciado (cola: boletas)
   Redis: 127.0.0.1:6379
   Esperando jobs...
```

### Terminal 3: (Opcional) Prisma Studio

```bash
npx prisma studio
```

Abre http://localhost:5555 para ver/editar datos en BD.

## 5. Testing Rápido

### Crear un Socio

```bash
curl -X POST http://localhost:3000/api/socios \
  -H "Content-Type: application/json" \
  -d '{
    "numero": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com"
  }'
```

### Enviar Boleta Individual

```bash
curl -X POST http://localhost:3000/api/socios/1/enviar-boleta \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 11,
    "año": 2025,
    "email": "juan@example.com"
  }'
```

### Ver Historial de Envíos

```bash
curl http://localhost:3000/api/socios/sent-emails
```

### Ver BD con Prisma Studio

```bash
http://localhost:5555
```

## 6. Detener Todo

```bash
# Ctrl+C en cada terminal

# Detener Redis (si usas Docker)
docker stop contable-redis
docker rm contable-redis

# Limpiar BD (para empezar de nuevo)
rm prisma/dev.db
DATABASE_URL="file:./prisma/dev.db" npx prisma migrate dev --name init
```

## 7. Build para Producción

```bash
# Compilar
npm run build

# Ejecutar servidor
NODE_ENV=production npm start

# En otra terminal: ejecutar worker
NODE_ENV=production npm run worker
```

## Solución de Problemas

### ❌ "DATABASE_URL not found"
```bash
# Solución: Asegurar que .env.local existe en raíz
ls -la .env.local

# Recrea si falta
echo 'DATABASE_URL="file:./prisma/dev.db"' >> .env.local
```

### ❌ "Redis connection refused"
```bash
# Verificar si Redis está corriendo
redis-cli ping

# Si no responde:
docker run -p 6379:6379 -d --name contable-redis redis:7
```

### ❌ "SMTP Error: 451 Service Unavailable"
```
Espera unos minutos y reintenta. Es un error temporal del servidor SMTP.
```

### ❌ "Worker no procesa jobs"
```bash
# Verificar logs del worker
npm run dev:worker

# Debe mostrar:
# 🚀 Worker BullMQ iniciado...

# Si no, revisar variables de entorno REDIS_*
```

### ❌ "Errores de tipo TypeScript"
```bash
# Los errores menores de TypeScript no impiden la ejecución.
# El build necesita --swcrc si hay problemas serios:
npm run build -- --swcrc
```

## Comandos Útiles

```bash
# Ver status del servidor
curl http://localhost:3000/api/hello

# Listar socios
curl http://localhost:3000/api/socios

# Obtener configuración de cuotas
curl http://localhost:3000/api/config/cuotas

# Exportar historial a CSV
curl http://localhost:3000/api/socios/sent-emails/export > sent_emails.csv

# Ver estado del worker
curl http://localhost:3000/api/worker/status

# Iniciar worker HTTP endpoint
curl -X POST http://localhost:3000/api/worker/start

# Reintentar envíos fallidos
curl -X POST http://localhost:3000/api/socios/retry-failed-boletas \
  -H "Content-Type: application/json" \
  -d '{"mes": 11, "año": 2025}'
```

## Flujo Completo: Envio de Boletas Masivo

1. **Abrir UI:** http://localhost:3000/socios
2. **Configurar Cuotas:** Llenar "Cuota Bienestar" y "Cuota Ordinaria"
3. **Agregar Socios:** Importar Excel o crear manualmente
4. **Cargar Descuentos:** Para cada socio, crear descuentos del mes
5. **Enviar Masivo:** 
   - Seleccionar mes/año
   - Click "Enviar boletas a todos"
   - Los jobs se encolan en Redis
   - El worker los procesa en background
6. **Ver Historial:** Panel "Historial de Emails"
7. **Exportar:** Click "Descargar CSV"

---

**¡Listo!** Tu aplicación está optimizada y lista para usar. 🚀
