# FASE 3 Y 4 - Roadmap Detallado

**Estado:** Planificado  
**Inicio Estimado:** Próxima iteración  
**Duración Estimada:** 4-6 semanas totales (Fase 3+4)

---

## FASE 3: Auditoría, Gráficos y Análisis (2-3 semanas)

### 3.1 Sistema de Auditoría ✅ Planeado

**Objetivos:**
- Registrar TODOS los cambios en el sistema (quién, qué, cuándo)
- Vista de auditoría para admin
- Revertir cambios si es necesario

**Implementación:**

```typescript
// Modelo AuditLog ya existe en BD
model AuditLog {
  usuarioId    Int
  accion       String  // "crear_transaccion", "editar_socio", "login"
  tabla        String  // "Transaccion", "Socio", "Usuario"
  registroId   Int?    // ID del registro afectado
  cambioAnterior String? // JSON con valores anteriores
  cambioNuevo  String?  // JSON con valores nuevos
  ip           String?
  userAgent    String?
  createdAt    DateTime
}
```

**Tasks:**
1. Middleware de auditoría en cada endpoint
   - Capturar datos antes/después
   - Guardar IP y User-Agent
   - Registrar usuario que hizo cambio

2. Endpoint `/api/auditoria/logs?filtros`
   - Filtrar por usuario, tabla, acción, fecha
   - Paginar resultados
   - Solo acceso para admin

3. Página `/auditoria` (Admin only)
   - Tabla con logs
   - Filtros avanzados
   - Opción de revertir cambios

**Ejemplo de implementación:**
```typescript
// En cada POST/PUT/DELETE:
const before = await prisma.transaccion.findUnique({ where: { id } });

// Hacer cambio
await prisma.transaccion.update({ where: { id }, data: {...} });

// Registrar en auditoría
await prisma.auditLog.create({
  data: {
    usuarioId: payload.usuarioId,
    accion: 'editar_transaccion',
    tabla: 'Transaccion',
    registroId: id,
    cambioAnterior: JSON.stringify(before),
    cambioNuevo: JSON.stringify(updated),
    ip: request.ip,
    userAgent: request.headers.get('user-agent'),
  }
});
```

### 3.2 Gráficos Interactivos ✅ Planeado

**Objetivos:**
- Visualización de datos financieros
- Análisis de tendencias
- Comparativas mensuales/anuales

**Instalación:**
```bash
npm install chart.js react-chartjs-2
```

**Gráficos a implementar:**

1. **Línea:** Ingresos vs Egresos por mes
   - Eje X: Meses
   - Eje Y: Montos
   - 2 líneas: Ingresos (verde), Egresos (rojo)

2. **Barra:** Categorías de ingresos
   - Eje X: Categorías
   - Eje Y: Monto total
   - Color por categoría

3. **Pastel:** Distribución de egresos
   - Segmentos por categoría
   - Porcentaje y monto

4. **Area:** Acumulado por mes
   - Mostrar balance acumulado
   - Poder hacer zoom

**Ubicación:**
```
src/app/reportes/page.tsx
  - Reemplazar tabla de resumen mensual con gráfico de línea
  - Agregar gráficos de pie para distribución

src/app/dashboard/page.tsx (nuevo)
  - Dashboard ejecutivo con 4 gráficos
  - KPIs principales
  - Solo para Admin/Contador
```

**Ejemplo de componente:**
```tsx
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function IngresoEgresoChart({ data }) {
  const chartData = {
    labels: data.meses,
    datasets: [
      {
        label: 'Ingresos',
        data: data.ingresos,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
      },
      {
        label: 'Egresos',
        data: data.egresos,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
      },
    ],
  };

  return <Line data={chartData} options={{ responsive: true }} />;
}
```

### 3.3 Dashboard Ejecutivo ✅ Planeado

**Ubicación:** `/dashboard` (solo admin/contador)

**Componentes:**
```
┌─────────────────────────────────────────┐
│  💰 Dashboard Ejecutivo                  │
├─────────────────────────────────────────┤
│ KPIs (4 tarjetas):                      │
│ • Total Ingresos (mes actual)           │
│ • Total Egresos (mes actual)            │
│ • Balance (mes actual)                  │
│ • Socios Activos                        │
├─────────────────────────────────────────┤
│ Gráficos (2x2 grid):                    │
│ • Línea: Ingresos vs Egresos (12 meses)│
│ • Pastel: Distribución egresos         │
│ • Barra: Top categorías ingresos       │
│ • Area: Balance acumulado               │
├─────────────────────────────────────────┤
│ Tabla:                                  │
│ • Últimas 5 transacciones               │
│ • Socios morosos (si aplica)            │
└─────────────────────────────────────────┘
```

---

## FASE 4: Análisis Avanzado y Integraciones (2-3 semanas)

### 4.1 Sistema de Presupuestos ✅ Planeado

**Modelo Prisma:**
```prisma
model Budget {
  id            Int     @id @default(autoincrement())
  año           Int
  mes           Int?    // null si es anual
  categoria     String
  monto         Float   // monto presupuestado
  realizado     Float?  // se calcula de Transacciones
  desviacion    Float?  // realizado - presupuestado
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([año, mes, categoria])
  @@index([año, mes])
}
```

**Tasks:**
1. Endpoint POST `/api/budgets` - Crear presupuesto
2. Endpoint GET `/api/budgets?año=2025&mes=11` - Listar presupuestos
3. Endpoint PUT `/api/budgets/:id` - Actualizar
4. Integración en reportes:
   - Mostrar presupuestado vs realizado
   - Alertar si desviación > 10%

### 4.2 Notificaciones Automáticas ✅ Planeado

**Tipos de notificaciones:**
1. **Email al socio:** Cuota vencida
2. **Email a admin:** Ingreso grande registrado (> monto_X)
3. **Email a admin:** Presupuesto excedido
4. **Dashboard alert:** Socios morosos

**Implementación:**
```typescript
// Hook en POST /api/transacciones/ingresos
if (monto > UMBRAL_ALERTA) {
  await enviarEmailAdmin(
    'Ingreso Sospechoso',
    `Se registró ingreso de $${monto} por ${concepto}`
  );
}

// Hook en cálculo de reportes
const morosos = creditos.filter(c => c.cuotasPagadas < c.cuotas);
for (const moroso of morosos) {
  await enviarEmailSocio(
    moroso.email,
    'Cuota Vencida',
    `Tiene una cuota vencida por $${monto}`
  );
}
```

### 4.3 Integración Pagos Online ✅ Planeado

**Proveedor:** Stripe (recomendado) o PayPal

**Flujo:**
```
Usuario quiere pagar cuota online
  ↓
Click en "Pagar Online" en página socio
  ↓
Generar sesión Stripe
  ↓
Redirige a Stripe Checkout
  ↓
Usuario ingresa tarjeta
  ↓
Stripe procesa pago
  ↓
Webhook confirma pago
  ↓
Actualizar Transaccion + Pago en BD
  ↓
Enviar confirmación por email
```

**Dependencias:**
```bash
npm install stripe
```

**Endpoints a crear:**
1. POST `/api/pagos/crear-sesion-stripe`
2. POST `/api/pagos/webhook-stripe` (sin autenticación)
3. GET `/api/pagos/confirmacion`

### 4.4 Reportes Avanzados ✅ Planeado

**Nuevos reportes:**
1. **Conciliación bancaria**
   - Comparar transacciones registradas vs extracto bancario
   - Identificar discrepancias

2. **Flujo de caja proyectado**
   - Proyectar próximos 3 meses
   - Basado en patrones históricos

3. **Análisis de desviación**
   - vs presupuesto
   - vs año anterior
   - Mostrar % cambio

4. **Estados financieros**
   - Balance General
   - Estado de Resultados
   - Flujo de Efectivo

---

## Checklist de Implementación

### FASE 3
- [ ] Middleware de auditoría en todos los endpoints
- [ ] Endpoint `/api/auditoria/logs`
- [ ] Página `/auditoria` con filtros
- [ ] Instalar Chart.js + react-chartjs-2
- [ ] Gráfico de línea (ingresos vs egresos)
- [ ] Gráfico de pastel (distribución egresos)
- [ ] Página `/dashboard` ejecutivo
- [ ] KPIs en dashboard
- [ ] Integración gráficos en reportes

### FASE 4
- [ ] Modelo Budget en Prisma
- [ ] Endpoints CRUD presupuestos
- [ ] Validación presupuestos en reportes
- [ ] Sistema notificaciones email
- [ ] Alertas en dashboard
- [ ] Integración Stripe (básica)
- [ ] Webhook Stripe
- [ ] Nuevo tipo Transaccion para pagos online
- [ ] Reportes conciliación bancaria
- [ ] Reportes proyecciones

---

## Estimación de Esfuerzo

| Tarea | Complejidad | Horas Estimadas |
|---|---|---|
| Auditoría | Media | 6-8 |
| Gráficos | Media | 8-10 |
| Dashboard | Media | 4-6 |
| Presupuestos | Baja | 4-5 |
| Notificaciones | Media | 6-8 |
| Pagos Online | Alta | 12-16 |
| Reportes Avanzados | Alta | 10-14 |
| **TOTAL** | | **50-67 horas** |

**Tiempo calendario:** 4-6 semanas (dedicación 20-30 hrs/semana)

---

## Prioridad

### P0 (Crítico)
- [ ] Auditoría
- [ ] Gráficos básicos
- [ ] Dashboard

### P1 (Importante)
- [ ] Notificaciones
- [ ] Presupuestos

### P2 (Deseable)
- [ ] Pagos Online
- [ ] Reportes Avanzados

---

## Tecnologías a Instalar

### FASE 3
```bash
npm install chart.js react-chartjs-2
```

### FASE 4
```bash
npm install stripe
npm install sendgrid  # opcional, si quieres reemplazar nodemailer
```

---

## Notas Importantes

1. **Auditoría:** Es crítica para cumplimiento legal. Priorizar.
2. **Gráficos:** Mejorar UX significativamente. Usar Chart.js v4+.
3. **Pagos Online:** Requiere configuración en Stripe. Tomar tiempo para setup.
4. **Testing:** Agregar tests unitarios para nuevas funciones.
5. **Documentación:** Actualizar ARCHITECTURE.md con cada fase.

---

## Siguiente Paso

Una vez FASE 2 esté ✅, comenzar con:

1. Modelo AuditLog (ya existe, solo integrar)
2. Middleware en 2-3 endpoints críticos (transacciones)
3. Verificar que se guarda correctamente
4. Crear página `/auditoria` básica

Esto lo podríamos hacer en 1-2 sprints.

---

**Documento:** FASE 3 y 4 Roadmap  
**Fecha:** 17 de noviembre de 2025  
**Estado:** 📋 En planificación
