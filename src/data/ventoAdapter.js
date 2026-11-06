/* ═══════════════════════════════════════════════════════════════
   INVENTARIO REAL DESDE VENTO

   El ChatBot Stock guarda el inventario en Vento, en la red `cesd`,
   con esta forma por fila:

     { sku, producto, cantidad, stock_minimo, unidad,
       ubicacion, proveedor, notas }

   POR QUÉ UNA COPIA Y NO LA API EN VIVO
   La app de Vento lee su API con la cookie de sesión del propio
   dominio. SOLVUS vive en otro origen (GitHub Pages), así que el
   navegador exigiría que Vento respondiera con
   `Access-Control-Allow-Origin` apuntando a ese origen y
   `Access-Control-Allow-Credentials: true`. Eso lo decide el
   servidor de Vento, no esta app — y hoy no lo hace. Pedirle a la
   API desde acá da error de CORS siempre, con sesión abierta o sin
   ella.

   La salida es una copia: se exporta el inventario una vez desde la
   propia app —ahí sí es mismo origen y la cookie vale— y se publica
   como `public/inventario.json`. Instrucciones en el README.

   LO QUE LOS DATOS REALES SÍ Y NO TRAEN
   El esquema del ChatBot no tiene costo unitario ni historial de
   ventas. Con eso:

     · Stock, faltantes, ubicaciones y proveedores → salen completos.
     · Capital inmovilizado y valorización → NO se pueden calcular.
     · Pronóstico de demanda → NO, no hay serie de ventas.

   No se rellenan con números inventados: las pantallas que dependen
   de eso lo dicen. Un costo falso contamina el capital, la
   valorización y las recomendaciones de compra a la vez.
   ═══════════════════════════════════════════════════════════════ */

const RUTA = `${import.meta.env.BASE_URL}inventario.json`

let cache = null

function normalizarFila(fila) {
  const cantidad = Number(fila.cantidad) || 0
  const minimo = Number(fila.stock_minimo) || 0
  return {
    sku: String(fila.sku ?? '').trim(),
    name: String(fila.producto ?? '').trim() || `SKU ${fila.sku}`,
    /* El ChatBot no tiene categorías. Se agrupa por proveedor, que es
       la dimensión que sus datos sí traen, en vez de inventar una. */
    category: String(fila.proveedor ?? '').trim() || 'Sin proveedor',
    stock: cantidad,
    reorder: minimo,
    unit: String(fila.unidad ?? '').trim() || 'Unidad',
    warehouseId: String(fila.ubicacion ?? '').trim() || 'Sin ubicación',
    supplierId: String(fila.proveedor ?? '').trim() || null,
    notes: String(fila.notas ?? '').trim() || null,
    /* Sin costo ni historial. Se dejan explícitos en null y no en cero:
       cero es un número y mentiría en las sumas; null se puede
       detectar y reportar. */
    unitCost: null,
    ean: null,
    lastSaleAt: null,
    daysSinceLastSale: null,
    dailySalesAvg: null,
    dailySalesRecent: null,
  }
}

function filasDe(datos) {
  if (Array.isArray(datos)) return datos
  return datos?.items || datos?.data || []
}

/* Devuelve null —y no lanza— cuando no hay copia publicada: es el caso
   normal antes del primer export, y tiene que degradar al depósito de
   ejemplo sin romper nada. */
export async function cargarInventarioVento() {
  if (cache !== null) return cache
  try {
    const res = await fetch(RUTA, { cache: 'no-cache' })
    if (!res.ok) { cache = false; return null }
    const filas = filasDe(await res.json())
      .filter((f) => f && f.sku != null)
      .map(normalizarFila)
    cache = filas.length ? filas : false
    return cache || null
  } catch {
    cache = false
    return null
  }
}

export function hayInventarioVento() {
  return Array.isArray(cache) && cache.length > 0
}

export const ventoAdapter = {
  async getStockRows() {
    const filas = await cargarInventarioVento()
    if (!filas) throw new Error('No hay inventario publicado.')
    return filas
  },

  async getStockByWarehouse() {
    const filas = await cargarInventarioVento()
    if (!filas) throw new Error('No hay inventario publicado.')
    /* Una fila por SKU y ubicación: el ChatBot guarda una sola
       ubicación por producto, así que cada SKU aporta una. */
    return filas.map((f) => ({ ...f, warehouseName: f.warehouseId }))
  },

  /* Sin historial de ventas no hay serie. Null es la señal que el panel
     ya entiende: muestra el estado vacío con su explicación. */
  async getDemandSeries() {
    return null
  },

  async createReplenishmentOrder(skus) {
    return { id: `OC-${Date.now().toString().slice(-6)}`, skus, createdAt: new Date() }
  },

  async transferStock() {
    throw new Error(
      'Esta vista es de solo lectura sobre la copia del inventario. ' +
        'Las transferencias se hacen en el ChatBot Stock.'
    )
  },

  async setPhysicalCount() {
    throw new Error('El conteo físico se carga en el ChatBot Stock.')
  },

  async getPhysicalCounts() {
    return {}
  },

  async applyInventoryAdjustment() {
    throw new Error('Los ajustes se hacen en el ChatBot Stock.')
  },
}
