import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'
// Load pdfkit dynamically to avoid build-time resolution errors when dependency isn't installed
let PDFDocument: any = null

function inMonth(dateStr: string, month: number, year: number) {
  const d = new Date(dateStr)
  return d.getFullYear() === year && d.getMonth() + 1 === month
}

export async function GET(request: Request, { params }: { params: { numero: string } }) {
  try {
    const numero = params.numero
    const q = new URL(request.url).searchParams
    const month = Number(q.get('month') || new Date().getMonth() + 1)
    const year = Number(q.get('year') || new Date().getFullYear())

    const db = await getDb()
    const socio = db.data!.socios.find(s => String(s.numero) === String(numero))
    if (!socio) return NextResponse.json({ ok: false, error: 'Socio no encontrado' }, { status: 404 })

    const cuotaAFUT = Number(db.data!.cuotaConfig.bienestar || 0) + Number(db.data!.cuotaConfig.ordinaria || 0)

    const discounts = (db.data!.discounts || []).filter((d: any) => String(d.numero) === String(numero) && inMonth(d.fecha, month, year))
    const sumDiscounts = discounts.reduce((s: number, d: any) => s + Number(d.monto || 0), 0)

    const credits = (db.data!.credits || []).filter((c: any) => String(c.numero) === String(numero))
    const installmentsDue = credits.reduce((s: number, c: any) => {
      const remaining = Number(c.cuotas || 0) - Number(c.cuotasPagadas || 0)
      if (remaining <= 0) return s
      return s + Number(c.cuotaMensual || 0)
    }, 0)

    const totalDescuentos = sumDiscounts + installmentsDue
    const totalAPagar = cuotaAFUT - totalDescuentos

    // Dynamic import of pdfkit
    try {
      const mod = await import('pdfkit')
      PDFDocument = mod.default ?? mod
    } catch (e) {
      return NextResponse.json({ ok: false, error: 'Dependency pdfkit no está instalada. Ejecuta `npm install`.' }, { status: 500 })
    }

    // Generate PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Uint8Array[] = []
    doc.on('data', (chunk: any) => chunks.push(chunk))

    // Header
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#000000').text('Recibo Mensual - Asociación de Socios', { align: 'center' })
    doc.moveTo(50, doc.y + 5).lineTo(500, doc.y + 5).stroke('#333333')
    doc.moveDown()

    doc.font('Helvetica-Bold').fontSize(12).fillColor('#000000').text(`Socio: ${socio.nombre} (N° ${socio.numero})`)
    doc.font('Helvetica').fillColor('#333333').text(`RUT: ${socio.rut}`)
    doc.text(`Período: ${month}/${year}`)
    doc.moveDown()

    doc.font('Helvetica-Bold').fontSize(12).fillColor('#000000').text('═ DETALLE DE CUOTAS Y DESCUENTOS ═')
    doc.moveDown(0.5)
    doc.font('Helvetica').fontSize(11).fillColor('#333333')
    doc.text(`  • Cuota Bienestar: $${Number(db.data!.cuotaConfig.bienestar || 0).toLocaleString()}`)
    doc.text(`  • Cuota Ordinaria: $${Number(db.data!.cuotaConfig.ordinaria || 0).toLocaleString()}`)
    doc.font('Helvetica-Bold').fillColor('#000000').text(`  • Cuota Socio AFUT (Total): $${cuotaAFUT.toLocaleString()}`)
    doc.moveDown(0.5)

    doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000').text('═ DESCUENTOS APLICADOS ═')
    doc.font('Helvetica').fontSize(10).fillColor('#333333')
    if (discounts.length === 0) doc.text('  (Sin descuentos)')
    discounts.forEach((d: any) => {
      doc.text(`  • [${d.tipo}] ${d.descripcion || ''}: $${Number(d.monto).toLocaleString()} (${new Date(d.fecha).toLocaleDateString()})`)
    })
    doc.moveDown(0.5)

    doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000').text('═ CRÉDITOS (CUOTAS MENSUALES PENDIENTES) ═')
    doc.font('Helvetica').fontSize(10).fillColor('#333333')
    if (credits.length === 0) doc.text('  (Sin créditos)')
    credits.forEach((c: any) => {
      const remaining = Number(c.cuotas || 0) - Number(c.cuotasPagadas || 0)
      doc.text(`  • Crédito ${c.id || ''}: cuota $${Number(c.cuotaMensual).toLocaleString()} | Total cuotas: ${c.cuotas} | Pagadas: ${c.cuotasPagadas || 0} | Pendientes: ${remaining}`)
    })

    doc.moveDown(1)
    doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke('#999999')
    doc.moveDown(0.5)

    doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000')
    doc.text(`Total descuentos y cuotas de crédito: $${totalDescuentos.toLocaleString()}`)
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#CC0000')
    doc.text(`TOTAL A PAGAR: $${totalAPagar.toLocaleString()}`)

    doc.moveDown(2)
    doc.font('Helvetica').fontSize(9).fillColor('#666666').text(`Generado: ${new Date().toLocaleString()}`)

    doc.end()

    await new Promise<void>((resolve) => doc.on('end', () => resolve()))
    const pdf = Buffer.concat(chunks.map(c => Buffer.from(c)))

    const filename = `recibo-${socio.numero}-${month}-${year}.pdf`

    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}
