/* ═══════════════════════════════════════════════════════════════
   FUENTES DE PRECIO (PriceSource)

   Arquitectura de valorización: cada proveedor implementa la misma
   interfaz mínima — `quote(product) -> normalizado | null` — para que
   sumar o sacar una fuente no toque el motor de agregación (valuation.js)
   ni la UI. `null` es una respuesta válida: "esta fuente no tiene
   coincidencia para este producto", no un error.

   ESTADO ACTUAL: **las cuatro fuentes son mock.** No hay scraping ni
   integración real con ningún marketplace, retailer o proveedor — los
   precios se derivan de forma determinística del costo de catálogo
   (mismo sku → mismo precio en toda la sesión, para que no parezca un
   bug que el valor "cambie solo"). Conectar una fuente real implica
   reemplazar el cuerpo de `quote()` de esa fuente; el resto no cambia.

   Forma normalizada de cada quote:
   { product, source, price, currency, url, timestamp, confidence }
   ═══════════════════════════════════════════════════════════════ */

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

function seed(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}
const pseudo = (sku, salt) => (seed(sku + salt) % 1000) / 1000

/* Este SKU queda deliberadamente sin catálogo en ninguna fuente: el
   camino de "no encontramos una coincidencia confiable" tiene que poder
   probarse siempre, no depender de que el azar lo produzca. */
const NO_MATCH_ANYWHERE = new Set(['PC-3311'])

function coversSku(sku, providerKey, threshold) {
  if (NO_MATCH_ANYWHERE.has(sku)) return false
  return pseudo(sku, providerKey) < threshold
}

function mockPrice(product, providerKey, factor) {
  const jitter = 0.9 + pseudo(product.sku, providerKey + '-jitter') * 0.2 // ±10%
  return Math.round(product.unitCost * factor * jitter * 100) / 100
}

export const MarketplaceProvider = {
  name: 'Marketplace',
  async quote(product) {
    await delay(180 + pseudo(product.sku, 'mkt-delay') * 200)
    if (!coversSku(product.sku, 'marketplace', 0.82)) return null
    return {
      product: product.sku,
      source: 'Marketplace',
      price: mockPrice(product, 'marketplace', 1.42),
      currency: 'USD',
      url: `https://marketplace.mock/search?q=${encodeURIComponent(product.ean)}`,
      timestamp: new Date(),
      // agregado de muchos vendedores: referencia amplia, no un precio verificado
      confidence: 'media',
    }
  },
}

export const RetailProvider = {
  name: 'Retail oficial',
  async quote(product) {
    await delay(220 + pseudo(product.sku, 'retail-delay') * 200)
    if (!coversSku(product.sku, 'retail', 0.6)) return null
    return {
      product: product.sku,
      source: 'Retail oficial',
      price: mockPrice(product, 'retail', 1.58),
      currency: 'USD',
      url: `https://retail.mock/p/${product.sku}`,
      timestamp: new Date(),
      // catálogo de marca/distribuidor oficial
      confidence: 'alta',
    }
  },
}

export const SupplierProvider = {
  name: 'Costo de proveedor',
  async quote(product) {
    await delay(120 + pseudo(product.sku, 'sup-delay') * 150)
    if (!coversSku(product.sku, 'supplier', 0.92)) return null
    return {
      product: product.sku,
      source: 'Costo de proveedor',
      price: mockPrice(product, 'supplier', 1.05),
      currency: 'USD',
      url: null,
      timestamp: new Date(),
      // costo de compra directo declarado por el proveedor, no precio al público
      confidence: 'alta',
    }
  },
}

const customPrices = new Map() // sku -> { price, currency, at }

export const CustomProvider = {
  name: 'Precio manual',
  async quote(product) {
    const entry = customPrices.get(product.sku)
    if (!entry) return null
    return {
      product: product.sku,
      source: 'Precio manual',
      price: entry.price,
      currency: entry.currency,
      url: null,
      timestamp: entry.at,
      // cargado a mano por alguien del depósito: se trata como verificado
      confidence: 'alta',
    }
  },
  set(sku, price, currency = 'USD') {
    customPrices.set(sku, { price, currency, at: new Date() })
  },
  clear(sku) {
    customPrices.delete(sku)
  },
}

export const PROVIDERS = [CustomProvider, SupplierProvider, RetailProvider, MarketplaceProvider]
