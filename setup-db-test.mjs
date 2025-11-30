import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Contando usuarios...')
    const count = await prisma.usuario.count()
    console.log(`✅ Usuarios encontrados: ${count}`)
  } catch (e) {
    console.error('❌ Error:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
