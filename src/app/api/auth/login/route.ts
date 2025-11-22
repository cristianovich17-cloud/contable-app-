import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-db';

export const dynamic = 'force-dynamic';
import { comparePassword, generateToken } from '@/lib/auth';

/**
 * POST /api/auth/login
 * Login de usuario - retorna JWT token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validar datos requeridos
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Email y contraseña requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return NextResponse.json(
        { ok: false, error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Verificar que está activo
    if (!usuario.activo) {
      return NextResponse.json(
        { ok: false, error: 'Usuario desactivado' },
        { status: 401 }
      );
    }

    // Comparar contraseña
    const isPasswordValid = await comparePassword(password, usuario.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { ok: false, error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Generar token
    const token = generateToken({
      usuarioId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    // Actualizar lastLogin
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { lastLogin: new Date() },
    });

    return NextResponse.json(
      {
        ok: true,
        data: {
          token,
          usuario: {
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en POST /api/auth/login:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
