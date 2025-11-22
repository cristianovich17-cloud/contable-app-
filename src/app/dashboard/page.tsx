import React from 'react';
import { prisma } from '@/lib/prisma-db';

export const dynamic = 'force-dynamic';
import IngresoEgresoChart from '@/components/charts/IngresoEgresoChart';

export default async function DashboardPage() {
  // Calcular últimos 12 meses
  const now = new Date();
  const months: { label: string; año: number; mes: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('es-CL', { month: 'short', year: 'numeric' });
    months.push({ label, año: d.getFullYear(), mes: d.getMonth() + 1 });
  }

  const ingresosPromises = months.map((m) =>
    prisma.transaccion.aggregate({
      where: { tipo: 'ingreso', año: m.año, mes: m.mes },
      _sum: { monto: true },
    })
  );
  const egresosPromises = months.map((m) =>
    prisma.transaccion.aggregate({
      where: { tipo: 'egreso', año: m.año, mes: m.mes },
      _sum: { monto: true },
    })
  );

  const ingresosRes = await Promise.all(ingresosPromises);
  const egresosRes = await Promise.all(egresosPromises);

  const labels = months.map((m) => m.label);
  const ingresos = ingresosRes.map((r) => r._sum.monto ?? 0);
  const egresos = egresosRes.map((r) => r._sum.monto ?? 0);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard Ejecutivo</h1>
      <section className="bg-white p-4 rounded shadow">
        <IngresoEgresoChart labels={labels} ingresos={ingresos} egresos={egresos} />
      </section>
    </main>
  );
}
