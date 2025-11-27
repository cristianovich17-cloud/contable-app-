#!/usr/bin/env node

/**
 * Test: Crear socio manual por API sin especificar correo
 * Verifica que se auto-genere el correo
 */

const jwt = require('jsonwebtoken');

// Secret key from auth.ts
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-super-seguro-2025';

// Generar token válido
const token = jwt.sign(
  { usuarioId: 1, email: 'admin@contable.app', rol: 'admin' },
  JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('\n========================================');
console.log('API Test: Create Socio Without Email');
console.log('========================================\n');

console.log('Generated JWT Token:');
console.log(token);
console.log('\n');

// Test data
const testData = {
  numero: 'API-TEST-001',
  nombre: 'Patricia Martínez García',
  telefono: '+56912345678'
  // Note: NO email field provided
};

console.log('Request Payload:');
console.log(JSON.stringify(testData, null, 2));
console.log('\n');

console.log('Expected Behavior:');
console.log('✅ Correo será auto-generado a partir del nombre');
console.log('✅ Resultado esperado: patricia.martinez.garcia@contable.app');
console.log('\n');

console.log('Command to execute:');
console.log(`
curl -X POST http://localhost:3000/api/socios \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '${JSON.stringify(testData)}'
`);

console.log('\n========================================');
console.log('To run this test:');
console.log('1. Make sure server is running: npm run dev');
console.log('2. Copy the curl command above and run in terminal');
console.log('3. Verify response has email: patricia.martinez.garcia@contable.app');
console.log('========================================\n');
