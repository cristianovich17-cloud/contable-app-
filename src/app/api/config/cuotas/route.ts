import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const db = await getDb()
    return NextResponse.json({ ok: true, cuotaConfig: db.data!.cuotaConfig })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const bienestar = Number(payload.bienestar ?? 0)
    const ordinaria = Number(payload.ordinaria ?? 0)
    const db = await getDb()
    db.data!.cuotaConfig = { bienestar, ordinaria }
    await db.write()
    return NextResponse.json({ ok: true, cuotaConfig: db.data!.cuotaConfig })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}
