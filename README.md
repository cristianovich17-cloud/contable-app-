# Contable-app - Sistema de Contabilidad para Asociación de Socios

## 📊 Estado del Proyecto

**Versión:** 2.0.0  
**Fase 1:** ✅ 100% Completada  
**Fase 2:** ✅ 100% Completada (Autenticación, Permisos, Upload)  
**Fase 3:** ⏳ Próxima (Auditoría, Gráficos)  

---

## 🎯 Funcionalidades Implementadas

### FASE 1 - Contabilidad Base ✅
- ✅ Gestión de Socios (CRUD, importación Excel)
- ✅ Registro de Ingresos/Egresos categorizados
- ✅ Reportes Mensuales y Anuales
- ✅ Exportación a CSV
- ✅ Gestión de Cuotas y Descuentos
- ✅ Seguimiento de Morosos

### FASE 2 - Autenticación y Seguridad ✅
- ✅ **Login/Logout con JWT**
- ✅ **Roles** (Admin, Contador, Visor)
- ✅ **Permisos granulares** por rol
- ✅ **Página de login** con registro
- ✅ **Upload de comprobantes** (PDF, PNG, JPG)
- ✅ **Usuarios de demo** para pruebas

### FASE 3 - Próximas (Auditoría y Gráficos)
- [ ] Página de auditoría (logs de cambios)
- [ ] Gráficos interactivos (Chart.js)
- [ ] Presupuestos y alertas
- [ ] Notificaciones por email

---

## 👤 Usuarios de Demo

```
Admin:     admin@example.com / admin123
Contador:  contador@example.com / contador123
Visor:     visor@example.com / visor123
```

---

## 🚀 Instalación y Ejecución

### Requisitos
- Node.js 18+
- Git

### Setup

```bash
# Clonar/navegar al proyecto
cd /Users/cristianvivarvera/Vscode_Proyectos/contable-app

# Instalar dependencias
npm install

# Crear archivo .env.local (opcional para desarrollo)
echo 'DATABASE_URL="file:./prisma/dev.db"' > .env.local

# Inicializar BD (si es primera vez)
npx prisma migrate deploy

# Iniciar servidor
npm run dev
```

Acceder a: **http://localhost:3000**

---

## 📱 Acceso Rápido

### Login
```
URL: http://localhost:3000/login
Email: admin@example.com
Password: admin123
```

### Páginas Principales
```
👥 Socios:        http://localhost:3000/socios
📈 Transacciones: http://localhost:3000/transacciones
📊 Reportes:      http://localhost:3000/reportes
```

---

## 🔐 Autenticación

### Endpoints

**POST** `/api/auth/login`
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**GET** `/api/auth/me` (requiere JWT)
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/auth/me
```

**POST** `/api/auth/logout`
```bash
curl -X POST http://localhost:3000/api/auth/logout
```

---

## 💼 Roles y Permisos

| Rol | Crear Trans | Editar Trans | Ver Reportes | Admin |
|---|:---:|:---:|:---:|:---:|
| **Admin** | ✅ | ✅ | ✅ | ✅ |
| **Contador** | ✅ | ✅ | ✅ | ❌ |
| **Visor** | ❌ | ❌ | ✅ | ❌ |

---

## 📤 Upload de Comprobantes

```bash
# Subir comprobante a transacción
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@documento.pdf" \
  -F "transaccionId=1" \
  http://localhost:3000/api/transacciones/upload

# Listar comprobantes
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/transacciones/upload?transaccionId=1"

# Eliminar comprobante
curl -X DELETE \
  -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/transacciones/upload?comprobanteId=1"
```

---

## 📚 Documentación Completa

| Documento | Descripción |
|---|---|
| `GETTING_STARTED.md` | Guía rápida de inicio |
| `PHASE2_QUICK_SUMMARY.md` | Resumen FASE 2 |
| `PHASE2_COMPLETED.md` | Detalle completo FASE 2 |
| `ARCHITECTURE.md` | Arquitectura técnica |
| `IMPLEMENTATION_SUMMARY.md` | Resumen general |

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14 + React 18
- **Lenguaje:** TypeScript
- **BD:** SQLite (Prisma ORM)
- **Autenticación:** JWT + bcryptjs
- **Estilos:** Tailwind CSS
- **Background Jobs:** BullMQ + Redis
- **Email:** Nodemailer

---

## 📦 Scripts Disponibles

```bash
npm run dev          # Iniciar desarrollo
npm run build        # Build producción
npm run start        # Iniciar producción
npm run seed         # Crear usuarios de demo
npm run dev:worker   # Iniciar background worker
```

---

## 🔄 Flujo de Uso Típico

```
1. Ir a http://localhost:3000/login
2. Ingresar credenciales (admin@example.com / admin123)
3. Navegar a /socios (gestionar socios)
4. Ir a /transacciones (registrar ingresos/egresos)
5. Ver /reportes (análisis financiero)
6. Descargar CSV desde reportes
7. Cliquear "Logout" para salir
```

---

## 🚀 Despliegue en Producción

### Vercel (Recomendado - GRATUITO)

```bash
# 1. Push a GitHub
git push origin main

# 2. Ir a https://vercel.com y conectar tu repositorio
# 3. Vercel despliega automáticamente cada push

# Tu app estará en: https://contable-app.vercel.app
```

**Ventajas:**
- ✅ Completamente GRATUITO (sin tarjeta de crédito)
- ✅ Despliegue automático desde GitHub
- ✅ Base de datos SQLite incluida
- ✅ SSL/HTTPS automático
- ✅ Performance optimizado

Ver detalles: `QUICK_DEPLOY.md` o `VERCEL_DEPLOYMENT_GUIDE.md`

---

## 🐛 Troubleshooting

### Error: "database.db is locked"
```bash
# Cerrar procesos Node
killall node

# Reiniciar
npm run dev
```

### Error: "REDIS connection refused"
```bash
# Solo si usas background jobs, inicia Redis:
docker run -p 6379:6379 -d redis:7

# O en macOS con Homebrew:
brew services start redis
```

### Error de autenticación
- Asegúrate de que el token está en el header `Authorization: Bearer <token>`
- El token expira en 7 días
- Vuelve a hacer login si expiró

---

## 🤝 Contribución

Para contribuir:
1. Crear rama feature: `git checkout -b feature/mi-feature`
2. Commit cambios: `git commit -m "feat: descripción"`
3. Push: `git push origin feature/mi-feature`
4. Crear PR

---

## 📝 Licencia

MIT

---

## 📞 Soporte

Para reportes de bugs o sugerencias, revisar:
- `PHASE2_COMPLETED.md` - Documentación técnica detallada
- `GETTING_STARTED.md` - Guía de inicio rápido
- `ARCHITECTURE.md` - Especificación de endpoints

---

**Última actualización:** 17 de noviembre de 2025  
**Versión:** 2.0.0 ✅
```

Windows (PowerShell):

Abre PowerShell (preferiblemente como usuario normal) y ejecuta:

```powershell
cd C:\ruta\a\contable-app
npm install
npm run dev
# alternativa usando el script de ayuda (ejecuta con política de ejecución permitida para el script local)
npm run dev:win
```

Archivos de ayuda incluidos:
- `run-macos.sh`: script simple que instala dependencias (si faltan) y lanza `npm run dev`.
- `run-windows.ps1`: script PowerShell que instala dependencias (si faltan) y lanza `npm run dev`.

Notas:
- En Windows puede ser necesario ajustar la `ExecutionPolicy` para ejecutar `run-windows.ps1`. El script `npm run dev:win` utiliza `powershell -ExecutionPolicy Bypass -File` para facilitar su ejecución.
- Para producción se recomienda desplegar en un servidor adecuado y migrar desde `lowdb` a una base de datos SQL o PostgreSQL.
