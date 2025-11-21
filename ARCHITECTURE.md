# Guía de Arquitectura - Sistema de Contabilidad para Asociación de Socios

## 1. Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Application (Frontend)             │
│                                                               │
│  Pages:                                                       │
│  ├── /socios              → Gestión de socios               │
│  ├── /transacciones       → Ingresos/Egresos                │
│  ├── /reportes            → Reportes mensuales/anuales      │
│  └── /                    → Dashboard                        │
└──────────┬──────────────────────────────────────────────────┘
           │
           ├─ API Routes (/app/api/)
           │  ├── /socios             → CRUD de socios
           │  ├── /transacciones      → Ingresos/Egresos
           │  │  ├── /ingresos        → POST, GET ingresos
           │  │  └── /egresos         → POST, GET egresos
           │  └── /reportes           → Análisis financiero
           │     ├── /mensual         → Reporte mensual
           │     └── /anual           → Reporte anual + comparativa
           │
           └─ Backend Services
              ├── Prisma ORM (SQLite)
              │  └── prisma/dev.db
              ├── BullMQ Queue (Redis)
              │  └── Worker: bull-worker.ts
              └── Email Service (Nodemailer)
```

## 2. Base de Datos (Prisma + SQLite)

### Modelos Principales

```typescript
// 1. Socio - Información de asociados
model Socio {
  id: Int @id @default(autoincrement())
  numero: Int @unique                    // N° único del socio
  nombre: String                         // Nombre completo
  email: String?                         // Email de contacto
  telefono: String?
  estado: String @default("activo")      // activo/inactivo
  
  // Relaciones
  descuentos: Descuento[]
  creditos: Credito[]
  pagos: Pago[]
  recibos: Recibo[]
  sentEmails: SentEmail[]
}

// 2. CuotaConfig - Montos de cuotas mensuales
model CuotaConfig {
  id: Int @id @default(autoincrement())
  mes: Int                               // 1-12
  año: Int
  cuotaBienestar: Float                 // Monto cuota bienestar
  cuotaOrdinaria: Float                 // Monto cuota ordinaria
  cuotaSocioAFUT: Float?                // Bienestar + Ordinaria
  
  @@unique([mes, año])                  // Un config por mes/año
}

// 3. Descuento - Descuentos mensuales por socio
model Descuento {
  id: Int @id @default(autoincrement())
  socioId: Int
  socio: Socio @relation(...)
  mes: Int
  año: Int
  monto: Float                           // Monto del descuento
  concepto: String?                      // Gas, incorporación, etc
  
  @@index([socioId, mes, año])           // Búsquedas frecuentes
}

// 4. Credito - Créditos otorgados a socios
model Credito {
  id: Int @id @default(autoincrement())
  socioId: Int
  socio: Socio @relation(...)
  monto: Float
  concepto: String?                      // Ahorrocoop, etc
  cuotasPagadas: Int @default(0)
  estado: String @default("pendiente")   // pendiente/pagado/cancelado
  
  pagos: Pago[]
}

// 5. Pago - Pagos realizados
model Pago {
  id: Int @id @default(autoincrement())
  socioId: Int
  socio: Socio @relation(...)
  creditoId: Int?                        // Si es pago a crédito
  credito: Credito? @relation(...)
  monto: Float
  fecha: DateTime @default(now())
}

// 6. Recibo - Recibos generados
model Recibo {
  id: Int @id @default(autoincrement())
  socioId: Int
  socio: Socio @relation(...)
  mes: Int
  año: Int
  monto: Float
  concepto: String?
  pdfPath: String?                       // Ruta del PDF generado
}

// 7. Transaccion - Ingresos/Egresos de la asociación
model Transaccion {
  id: Int @id @default(autoincrement())
  tipo: String                           // "ingreso" o "egreso"
  categoria: String                      // cuotas, administrativo, etc
  mes: Int
  año: Int
  monto: Float
  concepto: String?
  referencia: String?
  
  comprobantes: Comprobante[]            // Adjuntos
  
  @@index([tipo, mes, año])              // Búsquedas frecuentes
}

// 8. Comprobante - Adjuntos a transacciones
model Comprobante {
  id: Int @id @default(autoincrement())
  transaccionId: Int
  transaccion: Transaccion @relation(...)
  nombre: String                         // Nombre del archivo
  ruta: String                           // /uploads/2025/comprobante_123.pdf
  tipoMIME: String                       // application/pdf, image/png
  tamaño: Int                            // Bytes
}

// 9. SentEmail - Registro de envíos de boletas
model SentEmail {
  id: Int @id @default(autoincrement())
  socioId: Int?
  socio: Socio? @relation(...)
  email: String
  mes: Int
  año: Int
  asunto: String
  processed: Boolean @default(false)
  processedOk: Boolean @default(false)
  lastError: String?
  processedDate: DateTime?
}
```

## 3. API Endpoints

### Gestión de Transacciones

#### POST /api/transacciones/ingresos
```bash
curl -X POST http://localhost:3000/api/transacciones/ingresos \
  -H "Content-Type: application/json" \
  -d '{
    "categoria": "cuotas",
    "mes": 11,
    "año": 2025,
    "monto": 5000,
    "concepto": "Cuotas mes de noviembre",
    "referencia": "Banco ABC - Depósito"
  }'

# Respuesta:
{
  "ok": true,
  "transaccion": {
    "id": 1,
    "tipo": "ingreso",
    "categoria": "cuotas",
    "mes": 11,
    "año": 2025,
    "monto": 5000,
    ...
  }
}
```

#### GET /api/transacciones/ingresos?mes=11&año=2025&categoria=cuotas
```json
{
  "ok": true,
  "ingresos": [...],
  "resumen": {
    "total": 15000,
    "cantidad": 3,
    "porCategoria": {
      "cuotas": 10000,
      "donaciones": 5000
    }
  }
}
```

#### POST /api/transacciones/egresos
Estructura idéntica a ingresos, con categorías: administrativos, proveedores, bienestar, salarios, otros

#### GET /api/transacciones/egresos?mes=11&año=2025

### Reportes

#### GET /api/reportes/mensual?mes=11&año=2025
```json
{
  "ok": true,
  "periodo": { "mes": 11, "año": 2025 },
  "ingresos": {
    "porCategoria": { "cuotas": 50000, "donaciones": 2000 },
    "total": 52000,
    "cantidad": 5
  },
  "egresos": {
    "porCategoria": { "administrativos": 5000, "bienestar": 3000 },
    "total": 8000,
    "cantidad": 2
  },
  "balance": 44000,
  "descuentosPorSocio": [
    {
      "numero": 101,
      "nombre": "Juan Pérez",
      "total": 450,
      "cantidad": 2,
      "detalles": [
        { "concepto": "Gas", "monto": 200 },
        { "concepto": "Incorporación", "monto": 250 }
      ]
    }
  ],
  "morosos": [
    {
      "socio": { "numero": 102, "nombre": "Carlos López" },
      "creditoId": 5,
      "monto": 1000,
      "estado": "pendiente"
    }
  ],
  "resumen": {
    "totalIngresos": 52000,
    "totalEgresos": 8000,
    "balance": 44000,
    "sociosMorosos": 1,
    "totalDescuentos": 2250
  }
}
```

#### GET /api/reportes/anual?año=2025&formato=json|csv
Proporciona:
- Resumen mensual (ingresos, egresos, balance)
- Análisis comparativo con año anterior
- Exportación a CSV

### Estructura de Respuestas

Todas las respuestas siguen este patrón:
```json
{
  "ok": true/false,
  "data": {...},
  "error": "String con descripción del error (si ok=false)"
}
```

## 4. Frontend Components

### Página `/transacciones`
- Formulario para crear ingresos/egresos
- Selector de tipo (ingreso/egreso)
- Filtros: mes, año, categoría
- Tabla de historial con totales
- Upload de comprobantes (futuro)

### Página `/reportes`
- Tabs: Mensual / Anual
- Filtros: mes (mensual), año
- Cards con KPIs: Total Ingresos, Egresos, Balance, Morosos
- Tablas de detalle por categoría
- Botón descargar CSV
- Tabla de descuentos por socio

## 5. Servicios Internos

### `src/lib/prisma-db.ts`
**Funciones principales:**

```typescript
// Crear transacción con comprobante
crearTransaccionConComprobante(transaccionData, comprobante?)

// Agregar comprobante a transacción existente
agregarComprobanteATransaccion(transaccionId, comprobante)

// Obtener transacciones con filtros
obtenerTransacciones(tipo?, mes?, año?)

// Resumen por mes/año
obtenerTransaccionesPorMesYAño(mes, año)
// Retorna: { ingresos: [...], egresos: [...] }

// Totales por categoría
calcularTotalesPorCategoria(tipo, mes, año)
// Retorna: { "cuotas": 50000, "donaciones": 2000, ... }

// Manejo de socios, descuentos, créditos, pagos (legacy)
createSocio, getSocioByNumero, updateSocio, deleteSocio
createDescuento, createCredito, createPago
```

### `src/lib/queue.ts`
Sistema de colas con BullMQ + Redis:
```typescript
enqueueBoleta(job) // Encola un trabajo
// Requiere: { numero, mes, año, sentEmailId }
```

### `src/worker/bull-worker.ts`
Worker que procesa jobs:
1. Busca socio por número
2. Obtiene descuentos mensuales
3. Genera PDF de boleta
4. Envía email
5. Registra resultado en SentEmail

## 6. Flujos de Datos

### Flujo: Registrar Ingreso/Egreso

```
Usuario en /transacciones
    ↓
POST /api/transacciones/ingresos
    ↓
Validar categoría, mes, año, monto
    ↓
prisma.transaccion.create()
    ↓
Guardar en BD (Transaccion + Comprobante si aplica)
    ↓
Retornar transacción creada
    ↓
Tabla actualiza con nuevo registro
```

### Flujo: Generar Reporte Mensual

```
Usuario en /reportes
    ↓
GET /api/reportes/mensual?mes=X&año=Y
    ↓
Paralelamente:
  1. Obtener todas las Transacciones de mes/año
  2. Obtener Descuentos por Socio
  3. Obtener Créditos Pendientes (morosos)
    ↓
Agrupar ingresos por categoría
Agrupar egresos por categoría
Calcular balance
    ↓
Retornar JSON con resumen ejecutivo
    ↓
Frontend renderiza cards + tablas
```

### Flujo: Envío de Boletas (Background)

```
POST /api/socios/enviar-boletas-mes
    ↓
Crear registros SentEmail para cada socio
Encolar jobs en Redis (BullMQ)
    ↓
Retornar inmediatamente con summary
    ↓
[Worker Bull en background]
    ↓
Procesar cada job:
  - Generar PDF
  - Enviar email
  - Actualizar SentEmail (processed, processedOk, lastError)
    ↓
Reintentos automáticos si falla (5 intentos, exponential backoff)
```

## 7. Categorías Predefinidas

### Ingresos
- `cuotas` - Cuotas regulares de socios
- `donaciones` - Aportes voluntarios
- `actividades` - Eventos, talleres, etc
- `intereses` - Rendimiento de fondos
- `otros` - Otros ingresos

### Egresos
- `administrativos` - Gastos operativos, oficina
- `proveedores` - Compras, suministros
- `bienestar` - Actividades de bienestar social
- `salarios` - Remuneraciones (si aplica)
- `otros` - Otros gastos

## 8. Validaciones

### API Side
- Categoría debe estar en lista predefinida
- Mes: 1-12
- Año: >= 2020
- Monto: > 0
- Email: formato válido (si aplica)

### Frontend Side
- Campos obligatorios: categoría, mes, año, monto
- Confirmaciones antes de eliminar
- Manejo de errores con feedback visual
- Validación en tiempo real (futuro)

## 9. Escalabilidad

### Actuales
- SQLite en dev (cambiar a PostgreSQL en producción)
- Redis local para queue
- Emails con rate limiting (futuro)
- Cache in-memory para reportes (futuro)

### Recomendaciones
- PostgreSQL para DB en producción
- Redis cloud (p.ej. Upstash) para queue
- Implementar paginación en endpoints
- Agregar índices adicionales según uso

## 10. Tests Recomendados

```bash
# Crear ingreso
POST /api/transacciones/ingresos
  Input: { categoria: "cuotas", mes: 11, año: 2025, monto: 5000 }
  Expected: 201 con transacción creada

# Listar ingresos
GET /api/transacciones/ingresos?mes=11&año=2025
  Expected: 200 con array de ingresos y resumen

# Reporte mensual
GET /api/reportes/mensual?mes=11&año=2025
  Expected: 200 con ingresos, egresos, balance, morosos

# Reporte anual
GET /api/reportes/anual?año=2025
  Expected: 200 con resumen mensual y comparativa

# Descargar CSV
GET /api/reportes/anual?año=2025&formato=csv
  Expected: 200 con archivo CSV
```

## 11. Próximos Pasos

✅ **Completado (Fase 1):**
- Endpoints de Ingresos/Egresos
- Reportes Mensuales/Anuales
- Frontend Transacciones
- Frontend Reportes
- Schema Prisma con Comprobantes

📋 **Fase 2:**
- Upload de comprobantes (formidable)
- Validaciones frontend avanzadas
- Autenticación de usuarios
- Permisos y roles
- Audit trail

🔮 **Fase 3:**
- Dashboard con gráficos (recharts)
- Predicción de flujos
- Notificaciones automáticas
- Integración con pagos online
- Exportación a Excel (xlsx)
