import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

/**
 * Rutas públicas que no requieren autenticación
 */
const publicRoutes = [
  '/login',
  '/api/auth/login',
  '/api/auth/register',
];

/**
 * Rutas que requieren ciertos roles
 */
const roleBasedRoutes: Record<string, string[]> = {
  '/admin': ['admin'],
  '/api/admin': ['admin'],
  '/api/usuarios': ['admin'],
  '/api/auditoria': ['admin'],
};

/**
 * Extraer token del header Authorization o cookie
 */
function getToken(request: NextRequest): string | null {
  // Primero intenta desde header Authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    }
  }

  // Luego intenta desde cookie
  const cookieToken = request.cookies.get('authToken')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Obtener token
  const token = getToken(request);
  
  // Validar token
  let payload = null;
  if (token) {
    payload = verifyToken(token);
  }

  if (!payload) {
    // Si es API, retornar error
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { ok: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Si es página, redirigir a login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validar roles específicos
  for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
    if (pathname.startsWith(route) && !allowedRoles.includes(payload.rol)) {
      // Si es API, retornar error
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { ok: false, error: 'Acceso denegado - rol insuficiente' },
          { status: 403 }
        );
      }

      // Si es página, redirigir a home
      return NextResponse.redirect(new URL('/socios', request.url));
    }
  }

  return NextResponse.next();
}

/**
 * Configurar qué rutas usar el middleware
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
