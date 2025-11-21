#!/usr/bin/env sh
# Helper script for macOS / Unix to install deps (if needed) and run dev server
set -e
echo "Comprobando node y npm..."
command -v node >/dev/null 2>&1 || { echo "node no está instalado. Instálalo primero."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm no está instalado. Instálalo primero."; exit 1; }

if [ ! -d "node_modules" ]; then
  echo "Instalando dependencias..."
  npm install
fi

echo "Iniciando servidor de desarrollo..."
npm run dev
