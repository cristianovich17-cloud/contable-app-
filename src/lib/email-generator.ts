/**
 * Genera un correo electrónico automático basado en el nombre del socio
 * SOLO genera correo si:
 * 1. El correo está vacío/undefined
 * 2. El correo es una cadena vacía o solo espacios
 * 
 * Si el socio ya tiene un correo válido, lo retorna sin cambios.
 * 
 * Formato generado: {nombre-normalizado}@contable.app
 * - Acentos removidos
 * - Espacios y caracteres especiales reemplazados con puntos
 * - Convertido a minúsculas
 * - Puntos múltiples colapsados
 * 
 * @param nombre - Nombre del socio (requerido)
 * @param email - Correo del socio (opcional)
 * @returns Correo del socio (generado o existente)
 */
export function generateEmailIfMissing(nombre: string, email?: string): string {
  // Si ya tiene correo válido, retornarlo sin cambios
  if (email && email.trim() !== '') {
    return email.trim();
  }

  // Generar correo a partir del nombre
  // Proceso: normalizar nombre → minúsculas → remover acentos → reemplazar especiales con puntos
  const emailBase = nombre
    .toLowerCase()
    .trim()
    // Remover acentos y caracteres especiales
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos
    .replace(/[^a-z0-9]/g, '.') // Reemplazar caracteres no alfanuméricos con punto
    .replace(/\.+/g, '.') // Remover puntos múltiples
    .replace(/^\.+|\.+$/g, ''); // Remover puntos al inicio/final

  return `${emailBase}@contable.app`;
}

/**
 * Valida si un correo es válido (básica validación)
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Limpia un correo eliminando espacios y convirtiendo a minúsculas
 */
export function cleanEmail(email: string): string {
  return email.trim().toLowerCase();
}
