<#
Helper PowerShell script for Windows to install dependencies and run the dev server.
Run: powershell -ExecutionPolicy Bypass -File .\run-windows.ps1
#>
Set-StrictMode -Version Latest

Write-Host "Comprobando node y npm..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "node no está instalado. Instálalo desde https://nodejs.org/"
    exit 1
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm no está instalado. Instálalo desde https://nodejs.org/"
    exit 1
}

if (-not (Test-Path node_modules)) {
    Write-Host "Instalando dependencias..."
    npm install
}

Write-Host "Iniciando servidor de desarrollo..."
npm run dev
