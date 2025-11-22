import { NextResponse, NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { validateJWT } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

function inMonth(dateStr: string, month: number, year: number) {
  const d = new Date(dateStr)
  return d.getFullYear() === year && d.getMonth() + 1 === month
}

export async function POST(request: NextRequest, { params }: { params: { numero: string } }) {
  try {
    const numero = params.numero
    const q = new URL(request.url).searchParams
    const month = Number(q.get('month') || new Date().getMonth() + 1)
    const year = Number(q.get('year') || new Date().getFullYear())

    const db = await getDb()
    const socio = db.data!.socios.find(s => String(s.numero) === String(numero))
    if (!socio) return NextResponse.json({ ok: false, error: 'Socio no encontrado' }, { status: 404 })

    const cuotaAFUT = Number(db.data!.cuotaConfig.bienestar || 0) + Number(db.data!.cuotaConfig.ordinaria || 0)

    const discounts = (db.data!.discounts || []).filter((d: any) => String(d.numero) === String(numero) && inMonth(d.fecha, month, year))
    const sumDiscounts = discounts.reduce((s: number, d: any) => s + Number(d.monto || 0), 0)

    const credits = (db.data!.credits || []).filter((c: any) => String(c.numero) === String(numero))
    // For each credit, if cuotasPagadas < cuotas then one installment is due
    const installmentsDue = credits.reduce((s: number, c: any) => {
      const remaining = Number(c.cuotas || 0) - Number(c.cuotasPagadas || 0)
      if (remaining <= 0) return s
      return s + Number(c.cuotaMensual || 0)
    }, 0)

    const totalDescuentos = sumDiscounts + installmentsDue
    const totalAPagar = cuotaAFUT - totalDescuentos

    const receipt = {
      id: Date.now().toString(),
      numero: String(numero),
      socio: { numero: socio.numero, nombre: socio.nombre, rut: socio.rut },
      periodo: { month, year },
      cuotaAFUT,
      discounts,
      installmentsDue,
      totalDescuentos,
      totalAPagar,
      generatedAt: new Date().toISOString()
    }

    if (!db.data) db.data = {
      socios: [], cuotaConfig: {}, descuentos: [], credits: [], creditos: [],
      pagos: [], recibos: [], receipts: [], transacciones: [], transactions: [], ingresos: [], egresos: [], sentEmails: []
    } as any
    if (!db.data.receipts) db.data.receipts = []
    db.data.receipts.push(receipt)
    await db.write()

    // Log de auditoría
    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'CREAR',
        tabla: 'receipts',
        registroId: parseInt(receipt.id),
        cambioNuevo: receipt,
        request
      })
    }

    return NextResponse.json({ ok: true, receipt })
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
    const list = db.data!.receipts || []
    const idx = list.findIndex((r: any) => String(r.id) === id && String(r.numero) === String(numero))
    if (idx === -1) return NextResponse.json({ ok: false, error: 'Recibo no encontrado' }, { status: 404 })

    const antes = { ...list[idx] }
    if (payload.periodo !== undefined) list[idx].periodo = payload.periodo
    if (payload.cuotaAFUT !== undefined) list[idx].cuotaAFUT = Number(payload.cuotaAFUT)
    if (payload.totalAPagar !== undefined) list[idx].totalAPagar = Number(payload.totalAPagar)

    await db.write()

    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'EDITAR',
        tabla: 'receipts',
        registroId: parseInt(id),
        cambioAnterior: antes,
        cambioNuevo: list[idx],
        request
      })
    }

    return NextResponse.json({ ok: true, receipt: list[idx] })
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
    const list = db.data!.receipts || []
    const idx = list.findIndex((r: any) => String(r.id) === id && String(r.numero) === String(numero))
    if (idx === -1) return NextResponse.json({ ok: false, error: 'Recibo no encontrado' }, { status: 404 })

    const antes = { ...list[idx] }
    list.splice(idx, 1)
    await db.write()

    const userPayload = await validateJWT(request)
    if (userPayload) {
      await logAudit({
        usuarioId: userPayload.usuarioId,
        accion: 'ELIMINAR',
        tabla: 'receipts',
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
