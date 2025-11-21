import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-db'
import Redis from 'ioredis'

export async function GET() {
  const res: any = { ok: true }

  // Check DB
  try {
    // Simple query to validate DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.db = 'ok'
  } catch (e: any) {
    res.db = 'error'
    res.dbError = String(e.message || e)
    res.ok = false
  }

  // Check Redis if configured
  const redisHost = process.env.REDIS_HOST
  if (redisHost) {
    try {
      const redisPort = Number(process.env.REDIS_PORT || 6379)
      const redisPassword = process.env.REDIS_PASSWORD || undefined
      const client = new Redis({ host: redisHost, port: redisPort, password: redisPassword, connectTimeout: 2000 })
      const pong = await client.ping()
      await client.quit()
      res.redis = pong === 'PONG' ? 'ok' : String(pong)
    } catch (e: any) {
      res.redis = 'error'
      res.redisError = String(e.message || e)
      res.ok = false
    }
  } else {
    res.redis = 'not-configured'
  }

  return NextResponse.json(res)
}
