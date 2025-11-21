import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-db'

function toCSV(rows: any[]) {
  if (!rows || rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [headers.join(',')]
  for (const r of rows) {
    const vals = headers.map(h => {
      const v = r[h]
      if (v === undefined || v === null) return ''
      const s = String(v).replace(/"/g, '""')
      return `"${s}"`
    })
    lines.push(vals.join(','))
  }
  return lines.join('\n')
}

export async function GET(request: NextRequest) {
  const rows = await prisma.sentEmail.findMany({
    include: { socio: true },
    orderBy: { createdAt: 'desc' },
  })
  
  // Transformar para CSV (aplanar socio)
  const flattened = rows.map(r => ({
    id: r.id,
    socioNumero: r.socio?.numero || 'N/A',
    socioNombre: r.socio?.nombre || 'N/A',
    email: r.email,
    mes: r.mes,
    año: r.año,
    asunto: r.asunto,
    processed: r.processed,
    processedOk: r.processedOk,
    lastError: r.lastError || 'N/A',
    createdAt: r.createdAt,
    processedDate: r.processedDate || 'N/A',
  }))
  
  const csv = toCSV(flattened)
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="sent_emails.csv"',
    },
  })
}

