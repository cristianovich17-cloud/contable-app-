import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-db';

// Categorías de ingresos predefinidas
const CATEGORIAS_INGRESOS = ['cuotas', 'donaciones', 'actividades', 'intereses', 'otros'];

/**
 * POST /api/transacciones/ingresos
 * Crear nuevo ingreso con comprobante opcional
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { categoria, mes, año, monto, concepto, referencia } = body;

    // Validaciones
    if (!categoria || !CATEGORIAS_INGRESOS.includes(categoria)) {
      return NextResponse.json(
        { error: `Categoría inválida. Válidas: ${CATEGORIAS_INGRESOS.join(', ')}` },
        { status: 400 }
      );
    }
    if (!mes || !año || mes < 1 || mes > 12 || año < 2020) {
      return NextResponse.json({ error: 'Mes y año inválidos' }, { status: 400 });
    }
    if (!monto || monto <= 0) {
      return NextResponse.json({ error: 'Monto debe ser mayor a 0' }, { status: 400 });
    }

    // Crear transacción
    const transaccion = await prisma.transaccion.create({
      data: {
        tipo: 'ingreso',
        categoria,
        mes,
        año,
        monto,
        concepto,
        referencia,
      },
    });

    return NextResponse.json(
      { ok: true, transaccion },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear ingreso:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear ingreso' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/transacciones/ingresos
 * Listar ingresos con filtros opcionales (mes, año, categoría)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mes = searchParams.get('mes') ? parseInt(searchParams.get('mes')!) : undefined;
    const año = searchParams.get('año') ? parseInt(searchParams.get('año')!) : undefined;
    const categoria = searchParams.get('categoria');

    let query: any = { tipo: 'ingreso' };
    if (mes) query.mes = mes;
    if (año) query.año = año;
    if (categoria) query.categoria = categoria;

    const ingresos = await prisma.transaccion.findMany({
      where: query,
      orderBy: { createdAt: 'desc' },
    });

    // Calcular totales
    const total = ingresos.reduce((sum, t) => sum + t.monto, 0);
    const porCategoria: Record<string, number> = {};
    ingresos.forEach((t) => {
      porCategoria[t.categoria] = (porCategoria[t.categoria] || 0) + t.monto;
    });

    return NextResponse.json({
      ok: true,
      ingresos,
      resumen: {
        total,
        cantidad: ingresos.length,
        porCategoria,
      },
    });
  } catch (error: any) {
    console.error('Error al listar ingresos:', error);
    return NextResponse.json(
      { error: error.message || 'Error al listar ingresos' },
      { status: 500 }
    );
  }
}
