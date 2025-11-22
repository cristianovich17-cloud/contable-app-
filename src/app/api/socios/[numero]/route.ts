import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-db';

export const dynamic = 'force-dynamic';
import { validateJWT, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { numero: string } }
) {
  try {
    const numero = parseInt(params.numero);
    const socio = await prisma.socio.findUnique({
      where: { numero },
    });

    if (!socio) {
      return NextResponse.json({ ok: false, error: 'Socio no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, socio });
  } catch (e) {
    console.error('Error fetching socio', e);
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { numero: string } }
) {
  try {
    const payload = await validateJWT(req);
    if (!payload) return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
    if (!hasPermission(payload.rol, 'editar_socio')) {
      return NextResponse.json({ ok: false, error: 'Permiso denegado' }, { status: 403 });
    }

    const numero = parseInt(params.numero);
    const body = await req.json();
    const { nombre, email, telefono, estado } = body;

    // Obtener estado anterior
    const before = await prisma.socio.findUnique({
      where: { numero },
    });

    if (!before) {
      return NextResponse.json({ ok: false, error: 'Socio no encontrado' }, { status: 404 });
    }

    // Actualizar
    const updated = await prisma.socio.update({
      where: { numero },
      data: {
        ...(nombre && { nombre }),
        ...(email && { email }),
        ...(telefono && { telefono }),
        ...(estado && { estado }),
      },
    });

    // Registrar auditoría
    try {
      await logAudit({
        usuarioId: payload.usuarioId,
        accion: 'editar_socio',
        tabla: 'Socio',
        registroId: before.id,
        cambioAnterior: before,
        cambioNuevo: updated,
        request: req,
      });
    } catch (e) {
      console.warn('audit log failed', e);
    }

    return NextResponse.json({ ok: true, socio: updated });
  } catch (e) {
    console.error('Error updating socio', e);
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { numero: string } }
) {
  try {
    const payload = await validateJWT(req);
    if (!payload) return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
    if (!hasPermission(payload.rol, 'eliminar_socio')) {
      return NextResponse.json({ ok: false, error: 'Permiso denegado' }, { status: 403 });
    }

    const numero = parseInt(params.numero);

    // Obtener estado anterior
    const before = await prisma.socio.findUnique({
      where: { numero },
    });

    if (!before) {
      return NextResponse.json({ ok: false, error: 'Socio no encontrado' }, { status: 404 });
    }

    // Eliminar
    await prisma.socio.delete({
      where: { numero },
    });

    // Registrar auditoría
    try {
      await logAudit({
        usuarioId: payload.usuarioId,
        accion: 'eliminar_socio',
        tabla: 'Socio',
        registroId: before.id,
        cambioAnterior: before,
        request: req,
      });
    } catch (e) {
      console.warn('audit log failed', e);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Error deleting socio', e);
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
  }
}
