'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Transaccion {
  id: number;
  tipo: 'ingreso' | 'egreso';
  categoria: string;
  mes: number;
  año: number;
  monto: number;
  concepto?: string;
  referencia?: string;
  createdAt: string;
}

export default function TransaccionesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [tipo, setTipo] = useState<'ingreso' | 'egreso'>('ingreso');
  const [categoria, setCategoria] = useState('');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [año, setAño] = useState(new Date().getFullYear());
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('');
  const [referencia, setReferencia] = useState('');
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const categoriasIngresos = ['cuotas', 'donaciones', 'actividades', 'intereses', 'otros'];
  const categoriasEgresos = ['administrativos', 'proveedores', 'bienestar', 'salarios', 'otros'];
  const categorias = tipo === 'ingreso' ? categoriasIngresos : categoriasEgresos;

  // Cargar transacciones
  useEffect(() => {
    cargarTransacciones();
  }, [tipo, mes, año]);

  async function cargarTransacciones() {
    try {
      setLoading(true);
      const endpoint = tipo === 'ingreso' ? '/api/transacciones/ingresos' : '/api/transacciones/egresos';
      const res = await fetch(`${endpoint}?mes=${mes}&año=${año}`);
      const data = await res.json();
      if (data.ok) {
        setTransacciones(data[tipo === 'ingreso' ? 'ingresos' : 'egresos'] || []);
      }
    } catch (err) {
      console.error('Error cargando transacciones:', err);
    } finally {
      setLoading(false);
    }
  }

  async function crearTransaccion(e: React.FormEvent) {
    e.preventDefault();
    if (!categoria || !monto || !mes || !año) {
      setMensaje('Complete todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      const endpoint = tipo === 'ingreso' ? '/api/transacciones/ingresos' : '/api/transacciones/egresos';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          categoria,
          mes: parseInt(mes.toString()),
          año: parseInt(año.toString()),
          monto: parseFloat(monto),
          concepto,
          referencia,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje('✓ Transacción creada exitosamente');
        setMonto('');
        setConcepto('');
        setReferencia('');
        cargarTransacciones();
      } else {
        setMensaje(`✗ ${data.error || 'Error al crear transacción'}`);
      }
    } catch (err) {
      setMensaje(`✗ Error: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  const resumenMensual = transacciones.reduce((sum, t) => sum + t.monto, 0);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Transacciones</h1>
          <p className="text-gray-600">Gestiona ingresos y egresos de la asociación</p>
        </div>

        {/* Selector tipo de transacción */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTipo('ingreso')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              tipo === 'ingreso'
                ? 'bg-green-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ⬆️ Ingresos
          </button>
          <button
            onClick={() => setTipo('egreso')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              tipo === 'egreso'
                ? 'bg-red-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ⬇️ Egresos
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Formulario */}
          <div className="lg:col-span-1 bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white">Nueva {tipo === 'ingreso' ? 'Entrada' : 'Salida'}</h2>
            <form onSubmit={crearTransaccion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Categoría *</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg p-2"
                >
                  <option className="bg-gray-700 text-white" value="">Selecciona categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat} className="bg-gray-700 text-white">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Mes *</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={mes}
                    onChange={(e) => setMes(parseInt(e.target.value))}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Año *</label>
                  <input
                    type="number"
                    value={año}
                    onChange={(e) => setAño(parseInt(e.target.value))}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Monto *</label>
                <input
                  type="number"
                  step="0.01"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg p-2"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Concepto</label>
                <input
                  type="text"
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg p-2"
                  placeholder="Descripción breve"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Referencia</label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg p-2"
                  placeholder="Comprobante, factura, etc."
                />
              </div>

              {mensaje && (
                <div className={`p-3 rounded-lg ${mensaje.startsWith('✓') ? 'bg-green-900 text-green-200 border border-green-700' : 'bg-red-900 text-red-200 border border-red-700'}`}>
                  {mensaje}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </form>
          </div>

          {/* Lista de transacciones */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {tipo === 'ingreso' ? 'Ingresos' : 'Egresos'} - {mes}/{año}
              </h2>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total del mes</p>
                <p className={`text-2xl font-bold ${tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                  ${resumenMensual.toFixed(2)}
                </p>
              </div>
            </div>

            {loading ? (
              <p className="text-center py-8 text-gray-500">Cargando...</p>
            ) : transacciones.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No hay {tipo === 'ingreso' ? 'ingresos' : 'egresos'} para este mes</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700 border-b border-gray-600 text-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Categoría</th>
                      <th className="px-4 py-2 text-left font-medium">Concepto</th>
                      <th className="px-4 py-2 text-right font-medium">Monto</th>
                      <th className="px-4 py-2 text-left font-medium">Referencia</th>
                      <th className="px-4 py-2 text-left font-medium">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {transacciones.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-700 text-gray-200">
                        <td className="px-4 py-2 font-medium">{t.categoria}</td>
                        <td className="px-4 py-2 text-gray-400">{t.concepto || '-'}</td>
                        <td className={`px-4 py-2 text-right font-semibold ${tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                          ${t.monto.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-gray-400 text-xs">{t.referencia || '-'}</td>
                        <td className="px-4 py-2 text-gray-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
