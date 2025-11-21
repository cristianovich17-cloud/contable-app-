import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-db';
import { hashPassword, generateToken } from '@/lib/auth';

/**
 * POST /api/auth/register
 * Registra un nuevo usuario (solo admin puede hacer esto)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, nombre, password, rol } = body;

    // Validar datos requeridos
    if (!email || !nombre || !password) {
      return NextResponse.json(
        { ok: false, error: 'Email, nombre y contraseña requeridos' },
        { status: 400 }
      );
    }

    // Validar rol
    const validRoles = ['admin', 'contador', 'visor'];
    if (!validRoles.includes(rol)) {
      return NextResponse.json(
        { ok: false, error: 'Rol inválido. Debe ser: admin, contador o visor' },
        { status: 400 }
      );
    }

    // Verificar que email no existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { ok: false, error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Hash la contraseña
    const passwordHash = await hashPassword(password);

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        email,
        nombre,
        passwordHash,
        rol,
        activo: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        data: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/auth/register:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
