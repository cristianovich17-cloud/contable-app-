export function normalizeHeader(h: string) {
  return h?.toString().trim().toLowerCase()
}

export function validateSocioRow(row: any) {
  const errors: string[] = []
  if (!row['n°'] && !row['numero'] && !row['numero de socio'] && !row['no']) errors.push('Falta columna N°')
  if (!row['rut'] && !row['r.u.t']) errors.push('Falta columna RUT')
  if (!row['nombre completo'] && !row['nombre']) errors.push('Falta columna Nombre completo')
  if (!row['calidad jurídica'] && !row['calidad juridica'] && !row['calidad']) errors.push('Falta columna Calidad jurídica')
  return errors
}

export function isValidCalidad(calidad: string) {
  if (!calidad) return false
  const c = calidad.toString().toLowerCase()
  return c === 'funcionario' || c.includes('código del trabajo') || c.includes('codigo del trabajo') || c.includes('codigo')
}
