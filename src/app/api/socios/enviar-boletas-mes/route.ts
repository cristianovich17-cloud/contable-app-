import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-db'

export const dynamic = 'force-dynamic'
import { generarPDFBoleta } from '@/lib/pdf-boleta'
import { enviarBoleta } from '@/lib/email'
import { enqueueBoleta } from '@/lib/queue'

// Helper: ejecutar promesa con reintentos
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

// Helper: procesar en lotes con concurrencia limitada
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
    const { mes, año, onlyWithEmail } = await request.json()

    if (!mes || !año) {
      return NextResponse.json({ error: 'Parámetros mes y año requeridos' }, { status: 400 })
    }

    const mesParsed = parseInt(mes, 10)
    const añoParsed = parseInt(año, 10)

    // Obtener todos los socios
    const socios = await prisma.socio.findMany({
      where: { estado: 'activo' },
      orderBy: { numero: 'asc' },
    })

    // Mapper que procesa un socio y retorna el resultado
    const mapper = async (socio: any) => {
      const email = socio.email
      if (onlyWithEmail && !email) {
        return { numero: socio.numero, email: socio.email, success: false, mensaje: 'Sin email' }
      }

      // Obtener descuentos del mes
      const descuentosDelMes = await prisma.descuento.findMany({
        where: {
          socioId: socio.id,
          mes: mesParsed,
          año: añoParsed,
        },
      })

      const totalDescuentos = descuentosDelMes.reduce((sum: number, d) => sum + d.monto, 0)

      // Si no hay email, registrar y retornar
      if (!email) {
        await prisma.sentEmail.create({
          data: {
            socioId: socio.id,
            email: socio.email || 'N/A',
            mes: mesParsed,
            año: añoParsed,
            asunto: `Boleta - ${socio.nombre}`,
            processed: true,
            processedOk: false,
            lastError: 'Sin email',
          },
        })
        return { numero: socio.numero, email: socio.email, success: false, mensaje: 'Sin email' }
      }

      try {
        // Generar PDF con reintentos
        const descuentosFormato = descuentosDelMes.map((d) => ({
          concepto: d.concepto || 'Descuento',
          monto: d.monto,
          fecha: new Date(d.createdAt).toLocaleDateString('es-CL'),
        }))

        const pdf = await withRetries(
          () => generarPDFBoleta(socio.nombre, socio.numero.toString(), mesParsed, añoParsed, email, descuentosFormato, totalDescuentos),
          1,
          500
        )

        const descuentosInfo = descuentosDelMes.length
          ? `<ul>${descuentosDelMes.map((d) => `<li>${d.concepto}: $${d.monto.toLocaleString('es-CL')}</li>`).join('')}</ul><p><strong>Total: $${totalDescuentos.toLocaleString('es-CL')}</strong></p>`
          : '<p>Sin descuentos registrados para este período.</p>'

        // Enviar con reintentos
        const res = await withRetries(() => enviarBoleta(email, socio.nombre, socio.numero.toString(), mesParsed, añoParsed, pdf, descuentosInfo), 2, 1000)

        // Log en DB
        await prisma.sentEmail.create({
          data: {
            socioId: socio.id,
            email,
            mes: mesParsed,
            año: añoParsed,
            asunto: `Boleta de Descuentos - ${socio.nombre}`,
            processed: true,
            processedOk: res.success,
            lastError: res.success ? null : res.mensaje,
            processedDate: new Date(),
          },
        })

        return { numero: socio.numero, email, success: res.success, mensaje: res.mensaje }
      } catch (err: any) {
        // Log error en DB
        await prisma.sentEmail.create({
          data: {
            socioId: socio.id,
            email: socio.email || 'N/A',
            mes: mesParsed,
            año: añoParsed,
            asunto: `Boleta - ${socio.nombre}`,
            processed: true,
            processedOk: false,
            lastError: err?.message || 'Error',
            processedDate: new Date(),
          },
        })
        return { numero: socio.numero, email: socio.email, success: false, mensaje: err?.message || 'Error' }
      }
    }

    // Si Redis está configurado, encolar jobs
    const useRedis = process.env.REDIS_HOST || process.env.REDIS_URL
    if (useRedis) {
      const queued: any[] = []
      for (const socio of socios) {
        // Si onlyWithEmail y sin email, skip
        if (onlyWithEmail && !socio.email) continue

        // Crear registro SentEmail marcado como encolado
        const sentEmail = await prisma.sentEmail.create({
          data: {
            socioId: socio.id,
            email: socio.email || 'N/A',
            mes: mesParsed,
            año: añoParsed,
            asunto: `Boleta - ${socio.nombre}`,
            processed: false,
          },
        })

        // Encolar job
        const job = {
          numero: socio.numero,
          mes: mesParsed,
          año: añoParsed,
          email: socio.email,
          sentEmailId: sentEmail.id,
        }
        const q = await enqueueBoleta(job)
        queued.push({ numero: socio.numero, jobId: q.id, sentEmailId: sentEmail.id })
      }

      const summary = { total: socios.length, queued: queued.length, detalles: queued }
      return NextResponse.json({ ok: true, summary })
    }

    // Procesamiento inline si no hay Redis
    const results = await mapWithConcurrency(socios, mapper, 6)

    const summary = {
      total: socios.length,
      enviados: results.filter(r => r.success).length,
      fallidos: results.filter(r => !r.success).length,
      detalles: results,
    }

    return NextResponse.json({ ok: true, summary })
  } catch (error) {
    console.error('Error en envío masivo de boletas:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

