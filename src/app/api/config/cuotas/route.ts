import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const mes = new Date().getMonth() + 1
    const año = new Date().getFullYear()

    const cuotaConfig = await prisma.cuotaConfig.findFirst({
      where: { mes, año }
    })

    return NextResponse.json({ 
      ok: true, 
      cuotaConfig: cuotaConfig || { bienestar: 0, ordinaria: 0, mes, año }
    })
  } catch (err: any) {
    console.error('[Cuotas] GET error:', err.message)
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const bienestar = Number(payload.bienestar ?? 0)
    const ordinaria = Number(payload.ordinaria ?? 0)
    const mes = Number(payload.mes ?? new Date().getMonth() + 1)
    const año = Number(payload.año ?? new Date().getFullYear())

    // Buscar si ya existe para este mes/año
    const existing = await prisma.cuotaConfig.findFirst({
      where: { mes, año }
    })

    let cuotaConfig
    if (existing) {
      // Actualizar existente
      cuotaConfig = await prisma.cuotaConfig.update({
        where: { id: existing.id },
        data: { cuotaBienestar: bienestar, cuotaOrdinaria: ordinaria }
      })
    } else {
      // Crear nuevo
      cuotaConfig = await prisma.cuotaConfig.create({
        data: {
          mes,
          año,
          cuotaBienestar: bienestar,
          cuotaOrdinaria: ordinaria
        }
      })
    }

    console.log('[Cuotas] Saved:', { mes, año, bienestar, ordinaria })

    return NextResponse.json({ 
      ok: true, 
      cuotaConfig: {
        bienestar: cuotaConfig.cuotaBienestar,
        ordinaria: cuotaConfig.cuotaOrdinaria,
        mes: cuotaConfig.mes,
        año: cuotaConfig.año
      }
    })
  } catch (err: any) {
    console.error('[Cuotas] POST error:', err.message)
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}
