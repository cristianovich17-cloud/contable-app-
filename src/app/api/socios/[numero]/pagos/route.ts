import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma-db'
import { validateJWT } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest, { params }: { params: { numero: string } }) {
  try {
    const numero = parseInt(params.numero, 10)
    const payload = await request.json()
    // expected: { monto, concepto, creditoId? }
    const monto = Number(payload.monto || 0)
    const concepto = String(payload.concepto || 'Pago')
    const creditoId = payload.creditoId ? Number(payload.creditoId) : undefined

    if (monto <= 0) return NextResponse.json({ ok: false, error: 'Monto inválido' }, { status: 400 })

    const socio = await prisma.socio.findUnique({ where: { numero } })
    if (!socio) return NextResponse.json({ ok: false, error: 'Socio no encontrado' }, { status: 404 })

    // Crear pago
    const pago = await prisma.pago.create({
      data: {
        socioId: socio.id,
        creditoId,
        monto,
        concepto
      }
    })

    // Log auditoría
    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'CREAR',
        tabla: 'Pago',
        registroId: pago.id,
        cambioNuevo: pago as any,
        request
      })
    }

    return NextResponse.json({ ok: true, pago })
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

    const antes = await prisma.pago.findUnique({ where: { id } })
    if (!antes || antes.socioId !== socio.id) {
      return NextResponse.json({ ok: false, error: 'Pago no encontrado' }, { status: 404 })
    }

    const updated = await prisma.pago.update({
      where: { id },
      data: {
        monto: payload.monto !== undefined ? Number(payload.monto) : undefined,
        concepto: payload.concepto !== undefined ? String(payload.concepto) : undefined
      }
    })

    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'EDITAR',
        tabla: 'Pago',
        registroId: id,
        cambioAnterior: antes as any,
        cambioNuevo: updated as any,
        request
      })
    }

    return NextResponse.json({ ok: true, pago: updated })
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

    const antes = await prisma.pago.findUnique({ where: { id } })
    if (!antes || antes.socioId !== socio.id) {
      return NextResponse.json({ ok: false, error: 'Pago no encontrado' }, { status: 404 })
    }

    await prisma.pago.delete({ where: { id } })

    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'ELIMINAR',
        tabla: 'Pago',
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
