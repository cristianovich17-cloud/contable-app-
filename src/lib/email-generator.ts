/**
 * Genera un correo electrónico automático basado en el nombre del socio
 * Si el socio ya tiene correo, lo retorna tal cual
 * Si no tiene correo, genera uno a partir del nombre
 */
export function generateEmailIfMissing(nombre: string, email?: string): string {
  // Si ya tiene correo, retornarlo tal cual
  if (email && email.trim() !== '') {
    return email.trim();
  }

  // Generar correo a partir del nombre
  // Convertir a minúsculas, reemplazar espacios y caracteres especiales
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
