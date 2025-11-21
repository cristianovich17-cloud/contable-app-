import { getDb } from '@/lib/db'
import { generarPDFBoleta } from '@/lib/pdf-boleta'
import { enviarBoleta } from '@/lib/email'

let running = false

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function withExponentialRetries<T>(fn: () => Promise<T>, retries = 3, baseDelay = 500) {
  let lastErr: any
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (attempt < retries) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 200)
        await sleep(delay)
      }
    }
  }
  throw lastErr
}

async function mapWithConcurrency<T, R>(items: T[], mapper: (t: T) => Promise<R>, concurrency = 3) {
  const results: R[] = []
  const executing: Promise<void>[] = []
  let i = 0

  async function runOne() {
    while (i < items.length) {
      const index = i++
      try {
        const res = await mapper(items[index])
        results[index] = res
      } catch (err) {
        results[index] = err as any
      }
    }
  }

  for (let j = 0; j < concurrency; j++) executing.push(runOne())
  await Promise.all(executing)
  return results
}

export async function runWorker(options?: { concurrency?: number; maxRetries?: number }) {
  if (running) return { running: true }
  running = true
  const concurrency = options?.concurrency ?? 3
  const maxRetries = options?.maxRetries ?? 3

  const db = await getDb()
  if (!db.data) {
    running = false
    return { error: 'DB inaccesible' }
  }
  const data = db.data
  data.sentEmails = data.sentEmails || []

  // Seleccionar trabajos pendientes: ok === false y processed !== true y queued !== true
  const pending = data.sentEmails.filter((e: any) => e.ok === false && !e.processed && !e.queued)

  // Marcar queued para evitar duplicados
  for (const p of pending) {
    p.queued = true
  }
  await db.write()

  const mapper = async (job: any) => {
    // find socio
    const socio = (data.socios || []).find((s: any) => s.numero === job.numero)
    if (!socio) {
      job.processed = true
      job.processedOk = false
      job.attempts = (job.attempts || 0) + 1
      job.lastError = 'Socio no encontrado'
      job.processedDate = new Date().toISOString()
      await db.write()
      return { numero: job.numero, success: false, mensaje: 'Socio no encontrado' }
    }

    try {
      const descuentosDelMes = (data.discounts || []).filter((d: any) => {
        const fecha = new Date(d.fecha)
        return d.numeroSocio === socio.numero && fecha.getMonth() + 1 === job.mes && fecha.getFullYear() === job.año
      }).map((d: any) => ({ concepto: d.concepto, monto: d.monto, fecha: new Date(d.fecha).toLocaleDateString('es-CL') }))

      const totalDescuentos = descuentosDelMes.reduce((s: number, d: any) => s + (d.monto || 0), 0)

      const pdf = await withExponentialRetries(() => generarPDFBoleta(socio.nombre, socio.numero, job.mes, job.año, socio.email || '', descuentosDelMes, totalDescuentos), Math.max(1, Math.min(maxRetries, 3)), 300)

      const descuentosInfo = descuentosDelMes.length ? `<ul>${descuentosDelMes.map((d: any) => `<li>${d.concepto}: $${d.monto.toLocaleString('es-CL')} (${d.fecha})</li>`).join('')}</ul><p><strong>Total: $${totalDescuentos.toLocaleString('es-CL')}</strong></p>` : '<p>Sin descuentos registrados para este período.</p>'

      const res = await withExponentialRetries(() => enviarBoleta(socio.email || '', socio.nombre, socio.numero, job.mes, job.año, pdf, descuentosInfo), Math.max(1, Math.min(maxRetries, 5)), 500)

      job.processed = true
      job.processedOk = res.success
      job.attempts = (job.attempts || 0) + 1
      job.lastError = res.success ? undefined : res.mensaje
      job.processedDate = new Date().toISOString()
      await db.write()
      return { numero: socio.numero, success: res.success, mensaje: res.mensaje }
    } catch (err: any) {
      job.processed = false
      job.processedOk = false
      job.attempts = (job.attempts || 0) + 1
      job.lastError = err?.message || 'Error'
      job.processedDate = new Date().toISOString()
      // clear queued so it can be re-queued later
      job.queued = false
      await db.write()
      return { numero: socio.numero, success: false, mensaje: err?.message || 'Error' }
    }
  }

  const results = await mapWithConcurrency(pending, mapper, concurrency)
  running = false
  return { ok: true, processed: results.length, results }
}

export function isWorkerRunning() {
  return running
}
