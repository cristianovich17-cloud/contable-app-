import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-db';

export const dynamic = 'force-dynamic';
import { validateJWT, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await validateJWT(req);
    if (!payload) return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
    if (!hasPermission(payload.rol, 'editar_transaccion')) {
      return NextResponse.json({ ok: false, error: 'Permiso denegado' }, { status: 403 });
    }

    const id = parseInt(params.id);
    const body = await req.json();
    const { categoria, mes, año, monto, concepto, referencia } = body;

    // Obtener estado anterior
    const before = await prisma.transaccion.findUnique({
      where: { id },
    });

    if (!before) {
      return NextResponse.json({ ok: false, error: 'Transacción no encontrada' }, { status: 404 });
    }

    // Actualizar
    const updated = await prisma.transaccion.update({
      where: { id },
      data: {
        ...(categoria && { categoria }),
        ...(mes && { mes }),
        ...(año && { año }),
        ...(monto && { monto }),
        ...(concepto && { concepto }),
        ...(referencia && { referencia }),
      },
    });

    // Registrar auditoría
    try {
      await logAudit({
        usuarioId: payload.usuarioId,
        accion: 'editar_transaccion',
        tabla: 'Transaccion',
        registroId: id,
        cambioAnterior: before,
        cambioNuevo: updated,
        request: req,
      });
    } catch (e) {
      console.warn('audit log failed', e);
    }

    return NextResponse.json({ ok: true, transaccion: updated });
  } catch (e) {
    console.error('Error updating transaccion', e);
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await validateJWT(req);
    if (!payload) return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
    if (!hasPermission(payload.rol, 'eliminar_transaccion')) {
      return NextResponse.json({ ok: false, error: 'Permiso denegado' }, { status: 403 });
    }

    const id = parseInt(params.id);

    // Obtener estado anterior
    const before = await prisma.transaccion.findUnique({
      where: { id },
    });

    if (!before) {
      return NextResponse.json({ ok: false, error: 'Transacción no encontrada' }, { status: 404 });
    }

    // Eliminar
    await prisma.transaccion.delete({
      where: { id },
    });

    // Registrar auditoría
    try {
      await logAudit({
        usuarioId: payload.usuarioId,
        accion: 'eliminar_transaccion',
        tabla: 'Transaccion',
        registroId: id,
        cambioAnterior: before,
        request: req,
      });
    } catch (e) {
      console.warn('audit log failed', e);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Error deleting transaccion', e);
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
  }
}
