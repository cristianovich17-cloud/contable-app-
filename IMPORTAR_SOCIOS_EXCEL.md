# Guía: Importar Socios desde Excel

## Formato del Archivo Excel

El archivo Excel debe tener las siguientes columnas **exactamente como se especifica**:

### Columnas Requeridas:

| Columna | Descripción | Ejemplo | Obligatorio |
|---------|-------------|---------|------------|
| **N°** | Número de socio | 1, 2, 3... | ✅ Sí |
| **RUT** | RUT del socio (con o sin puntos/guión) | 12.345.678-9 o 123456789 | ✅ Sí |
| **Nombre** o **Nombre completo** | Nombre completo del socio | Juan Pérez García | ✅ Sí |
| **Correo electrónico** o **Email** | Correo del socio | juan@example.com | ❌ No (opcional) |
| **Calidad jurídica** o **Calidad** | Tipo de socio | Persona Natural, Empresa | ✅ Sí |

---

## Nombres de Columnas Aceptados

El sistema reconoce variaciones en los nombres de columnas:

### N° (Número de socio)
- `N°`
- `N`
- `No`
- `numero`
- `n°`
- `n`

### RUT
- `RUT`
- `Rut`
- `rut`

### Nombre
- `Nombre completo`
- `Nombre`
- `nombre`

### Email
- `Correo electrónico`
- `Email`
- `correo`
- `email`

### Calidad Jurídica
- `Calidad jurídica`
- `Calidad juridica`
- `Calidad`
- `calidad`

---

## Valores Válidos para Calidad Jurídica

Solo se aceptan DOS valores:

1. **`Funcionario`** - Para trabajadores que son funcionarios públicos
2. **`Código del Trabajo`** - Para trabajadores bajo código del trabajo (sector privado)

Ejemplos válidos:
- `Funcionario`
- `funcionario`
- `Código del Trabajo`
- `código del trabajo`
- `codigo del trabajo`
- `Codigo`
- `codigo`

---

## Ejemplo de Archivo Excel Correcto

```
N°  | RUT          | Nombre completo    | Correo electrónico      | Calidad jurídica
----|--------------|-------------------|-------------------------|------------------
1   | 12.345.678-9 | Juan Pérez García  | juan@empresa.com        | Funcionario
2   | 98.765.432-1 | María López Silva  | maria@empresa.com       | Código del Trabajo
3   | 55.123.789-K | Carlos Muñoz Díaz  | carlos@empresa.com      | Funcionario
```

---

## Pasos para Importar

1. **Prepare el archivo Excel**
   - Crear archivo con las columnas especificadas
   - Asegúrese de usar exactamente los nombres de columna indicados
   - Guarde como `.xls` o `.xlsx`

2. **En la aplicación**
   - Vaya a **Gestión de Socios**
   - Haga clic en el botón **"Seleccionar archivo"** (icono de carpeta)
   - Seleccione su archivo Excel
   - Haga clic en **"Importar"**

3. **Revise los resultados**
   - El sistema mostrará: "Importados: X. Errores: Y"
   - Si hay errores, corrija el archivo y reintente

---

## Validaciones Realizadas

El sistema verifica:

✅ **Columnas requeridas presentes**
- N° (número)
- RUT
- Nombre
- Calidad jurídica

✅ **Sin duplicados**
- RUT no existe en la base de datos
- N° no existe en la base de datos

✅ **Calidad jurídica válida**
- Solo acepta valores de la lista permitida

❌ **Errores comunes**
- Falta columna obligatoria
- RUT ya existe
- Número de socio duplicado
- Calidad jurídica inválida
- Celda vacía en campo obligatorio

---

## Notas Importantes

- El email es **opcional** (puede dejarse en blanco)
- Los formatos de RUT son flexibles (con o sin separadores)
- No se necesita la fila de encabezado adicional (se detecta automáticamente)
- Se pueden importar múltiples socios en un solo archivo
- Los duplicados se rechazarán pero no afectarán los demás registros

---

## Ejemplo de Mensaje de Error

Si algo falla, verá un error como:

```
Importados: 2. Errores: 1
Fila 3: Falta Calidad jurídica, Calidad jurídica inválida
```

Esto indica que las filas 1 y 2 se importaron correctamente, pero la fila 3 tiene problemas.

