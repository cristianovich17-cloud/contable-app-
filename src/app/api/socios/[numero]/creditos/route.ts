import { NextResponse, NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { validateJWT } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function GET(request: Request, { params }: { params: { numero: string } }) {
  try {
    const numero = params.numero
    const db = await getDb()
    const credits = (db.data!.credits || []).filter((c: any) => String(c.numero) === String(numero))
    return NextResponse.json({ ok: true, credits })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { numero: string } }) {
  try {
    const numero = params.numero
    const payload = await request.json()
    // expected: { montoTotal, cuotas, descripcion, fechaInicio }
    const montoTotal = Number(payload.montoTotal || 0)
    const cuotas = Number(payload.cuotas || 1)
    const descripcion = String(payload.descripcion || '')
    const fechaInicio = payload.fechaInicio || new Date().toISOString()
    const cuotaMensual = Math.round((montoTotal / Math.max(1, cuotas)) * 100) / 100

    const db = await getDb()
    const item = {
      id: Date.now().toString(),
      numero: String(numero),
      montoTotal,
      cuotas,
      cuotaMensual,
      descripcion,
      fechaInicio,
      cuotasPagadas: 0
    }
    if (!db.data) db.data = {
      socios: [], cuotaConfig: {}, descuentos: [], credits: [], creditos: [],
      pagos: [], recibos: [], transacciones: [], transactions: [], ingresos: [], egresos: [], sentEmails: []
    } as any
    if (!db.data.credits) db.data.credits = []
    db.data.credits.push(item)
    await db.write()

    // Log de auditoría
    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'CREAR',
        tabla: 'credits',
        registroId: parseInt(item.id),
        cambioNuevo: item,
        request
      })
    }

    return NextResponse.json({ ok: true, credit: item })
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
    const list = db.data!.credits || []
    const idx = list.findIndex((c: any) => String(c.id) === id && String(c.numero) === String(numero))
    if (idx === -1) return NextResponse.json({ ok: false, error: 'Credito no encontrado' }, { status: 404 })

    const antes = { ...list[idx] }
    const payloadMonto = payload.montoTotal
    const payloadCuotas = payload.cuotas
    if (payloadMonto !== undefined) list[idx].montoTotal = Number(payloadMonto)
    if (payloadCuotas !== undefined) list[idx].cuotas = Number(payloadCuotas)
    if (payload.montoTotal !== undefined || payload.cuotas !== undefined) {
      list[idx].cuotaMensual = Math.round((Number(list[idx].montoTotal || 0) / Math.max(1, Number(list[idx].cuotas || 1))) * 100) / 100
    }
    if (payload.descripcion !== undefined) list[idx].descripcion = String(payload.descripcion)
    if (payload.fechaInicio !== undefined) list[idx].fechaInicio = payload.fechaInicio

    await db.write()

    // Audit
    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'EDITAR',
        tabla: 'credits',
        registroId: parseInt(id),
        cambioAnterior: antes,
        cambioNuevo: list[idx],
        request
      })
    }

    return NextResponse.json({ ok: true, credit: list[idx] })
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
    const list = db.data!.credits || []
    const idx = list.findIndex((c: any) => String(c.id) === id && String(c.numero) === String(numero))
    if (idx === -1) return NextResponse.json({ ok: false, error: 'Credito no encontrado' }, { status: 404 })

    const antes = { ...list[idx] }
    list.splice(idx, 1)
    await db.write()

    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'ELIMINAR',
        tabla: 'credits',
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
