import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-db'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/socios/[id]
 * Elimina un socio por ID
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const socioId = parseInt(params.id, 10)

    if (isNaN(socioId)) {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 })
    }

    console.log(`[Socios] Deleting socio with ID: ${socioId}`)

    const deleted = await prisma.socio.delete({
      where: { id: socioId }
    })

    console.log(`[Socios] Deleted: ${deleted.nombre} (ID: ${socioId})`)

    return NextResponse.json({ 
      ok: true, 
      message: `Socio "${deleted.nombre}" eliminado exitosamente`,
      deleted 
    })
  } catch (err: any) {
    console.error('[Socios] Delete error:', err.message)
    
    if (err.code === 'P2025') {
      return NextResponse.json(
        { ok: false, error: 'Socio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { ok: false, error: `Error al eliminar: ${err.message}` },
      { status: 500 }
    )
  }
}

/**
 * GET /api/socios/[id]
 * Obtiene un socio específico por ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const socioId = parseInt(params.id, 10)

    if (isNaN(socioId)) {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 })
    }

    const socio = await prisma.socio.findUnique({
      where: { id: socioId }
    })

    if (!socio) {
      return NextResponse.json(
        { ok: false, error: 'Socio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ok: true, socio })
  } catch (err: any) {
    console.error('[Socios] Get error:', err.message)
    return NextResponse.json(
      { ok: false, error: `Error al obtener: ${err.message}` },
      { status: 500 }
    )
  }
}
