import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-db';

/**
 * GET /api/reportes/anual?año=2025&formato=json
 * Informe anual consolidado:
 * - Resumen mensual de ingresos/egresos
 * - Balance anual
 * - Análisis comparativo anual
 * - Exportación a CSV (formato=csv)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const año = parseInt(searchParams.get('año') || String(new Date().getFullYear()));
    const formato = searchParams.get('formato') || 'json'; // json o csv

    // Genera resumen por mes
    const meses = Array.from({ length: 12 }, (_, i) => i + 1);
    const resumenMensual: any[] = [];

    const allTransacciones = await prisma.transaccion.findMany({
      where: { año },
    });

    meses.forEach((mes) => {
      const ingresos = allTransacciones.filter((t) => t.tipo === 'ingreso' && t.mes === mes);
      const egresos = allTransacciones.filter((t) => t.tipo === 'egreso' && t.mes === mes);

      const ingresosCategoria: Record<string, number> = {};
      ingresos.forEach((t) => {
        ingresosCategoria[t.categoria] = (ingresosCategoria[t.categoria] || 0) + t.monto;
      });

      const egresosCategoria: Record<string, number> = {};
      egresos.forEach((t) => {
        egresosCategoria[t.categoria] = (egresosCategoria[t.categoria] || 0) + t.monto;
      });

      const totalIngresos = ingresos.reduce((sum, t) => sum + t.monto, 0);
      const totalEgresos = egresos.reduce((sum, t) => sum + t.monto, 0);

      resumenMensual.push({
        mes,
        totalIngresos,
        totalEgresos,
        balance: totalIngresos - totalEgresos,
        ingresosCategoria,
        egresosCategoria,
      });
    });

    const totalIngresosAnual = resumenMensual.reduce((sum, m) => sum + m.totalIngresos, 0);
    const totalEgresosAnual = resumenMensual.reduce((sum, m) => sum + m.totalEgresos, 0);
    const balanceAnual = totalIngresosAnual - totalEgresosAnual;

    // Análisis comparativo (comparar con año anterior si existe)
    const allTransaccionesAñoAnterior = await prisma.transaccion.findMany({
      where: { año: año - 1 },
    });

    let comparativaAñoAnterior: any = null;
    if (allTransaccionesAñoAnterior.length > 0) {
      const totalIngresosAñoAnterior = allTransaccionesAñoAnterior
        .filter((t) => t.tipo === 'ingreso')
        .reduce((sum, t) => sum + t.monto, 0);
      const totalEgresosAñoAnterior = allTransaccionesAñoAnterior
        .filter((t) => t.tipo === 'egreso')
        .reduce((sum, t) => sum + t.monto, 0);

      comparativaAñoAnterior = {
        año: año - 1,
        totalIngresosAñoAnterior,
        totalEgresosAñoAnterior,
        balanceAñoAnterior: totalIngresosAñoAnterior - totalEgresosAñoAnterior,
        variacionIngresos: totalIngresosAnual - totalIngresosAñoAnterior,
        variacionEgresos: totalEgresosAnual - totalEgresosAñoAnterior,
        variacionBalance: balanceAnual - (totalIngresosAñoAnterior - totalEgresosAñoAnterior),
      };
    }

    const response = {
      ok: true,
      año,
      resumenMensual,
      totales: {
        totalIngresosAnual,
        totalEgresosAnual,
        balanceAnual,
      },
      comparativa: comparativaAñoAnterior,
    };

    if (formato === 'csv') {
      // Generar CSV
      const csv = generarCSV(resumenMensual, año);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="reporte_anual_${año}.csv"`,
        },
      });
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error en reporte anual:', error);
    return NextResponse.json(
      { error: error.message || 'Error al generar reporte anual' },
      { status: 500 }
    );
  }
}

function generarCSV(resumenMensual: any[], año: number): string {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  let csv = `Reporte Anual ${año}\n`;
  csv += `Mes,Ingresos,Egresos,Balance\n`;

  resumenMensual.forEach((mes) => {
    csv += `${meses[mes.mes - 1]},${mes.totalIngresos.toFixed(2)},${mes.totalEgresos.toFixed(2)},${mes.balance.toFixed(2)}\n`;
  });

  const totales = resumenMensual.reduce(
    (sum, m) => ({
      ingresos: sum.ingresos + m.totalIngresos,
      egresos: sum.egresos + m.totalEgresos,
      balance: sum.balance + m.balance,
    }),
    { ingresos: 0, egresos: 0, balance: 0 }
  );

  csv += `\nTOTAL,${totales.ingresos.toFixed(2)},${totales.egresos.toFixed(2)},${totales.balance.toFixed(2)}\n`;

  return csv;
}
