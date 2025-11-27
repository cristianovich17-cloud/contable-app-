'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

type AuditLog = {
  id: number;
  usuarioId: number;
  accion: string;
  tabla: string;
  registroId?: number | null;
  cambioAnterior?: any;
  cambioNuevo?: any;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: string;
};

export default function AuditPage() {
  const { user, token, hasPermission, loading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState({ tabla: '', accion: '' });
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!hasPermission('ver_auditoria')) {
      router.push('/');
    }
  }, [loading, hasPermission, router]);

  const fetchLogs = async () => {
    if (!token) return;
    setFetching(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(filters.tabla && { tabla: filters.tabla }),
        ...(filters.accion && { accion: filters.accion }),
      });
      const res = await fetch(`/api/auditoria/logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (e) {
      console.error('Error fetching audit logs', e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user, token, page, limit, filters]);

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!hasPermission('ver_auditoria')) return null;

  const pages = Math.ceil(total / limit);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Auditoría</h1>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            placeholder="Tabla..."
            value={filters.tabla}
            onChange={(e) => {
              setFilters({ ...filters, tabla: e.target.value });
              setPage(1);
            }}
            className="px-3 py-2 border rounded"
          />
          <input
            placeholder="Acción..."
            value={filters.accion}
            onChange={(e) => {
              setFilters({ ...filters, accion: e.target.value });
              setPage(1);
            }}
            className="px-3 py-2 border rounded"
          />
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 border rounded"
          >
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </select>
        </div>

        {fetching && <p className="text-gray-500">Cargando...</p>}

        {!fetching && logs.length === 0 && <p className="text-gray-500">Sin registros.</p>}

        {logs.length > 0 && (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-2">Fecha</th>
                  <th className="text-left py-2 px-2">Acción</th>
                  <th className="text-left py-2 px-2">Tabla</th>
                  <th className="text-left py-2 px-2">Registro ID</th>
                  <th className="text-left py-2 px-2">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="py-2 px-2 text-xs">
                      {new Date(log.createdAt).toLocaleString('es-CL')}
                    </td>
                    <td className="py-2 px-2">{log.accion}</td>
                    <td className="py-2 px-2">{log.tabla}</td>
                    <td className="py-2 px-2">{log.registroId || '-'}</td>
                    <td className="py-2 px-2 text-xs">{log.ip || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex gap-2 mt-4 justify-center">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded ${
                  page === p ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
