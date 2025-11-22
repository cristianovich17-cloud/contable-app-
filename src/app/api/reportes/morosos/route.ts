import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const month = Number(url.searchParams.get('month') || new Date().getMonth() + 1)
    const year = Number(url.searchParams.get('year') || new Date().getFullYear())

    const db = await getDb()

    // Filtrar socios con transacciones o créditos pendientes
    const transacciones = (db.data!.transactions || []).filter((t: any) => {
      const d = new Date(t.fecha)
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })

    // Calcular montos debidos por socio (cuota AFUT - pagos)
    const cuotaAFUT = Number(db.data!.cuotaConfig.bienestar || 0) + Number(db.data!.cuotaConfig.ordinaria || 0)
    const morosos: any[] = []

    db.data!.socios.forEach((socio: any) => {
      const numerSocio = String(socio.numero)

      // Pagos realizados por este socio ese mes
      const pagosSocio = transacciones.filter((t: any) => String(t.numero) === numerSocio && t.tipo === 'Cuota')
      const totalPagado = pagosSocio.reduce((s: number, p: any) => s + Number(p.amount || 0), 0)

      // Descuentos aplicados
      const descuentos = (db.data!.discounts || []).filter((d: any) => {
        const dFecha = new Date(d.fecha)
        return String(d.numero) === numerSocio && dFecha.getFullYear() === year && dFecha.getMonth() + 1 === month
      })
      const totalDescuentos = descuentos.reduce((s: number, d: any) => s + Number(d.monto || 0), 0)

      // Créditos pendientes de pago
      const creditos = (db.data!.credits || []).filter((c: any) => String(c.numero) === numerSocio)
      const cuotasCredito = creditos.reduce((s: number, c: any) => {
        const pendientes = Number(c.cuotas || 0) - Number(c.cuotasPagadas || 0)
        return s + (pendientes > 0 ? Number(c.cuotaMensual || 0) : 0)
      }, 0)

      // Calcular monto adeudado
      const montoDebe = Math.max(0, cuotaAFUT - totalDescuentos - totalPagado - cuotasCredito)

      if (montoDebe > 0 || totalPagado === 0) {
        morosos.push({
          numero: socio.numero,
          nombre: socio.nombre,
          rut: socio.rut,
          calidadJuridica: socio.calidadJuridica,
          cuotaAFUT,
          totalDescuentos,
          totalPagado,
          cuotasCredito,
          montoDebe
        })
      }
    })

    return NextResponse.json({ ok: true, periodo: { month, year }, morosos, totalMorosos: morosos.length })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}
