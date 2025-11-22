import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-db'

export const dynamic = 'force-dynamic'
import { generarPDFBoleta } from '@/lib/pdf-boleta'
import { enviarBoleta } from '@/lib/email'

// Reutiliza helpers similares al envío masivo
async function withRetries<T>(fn: () => Promise<T>, retries = 2, delayMs = 1000): Promise<T> {
  let lastError: any
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt < retries) await new Promise(r => setTimeout(r, delayMs))
    }
  }
  throw lastError
}

async function mapWithConcurrency<T, R>(items: T[], mapper: (t: T) => Promise<R>, concurrency = 5) {
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

  for (let j = 0; j < concurrency; j++) {
    executing.push(runOne())
  }

  await Promise.all(executing)
  return results
}

export async function POST(request: NextRequest) {
  try {
    const { mes, año } = await request.json()
    if (!mes || !año) return NextResponse.json({ error: 'mes y año requeridos' }, { status: 400 })

    const mesParsed = parseInt(mes, 10)
    const añoParsed = parseInt(año, 10)

    // Obtener registros fallidos SentEmail
    const fallidos = await prisma.sentEmail.findMany({
      where: {
        processedOk: false,
        mes: mesParsed,
        año: añoParsed,
      },
      include: { socio: true },
    })

    if (fallidos.length === 0) {
      return NextResponse.json({ ok: true, summary: { total: 0, reintentos: 0 } })
    }

    const mapper = async (entry: any) => {
      const socio = entry.socio
      if (!socio) {
        await prisma.sentEmail.update({
          where: { id: entry.id },
          data: {
            processed: true,
            processedOk: false,
            lastError: 'Socio no encontrado',
            processedDate: new Date(),
          },
        })
        return { email: entry.email, success: false, mensaje: 'Socio no encontrado' }
      }

      try {
        // Obtener descuentos del mes
        const descuentosDelMes = await prisma.descuento.findMany({
          where: {
            socioId: socio.id,
            mes: mesParsed,
            año: añoParsed,
          },
        })

        const totalDescuentos = descuentosDelMes.reduce((s: number, d) => s + d.monto, 0)

        const descuentosFormato = descuentosDelMes.map((d) => ({
          concepto: d.concepto || 'Descuento',
          monto: d.monto,
          fecha: new Date(d.createdAt).toLocaleDateString('es-CL'),
        }))

        const pdf = await withRetries(
          () => generarPDFBoleta(socio.nombre, socio.numero.toString(), mesParsed, añoParsed, socio.email || '', descuentosFormato, totalDescuentos),
          1,
          500
        )

        const descuentosInfo = descuentosDelMes.length
          ? `<ul>${descuentosDelMes.map((d) => `<li>${d.concepto}: $${d.monto.toLocaleString('es-CL')}</li>`).join('')}</ul><p><strong>Total: $${totalDescuentos.toLocaleString('es-CL')}</strong></p>`
          : '<p>Sin descuentos</p>'

        const res = await withRetries(
          () => enviarBoleta(socio.email || '', socio.nombre, socio.numero.toString(), mesParsed, añoParsed, pdf, descuentosInfo),
          2,
          1000
        )

        await prisma.sentEmail.update({
          where: { id: entry.id },
          data: {
            processed: true,
            processedOk: res.success,
            lastError: res.success ? null : res.mensaje,
            processedDate: new Date(),
          },
        })

        return { email: socio.email, success: res.success, mensaje: res.mensaje }
      } catch (err: any) {
        await prisma.sentEmail.update({
          where: { id: entry.id },
          data: {
            processed: true,
            processedOk: false,
            lastError: err?.message || 'Error',
            processedDate: new Date(),
          },
        })
        return { email: socio?.email || entry.email, success: false, mensaje: err?.message || 'Error' }
      }
    }

    const results = await mapWithConcurrency(fallidos, mapper, 5)
    const summary = { total: fallidos.length, reintentos: results.filter((r: any) => r.success).length }
    return NextResponse.json({ ok: true, summary, detalles: results })
  } catch (error) {
    console.error('Error reintentando fallidos:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

