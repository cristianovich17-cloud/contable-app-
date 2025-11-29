import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma-db'
import { validateJWT } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function GET(request: Request, { params }: { params: { numero: string } }) {
  try {
    const numero = parseInt(params.numero, 10)
    const socio = await prisma.socio.findUnique({ where: { numero } })
    if (!socio) return NextResponse.json({ ok: true, creditos: [] })

    const creditos = await prisma.credito.findMany({
      where: { socioId: socio.id }
    })
    return NextResponse.json({ ok: true, creditos })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { numero: string } }) {
  try {
    const numero = parseInt(params.numero, 10)
    const payload = await request.json()
    // expected: { monto, concepto, estado }
    const monto = Number(payload.monto || payload.montoTotal || 0)
    const concepto = String(payload.concepto || payload.descripcion || 'Crédito')
    const estado = String(payload.estado || 'pendiente')

    if (monto <= 0) return NextResponse.json({ ok: false, error: 'Monto inválido' }, { status: 400 })

    const socio = await prisma.socio.findUnique({ where: { numero } })
    if (!socio) return NextResponse.json({ ok: false, error: 'Socio no encontrado' }, { status: 404 })

    const credito = await prisma.credito.create({
      data: { socioId: socio.id, monto, concepto, estado }
    })

    // Log auditoría
    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'CREAR',
        tabla: 'Credito',
        registroId: credito.id,
        cambioNuevo: credito as any,
        request
      })
    }

    return NextResponse.json({ ok: true, credito })
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

    const antes = await prisma.credito.findUnique({ where: { id } })
    if (!antes || antes.socioId !== socio.id) {
      return NextResponse.json({ ok: false, error: 'Crédito no encontrado' }, { status: 404 })
    }

    const updated = await prisma.credito.update({
      where: { id },
      data: {
        monto: payload.monto !== undefined ? Number(payload.monto) : undefined,
        concepto: payload.concepto !== undefined ? String(payload.concepto) : undefined,
        estado: payload.estado !== undefined ? String(payload.estado) : undefined
      }
    })

    // Audit
    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'EDITAR',
        tabla: 'Credito',
        registroId: id,
        cambioAnterior: antes as any,
        cambioNuevo: updated as any,
        request
      })
    }

    return NextResponse.json({ ok: true, credito: updated })
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

    const antes = await prisma.credito.findUnique({ where: { id } })
    if (!antes || antes.socioId !== socio.id) {
      return NextResponse.json({ ok: false, error: 'Crédito no encontrado' }, { status: 404 })
    }

    await prisma.credito.delete({ where: { id } })

    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'ELIMINAR',
        tabla: 'Credito',
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
