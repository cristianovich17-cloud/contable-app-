import { PrismaClient } from '@prisma/client';

// Inicialización perezosa de Prisma para evitar que el build falle
// cuando no existen variables de entorno (ej. durante el paso de build en CI).
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

let _prisma: PrismaClient | undefined = globalForPrisma.prisma;

function createPrisma(): PrismaClient {
  if (_prisma) return _prisma;

  // Si no hay DATABASE_URL definida, usa /tmp/contable.db (writable en Vercel)
  const databaseUrl = process.env.DATABASE_URL || 'file:/tmp/contable.db';

  try {
    const client = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['info', 'warn', 'error'] : ['error'],
    });
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client;
    }
    _prisma = client;
    return _prisma;
  } catch (error) {
    // Si hay error creando cliente, retorna un proxy que falla solo cuando se use
    const handler: ProxyHandler<any> = {
      get(_target, prop) {
        throw new Error(
          `Prisma no inicializado correctamente. Accedió a '${String(prop)}'. Error: ${error}`
        );
      },
    };
    // @ts-ignore
    _prisma = new Proxy({}, handler) as unknown as PrismaClient;
    return _prisma;
  }
}

export const prisma: PrismaClient = createPrisma();

export interface Data {
  socios: any[];
  cuotaConfig: any;
  descuentos: any[];
  credits?: any[];
  discounts?: any[];
  creditos: any[];
  pagos: any[];
  recibos: any[];
  receipts?: any[];
  transacciones: any[];
  transactions?: any[];
  ingresos: any[];
  egresos: any[];
  sentEmails: any[];
}

export interface DbInstance {
  data: Data;
  write: () => Promise<void>;
}

async function buildDataFromPrisma(): Promise<Data> {
  const [socios, cuotaConfigArray, descuentos, creditos, pagos, recibos, transacciones, sentEmails] =
    await Promise.all([
      prisma.socio.findMany({ orderBy: { numero: 'asc' } }),
      prisma.cuotaConfig.findMany({ orderBy: [{ año: 'desc' }, { mes: 'desc' }], take: 1 }),
      prisma.descuento.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.credito.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.pago.findMany({ orderBy: { fecha: 'asc' } }),
      prisma.recibo.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.transaccion.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.sentEmail.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);

  const cuotaConfig = cuotaConfigArray.length > 0 ? cuotaConfigArray[0] : { cuotaBienestar: 0, cuotaOrdinaria: 0 };
  const ingresos = transacciones.filter((t) => t.tipo === 'ingreso');
  const egresos = transacciones.filter((t) => t.tipo === 'egreso');

  return {
    socios,
    cuotaConfig: { bienestar: cuotaConfig.cuotaBienestar || 0, ordinaria: cuotaConfig.cuotaOrdinaria || 0 },
    descuentos,
    discounts: descuentos,
    credits: creditos,
    creditos,
    pagos,
    recibos,
    receipts: recibos,
    transacciones,
    transactions: transacciones,
    ingresos,
    egresos,
    sentEmails,
  };
}

export async function getDb(): Promise<DbInstance> {
  const data = await buildDataFromPrisma();
  return {
    data,
    write: async () => {
      // No-op en Prisma
    },
  };
}

export async function createSocio(data: { numero: number; nombre: string; rut: string; email?: string; telefono?: string }) {
  return prisma.socio.create({ data });
}

export async function getSocioByNumero(numero: number) {
  return prisma.socio.findUnique({ where: { numero } });
}

export async function updateSocio(numero: number, data: any) {
  const socio = await prisma.socio.findUnique({ where: { numero } });
  if (!socio) return null;
  return prisma.socio.update({ where: { id: socio.id }, data });
}

export async function deleteSocio(numero: number) {
  const socio = await prisma.socio.findUnique({ where: { numero } });
  if (!socio) return null;
  return prisma.socio.delete({ where: { id: socio.id } });
}

export async function createDescuento(data: { socioId: number; mes: number; año: number; monto: number; concepto?: string }) {
  return prisma.descuento.create({ data });
}

export async function createCredito(data: { socioId: number; monto: number; concepto?: string; cuotasPagadas?: number; estado?: string }) {
  return prisma.credito.create({ data });
}

export async function createPago(data: { socioId: number; creditoId?: number; monto: number }) {
  return prisma.pago.create({ data });
}

export async function createTransaccion(data: { tipo: 'ingreso' | 'egreso'; categoria: string; mes: number; año: number; monto: number; concepto?: string; referencia?: string }) {
  return prisma.transaccion.create({ data });
}

export async function createSentEmail(data: { socioId?: number; email: string; mes: number; año: number; asunto: string; processed?: boolean; processedOk?: boolean; lastError?: string; processedDate?: Date }) {
  return prisma.sentEmail.create({ data });
}

export async function updateSentEmail(id: number, data: { processed?: boolean; processedOk?: boolean; lastError?: string; processedDate?: Date }) {
  return prisma.sentEmail.update({ where: { id }, data });
}

export async function getUnprocessedSentEmails() {
  return prisma.sentEmail.findMany({ where: { processed: false }, orderBy: { createdAt: 'asc' } });
}

export async function saveCuotaConfig(mes: number, año: number, bienestar: number, ordinaria: number) {
  const existing = await prisma.cuotaConfig.findUnique({ where: { mes_año: { mes, año } } });
  if (existing) {
    return prisma.cuotaConfig.update({
      where: { id: existing.id },
      data: { cuotaBienestar: bienestar, cuotaOrdinaria: ordinaria },
    });
  }
  return prisma.cuotaConfig.create({
    data: { mes, año, cuotaBienestar: bienestar, cuotaOrdinaria: ordinaria },
  });
}

// Transacciones helpers
export async function crearTransaccionConComprobante(
  transaccionData: { tipo: 'ingreso' | 'egreso'; categoria: string; mes: number; año: number; monto: number; concepto?: string; referencia?: string },
  comprobante?: { nombre: string; ruta: string; tipoMIME: string; tamaño: number }
) {
  if (comprobante) {
    return prisma.transaccion.create({
      data: {
        ...transaccionData,
        comprobantes: {
          create: [comprobante],
        },
      },
      include: { comprobantes: true },
    });
  }
  return prisma.transaccion.create({
    data: transaccionData,
    include: { comprobantes: true },
  });
}

export async function agregarComprobanteATransaccion(transaccionId: number, comprobante: { nombre: string; ruta: string; tipoMIME: string; tamaño: number }) {
  return prisma.comprobante.create({
    data: { transaccionId, ...comprobante },
  });
}

export async function obtenerTransacciones(tipo?: 'ingreso' | 'egreso', mes?: number, año?: number) {
  return prisma.transaccion.findMany({
    where: {
      ...(tipo ? { tipo } : {}),
      ...(mes ? { mes } : {}),
      ...(año ? { año } : {}),
    },
    include: { comprobantes: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function obtenerTransaccionesPorMesYAño(mes: number, año: number) {
  const ingresos = await prisma.transaccion.findMany({
    where: { tipo: 'ingreso', mes, año },
    include: { comprobantes: true },
  });
  const egresos = await prisma.transaccion.findMany({
    where: { tipo: 'egreso', mes, año },
    include: { comprobantes: true },
  });
  return { ingresos, egresos };
}

export async function calcularTotalesPorCategoria(tipo: 'ingreso' | 'egreso', mes: number, año: number) {
  const transacciones = await prisma.transaccion.findMany({
    where: { tipo, mes, año },
  });
  const totales: Record<string, number> = {};
  transacciones.forEach((t) => {
    totales[t.categoria] = (totales[t.categoria] || 0) + t.monto;
  });
  return totales;
}
