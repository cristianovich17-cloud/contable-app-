import { NextRequest, NextResponse } from 'next/server';
import { validateJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma-db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/me
 * Obtiene los datos del usuario actual (requiere JWT)
 */
export async function GET(request: NextRequest) {
  try {
    // Validar JWT
    const payload = await validateJWT(request);
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.usuarioId },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { ok: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        data: usuario,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en GET /api/auth/me:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}
