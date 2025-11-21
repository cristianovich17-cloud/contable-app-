import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const year = Number(url.searchParams.get('year') || new Date().getFullYear())
    const previousYear = year - 1

    const db = await getDb()

    // Calcular totales para año actual y año anterior
    const ingresosYear = (db.data!.ingresos || []).filter((i: any) => new Date(i.fecha).getFullYear() === year)
    const egresosYear = (db.data!.egresos || []).filter((e: any) => new Date(e.fecha).getFullYear() === year)

    const ingresoPrevYear = (db.data!.ingresos || []).filter((i: any) => new Date(i.fecha).getFullYear() === previousYear)
    const egresoPrevYear = (db.data!.egresos || []).filter((e: any) => new Date(e.fecha).getFullYear() === previousYear)

    const totalIngresosYear = ingresosYear.reduce((s: number, i: any) => s + Number(i.monto || 0), 0)
    const totalEgresosYear = egresosYear.reduce((s: number, e: any) => s + Number(e.monto || 0), 0)
    const balanceYear = totalIngresosYear - totalEgresosYear

    const totalIngresosPrevYear = ingresoPrevYear.reduce((s: number, i: any) => s + Number(i.monto || 0), 0)
    const totalEgresosPrevYear = egresoPrevYear.reduce((s: number, e: any) => s + Number(e.monto || 0), 0)
    const balancePrevYear = totalIngresosPrevYear - totalEgresosPrevYear

    // Calcular variación
    const varIngreso = totalIngresosPrevYear > 0 ? ((totalIngresosYear - totalIngresosPrevYear) / totalIngresosPrevYear) * 100 : 0
    const varEgreso = totalEgresosPrevYear > 0 ? ((totalEgresosYear - totalEgresosPrevYear) / totalEgresosPrevYear) * 100 : 0
    const varBalance = balancePrevYear !== 0 ? ((balanceYear - balancePrevYear) / Math.abs(balancePrevYear)) * 100 : 0

    return NextResponse.json({
      ok: true,
      comparativa: {
        year,
        ingresos: totalIngresosYear,
        egresos: totalEgresosYear,
        balance: balanceYear,
        previousYear,
        ingresosAnteriores: totalIngresosPrevYear,
        egresosAnteriores: totalEgresosPrevYear,
        balanceAnterior: balancePrevYear
      },
      variacion: {
        variacionIngresosPct: varIngreso.toFixed(2),
        variacionEgresosPct: varEgreso.toFixed(2),
        variacionBalancePct: varBalance.toFixed(2)
      }
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}
