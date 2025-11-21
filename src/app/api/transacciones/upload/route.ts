import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-db';
import { validateJWT, hasPermission } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'public', 'comprobantes');
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/transacciones/upload
 * Sube un comprobante/archivo a una transacción
 */
export async function POST(request: NextRequest) {
  try {
    // Validar JWT
    const payload = await validateJWT(request);
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Validar permisos
    if (!hasPermission(payload.rol, 'crear_transaccion')) {
      return NextResponse.json(
        { ok: false, error: 'Permiso denegado' },
        { status: 403 }
      );
    }

    // Parsear form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const transaccionId = formData.get('transaccionId') as string;

    if (!file || !transaccionId) {
      return NextResponse.json(
        { ok: false, error: 'Archivo y transaccionId requeridos' },
        { status: 400 }
      );
    }

    // Validar tipo MIME
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: 'Tipo de archivo no permitido. Solo PDF, PNG, JPG.' },
        { status: 400 }
      );
    }

    // Validar tamaño
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { ok: false, error: 'Archivo muy grande. Máximo 5MB.' },
        { status: 400 }
      );
    }

    // Verificar que la transacción existe
    const transaccion = await prisma.transaccion.findUnique({
      where: { id: parseInt(transaccionId) },
    });

    if (!transaccion) {
      return NextResponse.json(
        { ok: false, error: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    // Crear ruta del archivo
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const uploadSubDir = join(UPLOAD_DIR, year.toString(), month);

    // Crear directorios si no existen
    await mkdir(uploadSubDir, { recursive: true });

    // Generar nombre único
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `comp_${transaccion.id}_${timestamp}.${fileExt}`;
    const filePath = join(uploadSubDir, fileName);
    const urlPath = `/comprobantes/${year}/${month}/${fileName}`;

    // Guardar archivo
    const buffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(buffer));

    // Guardar en BD
    const comprobante = await prisma.comprobante.create({
      data: {
        transaccionId: parseInt(transaccionId),
        nombre: file.name,
        ruta: urlPath,
        tipoMIME: file.type,
        tamaño: file.size,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        data: {
          id: comprobante.id,
          nombre: comprobante.nombre,
          ruta: comprobante.ruta,
          tamaño: comprobante.tamaño,
          tipoMIME: comprobante.tipoMIME,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/transacciones/upload:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al subir archivo' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/transacciones/upload?transaccionId=1
 * Lista comprobantes de una transacción
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

    const transaccionId = request.nextUrl.searchParams.get('transaccionId');
    if (!transaccionId) {
      return NextResponse.json(
        { ok: false, error: 'transaccionId requerido' },
        { status: 400 }
      );
    }

    // Obtener comprobantes
    const comprobantes = await prisma.comprobante.findMany({
      where: { transaccionId: parseInt(transaccionId) },
      select: {
        id: true,
        nombre: true,
        ruta: true,
        tipoMIME: true,
        tamaño: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        data: comprobantes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en GET /api/transacciones/upload:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al obtener comprobantes' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/transacciones/upload?comprobanteId=1
 * Elimina un comprobante
 */
export async function DELETE(request: NextRequest) {
  try {
    // Validar JWT
    const payload = await validateJWT(request);
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Validar permisos
    if (!hasPermission(payload.rol, 'editar_transaccion')) {
      return NextResponse.json(
        { ok: false, error: 'Permiso denegado' },
        { status: 403 }
      );
    }

    const comprobanteId = request.nextUrl.searchParams.get('comprobanteId');
    if (!comprobanteId) {
      return NextResponse.json(
        { ok: false, error: 'comprobanteId requerido' },
        { status: 400 }
      );
    }

    // Obtener comprobante
    const comprobante = await prisma.comprobante.findUnique({
      where: { id: parseInt(comprobanteId) },
    });

    if (!comprobante) {
      return NextResponse.json(
        { ok: false, error: 'Comprobante no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar archivo del servidor
    try {
      const filePath = join(process.cwd(), 'public', comprobante.ruta);
      await writeFile(filePath, ''); // Simplemente sobrescribir
    } catch (e) {
      console.warn('No se pudo eliminar archivo:', e);
    }

    // Eliminar de BD
    await prisma.comprobante.delete({
      where: { id: parseInt(comprobanteId) },
    });

    return NextResponse.json(
      {
        ok: true,
        message: 'Comprobante eliminado',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en DELETE /api/transacciones/upload:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al eliminar comprobante' },
      { status: 500 }
    );
  }
}
