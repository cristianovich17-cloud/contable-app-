#!/usr/bin/env node

// Test de la función generateEmailIfMissing

const fs = require('fs');
const path = require('path');

// Simular la función
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

console.log('\n========================================');
console.log('Testing Email Generation Function');
console.log('========================================\n');

const tests = [
  { nombre: 'Juan García', email: '', expected: 'juan.garcia@contable.app' },
  { nombre: 'María López Rodríguez', email: '', expected: 'maria.lopez.rodriguez@contable.app' },
  { nombre: 'José María García Pérez', email: '', expected: 'jose.maria.garcia.perez@contable.app' },
  { nombre: 'Empresa XYZ S.A.', email: '', expected: 'empresa.xyz.s.a@contable.app' },
  { nombre: 'Carlos', email: 'carlos@example.com', expected: 'carlos@example.com' },
  { nombre: 'Ana María', email: '  ana.maria@domain.com  ', expected: 'ana.maria@domain.com' },
  { nombre: 'José', email: '', expected: 'jose@contable.app' },
  { nombre: 'Ángel Carrillo', email: '', expected: 'angel.carrillo@contable.app' },
];

let passed = 0;
let failed = 0;

tests.forEach((test, idx) => {
  const result = generateEmailIfMissing(test.nombre, test.email);
  const success = result === test.expected;

  console.log(`Test ${idx + 1}: ${test.nombre}`);
  console.log(`  Input Email: "${test.email || '(empty)'}"`);
  console.log(`  Expected: ${test.expected}`);
  console.log(`  Got: ${result}`);
  console.log(`  Result: ${success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');

  if (success) passed++;
  else failed++;
});

console.log('========================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('========================================\n');

process.exit(failed > 0 ? 1 : 0);
