import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma-db'
import { validateJWT } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function GET(request: Request, { params }: { params: { numero: string } }) {
  try {
    const numero = parseInt(params.numero, 10)
    const q = new URL(request.url).searchParams
    const month = q.get('month')
    const year = q.get('year')

    // Obtener socio
    const socio = await prisma.socio.findUnique({
      where: { numero }
    })
    if (!socio) {
      return NextResponse.json({ ok: true, descuentos: [] })
    }

    // Filtrar por mes/año si se especifican
    const where: any = { socioId: socio.id }
    if (month) where.mes = parseInt(month)
    if (year) where.año = parseInt(year)

    const discounts = await prisma.descuento.findMany({
      where
    })
    return NextResponse.json({ ok: true, descuentos: discounts })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { numero: string } }) {
  try {
    const numero = parseInt(params.numero, 10)
    const payload = await request.json()
    // expected: { monto, concepto, mes, año }
    const monto = Number(payload.monto || 0)
    const concepto = String(payload.concepto || payload.descripcion || 'Descuento aplicado')
    const mes = Number(payload.mes || new Date().getMonth() + 1)
    const año = Number(payload.año || new Date().getFullYear())

    // Obtener socio
    const socio = await prisma.socio.findUnique({
      where: { numero }
    })
    if (!socio) {
      return NextResponse.json({ ok: false, error: 'Socio no encontrado' }, { status: 404 })
    }

    // Crear descuento
    const discount = await prisma.descuento.create({
      data: {
        socioId: socio.id,
        monto,
        concepto,
        mes,
        año
      }
    })

    // Log de auditoría
    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'CREAR',
        tabla: 'Descuento',
        registroId: discount.id,
        cambioNuevo: discount as any,
        request
      })
    }

    return NextResponse.json({ ok: true, descuento: discount })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { numero: string } }) {
  try {
    const numero = parseInt(params.numero, 10)
    const payload = await request.json()
    const id = Number(payload.id || 0)
    if (!id) return NextResponse.json({ ok: false, error: 'id requerido' }, { status: 400 })

    const socio = await prisma.socio.findUnique({ where: { numero } })
    if (!socio) return NextResponse.json({ ok: false, error: 'Socio no encontrado' }, { status: 404 })

    const antes = await prisma.descuento.findUnique({ where: { id } })
    if (!antes) return NextResponse.json({ ok: false, error: 'Descuento no encontrado' }, { status: 404 })

    const updated = await prisma.descuento.update({
      where: { id },
      data: {
        monto: payload.monto !== undefined ? Number(payload.monto) : undefined,
        concepto: payload.concepto !== undefined ? String(payload.concepto) : undefined,
        mes: payload.mes !== undefined ? Number(payload.mes) : undefined,
        año: payload.año !== undefined ? Number(payload.año) : undefined
      }
    })

    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'EDITAR',
        tabla: 'Descuento',
        registroId: id,
        cambioAnterior: antes as any,
        cambioNuevo: updated as any,
        request
      })
    }

    return NextResponse.json({ ok: true, descuento: updated })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { numero: string } }) {
  try {
    const numero = parseInt(params.numero, 10)
    const payload = await request.json()
    const id = Number(payload.id || 0)
    if (!id) return NextResponse.json({ ok: false, error: 'id requerido' }, { status: 400 })

    const socio = await prisma.socio.findUnique({ where: { numero } })
    if (!socio) return NextResponse.json({ ok: false, error: 'Socio no encontrado' }, { status: 404 })

    const antes = await prisma.descuento.findUnique({ where: { id } })
    if (!antes || antes.socioId !== socio.id) {
      return NextResponse.json({ ok: false, error: 'Descuento no encontrado' }, { status: 404 })
    }

    await prisma.descuento.delete({ where: { id } })

    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'ELIMINAR',
        tabla: 'Descuento',
        registroId: id,
        cambioAnterior: antes as any,
        cambioNuevo: null,
        request
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}
