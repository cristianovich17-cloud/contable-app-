
"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { calcularCuotaAFUT, formatCurrency } from '@/lib/cuotas'
import { useAuth } from '@/hooks/useAuth'

type Socio = {
  numero: string
  rut: string
  nombre: string
  email?: string
  estado?: string
  calidadJuridica?: string
}

const SociosPage = () => {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  
  const [socios, setSocios] = useState<Socio[]>([])
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [cuotaBienestar, setCuotaBienestar] = useState<number>(0)
  const [cuotaOrdinaria, setCuotaOrdinaria] = useState<number>(0)
  const [savingCuota, setSavingCuota] = useState(false)
  const [discountForms, setDiscountForms] = useState<Record<string, { tipo: string; monto: number; descripcion: string }>>({})
  const [creditForms, setCreditForms] = useState<Record<string, { montoTotal: number; cuotas: number; descripcion: string }>>({})
  const [paymentForms, setPaymentForms] = useState<Record<string, { amount: number; tipo: string; creditId?: string }>>({})
  const [creditsCache, setCreditsCache] = useState<Record<string, any[]>>({})
  const [loadingAction, setLoadingAction] = useState<Record<string, boolean>>({})
  const [workerRunning, setWorkerRunning] = useState(false)
    const [boletaForms, setBoletaForms] = useState<Record<string, { mes: number; año: number; email: string }>>({})
    const [bulkMes, setBulkMes] = useState<number>(new Date().getMonth() + 1)
    const [bulkAño, setBulkAño] = useState<number>(new Date().getFullYear())
    const [bulkSending, setBulkSending] = useState(false)
    const [bulkResult, setBulkResult] = useState<any | null>(null)
    const [sentEmails, setSentEmails] = useState<any[]>([])

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  async function fetchSocios() {
    setLoading(true)
    const res = await fetch('/api/socios')
    const data = await res.json()
    setSocios(data.socios || [])
    setLoading(false)
  }

  async function fetchCuotaConfig() {
    try {
      const res = await fetch('/api/config/cuotas')
      const data = await res.json()
      if (data.ok && data.cuotaConfig) {
        setCuotaBienestar(Number(data.cuotaConfig.bienestar || 0))
        setCuotaOrdinaria(Number(data.cuotaConfig.ordinaria || 0))
      }
    } catch (err) {
      // ignore
    }
  }

  useEffect(() => {
    fetchSocios()
    fetchCuotaConfig()
    fetchSentEmails()
  }, [])

  async function fetchSentEmails() {
    try {
      const res = await fetch('/api/socios/sent-emails')
      const data = await res.json()
      if (data.ok) setSentEmails(data.sent || [])
    } catch (_) {}
  }

  async function fetchWorkerStatus() {
    try {
      const r = await fetch('/api/worker/status')
      const j = await r.json()
      setWorkerRunning(Boolean(j.running))
    } catch (_) {}
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault()
    if (!fileRef.current || !fileRef.current.files || fileRef.current.files.length === 0) return
    const f = fileRef.current.files[0]
    const fd = new FormData()
    fd.append('file', f)
    const res = await fetch('/api/socios/import', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.ok) {
      alert(`Importados: ${data.addedCount}. Errores: ${data.errors?.length || 0}`)
      fetchSocios()
    } else {
      alert('Error en importación: ' + (data.error || 'unknown'))
    }
  }

  async function handleSaveCuota(e: React.FormEvent) {
    e.preventDefault()
    setSavingCuota(true)
    try {
      const res = await fetch('/api/config/cuotas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bienestar: cuotaBienestar, ordinaria: cuotaOrdinaria })
      })
      const data = await res.json()
      if (data.ok) {
        alert('Cuotas guardadas')
      } else {
        alert('Error guardando cuotas: ' + (data.error || ''))
      }
    } catch (err) {
      alert('Error guardando cuotas')
    }
    setSavingCuota(false)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">👥 Gestión de Socios</h1>
          {user && (
            <p className="text-sm text-gray-600 mt-1">
              🔐 {user.nombre} ({user.rol})
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium"
          >
            🚪 Logout
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-4 bg-gray-50 p-2 rounded">
            <select value={bulkMes} onChange={e => setBulkMes(Number(e.target.value))} className="border px-2 py-1 rounded text-sm">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][m-1]}</option>
              ))}
            </select>
            <input type="number" value={bulkAño} onChange={e => setBulkAño(Number(e.target.value))} className="border px-2 py-1 rounded w-24 text-sm" />
            <button onClick={async () => {
              if (!confirm(`Enviar boletas a todos los socios para ${bulkMes}/${bulkAño}?`)) return
              setBulkSending(true)
              setBulkResult(null)
              try {
                const res = await fetch('/api/socios/enviar-boletas-mes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mes: bulkMes, año: bulkAño, onlyWithEmail: true }) })
                const data = await res.json()
                if (data.ok) {
                  setBulkResult(data.summary)
                  alert(`Envío completado: enviados ${data.summary.enviados}, fallidos ${data.summary.fallidos}`)
                } else {
                  alert('Error en envío masivo: ' + (data.error || ''))
                }
              } catch (err) {
                alert('Error ejecutando envío masivo')
              }
              setBulkSending(false)
            }} className="bg-purple-600 text-white px-3 py-1 rounded text-sm">{bulkSending ? 'Enviando...' : 'Enviar boletas a todos'}</button>
            </div>
            <label className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
              Importar Excel
              <input ref={fileRef} type="file" accept=".xls,.xlsx" className="hidden" />
            </label>
            <button onClick={handleImport} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Procesar Importación
            </button>
          </div>
        </div>
      </div>

      {/* Historial de envíos recientes */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-white">Historial de envíos (últimos 10)</h3>
        <div className="bg-gray-900 border border-gray-700 rounded p-2">
          {sentEmails.length === 0 ? (
            <div className="text-sm text-gray-400">No hay registros de envíos aún.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-200">
                <thead className="text-left bg-gray-800 text-gray-100">
                  <tr>
                    <th className="px-2 py-2">Fecha</th>
                    <th className="px-2 py-2">N° Socio</th>
                    <th className="px-2 py-2">Email</th>
                    <th className="px-2 py-2">Estado</th>
                    <th className="px-2 py-2">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {sentEmails.slice(0, 10).map((e, idx) => (
                    <tr key={idx} className="border-t border-gray-700 hover:bg-gray-800">
                      <td className="px-2 py-1">{new Date(e.fecha).toLocaleString()}</td>
                      <td className="px-2 py-1">{e.numero}</td>
                      <td className="px-2 py-1">{e.email}</td>
                      <td className="px-2 py-1">{e.ok ? <span className="text-green-400">Enviado</span> : <span className="text-red-400">Fallido</span>}</td>
                      <td className="px-2 py-1 text-xs text-red-400">{e.error || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-2">
            <div className="flex gap-2">
              <button onClick={fetchSentEmails} className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm">Actualizar historial</button>
              <button onClick={async () => {
                if (!confirm(`Reintentar envíos fallidos para ${bulkMes}/${bulkAño}?`)) return
                try {
                  const res = await fetch('/api/socios/retry-failed-boletas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mes: bulkMes, año: bulkAño }) })
                  const data = await res.json()
                  if (data.ok) {
                    alert(`Reintentos completados: ${data.summary.reintentos} de ${data.summary.total}`)
                    fetchSentEmails()
                  } else alert('Error reintentando: ' + (data.error || ''))
                } catch (err) { alert('Error ejecutando reintentos') }
              }} className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-sm">Reintentar fallidos</button>
              <a href="/api/socios/sent-emails/export" className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm">Exportar CSV</a>
              <button onClick={async () => {
                try {
                  const res = await fetch('/api/worker/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ concurrency: 4, maxRetries: 3 }) })
                  const j = await res.json()
                  if (j.ok) {
                    alert('Worker iniciado')
                    setWorkerRunning(true)
                  } else alert('No se pudo iniciar worker: ' + (j.message || j.error || ''))
                } catch (err) { alert('Error iniciando worker') }
              }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-sm">Iniciar Worker</button>
              <button onClick={fetchWorkerStatus} className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm">Estado Worker</button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div>Cargando socios...</div>
      ) : (
        <div className="overflow-x-auto">
          <div className="mb-6 p-4 bg-gray-800 rounded border border-gray-700">
            <h2 className="text-lg font-semibold mb-2 text-white">Configuración de Cuotas</h2>
            <form onSubmit={handleSaveCuota} className="flex items-end gap-4">
              <div>
                <label className="block text-sm text-gray-300">Cuota Bienestar</label>
                <input type="number" value={cuotaBienestar} onChange={e => setCuotaBienestar(Number(e.target.value))} className="border border-gray-600 bg-gray-700 text-white px-2 py-1 rounded w-40" />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Cuota Ordinaria</label>
                <input type="number" value={cuotaOrdinaria} onChange={e => setCuotaOrdinaria(Number(e.target.value))} className="border border-gray-600 bg-gray-700 text-white px-2 py-1 rounded w-40" />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Cuota Socio AFUT</label>
                <div className="font-medium text-white">{formatCurrency(calcularCuotaAFUT(cuotaBienestar, cuotaOrdinaria))}</div>
              </div>
              <div>
                <button disabled={savingCuota} className="bg-indigo-600 text-white px-3 py-1 rounded">
                  {savingCuota ? 'Guardando...' : 'Guardar Cuotas'}
                </button>
              </div>
            </form>
          </div>
          <table className="min-w-full bg-gray-900">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 uppercase font-semibold text-sm">N°</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">RUT</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">Nombre</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">Email</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">Calidad</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">Estado</th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              {socios.map((s) => (
                <tr key={s.rut + s.numero} className="border-t border-gray-700 hover:bg-gray-800">
                  <td className="py-3 px-4">{s.numero}</td>
                  <td className="py-3 px-4">{s.rut}</td>
                  <td className="py-3 px-4">{s.nombre}</td>
                  <td className="py-3 px-4">{s.email}</td>
                  <td className="py-3 px-4">{s.calidadJuridica}</td>
                  <td className="py-3 px-4">{s.estado}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          // toggle discount form
                          setDiscountForms(prev => ({ ...prev, [s.numero]: prev[s.numero] ? undefined as any : { tipo: 'Descuento', monto: 0, descripcion: '' } }))
                        }}
                        className="bg-yellow-400 text-black px-2 py-1 rounded text-sm"
                      >
                        Descuento
                      </button>
                      <button
                        onClick={async () => {
                          // toggle credit form
                          setCreditForms(prev => ({ ...prev, [s.numero]: prev[s.numero] ? undefined as any : { montoTotal: 0, cuotas: 1, descripcion: '' } }))
                        }}
                        className="bg-orange-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Crédito
                      </button>
                      <button
                        onClick={async () => {
                          // generate receipt
                          setLoadingAction(prev => ({ ...prev, [s.numero]: true }))
                          try {
                            const res = await fetch(`/api/socios/${s.numero}/recibos`, { method: 'POST' })
                            const data = await res.json()
                            if (data.ok) {
                              // show JSON in new window
                              const w = window.open('about:blank')
                              if (w) w.document.write('<pre>' + JSON.stringify(data.receipt, null, 2) + '</pre>')
                            } else alert('Error generando recibo: ' + (data.error || ''))
                          } catch (err) {
                            alert('Error generando recibo')
                          }
                          setLoadingAction(prev => ({ ...prev, [s.numero]: false }))
                        }}
                        className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Recibo
                      </button>
                      <button
                        onClick={async () => {
                          // toggle payment form and fetch credits
                          setPaymentForms(prev => ({ ...prev, [s.numero]: prev[s.numero] ? undefined as any : { amount: 0, tipo: 'Cuota' } }))
                          try {
                            const res = await fetch(`/api/socios/${s.numero}/creditos`)
                            const data = await res.json()
                            if (data.ok) setCreditsCache(prev => ({ ...prev, [s.numero]: data.credits || [] }))
                          } catch (_) {}
                        }}
                        className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Pago
                      </button>
                        <button
                          onClick={async () => {
                            // toggle boleta form
                            setBoletaForms(prev => ({ ...prev, [s.numero]: prev[s.numero] ? undefined as any : { mes: new Date().getMonth() + 1, año: new Date().getFullYear(), email: s.email || '' } }))
                          }}
                          className="bg-purple-600 text-white px-2 py-1 rounded text-sm"
                        >
                          Boleta
                        </button>
                    </div>

                    {/* Discount form */}
                    {discountForms[s.numero] && (
                      <div className="mt-2 p-2 border rounded bg-white">
                        <input placeholder="Tipo" value={discountForms[s.numero].tipo} onChange={e => setDiscountForms(prev => ({ ...prev, [s.numero]: { ...prev[s.numero], tipo: e.target.value } }))} className="border px-2 py-1 rounded mr-2 text-sm" />
                        <input type="number" placeholder="Monto" value={discountForms[s.numero].monto} onChange={e => setDiscountForms(prev => ({ ...prev, [s.numero]: { ...prev[s.numero], monto: Number(e.target.value) } }))} className="border px-2 py-1 rounded mr-2 w-32 text-sm" />
                        <input placeholder="Descripción" value={discountForms[s.numero].descripcion} onChange={e => setDiscountForms(prev => ({ ...prev, [s.numero]: { ...prev[s.numero], descripcion: e.target.value } }))} className="border px-2 py-1 rounded mr-2 text-sm" />
                        <button onClick={async () => {
                          const f = discountForms[s.numero]
                          if (!f) return
                          setLoadingAction(prev => ({ ...prev, [s.numero]: true }))
                          try {
                            const res = await fetch(`/api/socios/${s.numero}/descuentos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) })
                            const data = await res.json()
                            if (data.ok) {
                              alert('Descuento añadido')
                              setDiscountForms(prev => ({ ...prev, [s.numero]: undefined as any }))
                            } else alert('Error: ' + (data.error || ''))
                          } catch (err) { alert('Error agregando descuento') }
                          setLoadingAction(prev => ({ ...prev, [s.numero]: false }))
                        }} className="bg-indigo-600 text-white px-2 py-1 rounded text-sm">Añadir</button>
                      </div>
                    )}

                    {/* Credit form */}
                    {creditForms[s.numero] && (
                      <div className="mt-2 p-2 border rounded bg-white">
                        <input type="number" placeholder="Monto total" value={creditForms[s.numero].montoTotal} onChange={e => setCreditForms(prev => ({ ...prev, [s.numero]: { ...prev[s.numero], montoTotal: Number(e.target.value) } }))} className="border px-2 py-1 rounded mr-2 w-36 text-sm" />
                        <input type="number" placeholder="Cuotas" value={creditForms[s.numero].cuotas} onChange={e => setCreditForms(prev => ({ ...prev, [s.numero]: { ...prev[s.numero], cuotas: Number(e.target.value) } }))} className="border px-2 py-1 rounded mr-2 w-24 text-sm" />
                        <input placeholder="Descripción" value={creditForms[s.numero].descripcion} onChange={e => setCreditForms(prev => ({ ...prev, [s.numero]: { ...prev[s.numero], descripcion: e.target.value } }))} className="border px-2 py-1 rounded mr-2 text-sm" />
                        <button onClick={async () => {
                          const f = creditForms[s.numero]
                          if (!f) return
                          setLoadingAction(prev => ({ ...prev, [s.numero]: true }))
                          try {
                            const res = await fetch(`/api/socios/${s.numero}/creditos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) })
                            const data = await res.json()
                            if (data.ok) {
                              alert('Crédito añadido')
                              setCreditForms(prev => ({ ...prev, [s.numero]: undefined as any }))
                            } else alert('Error: ' + (data.error || ''))
                          } catch (err) { alert('Error agregando crédito') }
                          setLoadingAction(prev => ({ ...prev, [s.numero]: false }))
                        }} className="bg-indigo-600 text-white px-2 py-1 rounded text-sm">Añadir</button>
                      </div>
                    )}

                    {/* Payment form */}
                    {paymentForms[s.numero] && (
                      <div className="mt-2 p-2 border rounded bg-white">
                        <input type="number" placeholder="Monto" value={paymentForms[s.numero].amount} onChange={e => setPaymentForms(prev => ({ ...prev, [s.numero]: { ...prev[s.numero], amount: Number(e.target.value) } }))} className="border px-2 py-1 rounded mr-2 w-32 text-sm" />
                        <select value={paymentForms[s.numero].tipo} onChange={e => setPaymentForms(prev => ({ ...prev, [s.numero]: { ...prev[s.numero], tipo: e.target.value } }))} className="border px-2 py-1 rounded mr-2 text-sm">
                          <option>Cuota</option>
                          <option>Credito</option>
                          <option>Otro</option>
                        </select>
                        <select value={paymentForms[s.numero].creditId || ''} onChange={e => setPaymentForms(prev => ({ ...prev, [s.numero]: { ...prev[s.numero], creditId: e.target.value || undefined } }))} className="border px-2 py-1 rounded mr-2 text-sm">
                          <option value="">(Sin crédito)</option>
                          {(creditsCache[s.numero] || []).map(c => (
                            <option key={c.id} value={c.id}>{`Crédito ${c.id} - cuota ${c.cuotaMensual}`}</option>
                          ))}
                        </select>
                        <button onClick={async () => {
                          const f = paymentForms[s.numero]
                          if (!f) return
                          setLoadingAction(prev => ({ ...prev, [s.numero]: true }))
                          try {
                            const body: any = { amount: f.amount, tipo: f.tipo }
                            if (f.creditId) body.creditId = f.creditId
                            const res = await fetch(`/api/socios/${s.numero}/pagos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
                            const data = await res.json()
                            if (data.ok) {
                              alert('Pago registrado')
                              setPaymentForms(prev => ({ ...prev, [s.numero]: undefined as any }))
                              // refresh credits cache
                              const r = await fetch(`/api/socios/${s.numero}/creditos`)
                              const rr = await r.json()
                              if (rr.ok) setCreditsCache(prev => ({ ...prev, [s.numero]: rr.credits || [] }))
                            } else alert('Error: ' + (data.error || ''))
                          } catch (err) { alert('Error registrando pago') }
                          setLoadingAction(prev => ({ ...prev, [s.numero]: false }))
                        }} className="bg-indigo-600 text-white px-2 py-1 rounded text-sm">Registrar</button>
                      </div>
                    )}

                      {/* Boleta form */}
                      {boletaForms[s.numero] && (
                        <div className="mt-2 p-2 border rounded bg-white">
                          <select value={boletaForms[s.numero].mes} onChange={e => setBoletaForms(prev => ({ ...prev, [s.numero]: { ...prev[s.numero], mes: Number(e.target.value) } }))} className="border px-2 py-1 rounded mr-2 text-sm">
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                              <option key={m} value={m}>{['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][m - 1]}</option>
                            ))}
                          </select>
                          <input type="number" placeholder="Año" value={boletaForms[s.numero].año} onChange={e => setBoletaForms(prev => ({ ...prev, [s.numero]: { ...prev[s.numero], año: Number(e.target.value) } }))} className="border px-2 py-1 rounded mr-2 w-24 text-sm" />
                          <input type="email" placeholder="Email" value={boletaForms[s.numero].email} onChange={e => setBoletaForms(prev => ({ ...prev, [s.numero]: { ...prev[s.numero], email: e.target.value } }))} className="border px-2 py-1 rounded mr-2 text-sm" />
                          <button onClick={async () => {
                            const f = boletaForms[s.numero]
                            if (!f || !f.email) {
                              alert('Por favor completa todos los campos')
                              return
                            }
                            setLoadingAction(prev => ({ ...prev, [s.numero]: true }))
                            try {
                              const res = await fetch(`/api/socios/${s.numero}/enviar-boleta`, { 
                                method: 'POST', 
                                headers: { 'Content-Type': 'application/json' }, 
                                body: JSON.stringify({ mes: f.mes, año: f.año, email: f.email }) 
                              })
                              const data = await res.json()
                              if (data.success) {
                                alert(`Boleta enviada exitosamente a ${f.email}\nDescuentos: ${data.descuentos?.cantidad || 0} - Total: $${data.descuentos?.total || 0}`)
                                setBoletaForms(prev => ({ ...prev, [s.numero]: undefined as any }))
                              } else alert('Error: ' + (data.error || 'Error desconocido'))
                            } catch (err) { alert('Error enviando boleta') }
                            setLoadingAction(prev => ({ ...prev, [s.numero]: false }))
                          }} className="bg-indigo-600 text-white px-2 py-1 rounded text-sm">Enviar</button>
                        </div>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default SociosPage
