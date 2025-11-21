import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { enviarBoleta } from '@/lib/email'
import { generarPDFBoleta } from '@/lib/pdf-boleta'

export async function POST(
  request: NextRequest,
  { params }: { params: { numero: string } }
) {
  try {
    const { mes, año, email } = await request.json()
      const numeroSocio = params.numero

    // Validar parámetros
    if (!mes || !año || !email) {
      return NextResponse.json(
        { error: 'Faltan parámetros: mes, año, email requeridos' },
        { status: 400 }
      )
    }

    if (mes < 1 || mes > 12) {
      return NextResponse.json(
        { error: 'El mes debe estar entre 1 y 12' },
        { status: 400 }
      )
    }

    const db = await getDb()

      if (!db.data) {
        return NextResponse.json(
          { error: 'Error al acceder a la base de datos' },
          { status: 500 }
        )
      }

      const socio = db.data.socios.find((s) => s.numero === numeroSocio)

    if (!socio) {
      return NextResponse.json(
        { error: 'Socio no encontrado' },
        { status: 404 }
      )
    }

    // Obtener descuentos del mes
      const descuentosDelMes = (db.data.discounts || [])
        .filter((d: any) => {
        const fecha = new Date(d.fecha)
        return (
          d.numeroSocio === numeroSocio &&
          fecha.getMonth() + 1 === mes &&
          fecha.getFullYear() === año
        )
      })
        .map((d: any) => ({
        concepto: d.concepto,
        monto: d.monto,
        fecha: new Date(d.fecha).toLocaleDateString('es-CL'),
      }))

      const totalDescuentos = descuentosDelMes.reduce((sum: number, d: any) => sum + d.monto, 0)

    // Generar PDF
    const pdfBuffer = await generarPDFBoleta(
      socio.nombre,
      numeroSocio,
      mes,
      año,
      email,
      descuentosDelMes,
      totalDescuentos
    )

    // Preparar información de descuentos para el email
    const descuentosInfo = descuentosDelMes.length
      ? `<ul>${descuentosDelMes.map((d: any) => `<li>${d.concepto}: $${d.monto.toLocaleString('es-CL')} (${d.fecha})</li>`).join('')}</ul><p><strong>Total: $${totalDescuentos.toLocaleString('es-CL')}</strong></p>`
      : '<p>Sin descuentos registrados para este período.</p>'

    // Enviar email
    const resultado = await enviarBoleta(
      email,
      socio.nombre,
      numeroSocio,
      mes,
      año,
      pdfBuffer,
      descuentosInfo
    )

    if (!resultado.success) {
      return NextResponse.json(
        { error: resultado.mensaje },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      mensaje: resultado.mensaje,
      descuentos: {
        cantidad: descuentosDelMes.length,
        total: totalDescuentos,
      },
    })
  } catch (error) {
    console.error('Error al enviar boleta:', error)
    return NextResponse.json(
      {
        error: 'Error al enviar boleta',
        detalles: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
