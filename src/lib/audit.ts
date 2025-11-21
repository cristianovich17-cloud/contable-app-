import { prisma } from '@/lib/prisma-db';
import { NextRequest } from 'next/server';

export interface AuditLogInput {
  usuarioId: number;
  accion: string;
  tabla: string;
  registroId?: number;
  cambioAnterior?: any;
  cambioNuevo?: any;
  request?: NextRequest;
}

/**
 * Registra una entrada de auditoría en la BD.
 * Si falla, lo hace silenciosamente (no rompe la operación principal).
 */
export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    const { usuarioId, accion, tabla, registroId, cambioAnterior, cambioNuevo, request } = input;

    let ip: string | null = null;
    let userAgent: string | null = null;

    if (request) {
      ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
      userAgent = request.headers.get('user-agent') || null;
    }

    await prisma.auditLog.create({
      data: {
        usuarioId,
        accion,
        tabla,
        registroId: registroId || null,
        cambioAnterior: cambioAnterior ? JSON.stringify(cambioAnterior) : null,
        cambioNuevo: cambioNuevo ? JSON.stringify(cambioNuevo) : null,
        ip,
        userAgent,
      },
    });
  } catch (e) {
    console.warn('[audit] Error logging audit entry', e);
    // No relanzar el error - no queremos que rompa la operación principal
  }
}
