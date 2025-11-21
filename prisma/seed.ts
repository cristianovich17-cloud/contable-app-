import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

async function seed() {
  console.log('🌱 Iniciando seeding de datos...');

  try {
    // Verificar si ya existe usuario admin
    const existingAdmin = await prisma.usuario.findUnique({
      where: { email: 'admin@example.com' },
    });

    if (existingAdmin) {
      console.log('✅ Usuario admin@example.com ya existe');
    } else {
      // Crear usuario admin
      const adminPassword = await hashPassword('admin123');
      const admin = await prisma.usuario.create({
        data: {
          email: 'admin@example.com',
          nombre: 'Administrador',
          passwordHash: adminPassword,
          rol: 'admin',
          activo: true,
        },
      });
      console.log('✅ Usuario admin creado:', admin.email);
    }

    // Crear usuario contador de demo
    const existingContador = await prisma.usuario.findUnique({
      where: { email: 'contador@example.com' },
    });

    if (existingContador) {
      console.log('✅ Usuario contador@example.com ya existe');
    } else {
      const contadorPassword = await hashPassword('contador123');
      const contador = await prisma.usuario.create({
        data: {
          email: 'contador@example.com',
          nombre: 'Contador General',
          passwordHash: contadorPassword,
          rol: 'contador',
          activo: true,
        },
      });
      console.log('✅ Usuario contador creado:', contador.email);
    }

    // Crear usuario visor de demo
    const existingVisor = await prisma.usuario.findUnique({
      where: { email: 'visor@example.com' },
    });

    if (existingVisor) {
      console.log('✅ Usuario visor@example.com ya existe');
    } else {
      const visorPassword = await hashPassword('visor123');
      const visor = await prisma.usuario.create({
        data: {
          email: 'visor@example.com',
          nombre: 'Visualizador',
          passwordHash: visorPassword,
          rol: 'visor',
          activo: true,
        },
      });
      console.log('✅ Usuario visor creado:', visor.email);
    }

    console.log('🎉 Seeding completado');
  } catch (error) {
    console.error('❌ Error en seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
