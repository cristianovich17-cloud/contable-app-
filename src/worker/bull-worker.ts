import 'dotenv/config'
import { Worker } from 'bullmq'
import { prisma } from '@/lib/prisma-db'
import { generarPDFBoleta } from '@/lib/pdf-boleta'
import { enviarBoleta } from '@/lib/email'

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined,
}

async function processJob(job: any) {
  const data = job.data
  
  // data: { numero, mes, año, email, sentEmailId }
  const socioNumber = parseInt(data.numero || data.socioNumber, 10);
  const mes = parseInt(data.mes, 10);
  const año = parseInt(data.año, 10);
  const email = data.email || '';

  let sentEmailEntry = null;

  try {
    // Obtener socio
    const socio = await prisma.socio.findUnique({
      where: { numero: socioNumber },
    });

    if (!socio) {
      if (data.sentEmailId) {
        await prisma.sentEmail.update({
          where: { id: data.sentEmailId },
          data: {
            processed: true,
            processedOk: false,
            lastError: 'Socio no encontrado',
            processedDate: new Date(),
          },
        });
      }
      return { ok: false, mensaje: 'Socio no encontrado' };
    }

    // Obtener descuentos del mes
    const descuentosDelMes = await prisma.descuento.findMany({
      where: {
        socioId: socio.id,
        mes,
        año,
      },
    });

    const totalDescuentos = descuentosDelMes.reduce((sum, d) => sum + d.monto, 0);

    // Generar PDF
    const descuentosFormato = descuentosDelMes.map((d) => ({
      concepto: d.concepto || 'Descuento',
      monto: d.monto,
      fecha: new Date(d.createdAt).toLocaleDateString('es-CL'),
    }));

    const pdf = await generarPDFBoleta(
      socio.nombre,
      socio.numero.toString(),
      mes,
      año,
      socio.email || email || '',
      descuentosFormato,
      totalDescuentos
    );

    // Preparar HTML para email
    const descuentosInfo = descuentosDelMes.length
      ? `<ul>${descuentosDelMes.map((d) => `<li>${d.concepto}: $${d.monto.toLocaleString('es-CL')}</li>`).join('')}</ul><p><strong>Total: $${totalDescuentos.toLocaleString('es-CL')}</strong></p>`
      : '<p>Sin descuentos</p>';

    // Enviar email
    const res = await enviarBoleta(
      socio.email || email || '',
      socio.nombre,
      socio.numero.toString(),
      mes,
      año,
      pdf,
      descuentosInfo
    );

    // Actualizar registro SentEmail
    if (data.sentEmailId) {
      await prisma.sentEmail.update({
        where: { id: data.sentEmailId },
        data: {
          processed: true,
          processedOk: res.success,
          lastError: res.success ? null : res.mensaje,
          processedDate: new Date(),
        },
      });
    } else {
      // Si no hay sentEmailId, crear uno
      await prisma.sentEmail.create({
        data: {
          socioId: socio.id,
          email: socio.email || email || '',
          mes,
          año,
          asunto: `Boleta de Descuentos - ${socio.nombre} (${getMonthName(mes)} ${año})`,
          processed: true,
          processedOk: res.success,
          lastError: res.success ? null : res.mensaje,
          processedDate: new Date(),
        },
      });
    }

    return { ok: res.success, mensaje: res.mensaje };
  } catch (err: any) {
    console.error('Error procesando job:', err.message);

    // Registrar error en SentEmail
    if (data.sentEmailId) {
      await prisma.sentEmail.update({
        where: { id: data.sentEmailId },
        data: {
          processed: true,
          processedOk: false,
          lastError: err?.message || 'Error desconocido',
          processedDate: new Date(),
        },
      });
    }
    throw err;
  }
}

function getMonthName(mes: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return months[mes - 1] || 'Mes inválido';
}

const worker = new Worker('boletas', async (job) => {
  console.log('🔄 Procesando job', job.id, job.name);
  return processJob(job);
}, { connection });

worker.on('completed', (job) => {
  console.log('✅ Job completado', job.id);
});

worker.on('failed', (job, err) => {
  console.error('❌ Job falló', job?.id, err?.message);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

console.log(
  `🚀 Worker BullMQ iniciado (cola: boletas)\n` +
  `   Redis: ${connection.host}:${connection.port}\n` +
  `   Esperando jobs...`
);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido. Cerrando worker...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recibido. Cerrando worker...');
  await worker.close();
  process.exit(0);
});

