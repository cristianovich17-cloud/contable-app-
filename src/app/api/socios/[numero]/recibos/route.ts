import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma-db'
import { logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: { numero: string } }) {
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

    // Obtener configuración de cuotas (última configuración)
    const cuotaConfig = await prisma.cuotaConfig.findFirst({
      where: {
        mes: month,
        año: year
      }
    })

    const cuotaAFUT = Number(cuotaConfig?.cuotaBienestar || 0) + Number(cuotaConfig?.cuotaOrdinaria || 0)

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
    
    // Sumar directamente los montos de los créditos pendientes
    const installmentsDue = credits.reduce((s: number, c: any) => s + Number(c.monto || 0), 0)

    const totalDescuentos = sumDiscounts
    const totalCreditos = installmentsDue
    const totalAPagar = Math.max(0, cuotaAFUT - totalDescuentos + totalCreditos)

    // Crear recibo
    const recibo = await prisma.recibo.create({
      data: {
        socioId: socio.id,
        mes: month,
        año: year,
        monto: totalAPagar,
        concepto: `Cuota AFUT ${month}/${year}`
      }
    })

    const receipt = {
      id: recibo.id.toString(),
      numero: String(numero),
      socio: { numero: socio.numero, nombre: socio.nombre, rut: socio.rut },
      periodo: { month, year },
      cuotaAFUT,
      discounts: discounts.map(d => ({ monto: d.monto, concepto: d.concepto })),
      credits: credits.map(c => ({ monto: c.monto, concepto: c.concepto })),
      sumDiscounts,
      sumCredits,
      totalAPagar,
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json({ ok: true, receipt })
  } catch (err: any) {
    console.error('[Recibos] Error:', err.message)
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}
