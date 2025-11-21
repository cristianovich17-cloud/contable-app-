import { NextRequest, NextResponse } from 'next/server'
import { isWorkerRunning } from '@/lib/worker'

export async function GET(request: NextRequest) {
  return NextResponse.json({ ok: true, running: isWorkerRunning() })
}
