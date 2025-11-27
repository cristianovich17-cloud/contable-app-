# Auto-Generación de Correos Electrónicos para Socios

## ✅ Implementación Completada

Se ha implementado la funcionalidad de **auto-generar correos electrónicos** cuando un socio no tiene uno especificado.

## Cambios Realizados

### 1. **Nuevo Archivo: `src/lib/email-generator.ts`**
Librería con funciones para:
- `generateEmailIfMissing(nombre, email)` - Genera correo si no existe
- `isValidEmail(email)` - Valida formato de correo
- `cleanEmail(email)` - Normaliza correo (lowercase, trim)

### 2. **API `/api/socios` (POST)**
- Si se envía `email` vacío o se omite, se genera automáticamente
- Si se envía un correo válido, se preserva tal cual
- Ejemplo: `Juan García` → `juan.garcia@contable.app`

### 3. **API `/api/socios/import` (POST)**
- Al importar desde Excel, si la columna de correo está vacía, se genera automáticamente
- Funciona con cualquier variante de nombre de columna:
  - Correo electrónico
  - Email
  - correo
  - email

### 4. **Normalización de Correos**
El proceso normaliza el nombre para crear un correo válido:
1. ✅ Convierte a minúsculas
2. ✅ Elimina acentos (á → a, é → e, í → i, etc.)
3. ✅ Reemplaza espacios y caracteres especiales con puntos
4. ✅ Elimina puntos múltiples consecutivos
5. ✅ Elimina puntos al inicio/final

### 5. **Ejemplos de Generación**

| Nombre Completo | Correo Generado |
|-----------------|-----------------|
| Juan García | juan.garcia@contable.app |
| María López Rodríguez | maria.lopez.rodriguez@contable.app |
| José María García Pérez | jose.maria.garcia.perez@contable.app |
| Empresa XYZ S.A. | empresa.xyz.s.a@contable.app |
| Ángel Carrillo | angel.carrillo@contable.app |

## Tests Implementados

### ✅ Unit Tests (test-email-generator.js)
```
Results: 8 passed, 0 failed

✅ Test 1: Juan García → juan.garcia@contable.app
✅ Test 2: María López Rodríguez → maria.lopez.rodriguez@contable.app
✅ Test 3: José María García Pérez → jose.maria.garcia.perez@contable.app
✅ Test 4: Empresa XYZ S.A. → empresa.xyz.s.a@contable.app
✅ Test 5: Email existente preservado
✅ Test 6: Email con espacios normalizado
✅ Test 7: José → jose@contable.app
✅ Test 8: Ángel Carrillo → angel.carrillo@contable.app
```

### 🔧 Integration Tests (test-auto-email.sh)
Script para probar los endpoints de API

## Cómo Usar

### Crear Socio Sin Correo
```bash
curl -X POST http://localhost:3000/api/socios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "numero": "001",
    "nombre": "Carlos Rodríguez",
    "telefono": "+56912345678"
  }'

# Respuesta:
{
  "ok": true,
  "socio": {
    "id": 1,
    "numero": "001",
    "nombre": "Carlos Rodríguez",
    "email": "carlos.rodriguez@contable.app",
    "telefono": "+56912345678",
    "estado": "activo",
    "createdAt": "2025-11-26T10:30:00Z"
  }
}
```

### Crear Socio Con Correo
Si proporcionas un correo, se preserva:
```bash
curl -X POST http://localhost:3000/api/socios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "numero": "002",
    "nombre": "Patricia Martínez",
    "email": "patricia@example.com",
    "telefono": "+56987654321"
  }'

# Respuesta: Email preservado como "patricia@example.com"
```

### Importar desde Excel
Si el Excel no tiene columna de correo o tiene celdas vacías, se generan automáticamente:

**Entrada:**
| N° | RUT | Nombre Completo | Calidad Jurídica |
|----|-----|-----------------|------------------|
| 001 | 12345678-9 | Patricia Martínez | Funcionario |
| 002 | 98765432-1 | Empresa XYZ | Código del Trabajo |

**Resultado:**
- patricia.martinez@contable.app
- empresa.xyz@contable.app

## Ventajas

1. ✅ **Todos los socios tienen correo** - Nunca hay socios sin correo
2. ✅ **Consistencia** - El correo generado es siempre el mismo para un nombre
3. ✅ **Flexible** - Si el usuario proporciona un correo, se preserva
4. ✅ **Normalizado** - Maneja acentos y caracteres especiales correctamente
5. ✅ **Auditable** - Todos los socios tienen un correo único para tracking

## Commits Realizados

1. **e1cb123** - `feat: auto-generate email for socios when not provided`
   - Creado src/lib/email-generator.ts
   - Actualizado POST /api/socios
   - Actualizado POST /api/socios/import

2. **cb0b5d3** - `docs: add auto-email generation documentation`
   - Documentación completa en AUTO_EMAIL_GENERATION.md

3. **6c3a8ac** - `test: add tests for auto-email generation`
   - Tests unitarios (8/8 pasando)
   - Tests de integración

## Estado Actual

- ✅ Funcionalidad implementada y probada
- ✅ Todos los tests pasando
- ✅ Documentación completada
- ✅ Commits realizados y pusheados a GitHub
- ✅ Servidor de desarrollo ejecutándose en http://localhost:3000
- ✅ Vercel actualizado automáticamente

## Próximos Pasos Opcionales

1. Agregar configuración para cambiar el dominio (@contable.app → otro)
2. Implementar opción para permitir/bloquear auto-generación de emails
3. Agregar endpoint para cambiar correo de un socio existente
4. Integrar con sistema de envío de emails real

## Referencias

- **Archivo de función:** `src/lib/email-generator.ts`
- **API de socios:** `src/app/api/socios/route.ts`
- **API de importación:** `src/app/api/socios/import/route.ts`
- **Documentación:** `AUTO_EMAIL_GENERATION.md`
- **Tests:** `test-email-generator.js`, `test-auto-email.sh`
