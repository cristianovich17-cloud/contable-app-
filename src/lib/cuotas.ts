export function calcularCuotaAFUT(bienestar: number, ordinaria: number) {
  const b = Number(bienestar || 0)
  const o = Number(ordinaria || 0)
  return b + o
}

export function formatCurrency(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
