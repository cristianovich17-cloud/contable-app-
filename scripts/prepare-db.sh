#!/bin/bash
# Script para preparar la base de datos antes del build

echo "🗄️ Preparando base de datos..."

# Generar cliente Prisma
echo "Generando cliente Prisma..."
npx prisma generate

# Aplicar migraciones
echo "Aplicando migraciones..."
npx prisma migrate deploy 2>/dev/null || echo "ℹ️ Migraciones ya aplicadas"

# Ejecutar seed para datos iniciales (solo si es necesario)
if [ "$NODE_ENV" = "production" ]; then
  echo "Aplicando datos iniciales en producción..."
  npx ts-node-esm prisma/seed.ts 2>/dev/null || echo "ℹ️ Seed ya ejecutado"
fi

echo "✅ Base de datos lista"
