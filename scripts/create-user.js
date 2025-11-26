#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser() {
  try {
    // Datos del usuario a crear
    const email = 'admin@contable.app';
    const nombre = 'Administrador';
    const password = 'admin123';
    const rol = 'admin';

    // Generar hash de contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const usuario = await prisma.usuario.upsert({
      where: { email },
      update: {
        nombre,
        passwordHash,
        rol,
        activo: true,
      },
      create: {
        email,
        nombre,
        passwordHash,
        rol,
        activo: true,
      },
    });

    console.log('\n✅ Usuario creado/actualizado exitosamente:\n');
    console.log('📧 Email:', usuario.email);
    console.log('👤 Nombre:', usuario.nombre);
    console.log('🔐 Contraseña:', password);
    console.log('👑 Rol:', usuario.rol);
    console.log('\nPuedes acceder en: http://localhost:3000/login\n');

  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
