import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Logout de usuario (simplemente valida el token y retorna OK)
 * El cliente debe eliminar el token del localStorage
 */
export async function POST(request: NextRequest) {
  try {
    // En realidad, con JWT stateless no hay mucho que hacer en el servidor
    // El cliente simplemente debe eliminar el token del localStorage
    return NextResponse.json(
      {
        ok: true,
        message: 'Sesión cerrada exitosamente',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en POST /api/auth/logout:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
