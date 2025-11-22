import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const sent = await prisma.sentEmail.findMany({
    include: { socio: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ ok: true, sent })
}

