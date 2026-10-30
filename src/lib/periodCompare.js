/* Comparación de período sobre datos que sí existen: la serie mensual
   observada de demanda (12 meses reales en el mock), no una serie diaria
   inventada. No hay snapshot histórico de stock/capital día a día en
   este proyecto — comparar "hoy vs ayer" ahí sería fabricar un dato que
   no existe, así que esa comparación no se ofrece todavía. */
export function compareDemandPeriods(observed, months = 1) {
  if (!observed || observed.length < months * 2) return null

  const current = observed.slice(-months)
  const previous = observed.slice(-months * 2, -months)
  const sum = (arr) => arr.reduce((s, d) => s + d.v, 0)

  const currentSum = sum(current)
  const previousSum = sum(previous)
  const deltaPct = previousSum === 0 ? null : ((currentSum - previousSum) / previousSum) * 100

  const range = (arr) => (arr.length === 1 ? arr[0].t : `${arr[0].t} → ${arr[arr.length - 1].t}`)

  return {
    currentLabel: range(current),
    previousLabel: range(previous),
    currentSum,
    previousSum,
    deltaPct,
  }
}
