import React from 'react';
import { prisma } from '@/lib/prisma-db';
import IngresoEgresoChart from '@/components/charts/IngresoEgresoChart';

export const dynamic = 'force-dynamic';

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

  const totalIngresos = ingresos.reduce((a, b) => a + b, 0);
  const totalEgresos = egresos.reduce((a, b) => a + b, 0);
  const saldo = totalIngresos - totalEgresos;

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard Ejecutivo</h1>
          <p className="text-secondary-400">Resumen financiero y estadísticas</p>
        </div>

        {/* Cards de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card Ingresos */}
          <div className="card border border-primary-500 border-opacity-20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-secondary-400 text-sm font-medium mb-1">Total Ingresos</p>
                <h3 className="text-3xl font-bold text-primary-400">
                  ${totalIngresos.toLocaleString('es-CL')}
                </h3>
              </div>
              <div className="p-3 bg-primary-500 bg-opacity-20 rounded-lg">
                <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <div className="text-xs text-secondary-500">Últimos 12 meses</div>
          </div>

          {/* Card Egresos */}
          <div className="card border border-red-500 border-opacity-20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-secondary-400 text-sm font-medium mb-1">Total Egresos</p>
                <h3 className="text-3xl font-bold text-red-400">
                  ${totalEgresos.toLocaleString('es-CL')}
                </h3>
              </div>
              <div className="p-3 bg-red-500 bg-opacity-20 rounded-lg">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </div>
            </div>
            <div className="text-xs text-secondary-500">Últimos 12 meses</div>
          </div>

          {/* Card Saldo */}
          <div className={`card border ${saldo >= 0 ? 'border-emerald-500' : 'border-red-500'} border-opacity-20`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-secondary-400 text-sm font-medium mb-1">Saldo Neto</p>
                <h3 className={`text-3xl font-bold ${saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${saldo.toLocaleString('es-CL')}
                </h3>
              </div>
              <div className={`p-3 ${saldo >= 0 ? 'bg-emerald-500' : 'bg-red-500'} bg-opacity-20 rounded-lg`}>
                <svg className={`w-8 h-8 ${saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-xs text-secondary-500">Diferencia ingresos - egresos</div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Movimiento Financiero (Últimos 12 Meses)</h2>
          <IngresoEgresoChart labels={labels} ingresos={ingresos} egresos={egresos} />
        </div>
      </div>
    </main>
  );
}
