/**
 * src/lib/db.ts - Capa de BD usando Prisma
 * 
 * NOTA: Migrado de lowdb (JSON file) a Prisma + SQLite
 * para mayor robustez, escalabilidad y evitar race conditions.
 * 
 * Interfaz mantenida compatible con código existente mediante
 * mapeo de nombres antiguos (credits, discounts, transactions)
 * a nuevos modelos Prisma (credito, descuento, transaccion).
 */

import { prisma } from './prisma-db'

export interface Data {
  socios: any[]
  cuotaConfig: any
  descuentos: any[]
  credits?: any[]
  discounts?: any[]
  creditos: any[]
  pagos: any[]
  recibos: any[]
  receipts?: any[]
  transacciones: any[]
  transactions?: any[]
  ingresos: any[]
  egresos: any[]
  sentEmails: any[]
}

export interface DbInstance {
  data: Data
  write: () => Promise<void>
}

/**
 * Construye el objeto `data` desde la BD Prisma con mapeo de compatibilidad
 */
async function buildDataFromPrisma(): Promise<Data> {
  const [socios, cuotaConfig, descuentos, creditos, pagos, recibos, transacciones, sentEmails] =
    await Promise.all([
      prisma.socio.findMany({ orderBy: { numero: 'asc' } }),
      prisma.cuotaConfig.findMany({ orderBy: [{ año: 'asc' }, { mes: 'asc' }] }),
      prisma.descuento.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.credito.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.pago.findMany({ orderBy: { fecha: 'asc' } }),
      prisma.recibo.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.transaccion.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.sentEmail.findMany({ orderBy: { createdAt: 'desc' } }),
    ])

  // Separar transacciones en ingresos y egresos
  const ingresos = transacciones.filter((t) => t.tipo === 'ingreso')
  const egresos = transacciones.filter((t) => t.tipo === 'egreso')

  return {
    socios,
    cuotaConfig,
    descuentos,
    credits: descuentos, // Alias para compatibilidad
    discounts: descuentos, // Alias para compatibilidad
    creditos,
    pagos,
    recibos,
    receipts: recibos, // Alias para compatibilidad
    transacciones,
    transactions: transacciones, // Alias para compatibilidad
    ingresos,
    egresos,
    sentEmails,
  }
}

/**
 * getDb: Obtiene instancia de BD con datos y función write
 */
export async function getDb(): Promise<DbInstance> {
  const data = await buildDataFromPrisma()

  return {
    data,
    write: async () => {
      // En Prisma, las escrituras ocurren automáticamente en cada operación.
      // Esta función es un no-op pero se mantiene por compatibilidad.
    },
  }
}

// Re-exportar funciones específicas para compatibilidad
export {
  prisma,
  createSocio,
  getSocioByNumero,
  updateSocio,
  deleteSocio,
  createDescuento,
  createCredito,
  createPago,
  createTransaccion,
  createSentEmail,
  updateSentEmail,
  getUnprocessedSentEmails,
} from './prisma-db'

