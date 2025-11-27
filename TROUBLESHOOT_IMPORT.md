# 🔍 Guía de Solución de Problemas - Importación de Excel

## ❌ Problema: Los datos no se suben

Si la importación no funciona, sigue esta guía.

---

## ✅ Formato Correcto del Excel

Tu archivo Excel **DEBE tener estas columnas** (en cualquier orden):

| Columna | Valores Válidos | Ejemplo | Requerido |
|---------|-----------------|---------|-----------|
| **N°** | Número único | 001, 002, 003 | ✅ SÍ |
| **RUT** | Múltiples formatos aceptados | 12345678-9, 12.345.678-9, 12345678 9 | ✅ SÍ |
| **Nombre Completo** | Texto | Juan García | ✅ SÍ |
| **Calidad Jurídica** | Solo 2 opciones: "Funcionario" o "Código del Trabajo" | Funcionario | ✅ SÍ |
| **Correo Electrónico** | Email válido (opcional) | juan@example.com | ❌ NO |

### ⚠️ IMPORTANTE: Variaciones de Nombres de Columnas

El sistema acepta estas variaciones:
- **N°**: N°, N, No, numero, n°, n
- **RUT**: RUT, Rut, rut
- **Nombre**: Nombre Completo, Nombre, nombre
- **Calidad**: Calidad Jurídica, Calidad juridica, Calidad, calidad
- **Correo**: Correo Electrónico, Email, correo, email

---

## 🔴 Errores Comunes

### 1️⃣ "Falta N°"
**Causa:** La columna N° está vacía o no existe
**Solución:** 
- ✅ Asegúrate de tener una columna con encabezado "N°"
- ✅ Rellena con números únicos (001, 002, 003, etc.)

### 2️⃣ "Falta RUT"
**Causa:** La columna RUT está vacía
**Solución:**
- ✅ Asegúrate de tener una columna "RUT"
- ✅ Formatos válidos: `12345678-9` o `12.345.678-9` o `12345678 9`
- ✅ El sistema normaliza automáticamente
- ✅ No pueden repetirse RUT

### 3️⃣ "Falta Nombre completo"
**Causa:** La columna de nombre está vacía
**Solución:**
- ✅ Llena la columna "Nombre Completo"
- ✅ Ejemplo: "Juan García Pérez"

### 4️⃣ "Falta Calidad jurídica"
**Causa:** La columna está vacía
**Solución:**
- ✅ Rellena con: "Funcionario" o "Código del Trabajo"
- ⚠️ Acepta mayúsculas/minúsculas pero SOLO estos 2 valores

### 5️⃣ "Calidad jurídica inválida"
**Causa:** El valor no es "Funcionario" ni "Código del Trabajo"
**Solución:**
- ❌ NO válido: "Empresa", "Persona Natural", "Cooperativa", "Asociación"
- ✅ Válido: "Funcionario" o "Código del Trabajo"

### 6️⃣ "Duplicado: RUT X ya existe"
**Causa:** El RUT ya está registrado en la base de datos
**Solución:**
- Elimina la fila duplicada del Excel
- O usa un RUT diferente
- O borra el socio existente antes de importar

---

## 📋 Ejemplo de Excel Correcto

```
N°          RUT             Nombre Completo          Correo Electrónico      Calidad Jurídica
001         12345678-9      Juan García              (vacío)                 Funcionario
002         98765432-1      Patricia Martínez                                Código del Trabajo
003         11111111-1      María López              maria@example.com       Funcionario
004         22222222-2      Carlos Rodríguez         carlos@domain.com       Código del Trabajo
```

**Resultado esperado:**
- 4 socios importados
- Juan García: correo auto-generado → juan.garcia@contable.app
- Patricia Martínez: correo auto-generado → patricia.martinez@contable.app
- María López: correo preservado → maria@example.com
- Carlos Rodríguez: correo preservado → carlos@domain.com

---

## 🛠️ Pasos para Importar Correctamente

### 1. Prepara tu Excel
```
✅ Abre Excel o Sheets
✅ Crea estas columnas: N°, RUT, Nombre Completo, Calidad Jurídica, Correo Electrónico
✅ Rellena los datos (Correo es opcional)
✅ Guarda como .xlsx o .xls
```

### 2. Ingresa a la Aplicación
```
✅ Ve a http://localhost:3000
✅ Inicia sesión con admin@contable.app / admin123
✅ Ve a "Gestión de Socios"
```

### 3. Importa el Archivo
```
✅ Haz clic en "Importar Socios desde Excel"
✅ Selecciona tu archivo
✅ Haz clic en "Importar"
```

### 4. Revisa los Resultados
```
✅ Verás un mensaje con:
   - ✅ Cuántos socios se importaron
   - ❌ Cuántos errores hubo
   - Detalles de los errores (si los hay)
```

---

## 🐛 Debugging

### Para ver los logs en la terminal:
1. Abre la terminal donde ejecutas `npm run dev`
2. Busca líneas que comiencen con `[Import]`
3. Verás detalles de qué se está procesando

### Ejemplo de logs:
```
[Import] Processing Excel file: socios.xlsx
[Import] Rows found: 4
[Import] First row sample: { N°: 1, RUT: '12345678-9', Nombre: 'Juan' ... }
[Import] Row 2 added: Juan García (12345678-9)
[Import] Row 3 added: Patricia Martínez (98765432-1)
[Import] Summary - Added: 2, Errors: 0
```

---

## 📞 ¿Aún no funciona?

1. **Verifica el formato del RUT:** Debe ser `12345678-9` (con guión)
2. **Verifica Calidad Jurídica:** Solo "Funcionario" o "Código del Trabajo"
3. **Verifica no hay duplicados:** RUT y N° no pueden repetirse
4. **Revisa los nombres de columnas:** Deben coincidir exactamente
5. **Prueba con pocos datos:** Importa solo 1-2 filas para verificar

---

## 📥 Descargar Plantilla

Puedes descargar una plantilla Excel correcta:

```
N°     RUT           Nombre Completo    Correo Electrónico    Calidad Jurídica
1      12345678-9    Ejemplo Persona                          Funcionario
2      98765432-1    Empresa Ejemplo                          Código del Trabajo
```

Guarda esto como `plantilla.xlsx` y úsalo como referencia.
