import { NextResponse, NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { validateJWT } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest, { params }: { params: { numero: string } }) {
  try {
    const numero = params.numero
    const payload = await request.json()
    // expected: { amount, tipo: 'Cuota'|'Credito'|'Otro', creditId? }
    const amount = Number(payload.amount || 0)
    const tipo = String(payload.tipo || 'Pago')
    const descripcion = String(payload.descripcion || '')
    const creditId = payload.creditId

    if (amount <= 0) return NextResponse.json({ ok: false, error: 'Monto inválido' }, { status: 400 })

    const db = await getDb()
    const now = new Date().toISOString()
    const transaction = {
      id: Date.now().toString(),
      numero: String(numero),
      amount,
      tipo,
      descripcion,
      creditId: creditId || null,
      fecha: now
    }

    if (!db.data) db.data = {
      socios: [], cuotaConfig: {}, descuentos: [], credits: [], creditos: [],
      pagos: [], recibos: [], transacciones: [], transactions: [], ingresos: [], egresos: [], sentEmails: []
    } as any
    if (!db.data.transactions) db.data.transactions = []
    db.data.transactions.push(transaction)

    // If payment is for a credit, increment cuotasPagadas accordingly (assume pays one cuota if amount >= cuotaMensual)
    if (creditId) {
      const credit = (db.data.credits || []).find((c: any) => c.id === String(creditId) && String(c.numero) === String(numero))
      if (credit) {
        const cuota = Number(credit.cuotaMensual || 0)
        if (cuota > 0) {
          const unidades = Math.floor(amount / cuota)
          credit.cuotasPagadas = Number(credit.cuotasPagadas || 0) + Math.max(1, unidades)
        } else {
          credit.cuotasPagadas = Number(credit.cuotasPagadas || 0) + 1
        }
      }
    }

    await db.write()

    // Log de auditoría
    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'CREAR',
        tabla: 'transactions',
        registroId: parseInt(transaction.id),
        cambioNuevo: transaction,
        request
      })
    }

    return NextResponse.json({ ok: true, transaction })
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
    const list = db.data!.transactions || []
    const idx = list.findIndex((t: any) => String(t.id) === id && String(t.numero) === String(numero))
    if (idx === -1) return NextResponse.json({ ok: false, error: 'Transacción no encontrada' }, { status: 404 })

    const antes = { ...list[idx] }
    if (payload.amount !== undefined) list[idx].amount = Number(payload.amount)
    if (payload.tipo !== undefined) list[idx].tipo = String(payload.tipo)
    if (payload.descripcion !== undefined) list[idx].descripcion = String(payload.descripcion)

    await db.write()

    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'EDITAR',
        tabla: 'transactions',
        registroId: parseInt(id),
        cambioAnterior: antes,
        cambioNuevo: list[idx],
        request
      })
    }

    return NextResponse.json({ ok: true, transaction: list[idx] })
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
    const list = db.data!.transactions || []
    const idx = list.findIndex((t: any) => String(t.id) === id && String(t.numero) === String(numero))
    if (idx === -1) return NextResponse.json({ ok: false, error: 'Transacción no encontrada' }, { status: 404 })

    const antes = { ...list[idx] }
    list.splice(idx, 1)
    await db.write()

    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'ELIMINAR',
        tabla: 'transactions',
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
