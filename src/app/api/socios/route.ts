import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-db';

export const dynamic = 'force-dynamic';
import { validateJWT, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { generateEmailIfMissing, cleanEmail } from '@/lib/email-generator';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';

    const where: any = {};
    if (q) {
      where.OR = [
        { nombre: { contains: q, mode: 'insensitive' } },
      ];
    }

    const socios = await prisma.socio.findMany({ where });
    return NextResponse.json({ ok: true, socios });
  } catch (e) {
    console.error('Error fetching socios', e);
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await validateJWT(req);
    if (!payload) return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
    if (!hasPermission(payload.rol, 'crear_socio')) {
      return NextResponse.json({ ok: false, error: 'Permiso denegado' }, { status: 403 });
    }

    const body = await req.json();
    let { numero, nombre, email, telefono, estado, rut } = body;

    // Generar correo si no lo proporciona
    email = generateEmailIfMissing(nombre, email);
    email = cleanEmail(email);

    // RUT debe ser requerido
    if (!rut) {
      return NextResponse.json({ ok: false, error: 'RUT es requerido' }, { status: 400 });
    }

    const socio = await prisma.socio.create({
      data: { numero, nombre, email, telefono, rut, estado: estado || 'activo' },
    });

    // Registrar auditoría
    try {
      await logAudit({
        usuarioId: payload.usuarioId,
        accion: 'crear_socio',
        tabla: 'Socio',
        registroId: socio.id,
        cambioNuevo: socio,
        request: req,
      });
    } catch (e) {
      console.warn('audit log failed', e);
    }

    return NextResponse.json({ ok: true, socio }, { status: 201 });
  } catch (e: any) {
    console.error('Error creating socio', e);
    return NextResponse.json({ ok: false, error: String(e.message || e) }, { status: 500 });
  }
}
