/**
 * Genera un correo electrónico automático basado en el nombre del socio
 * SOLO genera correo si:
 * 1. El correo está vacío/undefined
 * 2. El correo es una cadena vacía o solo espacios
 * 
 * Si el socio ya tiene un correo válido, lo retorna sin cambios.
 * 
 * Formato generado: {iniciales-o-primer-palabra}@contable.app
 * - Acentos removidos
 * - Usa iniciales de palabras principales (nombre + primer apellido)
 * - Convertido a minúsculas
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
  // Procesa: nombre normalizado → remover acentos → tomar iniciales o palabras cortas
  const normalized = nombre
    .toLowerCase()
    .trim()
    // Remover acentos y caracteres especiales
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remover diacríticos

  // Dividir en palabras
  const words = normalized
    .replace(/[^a-z\s]/g, '') // Remover caracteres no alfanuméricos
    .split(/\s+/)
    .filter(w => w.length > 0);

  let emailBase = '';
  
  if (words.length === 0) {
    emailBase = 'usuario';
  } else if (words.length === 1) {
    // Si solo hay una palabra, usar primeras 5 letras o la palabra completa si es más corta
    emailBase = words[0].substring(0, 5);
  } else {
    // Si hay 2+ palabras: tomar inicial de nombre + primer apellido completo (máx 8 caracteres)
    const firstName = words[0][0]; // Primera letra del primer nombre
    const lastName = words[1].substring(0, 7); // Primeras 7 letras del primer apellido
    emailBase = (firstName + lastName).substring(0, 8);
  }

  // Asegurar que no esté vacío
  emailBase = emailBase || 'usuario';

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
