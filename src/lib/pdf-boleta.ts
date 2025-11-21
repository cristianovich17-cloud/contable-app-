import PDFDocument from 'pdfkit'
import { Readable } from 'stream'

export interface DescuentoDetalle {
  concepto: string
  monto: number
  fecha: string
}

export function generarPDFBoleta(
  nombreSocio: string,
  numeroSocio: number | string,
  mes: number,
  año: number,
  email: string,
  descuentos: DescuentoDetalle[],
  totalDescuentos: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      })

      const chunks: Buffer[] = []

      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Encabezado
      doc.fontSize(20).font('Helvetica-Bold').text('BOLETA DE DESCUENTOS', {
        align: 'center',
      })

      doc.moveDown(0.5)
      doc.fontSize(10).font('Helvetica').text('Sistema Contable para Asociación de Socios', {
        align: 'center',
      })

      doc.moveDown(1)

      // Información del socio
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Información del Socio:', { underline: true })

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Nombre: ${nombreSocio}`)
        .text(`Número de Socio: ${numeroSocio}`)
        .text(`Email: ${email}`)

      // Período
      const meses = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ]
      const nombreMes = meses[mes - 1]

      doc.moveDown(0.5)
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`Período: ${nombreMes} ${año}`, { underline: true })

      doc.moveDown(1)

      // Tabla de descuentos
      doc.fontSize(11).font('Helvetica-Bold').text('Descuentos Registrados:', {
        underline: true,
      })

      doc.moveDown(0.5)

      // Encabezados de tabla
      const tableTop = doc.y
      const col1 = 50
      const col2 = 280
      const col3 = 450
      const col4 = 520
      const rowHeight = 25

      doc.fontSize(9).font('Helvetica-Bold')
      doc.text('Fecha', col1, tableTop)
      doc.text('Concepto', col2, tableTop)
      doc.text('Monto', col3, tableTop)

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke()

      // Datos de descuentos
      let y = tableTop + 20
      doc.fontSize(9).font('Helvetica')

      if (descuentos.length === 0) {
        doc.text('Sin descuentos registrados para este período', col1, y)
        y += rowHeight
      } else {
        descuentos.forEach((desc) => {
          doc.text(desc.fecha, col1, y)
          doc.text(desc.concepto, col2, y)
          doc.text(`$${desc.monto.toLocaleString('es-CL')}`, col3, y, {
            align: 'right',
          })
          y += rowHeight
        })
      }

      doc.moveTo(50, y).lineTo(550, y).stroke()

      // Total
      doc.moveDown(0.5)
      doc.fontSize(12).font('Helvetica-Bold')
      doc.text(
        `Total Descuentos: $${totalDescuentos.toLocaleString('es-CL')}`,
        { align: 'right' }
      )

      // Pie de página
      doc.moveDown(2)
      doc.fontSize(8).font('Helvetica').fillColor('#666666')
      doc.text('Este documento es generado automáticamente por el sistema contable.', {
        align: 'center',
      })
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CL')}`, {
        align: 'center',
      })

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
