import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-db';
import { validateJWT } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reportes/mensual?mes=11&año=2025&tipoSocio=Funcionario
 * Informe mensual consolidado:
 * - Resumen ingresos/egresos por categoría
 * - Descuentos por socio
 * - Socios morosos (con pagos pendientes)
 * - Cuotas de ahorro/créditos pendientes
 */
export async function GET(req: NextRequest) {
  try {
    // Validar autenticación
    const user = await validateJWT(req);
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado. Por favor inicia sesión.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const mes = parseInt(searchParams.get('mes') || String(new Date().getMonth() + 1));
    const año = parseInt(searchParams.get('año') || String(new Date().getFullYear()));
    const tipoSocio = searchParams.get('tipoSocio'); // Funcionario / Código del Trabajo / null para todos

    // Validar mes y año
    if (mes < 1 || mes > 12) {
      return NextResponse.json({ error: 'Mes debe estar entre 1 y 12' }, { status: 400 });
    }

    // 1. Ingresos y egresos por categoría
    const [transaccionesIngresos, transaccionesEgresos] = await Promise.all([
      prisma.transaccion.findMany({ where: { tipo: 'ingreso', mes, año } }).catch(() => []),
      prisma.transaccion.findMany({ where: { tipo: 'egreso', mes, año } }).catch(() => []),
    ]);

    const ingresosCategoria: Record<string, number> = {};
    transaccionesIngresos.forEach((t) => {
      ingresosCategoria[t.categoria] = (ingresosCategoria[t.categoria] || 0) + t.monto;
    });

    const egresosCategoria: Record<string, number> = {};
    transaccionesEgresos.forEach((t) => {
      egresosCategoria[t.categoria] = (egresosCategoria[t.categoria] || 0) + t.monto;
    });

    const totalIngresos = transaccionesIngresos.reduce((sum, t) => sum + t.monto, 0);
    const totalEgresos = transaccionesEgresos.reduce((sum, t) => sum + t.monto, 0);
    const balance = totalIngresos - totalEgresos;

    // 2. Descuentos por socio
    let descuentosQuery: any = { mes, año };
    let sociosFilter: any = undefined;
    if (tipoSocio) {
      sociosFilter = { where: { estado: tipoSocio } }; // Filtrar por estado/tipo si es necesario
    }

    const descuentosPorSocio = await prisma.descuento.findMany({
      where: descuentosQuery,
      include: { socio: true },
      orderBy: { socio: { numero: 'asc' } },
    });

    // 3. Socios morosos (con créditos pendientes)
    const creditosPendientes = await prisma.credito.findMany({
      where: { estado: 'pendiente' },
      include: { socio: true },
    });

    const morosos = creditosPendientes.map((c) => ({
      socio: c.socio,
      creditoId: c.id,
      monto: c.monto,
      estado: c.estado,
      concepto: c.concepto,
    }));

    // 4. Resumen de descuentos totales por socio
    const descuentosTotalesPorSocio: Record<
      number,
      { numero: number; nombre: string; total: number; cantidad: number; detalles: any[] }
    > = {};

    descuentosPorSocio.forEach((d) => {
      if (!descuentosTotalesPorSocio[d.socio.numero]) {
        descuentosTotalesPorSocio[d.socio.numero] = {
          numero: d.socio.numero,
          nombre: d.socio.nombre,
          total: 0,
          cantidad: 0,
          detalles: [],
        };
      }
      descuentosTotalesPorSocio[d.socio.numero].total += d.monto;
      descuentosTotalesPorSocio[d.socio.numero].cantidad++;
      descuentosTotalesPorSocio[d.socio.numero].detalles.push({
        concepto: d.concepto,
        monto: d.monto,
      });
    });

    return NextResponse.json({
      ok: true,
      periodo: { mes, año },
      ingresos: {
        porCategoria: ingresosCategoria,
        total: totalIngresos,
        cantidad: transaccionesIngresos.length,
      },
      egresos: {
        porCategoria: egresosCategoria,
        total: totalEgresos,
        cantidad: transaccionesEgresos.length,
      },
      balance,
      descuentosPorSocio: Object.values(descuentosTotalesPorSocio),
      morosos,
      resumen: {
        totalIngresos,
        totalEgresos,
        balance,
        sociosMorosos: morosos.length,
        totalDescuentos: descuentosPorSocio.reduce((sum, d) => sum + d.monto, 0),
      },
    });
  } catch (error: any) {
    console.error('Error en reporte mensual:', error);
    return NextResponse.json(
      { error: error.message || 'Error al generar reporte mensual' },
      { status: 500 }
    );
  }
}
