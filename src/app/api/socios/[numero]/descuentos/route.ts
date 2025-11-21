import { NextResponse, NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { validateJWT } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function GET(request: Request, { params }: { params: { numero: string } }) {
  try {
    const numero = params.numero
    const db = await getDb()
    const discounts = (db.data!.discounts || []).filter((d: any) => String(d.numero) === String(numero))
    return NextResponse.json({ ok: true, discounts })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { numero: string } }) {
  try {
    const numero = params.numero
    const payload = await request.json()
    // expected: { tipo, monto, descripcion, fecha }
    const monto = Number(payload.monto || 0)
    const tipo = String(payload.tipo || 'Descuento')
    const descripcion = String(payload.descripcion || '')
    const fecha = payload.fecha || new Date().toISOString()

    const db = await getDb()
    const item = { id: Date.now().toString(), numero: String(numero), tipo, monto, descripcion, fecha }
    if (!db.data) db.data = {
      socios: [], cuotaConfig: {}, descuentos: [], credits: [], creditos: [],
      pagos: [], recibos: [], transacciones: [], transactions: [], ingresos: [], egresos: [], sentEmails: []
    } as any
    if (!db.data.discounts) db.data.discounts = []
    db.data.discounts.push(item)
    await db.write()

    // Log de auditoría
    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'CREAR',
        tabla: 'discounts',
        registroId: parseInt(item.id),
        cambioNuevo: item,
        request
      })
    }

    return NextResponse.json({ ok: true, discount: item })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { numero: string } }) {
  try {
    const numero = params.numero
    const payload = await request.json()
    const id = String(payload.id || '')
    if (!id) return NextResponse.json({ ok: false, error: 'id requerido' }, { status: 400 })

    const db = await getDb()
    const list = db.data!.discounts || []
    const idx = list.findIndex((d: any) => String(d.id) === id && String(d.numero) === String(numero))
    if (idx === -1) return NextResponse.json({ ok: false, error: 'Descuento no encontrado' }, { status: 404 })

    const antes = { ...list[idx] }
    if (payload.monto !== undefined) list[idx].monto = Number(payload.monto)
    if (payload.tipo !== undefined) list[idx].tipo = String(payload.tipo)
    if (payload.descripcion !== undefined) list[idx].descripcion = String(payload.descripcion)
    if (payload.fecha !== undefined) list[idx].fecha = payload.fecha

    await db.write()

    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'EDITAR',
        tabla: 'discounts',
        registroId: parseInt(id),
        cambioAnterior: antes,
        cambioNuevo: list[idx],
        request
      })
    }

    return NextResponse.json({ ok: true, discount: list[idx] })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { numero: string } }) {
  try {
    const numero = params.numero
    const payload = await request.json()
    const id = String(payload.id || '')
    if (!id) return NextResponse.json({ ok: false, error: 'id requerido' }, { status: 400 })

    const db = await getDb()
    const list = db.data!.discounts || []
    const idx = list.findIndex((d: any) => String(d.id) === id && String(d.numero) === String(numero))
    if (idx === -1) return NextResponse.json({ ok: false, error: 'Descuento no encontrado' }, { status: 404 })

    const antes = { ...list[idx] }
    list.splice(idx, 1)
    await db.write()

    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'ELIMINAR',
        tabla: 'discounts',
        registroId: parseInt(id),
        cambioAnterior: antes,
        cambioNuevo: null,
        request
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}
