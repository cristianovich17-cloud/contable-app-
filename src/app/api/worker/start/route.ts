import { NextRequest, NextResponse } from 'next/server'
import { runWorker, isWorkerRunning } from '@/lib/worker'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const concurrency = Number(body.concurrency || 3)
    const maxRetries = Number(body.maxRetries || 3)

    if (isWorkerRunning()) return NextResponse.json({ ok: false, message: 'Worker ya en ejecución' })

    // Start worker asynchronously (do not await) but provide immediate response that started
    runWorker({ concurrency, maxRetries }).catch(err => console.error('Worker error:', err))

    return NextResponse.json({ ok: true, message: 'Worker iniciado' })
  } catch (err) {
    console.error('Error iniciando worker:', err)
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 })
  }
}
