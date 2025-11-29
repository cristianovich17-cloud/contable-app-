import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma-db'
import PDFDocument from 'pdfkit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { numero: string } }): Promise<NextResponse | Response> {
  try {
    const numero = parseInt(params.numero, 10)
    const q = new URL(request.url).searchParams
    const month = Number(q.get('month') || new Date().getMonth() + 1)
    const year = Number(q.get('year') || new Date().getFullYear())

    // Obtener socio
    const socio = await prisma.socio.findUnique({
      where: { numero }
    })
    
    if (!socio) {
      return NextResponse.json({ ok: false, error: 'Socio no encontrado' }, { status: 404 })
    }

    // Obtener configuración de cuotas
    const cuotaConfig = await prisma.cuotaConfig.findFirst({
      where: { mes: month, año: year }
    })

    const cuotaBienestar = Number(cuotaConfig?.cuotaBienestar || 0)
    const cuotaOrdinaria = Number(cuotaConfig?.cuotaOrdinaria || 0)
    const cuotaAFUT = cuotaBienestar + cuotaOrdinaria

    // Obtener descuentos
    const discounts = await prisma.descuento.findMany({
      where: {
        socioId: socio.id,
        mes: month,
        año: year
      }
    })
    const sumDiscounts = discounts.reduce((s: number, d: any) => s + Number(d.monto || 0), 0)

    // Obtener créditos pendientes
    const credits = await prisma.credito.findMany({
      where: {
        socioId: socio.id,
        estado: 'pendiente'
      }
    })
    const sumCredits = credits.reduce((s: number, c: any) => s + Number(c.monto || 0), 0)

    // Crear documento PDF
    const doc = new PDFDocument({ size: 'A4', margin: 40 })
    const chunks: any[] = []
    
    doc.on('data', (chunk) => chunks.push(chunk))

    // Encabezado profesional
    doc.fontSize(20).font('Helvetica-Bold').text('RECIBO DE CUOTA MENSUAL', { align: 'center' })
    doc.fontSize(11).font('Helvetica').text('Sistema de Gestión Contable - Asociación de Socios', { align: 'center' })
    doc.moveDown(0.3)

    // Línea separadora
    doc.strokeColor('#0099cc').lineWidth(2).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
    doc.moveDown(0.5)

    // Sección: Datos del Recibo
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0099cc').text('INFORMACIÓN DEL RECIBO')
    doc.fontSize(10).font('Helvetica').fillColor('#000000')
    
    const reciboBg = doc.y
    doc.rect(40, reciboBg, 515, 55).fillAndStroke('#f5f5f5', '#cccccc')
    doc.fillColor('#000000')
    
    doc.y = reciboBg + 3
    const datos1 = `N° Recibo: ${socio.id.toString().padStart(5, '0')} | Período: ${month}/${year}`
    const datos2 = `Fecha Emisión: ${new Date().toLocaleDateString('es-CL')} | Vencimiento: ${new Date(year, month, 10).toLocaleDateString('es-CL')}`
    const datos3 = `Estado: PENDIENTE`
    
    doc.text(datos1, 50)
    doc.moveDown(0.2)
    doc.text(datos2, 50)
    doc.moveDown(0.2)
    doc.text(datos3, 50)
    
    doc.y = reciboBg + 55
    doc.moveDown(0.3)

    // Sección: Datos del Socio
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0099cc').text('DATOS DEL SOCIO')
    doc.fontSize(10).font('Helvetica').fillColor('#000000')
    
    const socioBg = doc.y
    doc.rect(40, socioBg, 515, 75).fillAndStroke('#f9f9f9', '#dddddd')
    doc.fillColor('#000000')
    
    doc.y = socioBg + 3
    doc.text(`N° Socio: ${socio.numero} | RUT: ${socio.rut}`, 50)
    doc.moveDown(0.2)
    doc.text(`Nombre: ${socio.nombre}`, 50)
    doc.moveDown(0.2)
    doc.text(`Email: ${socio.email || 'No especificado'}`, 50)
    doc.moveDown(0.2)
    doc.text(`Calidad Jurídica: ${socio.calidadJuridica || 'No especificado'} | Estado: ${socio.estado || 'Activo'}`, 50)
    
    doc.y = socioBg + 75
    doc.moveDown(0.5)

    // Sección: Detalle de Cuotas
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0099cc').text('DETALLE DE CUOTAS')
    doc.moveDown(0.2)
    
    const tableTop = doc.y
    const col1 = 50
    const col2 = 350
    const col3 = 480
    
    // Encabezado tabla
    doc.rect(40, tableTop, 515, 25).fillAndStroke('#0099cc', '#0099cc')
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10)
    doc.text('Concepto', col1 + 5, tableTop + 7)
    doc.text('Monto', col2 + 5, tableTop + 7)
    doc.text('Total', col3 + 5, tableTop + 7)
    
    doc.fillColor('#000000').font('Helvetica').fontSize(10)
    doc.y = tableTop + 30
    
    // Datos de cuotas
    if (cuotaBienestar > 0) {
      doc.text('Cuota Bienestar Mensual', col1)
      doc.text(`$${cuotaBienestar.toLocaleString('es-CL')}`, col2)
      doc.text(`$${cuotaBienestar.toLocaleString('es-CL')}`, col3)
      doc.moveDown(0.25)
    }
    
    if (cuotaOrdinaria > 0) {
      doc.text('Cuota Ordinaria Mensual', col1)
      doc.text(`$${cuotaOrdinaria.toLocaleString('es-CL')}`, col2)
      doc.text(`$${cuotaOrdinaria.toLocaleString('es-CL')}`, col3)
      doc.moveDown(0.25)
    }

    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke('#cccccc')
    doc.moveDown(0.2)
    
    // Subtotal
    doc.font('Helvetica-Bold').fontSize(10)
    doc.text('SUBTOTAL CUOTAS', col1)
    doc.text(`$${cuotaAFUT.toLocaleString('es-CL')}`, col2)
    doc.text(`$${cuotaAFUT.toLocaleString('es-CL')}`, col3)
    doc.moveDown(0.4)

    // Descuentos
    if (sumDiscounts > 0) {
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#0099cc').text('DESCUENTOS APLICADOS')
      doc.font('Helvetica').fontSize(10).fillColor('#000000')
      doc.moveDown(0.2)
      
      for (const discount of discounts) {
        doc.text(`• ${discount.concepto || 'Descuento'}`, col1 + 10)
        doc.text(`$${discount.monto.toLocaleString('es-CL')}`, col2)
        doc.text(`-$${discount.monto.toLocaleString('es-CL')}`, col3)
        doc.moveDown(0.2)
      }
      doc.moveDown(0.2)
    }

    // Créditos pendientes
    if (sumCredits > 0) {
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#ff6b00').text('CRÉDITOS PENDIENTES')
      doc.font('Helvetica').fontSize(10).fillColor('#000000')
      doc.moveDown(0.2)
      
      for (const credit of credits) {
        doc.text(`• ${credit.concepto || 'Crédito'}`, col1 + 10)
        doc.text(`$${credit.monto.toLocaleString('es-CL')}`, col2)
        doc.text(`+$${credit.monto.toLocaleString('es-CL')}`, col3)
        doc.moveDown(0.2)
      }
      doc.moveDown(0.2)
    }

    // Total a pagar
    const totalAPagar = Math.max(0, cuotaAFUT - sumDiscounts + sumCredits)
    
    const totalBg = doc.y
    doc.rect(40, totalBg, 515, 65).fillAndStroke('#e8f4f8', '#0099cc').lineWidth(2)
    doc.fillColor('#000000')
    
    doc.y = totalBg + 5
    doc.fontSize(11).font('Helvetica')
    doc.text(`Total Descuentos: -$${sumDiscounts.toLocaleString('es-CL')}`, 50)
    doc.moveDown(0.25)
    doc.text(`Total Créditos: +$${sumCredits.toLocaleString('es-CL')}`, 50)
    doc.moveDown(0.3)
    
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#0099cc')
    doc.text(`TOTAL A PAGAR: $${totalAPagar.toLocaleString('es-CL')}`, 50)
    
    doc.y = totalBg + 65
    doc.moveDown(1)

    // Instrucciones de pago
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('INSTRUCCIONES DE PAGO')
    doc.fontSize(9).font('Helvetica').fillColor('#333333')
    doc.text('• Por favor realice el pago antes del 10 del mes en curso')
    doc.text('• Los pagos se aceptan en efectivo o transferencia bancaria')
    doc.text('• Contacte a tesorería para más información sobre descuentos y condiciones de pago')
    doc.moveDown(0.5)

    // Pie de página
    doc.fontSize(8).font('Helvetica').fillColor('#666666')
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke('#cccccc')
    doc.moveDown(0.3)
    doc.text('Recibo generado automáticamente por el Sistema de Gestión Contable', { align: 'center' })
    doc.text(`${new Date().toLocaleString('es-CL')}`, { align: 'center' })

    doc.end()

    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks)
        const filename = `recibo_${numero}_${month}_${year}.pdf`
        
        resolve(new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`
          }
        }))
      })
    })

  } catch (err: any) {
    console.error('[PDF Recibos] Error:', err.message)
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}
