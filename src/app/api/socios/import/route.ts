import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import * as XLSX from 'xlsx'
import { validateSocioRow, isValidCalidad } from '@/lib/validators'
import { generateEmailIfMissing, cleanEmail } from '@/lib/email-generator'

export const dynamic = 'force-dynamic'

/**
 * Normaliza RUT removiendo puntos y espacios, convierte K a mayúscula
 * Acepta formatos: 12345678-9, 12.345.678-9, 12345678 9, 12345678-K, 12.345.678-K
 */
function normalizeRUT(rut: string): string {
  if (!rut) return ''
  return String(rut)
    .trim()
    .toUpperCase() // Convierte todo a mayúscula (incluyendo K)
    .replace(/\./g, '') // Remover puntos
    .replace(/\s/g, '') // Remover espacios
}

export async function POST(request: Request) {
  try {
    console.log('[Import] Starting import process...')
    
    const form = await request.formData()
    const file = form.get('file') as any
    
    console.log('[Import] File received:', file?.name || 'NO FILE')
    
    if (!file) {
      console.log('[Import] Error: No file provided')
      return NextResponse.json({ ok: false, error: 'No file uploaded' }, { status: 400 })
    }

    console.log('[Import] Reading file buffer...')
    const arrayBuffer = await file.arrayBuffer()
    
    console.log('[Import] Parsing Excel...')
    const workbook = XLSX.read(arrayBuffer)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    console.log('[Import] Processing Excel file:', file.name)
    console.log('[Import] Rows found:', rows.length)
    console.log('[Import] Column headers:', Object.keys(rows[0] || {}))

    // Validar que hay filas
    if (rows.length === 0) {
      console.log('[Import] Error: Excel is empty')
      return NextResponse.json({ 
        ok: false, 
        error: '❌ El Excel está vacío. Por favor agrega al menos una fila de datos.' 
      }, { status: 400 })
    }

    // Validar columnas requeridas
    const firstRow = rows[0] || {}
    const headers = Object.keys(firstRow)
    
    console.log('[Import] Validating required columns...')
    const requiredColumns = {
      numero: ['N°', 'Nº', 'N', 'No', 'numero', 'n°', 'nº', 'n'],
      rut: ['RUT', 'Rut', 'rut'],
      nombre: ['Nombre completo', 'Nombre', 'nombre'],
      calidad: ['Calidad jurídica', 'Calidad Jurídica', 'Calidad juridica', 'Calidad Juridica', 'Calidad', 'calidad']
    }

    const missingColumns: string[] = []
    let hasNumero = false, hasRUT = false, hasNombre = false, hasCalidad = false

    headers.forEach(header => {
      const headerLower = header.toLowerCase().trim()
      // Búsqueda más inteligente usando includes
      if (requiredColumns.numero.some(col => headerLower.includes(col.toLowerCase()))) hasNumero = true
      if (requiredColumns.rut.some(col => headerLower.includes(col.toLowerCase()))) hasRUT = true
      if (requiredColumns.nombre.some(col => headerLower.includes(col.toLowerCase()))) hasNombre = true
      if (requiredColumns.calidad.some(col => headerLower.includes(col.toLowerCase()))) hasCalidad = true
    })
      if (requiredColumns.rut.some(col => headerLower.includes(col.toLowerCase()))) hasRUT = true
      if (requiredColumns.nombre.some(col => headerLower.includes(col.toLowerCase()))) hasNombre = true
      if (requiredColumns.calidad.some(col => headerLower.includes(col.toLowerCase()))) hasCalidad = true
    })

    if (!hasNumero) missingColumns.push('N°')
    if (!hasRUT) missingColumns.push('RUT')
    if (!hasNombre) missingColumns.push('Nombre Completo')
    if (!hasCalidad) missingColumns.push('Calidad Jurídica')

    if (missingColumns.length > 0) {
      const errorMsg = `❌ El formato del Excel es incorrecto.\n\nFaltan estas columnas requeridas:\n${missingColumns.map(col => `  • ${col}`).join('\n')}\n\nColumnas encontradas: ${headers.join(', ')}\n\nVerifica la guía de importación para el formato correcto.`
      console.log('[Import] Format error:', missingColumns)
      return NextResponse.json({ 
        ok: false, 
        error: errorMsg,
        missingColumns,
        foundColumns: headers
      }, { status: 400 })
    }

    const db = await getDb()
    const existing = db.data!.socios || []
    const errors: any[] = []
    const added: any[] = []

    console.log('[Import] Starting data processing...')
    
    rows.forEach((r, idx) => {
      // Normalize a few possible column names
      const numero = r['N°'] || r['N'] || r['No'] || r['numero'] || r['n°'] || r['n']
      let rut = r['RUT'] || r['Rut'] || r['rut']
      const nombre = r['Nombre completo'] || r['Nombre'] || r['nombre']
      const email = r['Correo electrónico'] || r['Email'] || r['correo'] || r['email']
      const calidad = r['Calidad jurídica'] || r['Calidad juridica'] || r['Calidad'] || r['calidad']

      // Normalizar RUT
      rut = normalizeRUT(rut)

      const rowErrors = []
      if (!numero) rowErrors.push('Falta N°')
      if (!rut) rowErrors.push('Falta RUT')
      if (!nombre) rowErrors.push('Falta Nombre completo')
      if (!calidad) rowErrors.push('Falta Calidad jurídica')
      if (calidad && !isValidCalidad(calidad)) rowErrors.push(`Calidad jurídica inválida: "${calidad}" (debe ser "Funcionario" o "Código del Trabajo")`)

      const dup = existing.find(s => s.rut === rut || s.numero === String(numero).toString())
      if (dup) rowErrors.push(`Duplicado: RUT ${rut} o N° ${numero} ya existe`)

      if (rowErrors.length) {
        errors.push({ row: idx + 2, errors: rowErrors, data: { numero, rut, nombre } })
        console.log(`[Import] Row ${idx + 2} has errors:`, rowErrors)
        return
      }

      const nuevo = {
        numero: String(numero),
        rut: rut,
        nombre: String(nombre),
        email: cleanEmail(generateEmailIfMissing(String(nombre), email)),
        estado: 'Activo',
        calidadJuridica: String(calidad)
      }
      existing.push(nuevo)
      added.push(nuevo)
      console.log(`[Import] Row ${idx + 2} added: ${nombre} (RUT: ${rut})`)
    })

    console.log('[Import] Saving to database...')
    await db.write()
    console.log('[Import] Summary - Added:', added.length, 'Errors:', errors.length)

    return NextResponse.json({ 
      ok: true, 
      addedCount: added.length, 
      errors,
      message: `${added.length} socio(s) importado(s). ${errors.length} error(es).`
    })
  } catch (err: any) {
    console.error('[Import] CRITICAL ERROR:', err)
    console.error('[Import] Stack:', err.stack)
    return NextResponse.json({ ok: false, error: `❌ Error al procesar el archivo: ${String(err.message || err)}` }, { status: 500 })
  }
}
