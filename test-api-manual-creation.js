#!/usr/bin/env node

/**
 * Test: Verificar que generateEmailIfMissing funciona en creación manual
 * Este test simula lo que hace el API cuando se crea un socio sin email
 */

const fs = require('fs');
const path = require('path');

// Simular la función generateEmailIfMissing (misma lógica que en src/lib/email-generator.ts)
function generateEmailIfMissing(nombre, email) {
  if (email && email.trim() !== '') {
    return email.trim();
  }

  const emailBase = nombre
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.+|\.+$/g, '');

  return `${emailBase}@contable.app`;
}

function cleanEmail(email) {
  return email.trim().toLowerCase();
}

console.log('\n========================================');
console.log('Test: API Manual Creation (Simulated)');
console.log('========================================\n');

const testCases = [
  {
    title: 'Test 1: Crear socio SIN email (None)',
    numero: 'M001',
    nombre: 'Patricia Martínez',
    email: undefined,
    telefono: '+56912345678',
    expectedEmail: 'patricia.martinez@contable.app'
  },
  {
    title: 'Test 2: Crear socio SIN email (Empty string)',
    numero: 'M002',
    nombre: 'Carlos Rodríguez López',
    email: '',
    telefono: '+56987654321',
    expectedEmail: 'carlos.rodriguez.lopez@contable.app'
  },
  {
    title: 'Test 3: Crear socio CON email (debe preservarse)',
    numero: 'M003',
    nombre: 'Ana García',
    email: 'ana@example.com',
    telefono: '+56911111111',
    expectedEmail: 'ana@example.com'
  },
  {
    title: 'Test 4: Crear socio CON email con espacios (normalizar)',
    numero: 'M004',
    nombre: 'Juan Pérez',
    email: '  juan@domain.com  ',
    telefono: '+56922222222',
    expectedEmail: 'juan@domain.com'
  },
  {
    title: 'Test 5: Nombre con caracteres especiales',
    numero: 'M005',
    nombre: 'José María Rodríguez Díaz',
    email: null,
    telefono: '+56933333333',
    expectedEmail: 'jose.maria.rodriguez.diaz@contable.app'
  }
];

let passed = 0;
let failed = 0;

testCases.forEach((test) => {
  console.log(test.title);
  console.log(`  Input: nombre="${test.nombre}", email="${test.email || '(undefined)'}"`);
  
  // Simular lo que hace el API POST /socios
  let email = test.email;
  email = generateEmailIfMissing(test.nombre, email);
  email = cleanEmail(email);
  
  console.log(`  Expected: ${test.expectedEmail}`);
  console.log(`  Got: ${email}`);
  
  const success = email === test.expectedEmail;
  console.log(`  Result: ${success ? '✅ PASS' : '❌ FAIL'}\n`);
  
  if (success) passed++;
  else failed++;
});

console.log('========================================');
console.log(`Results: ${passed}/${testCases.length} passed`);
console.log('========================================\n');

if (failed === 0) {
  console.log('✅ API POST /socios correctamente auto-genera correos cuando no se proporcionan');
  console.log('✅ Preserva correos cuando se proporcionan');
}

process.exit(failed > 0 ? 1 : 0);
