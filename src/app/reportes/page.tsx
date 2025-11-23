'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ReporteMensual {
  ok: boolean;
  periodo: { mes: number; año: number };
  ingresos: { porCategoria: Record<string, number>; total: number; cantidad: number };
  egresos: { porCategoria: Record<string, number>; total: number; cantidad: number };
  balance: number;
  descuentosPorSocio: Array<{ numero: number; nombre: string; total: number; cantidad: number }>;
  morosos: Array<{ socio: { numero: number; nombre: string }; creditoId: number; monto: number }>;
  resumen: { totalIngresos: number; totalEgresos: number; balance: number; sociosMorosos: number };
}

export default function ReportesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [vista, setVista] = useState<'mensual' | 'anual'>('mensual');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [año, setAño] = useState(new Date().getFullYear());
  const [reporteMensual, setReporteMensual] = useState<ReporteMensual | null>(null);
  const [reporteAnual, setReporteAnual] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    // Solo cargar reportes si está autenticado
    if (user) {
      if (vista === 'mensual') {
        cargarReporteMensual();
      } else {
        cargarReporteAnual();
      }
    }
  }, [vista, mes, año, user]);

  async function cargarReporteMensual() {
    try {
      setLoading(true);
      const res = await fetch(`/api/reportes/mensual?mes=${mes}&año=${año}`);
      const data = await res.json();
      if (data.ok) {
        setReporteMensual(data);
        setError('');
      } else {
        setError(data.error || 'Error cargando reporte');
      }
    } catch (err) {
      setError(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  async function cargarReporteAnual() {
    try {
      setLoading(true);
      const res = await fetch(`/api/reportes/anual?año=${año}`);
      const data = await res.json();
      if (data.ok) {
        setReporteAnual(data);
        setError('');
      } else {
        setError(data.error || 'Error cargando reporte');
      }
    } catch (err) {
      setError(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  async function descargarCSV() {
    try {
      const endpoint = vista === 'mensual'
        ? `/api/reportes/mensual?mes=${mes}&año=${año}&formato=csv`
        : `/api/reportes/anual?año=${año}&formato=csv`;
      const res = await fetch(endpoint);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${vista}_${año}.csv`;
      a.click();
    } catch (err) {
      alert(`Error descargando: ${err}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reportes</h1>
          <p className="text-gray-600">Análisis financiero mensual y anual</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setVista('mensual')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              vista === 'mensual'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setVista('anual')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              vista === 'anual'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Anual
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {vista === 'mensual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                <select
                  value={mes}
                  onChange={(e) => setMes(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  {meses.map((m, i) => (
                    <option key={i} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
              <input
                type="number"
                value={año}
                onChange={(e) => setAño(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={descargarCSV}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
              >
                Descargar CSV
              </button>
            </div>
          </div>
          {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">Cargando reporte...</p>
          </div>
        ) : vista === 'mensual' && reporteMensual ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Total Ingresos</p>
                <p className="text-2xl font-bold text-green-600">
                  ${reporteMensual.resumen.totalIngresos.toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Total Egresos</p>
                <p className="text-2xl font-bold text-red-600">
                  ${reporteMensual.resumen.totalEgresos.toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Balance</p>
                <p className={`text-2xl font-bold ${reporteMensual.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${reporteMensual.balance.toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Morosos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {reporteMensual.resumen.sociosMorosos}
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4 text-green-600">Ingresos por Categoría</h3>
                <div className="space-y-2">
                  {Object.entries(reporteMensual.ingresos.porCategoria).map(([cat, monto]) => (
                    <div key={cat} className="flex justify-between pb-2 border-b">
                      <span className="capitalize">{cat}</span>
                      <span className="font-semibold">${(monto as number).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 font-bold text-green-600">
                    <span>Total</span>
                    <span>${reporteMensual.ingresos.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4 text-red-600">Egresos por Categoría</h3>
                <div className="space-y-2">
                  {Object.entries(reporteMensual.egresos.porCategoria).map(([cat, monto]) => (
                    <div key={cat} className="flex justify-between pb-2 border-b">
                      <span className="capitalize">{cat}</span>
                      <span className="font-semibold">${(monto as number).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 font-bold text-red-600">
                    <span>Total</span>
                    <span>${reporteMensual.egresos.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : vista === 'anual' && reporteAnual ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Total Ingresos Anuales</p>
                <p className="text-2xl font-bold text-green-600">
                  ${reporteAnual.totales.totalIngresosAnual.toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Total Egresos Anuales</p>
                <p className="text-2xl font-bold text-red-600">
                  ${reporteAnual.totales.totalEgresosAnual.toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Balance Anual</p>
                <p className={`text-2xl font-bold ${reporteAnual.totales.balanceAnual >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${reporteAnual.totales.balanceAnual.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Resumen Mensual {año}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left">Mes</th>
                      <th className="px-4 py-2 text-right">Ingresos</th>
                      <th className="px-4 py-2 text-right">Egresos</th>
                      <th className="px-4 py-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reporteAnual.resumenMensual?.map((m: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-2">{meses[m.mes - 1]}</td>
                        <td className="px-4 py-2 text-right text-green-600">${m.totalIngresos.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right text-red-600">${m.totalEgresos.toFixed(2)}</td>
                        <td className={`px-4 py-2 text-right ${m.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          ${m.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-bold">
                      <td className="px-4 py-3">TOTAL</td>
                      <td className="px-4 py-3 text-right text-green-600">${reporteAnual.totales.totalIngresosAnual.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-red-600">${reporteAnual.totales.totalEgresosAnual.toFixed(2)}</td>
                      <td className={`px-4 py-3 text-right ${reporteAnual.totales.balanceAnual >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        ${reporteAnual.totales.balanceAnual.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
