# Generación Automática de Correos Electrónicos

## Descripción

Cuando un socio no tiene correo electrónico especificado, el sistema genera automáticamente uno basado en su nombre.

## Formato de Correo Generado

El formato de correo generado es: `{nombre-normalizado}@contable.app`

**Ejemplo:**
- Nombre: `Juan García Pérez` → `juan.garcia.perez@contable.app`
- Nombre: `María López` → `maria.lopez@contable.app`
- Nombre: `Empresa ABC S.A.` → `empresa.abc.s.a@contable.app`

## Normalización de Nombres

El proceso de normalización:
1. Convierte a minúsculas
2. Elimina acentos y caracteres especiales
3. Reemplaza espacios con puntos
4. Limpia múltiples puntos consecutivos
5. Elimina puntos al inicio/final

## Dónde se Aplica

### 1. **Creación Manual de Socio**
- Endpoint: `POST /api/socios`
- Si el campo `email` viene vacío o no se proporciona, se genera automáticamente

### 2. **Importación desde Excel**
- Endpoint: `POST /api/socios/import`
- Si la columna de correo está vacía, se genera automáticamente
- Válido para cualquiera de estas variaciones de columna:
  - Correo electrónico
  - Email
  - correo
  - email

## Ejemplos de Uso

### Creación Manual
```javascript
// Sin especificar correo - se genera automáticamente
POST /api/socios
{
  "numero": "001",
  "nombre": "Carlos Rodríguez",
  "telefono": "+56912345678"
  // email no se proporciona
}

// Respuesta:
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

### Importación desde Excel
Si importas un archivo Excel sin la columna de correo (o con celdas vacías):

| N° | RUT | Nombre Completo | Calidad Jurídica |
|----|-----|-----------------|------------------|
| 001 | 12345678-9 | Patricia Martínez | Funcionario |
| 002 | 98765432-1 | Empresa XYZ | Código del Trabajo |

**Resultado:** Se generarán correos automáticamente:
- patricia.martinez@contable.app
- empresa.xyz@contable.app

## Comportamiento

- ✅ Si se proporciona un correo válido, se **mantiene tal cual** (solo se normaliza)
- ✅ Si el correo está vacío o no se proporciona, se **genera uno automático**
- ✅ El correo generado es **único** basado en el nombre
- ✅ Se **limpia y normaliza** (minúsculas, sin espacios, sin acentos)

## Función Auxiliar

La lógica está en `src/lib/email-generator.ts`:

```typescript
export function generateEmailIfMissing(nombre: string, email?: string): string {
  // Si ya tiene correo, retornarlo tal cual
  if (email && email.trim() !== '') {
    return email.trim();
  }

  // Generar correo a partir del nombre
  const emailBase = nombre
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.+|\.+$/g, '');

  return `${emailBase}@contable.app`;
}
```

## Notas Importantes

- El correo generado es automático, no es requerimiento que sea uno real
- El dominio es `@contable.app` (interno del sistema)
- Todos los socios tendrán un correo válido para referencia y auditoría
- Se puede cambiar manualmente el correo de un socio después de crearlo

## Migración de Socios Existentes

Para actualizar socios existentes sin correo, usar:

```sql
UPDATE Socio 
SET email = LOWER(
  REPLACE(
    REPLACE(
      REPLACE(REPLACE(nombre, ' ', '.'), 'á', 'a'),
      'é', 'e'
    ),
    'í', 'i'
  )
) || '@contable.app'
WHERE email IS NULL OR email = '';
```

## Validación

El correo generado se valida para asegurar que tiene formato válido usando regex:
```typescript
const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```
