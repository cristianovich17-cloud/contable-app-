import { Queue } from 'bullmq'

const connection = {
  // Use REDIS_URL env or default localhost
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined,
}

export const boletasQueue = new Queue('boletas', { connection })

export async function enqueueBoleta(jobData: any) {
  // jobData should include: numero, mes, año, email (optional), attempt info
  return boletasQueue.add('enviar-boleta', jobData, {
    attempts: 5,
    backoff: { type: 'exponential', delay: 500 },
    removeOnComplete: true,
  })
}

