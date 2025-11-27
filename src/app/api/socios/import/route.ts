import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import * as XLSX from 'xlsx'
import { validateSocioRow, isValidCalidad } from '@/lib/validators'
import { generateEmailIfMissing, cleanEmail } from '@/lib/email-generator'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('file') as any
    if (!file) return NextResponse.json({ ok: false, error: 'No file uploaded' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    console.log('[Import] Processing Excel file:', file.name)
    console.log('[Import] Rows found:', rows.length)
    console.log('[Import] First row sample:', rows[0])

    const db = await getDb()
    const existing = db.data!.socios || []
    const errors: any[] = []
    const added: any[] = []

    rows.forEach((r, idx) => {
      // Normalize a few possible column names
      const numero = r['N°'] || r['N'] || r['No'] || r['numero'] || r['n°'] || r['n']
      const rut = r['RUT'] || r['Rut'] || r['rut']
      const nombre = r['Nombre completo'] || r['Nombre'] || r['nombre']
      const email = r['Correo electrónico'] || r['Email'] || r['correo'] || r['email']
      const calidad = r['Calidad jurídica'] || r['Calidad juridica'] || r['Calidad'] || r['calidad']

      const rowErrors = []
      if (!numero) rowErrors.push('Falta N°')
      if (!rut) rowErrors.push('Falta RUT')
      if (!nombre) rowErrors.push('Falta Nombre completo')
      if (!calidad) rowErrors.push('Falta Calidad jurídica')
      if (calidad && !isValidCalidad(calidad)) rowErrors.push(`Calidad jurídica inválida: "${calidad}" (debe ser "Funcionario" o "Código del Trabajo")`)

      const dup = existing.find(s => s.rut === String(rut).toString() || s.numero === String(numero).toString())
      if (dup) rowErrors.push(`Duplicado: RUT ${rut} o N° ${numero} ya existe`)

      if (rowErrors.length) {
        errors.push({ row: idx + 2, errors: rowErrors, data: { numero, rut, nombre } })
        console.log(`[Import] Row ${idx + 2} errors:`, rowErrors)
        return
      }

      const nuevo = {
        numero: String(numero),
        rut: String(rut),
        nombre: String(nombre),
        email: cleanEmail(generateEmailIfMissing(String(nombre), email)),
        estado: 'Activo',
        calidadJuridica: String(calidad)
      }
      existing.push(nuevo)
      added.push(nuevo)
      console.log(`[Import] Row ${idx + 2} added: ${nombre} (${rut})`)
    })

    console.log('[Import] Summary - Added:', added.length, 'Errors:', errors.length)
    
    await db.write()

    return NextResponse.json({ 
      ok: true, 
      addedCount: added.length, 
      errors,
      message: `${added.length} socio(s) importado(s). ${errors.length} error(es).`
    })
  } catch (err: any) {
    console.error('[Import] Error:', err)
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}
