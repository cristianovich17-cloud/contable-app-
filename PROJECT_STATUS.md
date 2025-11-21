# Estado del Proyecto - Sistema de Contabilidad para Asociación de Socios

**Fecha de creación:** 16 de noviembre de 2025  
**Última actualización:** 17 de noviembre de 2025
**Versión:** MVP 0.2.0  
**Estado General:** 85% completado (Fase 3 completa, preparado para staging)

---

## 1. GESTIÓN DE SOCIOS ✅ (Completado)

### Funcionalidades Implementadas
- **Registro y gestión de socios:**
  - Crear socios manualmente vía API (`POST /api/socios`)
  - Listar socios (`GET /api/socios`)
  - Buscar por nombre, RUT o número (`GET /api/socios?q=...`)
  - Filtrar por tipo de socio/calidad jurídica (`GET /api/socios?tipo=...`)
  - Datos capturados: N°, RUT, nombre, email, estado, calidad jurídica, fecha ingreso (opcional)

- **Importación masiva desde Excel:**
  - Endpoint `POST /api/socios/import` (carga archivo .xlsx)
  - Validación de columnas requeridas
  - Detección y rechazo de duplicados (por RUT o número)
  - Validación de tipo de socio (Funcionario / Código del Trabajo)
  - Reporte de errores por fila

- **UI Frontend:**
  - Página `/socios` con tabla de socios
  - Botón para importar Excel
  - Formularios por socio para acciones (descuentos, créditos, pagos, recibos)

### Archivos Clave
- `src/app/api/socios/route.ts` — CRUD socios
- `src/app/api/socios/import/route.ts` — Importación Excel
- `src/app/socios/page.tsx` — UI página socios
- `src/lib/validators.ts` — Validaciones de import
- `src/lib/db.ts` — Acceso a base de datos JSON

---

## 2. CUOTAS Y DESCUENTOS MENSUALES ✅ (Completado)

### Funcionalidades Implementadas
- **Configuración de cuotas:**
  - Endpoint `GET/POST /api/config/cuotas` para obtener y actualizar montos
  - Campos: `bienestar`, `ordinaria`
  - Cálculo automático: `Cuota Socio AFUT = bienestar + ordinaria`
  - UI en página socios para editar y guardar

- **Descuentos por socio:**
  - Endpoint `GET /api/socios/:numero/descuentos` — listar descuentos de un socio
  - Endpoint `POST /api/socios/:numero/descuentos` — crear descuento
  - Campos: tipo, monto, descripción, fecha
  - Tipos soportados: Descuento Gas, Descuentos Adicionales, Incorporación, etc.

- **Créditos (Ahorrocoop) por socio:**
  - Endpoint `GET /api/socios/:numero/creditos` — listar créditos
  - Endpoint `POST /api/socios/:numero/creditos` — crear crédito
  - Campos: montoTotal, cuotas, descripción, fechaInicio
  - Cálculo automático de `cuotaMensual = montoTotal / cuotas`
  - Seguimiento de cuotas pagadas (`cuotasPagadas`)

- **Recibos mensuales automáticos:**
  - Endpoint `POST /api/socios/:numero/recibos` — generar recibo JSON
  - Parámetros: `month`, `year` (usa mes/año actuales por defecto)
  - Calcula y almacena:
    - Cuota AFUT
    - Suma de descuentos del mes
    - Suma de cuotas mensuales de créditos con cuotas pendientes
    - Total descuentos
    - Total a pagar
  - Endpoint `GET /api/socios/:numero/recibos/pdf` — generar y descargar PDF del recibo

- **UI Frontend:**
  - Sección "Configuración de Cuotas" en página socios
  - Botones por socio: Descuento, Crédito, Recibo, Pago
  - Formularios emergentes para crear descuentos, créditos y registrar pagos

### Archivos Clave
- `src/app/api/config/cuotas/route.ts` — Configuración cuotas
- `src/app/api/socios/[numero]/descuentos/route.ts` — Descuentos
- `src/app/api/socios/[numero]/creditos/route.ts` — Créditos
- `src/app/api/socios/[numero]/recibos/route.ts` — Recibos JSON
- `src/app/api/socios/[numero]/recibos/pdf/route.ts` — Recibos PDF
- `src/lib/cuotas.ts` — Utilidades de cálculo

---

## 3. REGISTRO DE PAGOS ✅ (Completado)

### Funcionalidades Implementadas
- **Registro de pagos:**
  - Endpoint `POST /api/socios/:numero/pagos` — registrar pago
  - Campos: amount, tipo (Cuota/Credito/Otro), descripción, creditId (opcional)
  - Crea transacción en `db.data.transactions`
  - Si es pago de crédito, incrementa automáticamente `cuotasPagadas`

- **UI Frontend:**
  - Botón "Pago" por socio
  - Formulario con monto, tipo de pago, selector de crédito
  - Actualiza cache de créditos tras registrar pago

### Archivos Clave
- `src/app/api/socios/[numero]/pagos/route.ts` — Registro de pagos

---

## 4. RECIBOS Y DOCUMENTOS ✅ (Completado)

### Funcionalidades Implementadas
- **Generación de recibos JSON:**
  - Incluye: socio, período, cuota AFUT, descuentos, créditos, totales
  - Se almacenan en `db.data.receipts`

- **Generación de recibos PDF:**
  - Formato legible con contraste de colores
  - Incluye: datos del socio, cuota AFUT, descuentos detallados, créditos pendientes
  - Total a pagar en rojo y negrita
  - Formato moneda con separadores de miles
  - Descargable como attachment

### Archivos Clave
- `src/app/api/socios/[numero]/recibos/pdf/route.ts` — Generador PDF (usa `pdfkit`)

---

## 5. REGISTRO DE INGRESOS/EGRESOS ⏳ (NO INICIADO)

### Pendiente de Implementar
- [ ] Endpoint para registrar ingresos (POST `/api/transacciones/ingresos`)
- [ ] Endpoint para registrar egresos (POST `/api/transacciones/egresos`)
- [ ] Categorización: ingresos (cuotas, donaciones, actividades), egresos (administrativos, proveedores, bienestar)
- [ ] Adjuntar comprobantes/facturas (almacenar en carpeta `/public/comprobantes` o servicio externo)
- [ ] UI para registrar transacciones
- [ ] Módulo de comprobantes

### Estimación
- API: 3-4 horas
- UI: 2-3 horas
- Total: 5-7 horas

---

## 6. INFORMES MENSUALES ⏳ (NO INICIADO)

### Pendiente de Implementar
- [ ] Endpoint resumen mensual de ingresos/egresos (`GET /api/reportes/mensual?month=&year=`)
  - Total por categoría
  - Diferencia mensual (ingresos - egresos)
  
- [ ] Endpoint informe de descuentos por socio (`GET /api/reportes/descuentos?month=&year=`)
  - Descuentos aplicados a cada socio ese mes
  
- [ ] Endpoint informe de morosos (`GET /api/reportes/morosos`)
  - Socios con pagos pendientes
  - Total adeudado por socio
  
- [ ] Endpoint informe de créditos/cuotas (`GET /api/reportes/creditos?month=&year=`)
  - Estado de créditos por socio
  - Cuotas pagadas vs pendientes
  
- [ ] Filtrado por tipo de socio en todos los reportes (`?tipoSocio=...`)
  
- [ ] Exportación a CSV/Excel

- [ ] UI para visualizar y descargar reportes

### Estimación
- API: 5-6 horas
- UI: 3-4 horas
- Total: 8-10 horas

---

## 7. CONTABILIDAD ANUAL ⏳ (NO INICIADO)

### Pendiente de Implementar
- [ ] Endpoint balance anual (`GET /api/reportes/anual?year=`)
  - Ingresos totales del año
  - Egresos totales del año
  - Balance neto
  - Resumen por mes
  
- [ ] Endpoint comparativa anual (`GET /api/reportes/comparativa?year=&previousYear=`)
  - Comparación de ingresos/egresos entre años
  - Variación porcentual
  
- [ ] Exportación a Excel con gráficos
  
- [ ] UI para dashboards anuales

### Estimación
- API: 4-5 horas
- UI: 3-4 horas
- Total: 7-9 horas

---

## 8. FUNCIONALIDADES OPCIONALES (Futuro)

### No Iniciadas
- [ ] Gestión de presupuestos
- [ ] Recordatorios automáticos de pago (email/SMS)
- [ ] Integración con pagos online
- [ ] Sistema de permisos y control de acceso de usuarios
- [ ] Auditoría de cambios

---

## 9. MEJORAS TÉCNICAS NECESARIAS

### Escalabilidad
- [ ] Migrar de `lowdb` (JSON) a **SQLite** o **PostgreSQL** para producción
- [ ] Implementar **Prisma ORM** para queries y migraciones
- [ ] Índices de base de datos para búsquedas rápidas

### Seguridad
- [ ] Autenticación y autorización (JWT, sesiones)
- [ ] Validación exhaustiva de entrada
- [ ] Rate limiting en APIs
- [ ] Encriptación de datos sensibles (RUT, email)
- [ ] Auditoria de acceso (quién vio/editó qué y cuándo)

### Mantenibilidad
- [ ] Tests unitarios (Jest)
- [ ] Tests de integración (API testing)
- [ ] Logging y monitoreo
- [ ] Documentación de APIs (Swagger/OpenAPI)

### UX
- [ ] Validación de formularios en frontend
- [ ] Confirmación de acciones críticas (modales)
- [ ] Notificaciones de éxito/error mejoradas
- [ ] Paginación en listados largos
- [ ] Filtros y ordenamiento avanzados

---

## 10. ESTRUCTURA DE CARPETAS ACTUAL

```
contable-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── config/cuotas/route.ts
│   │   │   └── socios/
│   │   │       ├── route.ts (CRUD)
│   │   │       ├── import/route.ts
│   │   │       └── [numero]/
│   │   │           ├── descuentos/route.ts
│   │   │           ├── creditos/route.ts
│   │   │           ├── pagos/route.ts
│   │   │           └── recibos/
│   │   │               ├── route.ts (JSON)
│   │   │               └── pdf/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── socios/page.tsx
│   ├── lib/
│   │   ├── db.ts (acceso base datos)
│   │   ├── validators.ts
│   │   └── cuotas.ts
│   └── styles/
│       └── globals.css
├── data/
│   └── db.json (almacenamiento JSON)
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## 11. DEPENDENCIAS INSTALADAS

```json
{
  "next": "14.2.3",
  "react": "^18",
  "lowdb": "^3.0.0",
  "xlsx": "^0.18.5",
  "uuid": "^9.0.0",
  "pdfkit": "^0.13.0",
  "tailwindcss": "^3.4.1"
}
```

---

## 12. ROADMAP RECOMENDADO (Prioridad)

### Fase 1 (Ahora - MVP) ✅ COMPLETO
- ✅ Gestión de socios
- ✅ Cuotas y descuentos
- ✅ Recibos (JSON + PDF)
- ✅ Pagos básicos

### Fase 2 (1-2 semanas)
- [ ] Registro de ingresos/egresos con categorización
- [ ] Informes mensuales básicos
- [ ] Mejoras de UI (validaciones, confirmaciones)

### Fase 3 (2-3 semanas)
- [ ] Contabilidad anual
- [ ] Exportación a Excel
- [ ] Dashboard con métricas

### Fase 4 (Futuro - Producción)
- [ ] Migración a PostgreSQL + Prisma
- [ ] Sistema de autenticación
- [ ] Auditoría y permisos
- [ ] Integración con pagos online

---

## 13. CÓMO EJECUTAR

### Instalación
```bash
cd /Users/cristianvivarvera/Vscode_Proyectos/contable-app
npm install
```

### Desarrollo
```bash
npm run dev
# macOS helper
npm run dev:mac
# Windows helper
npm run dev:win
```

### URLs Importantes
- Página de socios: `http://localhost:3000/socios`
- API socios: `http://localhost:3000/api/socios`
- API cuotas: `http://localhost:3000/api/config/cuotas`

---

## 14. PRÓXIMOS PASOS

1. **Implementar Registro de Ingresos/Egresos** (Tarea #5)
   - Crear endpoints para ingresos y egresos categorizados
   - Adjuntar comprobantes

2. **Implementar Informes Mensuales** (Tarea #6)
   - Resúmenes por categoría
   - Informes de morosos
   - Filtrado por tipo de socio

3. **Mejorar UX**
   - Validaciones en frontend
   - Modales de confirmación
   - Mejor manejo de errores

4. **Considerar Migración a SQL**
   - Si el número de socios/transacciones crece significativamente
   - PostgreSQL + Prisma recomendado

---

**Última actualización:** 16 de noviembre de 2025

