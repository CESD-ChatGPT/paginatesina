/* ═══════════════════════════════════════════════════════════════
   MOTOR DE VALORIZACIÓN

   Agrega las quotes normalizadas de todas las fuentes (providers.js) en
   una sola estimación por producto y en un total de depósito. La regla
   de negocio que hay que respetar en toda la UI que consuma esto:

   **el resultado es siempre una ESTIMACIÓN, nunca una cifra exacta.**
   Cuando ninguna fuente tiene coincidencia, el producto queda en
   `status: 'sin_match'` — nunca se inventa un precio.

   Nivel de confianza (alta/media/baja) según cuántas fuentes coinciden
   y qué tan dispersos están sus precios entre sí, no según una sola
   fuente aislada.
   ═══════════════════════════════════════════════════════════════ */

import { PROVIDERS } from './providers'
import { inventoryService } from '../inventory'

const CACHE_TTL_MS = 2 * 60 * 1000
const cache = new Map()

export const CONFIDENCE_LABEL = { alta: 'Confianza alta', media: 'Confianza media', baja: 'Confianza baja' }
export const CONFIDENCE_TOKEN = { alta: 'var(--positive)', media: 'var(--warning)', baja: 'var(--alert)' }

function median(nums) {
  const s = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

function confidenceTier(quotes) {
  const prices = quotes.map((q) => q.price)
  const mid = median(prices)
  const spread = mid === 0 ? 0 : (Math.max(...prices) - Math.min(...prices)) / mid
  const hasAlta = quotes.some((q) => q.confidence === 'alta')
  if (quotes.length >= 2 && spread <= 0.15 && hasAlta) return 'alta'
  if (quotes.length >= 2 && spread <= 0.35) return 'media'
  if (quotes.length === 1 && hasAlta) return 'media'
  return 'baja'
}

/* `product` acepta cualquier objeto con {sku, unitCost, ean}: las filas
   de getStockRows() ya cumplen esa forma, así que no hace falta volver
   a resolver el producto acá. */
export async function getProductValuation(product) {
  const cached = cache.get(product.sku)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.result

  const results = await Promise.all(PROVIDERS.map((p) => p.quote(product)))
  const quotes = results.filter(Boolean)

  const result = quotes.length === 0
    ? { sku: product.sku, status: 'sin_match', quotes: [], estimatedUnitPrice: null, currency: null, confidence: null, asOf: null }
    : {
        sku: product.sku,
        status: 'ok',
        quotes,
        estimatedUnitPrice: Math.round(median(quotes.map((q) => q.price)) * 100) / 100,
        currency: quotes[0].currency,
        confidence: confidenceTier(quotes),
        asOf: quotes.reduce((max, q) => (q.timestamp > max ? q.timestamp : max), quotes[0].timestamp),
      }

  cache.set(product.sku, { result, at: Date.now() })
  return result
}

const CONFIDENCE_WEIGHT = { alta: 3, media: 2, baja: 1 }

export async function getDepotValorization() {
  const rows = await inventoryService.getStockRows()
  const valuations = await Promise.all(rows.map((r) => getProductValuation(r)))

  let estimatedTotal = 0
  let bookTotal = 0
  let coveredValue = 0
  let weightedConfidenceSum = 0

  const items = rows.map((row, i) => {
    const v = valuations[i]
    const bookValue = row.stock * row.unitCost
    bookTotal += bookValue
    if (v.status === 'ok') {
      estimatedTotal += row.stock * v.estimatedUnitPrice
      coveredValue += bookValue
      weightedConfidenceSum += CONFIDENCE_WEIGHT[v.confidence] * bookValue
    } else {
      // sin estimación externa: se usa el costo de catálogo como piso conocido
      estimatedTotal += bookValue
    }
    return { ...row, valuation: v, bookValue }
  })

  const coverageRatio = bookTotal === 0 ? 0 : coveredValue / bookTotal
  const avgWeight = coveredValue === 0 ? 0 : weightedConfidenceSum / coveredValue
  const overallConfidence = coveredValue === 0 ? null : avgWeight >= 2.5 ? 'alta' : avgWeight >= 1.5 ? 'media' : 'baja'

  return {
    estimatedTotal: Math.round(estimatedTotal * 100) / 100,
    bookTotal: Math.round(bookTotal * 100) / 100,
    coverageRatio,
    overallConfidence,
    items,
  }
}
