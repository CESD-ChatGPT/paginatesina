/* ═══════════════════════════════════════════════════════════════
   CAPA DE DATOS DE INVENTARIO

   ESTADO ACTUAL: **TODO ES MOCK.**
   El proyecto no tiene backend, API ni archivo de datos: es un sitio
   estático. No se inventaron "datos reales" — se construyó la capa que
   los va a servir, con un punto único de conexión.

   PARA CONECTAR UNA API REAL:
   cambiá `USE_MOCK` a false y completá las funciones de `apiAdapter`.
   Ningún componente necesita cambiar: todos consumen `inventoryService`,
   que ya devuelve promesas y modela latencia y error.

   Las firmas (getStockRows, getDemandSeries, …) son el contrato entre
   la UI y el origen de datos. Mantenelas al conectar el backend.
   ═══════════════════════════════════════════════════════════════ */

const USE_MOCK = true

/* ── Origen mock ────────────────────────────────────────────── */

const STOCK_ROWS = [
  { sku: 'MB-2041', name: 'Teclado mecánico TKL', category: 'Periféricos', stock: 142, reorder: 60, unitCost: 48 },
  { sku: 'MB-1180', name: 'Monitor 24" IPS', category: 'Pantallas', stock: 18, reorder: 45, unitCost: 190 },
  { sku: 'AC-3392', name: 'Hub USB-C 7 puertos', category: 'Accesorios', stock: 87, reorder: 40, unitCost: 34 },
  { sku: 'MB-0774', name: 'Webcam 1080p', category: 'Periféricos', stock: 31, reorder: 35, unitCost: 62 },
  { sku: 'AC-5510', name: 'Cable HDMI 2.1 · 2m', category: 'Accesorios', stock: 260, reorder: 80, unitCost: 11 },
  { sku: 'PC-1024', name: 'SSD NVMe 1TB', category: 'Componentes', stock: 54, reorder: 50, unitCost: 96 },
  { sku: 'PC-2048', name: 'Memoria DDR5 16GB', category: 'Componentes', stock: 12, reorder: 40, unitCost: 78 },
  { sku: 'PT-0301', name: 'Monitor 27" 4K', category: 'Pantallas', stock: 73, reorder: 30, unitCost: 340 },
]

// 12 meses observados + 6 proyectados, para el SKU MB-1180
const DEMAND_MB1180 = {
  sku: 'MB-1180',
  observed: [
    { t: '2025-03', v: 38 }, { t: '2025-04', v: 41 }, { t: '2025-05', v: 36 },
    { t: '2025-06', v: 48 }, { t: '2025-07', v: 45 }, { t: '2025-08', v: 57 },
    { t: '2025-09', v: 52 }, { t: '2025-10', v: 64 }, { t: '2025-11', v: 78 },
    { t: '2025-12', v: 91 }, { t: '2026-01', v: 62 }, { t: '2026-02', v: 69 },
  ],
  forecast: [
    { t: '2026-03', v: 74 }, { t: '2026-04', v: 71 }, { t: '2026-05', v: 83 },
    { t: '2026-06', v: 88 }, { t: '2026-07', v: 95 }, { t: '2026-08', v: 92 },
  ],
  confidence: 0.94,
}

/* ── Reglas de negocio (independientes del origen) ──────────── */

export function stockState(row) {
  if (row.stock < row.reorder) return 'low'
  if (row.stock < row.reorder * 1.15) return 'watch'
  return 'ok'
}

export const STATE_LABEL = { ok: 'En rango', watch: 'Por quebrar', low: 'Bajo' }

/* Token de color por estado. Los estados nunca se distinguen solo por
   color: siempre van acompañados de su etiqueta de texto. */
export const STATE_TOKEN = {
  ok: 'var(--positive)',
  watch: 'var(--warning)',
  low: 'var(--alert)',
}

/* ── Adaptadores ────────────────────────────────────────────── */

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

const mockAdapter = {
  async getStockRows() {
    await delay(420)
    return STOCK_ROWS
  },
  async getDemandSeries() {
    await delay(520)
    return DEMAND_MB1180
  },
  async createReplenishmentOrder(skus) {
    await delay(900)
    // No persiste nada: sin backend no hay dónde. Devuelve el borrador
    // que la UI muestra como confirmación.
    return { id: `OC-${Date.now().toString().slice(-6)}`, skus, createdAt: new Date() }
  },
}

const apiAdapter = {
  // Cuando exista backend: reemplazar por las llamadas reales.
  // p. ej. const r = await fetch('/api/stock'); if (!r.ok) throw new Error(...)
  async getStockRows() {
    throw new Error('API de inventario no configurada')
  },
  async getDemandSeries() {
    throw new Error('API de demanda no configurada')
  },
  async createReplenishmentOrder() {
    throw new Error('API de órdenes de compra no configurada')
  },
}

const source = USE_MOCK ? mockAdapter : apiAdapter

/* ── Servicio público: lo único que la UI debe importar ─────── */

export const inventoryService = {
  getStockRows: () => source.getStockRows(),
  getDemandSeries: () => source.getDemandSeries(),
  createReplenishmentOrder: (skus) => source.createReplenishmentOrder(skus),

  /* Derivados calculados sobre las filas — no son datos nuevos,
     son agregaciones de la misma fuente. */
  async getKpis() {
    const rows = await source.getStockRows()
    const capital = rows.reduce((sum, r) => sum + r.stock * r.unitCost, 0)
    const belowReorder = rows.filter((r) => stockState(r) === 'low').length
    const atRisk = rows.filter((r) => stockState(r) === 'watch').length
    return {
      skuCount: rows.length,
      capital,
      belowReorder,
      atRisk,
    }
  },

  async getCategoryBreakdown() {
    const rows = await source.getStockRows()
    const byCat = new Map()
    for (const r of rows) {
      const value = r.stock * r.unitCost
      byCat.set(r.category, (byCat.get(r.category) ?? 0) + value)
    }
    return [...byCat.entries()]
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
  },
}

/* ── Vistas sincrónicas para la landing ─────────────────────────
   La landing no debe mostrar skeletons: es la primera impresión, y ahí
   el panel y el gráfico son demostraciones del producto, no tableros en
   vivo. Salen de las mismas filas que el dashboard para que las cifras
   no se contradigan entre una página y otra. */

/* Muestra representativa: se elige una fila de cada estado para que el
   panel del hero enseñe las tres situaciones que el producto detecta.
   Los estados los sigue derivando la regla de negocio, no se fijan a mano. */
export function getStockPreview(limit = 4) {
  const byState = { ok: [], watch: [], low: [] }
  for (const r of STOCK_ROWS) byState[stockState(r)].push(r)

  const picked = []
  for (const s of ['ok', 'low', 'watch']) {
    if (byState[s][0]) picked.push(byState[s][0])
  }
  for (const r of STOCK_ROWS) {
    if (picked.length >= limit) break
    if (!picked.includes(r)) picked.push(r)
  }
  // se devuelve en el orden original del catálogo, no en el de selección
  return STOCK_ROWS.filter((r) => picked.slice(0, limit).includes(r))
}

export function getDemandPreview() {
  return { observed: DEMAND_MB1180.observed, forecast: DEMAND_MB1180.forecast }
}

export const IS_MOCK_DATA = USE_MOCK
