import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { NextRequest } from 'next/server';

const DEFAULT_JWT_SECRET = 'tu-secret-key-super-seguro-2025';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

// Advertencia en tiempo de ejecución si se usa el secret por defecto
try {
  if (JWT_SECRET === DEFAULT_JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[auth] WARNING: Using default JWT_SECRET in production. Configure a strong JWT_SECRET in environment variables.');
    } else {
      console.info('[auth] Notice: JWT_SECRET not set - using default for development. Set JWT_SECRET for staging/production.');
    }
  }
} catch (e) {
  // No bloquear si console no está disponible
}

export interface TokenPayload {
  usuarioId: number;
  email: string;
  rol: string;
}

/**
 * Hash una contraseña con bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

/**
 * Compara contraseña plana con hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

/**
 * Genera un JWT token
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Valida y decodifica un JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extrae el token del header Authorization
 */
export function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}

/**
 * Middleware para validar JWT
 */
export async function validateJWT(request: NextRequest): Promise<TokenPayload | null> {
  const token = extractTokenFromHeader(request);
  if (!token) return null;

  return verifyToken(token);
}

/**
 * Validar que usuario tiene ciertos roles
 */
export function validateRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Roles disponibles
 */
export const ROLES = {
  ADMIN: 'admin',
  CONTADOR: 'contador',
  VISOR: 'visor',
} as const;

/**
 * Permisos por rol
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.ADMIN]: [
    'crear_usuario',
    'editar_usuario',
    'eliminar_usuario',
    'crear_transaccion',
    'editar_transaccion',
    'eliminar_transaccion',
    'ver_reportes',
    'ver_auditoria',
    'crear_socio',
    'editar_socio',
    'eliminar_socio',
  ],
  [ROLES.CONTADOR]: [
    'crear_transaccion',
    'editar_transaccion',
    'ver_reportes',
    'crear_socio',
    'editar_socio',
  ],
  [ROLES.VISOR]: [
    'ver_reportes',
  ],
};

/**
 * Validar que usuario tiene permisos para una acción
 */
export function hasPermission(userRole: string, action: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(action);
}
