/* ═══════════════════════════════════════════════════════════════
   CAPA DE DATOS DE INVENTARIO

   ESTADO ACTUAL: **TODO ES MOCK.**
   El proyecto no tiene backend, API ni archivo de datos: es un sitio
   estático. No se inventaron "datos reales" — se construyó la capa que
   los va a servir, con un punto único de conexión.

   Las mutaciones (transferir, ajustar por conteo físico, generar orden)
   sí modifican el estado en memoria de este módulo durante la sesión —
   sin eso, "confirmar una transferencia" no tendría ningún efecto visible
   y el criterio de "responde correctamente" quedaría incumplido. Se
   resetea al recargar la página porque no hay dónde persistirlo: es
   honesto sobre esa limitación, no la esconde.

   PARA CONECTAR UNA API REAL:
   cambiá `USE_MOCK` a false y completá las funciones de `apiAdapter`.
   Ningún componente necesita cambiar: todos consumen `inventoryService`.
   ═══════════════════════════════════════════════════════════════ */

import { SUPPLIERS } from './suppliers'
import { WAREHOUSES } from './warehouses'
import { recordEvent } from './audit'

const USE_MOCK = true
const delay = (ms) => new Promise((r) => setTimeout(r, ms))

/* ── Catálogo (sin cantidad: la cantidad vive por depósito) ──── */

const PRODUCTS = [
  { sku: 'MB-2041', name: 'Teclado mecánico TKL', category: 'Periféricos', brand: 'Logitech', model: 'G413', ean: '7897539412048', unitCost: 48, reorder: 60, supplierId: 'sup-tecno', dailySalesAvg: 3.1, dailySalesRecent: 3.4 },
  { sku: 'MB-1180', name: 'Monitor 24" IPS', category: 'Pantallas', brand: 'LG', model: '24MP400', ean: '8806091234567', unitCost: 190, reorder: 45, supplierId: 'sup-tecno', dailySalesAvg: 2.1, dailySalesRecent: 2.3 },
  { sku: 'AC-3392', name: 'Hub USB-C 7 puertos', category: 'Accesorios', brand: 'Ugreen', model: 'CM480', ean: '6957303883392', unitCost: 34, reorder: 40, supplierId: 'sup-sur', dailySalesAvg: 2.6, dailySalesRecent: 2.5 },
  { sku: 'MB-0774', name: 'Webcam 1080p', category: 'Periféricos', brand: 'Logitech', model: 'C920', ean: '7897539407744', unitCost: 62, reorder: 35, supplierId: 'sup-tecno', dailySalesAvg: 1.8, dailySalesRecent: 3.6 },
  { sku: 'AC-5510', name: 'Cable HDMI 2.1 · 2m', category: 'Accesorios', brand: 'Ugreen', model: 'HD140', ean: '6957303885510', unitCost: 11, reorder: 80, supplierId: 'sup-sur', dailySalesAvg: 0.15, dailySalesRecent: 0.1 },
  { sku: 'PC-1024', name: 'SSD NVMe 1TB', category: 'Componentes', brand: 'Kingston', model: 'NV2', ean: '740617326024', unitCost: 96, reorder: 50, supplierId: 'sup-andina', dailySalesAvg: 2.4, dailySalesRecent: 2.5 },
  { sku: 'PC-2048', name: 'Memoria DDR5 16GB', category: 'Componentes', brand: 'Kingston', model: 'Fury Beast', ean: '740617320482', unitCost: 78, reorder: 40, supplierId: 'sup-andina', dailySalesAvg: 2.9, dailySalesRecent: 3.0 },
  { sku: 'PT-0301', name: 'Monitor 27" 4K', category: 'Pantallas', brand: 'Samsung', model: 'U28E590', ean: '8806090030301', unitCost: 340, reorder: 30, supplierId: 'sup-tecno', dailySalesAvg: 1.1, dailySalesRecent: 1.0 },
  { sku: 'PC-3311', name: 'Fuente 650W 80+ Bronze', category: 'Componentes', brand: 'EVGA', model: 'BR', ean: '843368033311', unitCost: 71, reorder: 35, supplierId: 'sup-andina', dailySalesAvg: 1.4, dailySalesRecent: 1.3 },
  { sku: 'AC-7720', name: 'Mousepad XL', category: 'Accesorios', brand: 'Razer', model: 'Gigantus V2', ean: '8886419377720', unitCost: 18, reorder: 25, supplierId: 'sup-sur', dailySalesAvg: 1.0, dailySalesRecent: 0.9 },
  { sku: 'MB-9012', name: 'Auriculares USB', category: 'Periféricos', brand: 'HyperX', model: 'Cloud Stinger', ean: '899894009012', unitCost: 39, reorder: 30, supplierId: 'sup-tecno', dailySalesAvg: 1.6, dailySalesRecent: 1.5 },
]

/* ── Stock por depósito (la fuente que sí muta durante la sesión) ── */

let stockByWarehouse = [
  { sku: 'MB-2041', warehouseId: 'central', stock: 96, lastSaleAt: '2026-02-18' },
  { sku: 'MB-2041', warehouseId: 'cordoba', stock: 46, lastSaleAt: '2026-02-17' },
  { sku: 'MB-1180', warehouseId: 'central', stock: 6, lastSaleAt: '2026-02-19' },
  { sku: 'MB-1180', warehouseId: 'cordoba', stock: 12, lastSaleAt: '2026-02-16' },
  { sku: 'AC-3392', warehouseId: 'central', stock: 61, lastSaleAt: '2026-02-18' },
  { sku: 'AC-3392', warehouseId: 'cordoba', stock: 26, lastSaleAt: '2026-02-15' },
  { sku: 'MB-0774', warehouseId: 'central', stock: 9, lastSaleAt: '2026-02-19' },
  { sku: 'MB-0774', warehouseId: 'cordoba', stock: 22, lastSaleAt: '2026-02-14' },
  { sku: 'AC-5510', warehouseId: 'central', stock: 210, lastSaleAt: '2025-11-02' },
  { sku: 'AC-5510', warehouseId: 'cordoba', stock: 50, lastSaleAt: '2025-10-21' },
  { sku: 'PC-1024', warehouseId: 'central', stock: 38, lastSaleAt: '2026-02-19' },
  { sku: 'PC-1024', warehouseId: 'cordoba', stock: 16, lastSaleAt: '2026-02-17' },
  { sku: 'PC-2048', warehouseId: 'central', stock: 4, lastSaleAt: '2026-02-19' },
  { sku: 'PC-2048', warehouseId: 'cordoba', stock: 38, lastSaleAt: '2026-02-13' },
  { sku: 'PT-0301', warehouseId: 'central', stock: 52, lastSaleAt: '2026-02-16' },
  { sku: 'PT-0301', warehouseId: 'cordoba', stock: 21, lastSaleAt: '2026-02-12' },
  { sku: 'PC-3311', warehouseId: 'central', stock: 24, lastSaleAt: '2026-02-15' },
  { sku: 'PC-3311', warehouseId: 'cordoba', stock: 11, lastSaleAt: '2026-02-11' },
  { sku: 'AC-7720', warehouseId: 'central', stock: 33, lastSaleAt: '2026-02-14' },
  { sku: 'AC-7720', warehouseId: 'cordoba', stock: 9, lastSaleAt: '2026-02-10' },
  { sku: 'MB-9012', warehouseId: 'central', stock: 27, lastSaleAt: '2026-02-17' },
  { sku: 'MB-9012', warehouseId: 'cordoba', stock: 14, lastSaleAt: '2026-02-12' },
]

/* Conteo físico registrado por el usuario en esta sesión: sku -> contado.
   Vive acá (no en el componente) para que "aplicar ajuste" pueda mutar
   stockByWarehouse de verdad. */
let physicalCounts = {}

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

/* Punto de referencia para "hoy", fijo — así los cálculos de días sin
   movimiento son reproducibles en vez de depender de cuándo se abre la app. */
const TODAY = new Date('2026-02-20')
const daysSince = (dateStr) => Math.round((TODAY - new Date(dateStr)) / 86400000)

/* ── Reglas de negocio (independientes del origen) ────────────── */

export function stockState(row) {
  if (row.stock < row.reorder) return 'low'
  if (row.stock < row.reorder * 1.15) return 'watch'
  return 'ok'
}

export const STATE_LABEL = { ok: 'En rango', watch: 'Por quebrar', low: 'Bajo' }

export const STATE_TOKEN = {
  ok: 'var(--positive)',
  watch: 'var(--warning)',
  low: 'var(--alert)',
}

/* Umbral de "sin movimiento": más de 60 días sin venta */
export const NO_MOVEMENT_DAYS = 60
/* Umbral de sobrestock: más del doble del punto de reposición */
export const OVERSTOCK_RATIO = 2

function joinRow(product, stockRows) {
  const stock = stockRows.reduce((s, r) => s + r.stock, 0)
  const lastSaleAt = stockRows.reduce((max, r) => (r.lastSaleAt > max ? r.lastSaleAt : max), '0000-00-00')
  return { ...product, stock, lastSaleAt, daysSinceLastSale: daysSince(lastSaleAt) }
}

function buildStockRows() {
  return PRODUCTS.map((p) =>
    joinRow(p, stockByWarehouse.filter((r) => r.sku === p.sku))
  )
}

/* ── Adaptadores ───────────────────────────────────────────────── */

const mockAdapter = {
  async getStockRows() {
    await delay(420)
    return buildStockRows()
  },
  async getStockByWarehouse() {
    await delay(380)
    return stockByWarehouse.map((r) => ({ ...r, ...PRODUCTS.find((p) => p.sku === r.sku) }))
  },
  async getDemandSeries() {
    await delay(520)
    return DEMAND_MB1180
  },
  async createReplenishmentOrder(skus) {
    await delay(900)
    const draft = { id: `OC-${Date.now().toString().slice(-6)}`, skus, createdAt: new Date() }
    recordEvent({
      action: 'Generó orden de compra',
      target: `${skus.length} SKU`,
      detail: draft.id,
    })
    return draft
  },
  async transferStock({ sku, fromWarehouseId, toWarehouseId, qty }) {
    await delay(700)
    const from = stockByWarehouse.find((r) => r.sku === sku && r.warehouseId === fromWarehouseId)
    if (!from || from.stock < qty) {
      throw new Error(`Stock insuficiente en ${fromWarehouseId} para transferir ${qty} unidades.`)
    }
    let to = stockByWarehouse.find((r) => r.sku === sku && r.warehouseId === toWarehouseId)
    from.stock -= qty
    if (to) {
      to.stock += qty
    } else {
      to = { sku, warehouseId: toWarehouseId, stock: qty, lastSaleAt: from.lastSaleAt }
      stockByWarehouse.push(to)
    }
    recordEvent({
      action: 'Transferencia entre depósitos',
      target: sku,
      detail: `${qty} u. ${fromWarehouseId} → ${toWarehouseId}`,
    })
    return { sku, fromWarehouseId, toWarehouseId, qty }
  },
  async setPhysicalCount(sku, counted) {
    physicalCounts = { ...physicalCounts, [sku]: counted }
    return physicalCounts
  },
  async getPhysicalCounts() {
    return physicalCounts
  },
  async applyInventoryAdjustment(sku, warehouseId, newQty, reason) {
    await delay(600)
    const row = stockByWarehouse.find((r) => r.sku === sku && r.warehouseId === warehouseId)
    if (!row) throw new Error('No se encontró el registro de stock para ese depósito.')

    /* El conteo se carga consolidado (todos los depósitos) pero el ajuste
       se asienta en uno solo, así que la diferencia puede superar lo que
       ese depósito tiene. Sin este control quedaba stock negativo, que
       después envenena KPIs, alertas y transferencias de toda la sesión. */
    if (!Number.isFinite(newQty) || newQty < 0) {
      throw new Error(
        `El ajuste dejaría el stock en ${newQty} u. Elegí el depósito donde ` +
          `realmente sobra o falta la diferencia, o cargá el conteo por depósito.`
      )
    }

    const before = row.stock
    row.stock = newQty
    recordEvent({
      action: 'Ajuste por conteo físico',
      target: sku,
      detail: `${before} → ${newQty} u.`,
      reason,
    })
    const { [sku]: _drop, ...rest } = physicalCounts
    physicalCounts = rest
    return { sku, before, after: newQty }
  },
}

const apiAdapter = {
  // Cuando exista backend: reemplazar por las llamadas reales.
  async getStockRows() { throw new Error('API de inventario no configurada') },
  async getStockByWarehouse() { throw new Error('API de depósitos no configurada') },
  async getDemandSeries() { throw new Error('API de demanda no configurada') },
  async createReplenishmentOrder() { throw new Error('API de órdenes de compra no configurada') },
  async transferStock() { throw new Error('API de transferencias no configurada') },
  async setPhysicalCount() { throw new Error('API de inventario físico no configurada') },
  async getPhysicalCounts() { throw new Error('API de inventario físico no configurada') },
  async applyInventoryAdjustment() { throw new Error('API de ajustes no configurada') },
}

const source = USE_MOCK ? mockAdapter : apiAdapter

/* ── Servicio público: lo único que la UI debe importar ─────────── */

export const inventoryService = {
  getStockRows: () => source.getStockRows(),
  getStockByWarehouse: () => source.getStockByWarehouse(),
  getDemandSeries: () => source.getDemandSeries(),
  createReplenishmentOrder: (skus) => source.createReplenishmentOrder(skus),
  transferStock: (args) => source.transferStock(args),
  setPhysicalCount: (sku, counted) => source.setPhysicalCount(sku, counted),
  getPhysicalCounts: () => source.getPhysicalCounts(),
  applyInventoryAdjustment: (sku, warehouseId, newQty, reason) =>
    source.applyInventoryAdjustment(sku, warehouseId, newQty, reason),

  async getKpis() {
    const rows = await source.getStockRows()
    const capital = rows.reduce((sum, r) => sum + r.stock * r.unitCost, 0)
    const belowReorder = rows.filter((r) => stockState(r) === 'low').length
    const atRisk = rows.filter((r) => stockState(r) === 'watch').length
    const overstock = rows.filter((r) => r.stock > r.reorder * OVERSTOCK_RATIO).length
    const noMovement = rows.filter((r) => r.daysSinceLastSale > NO_MOVEMENT_DAYS)
    return {
      skuCount: rows.length,
      capital,
      belowReorder,
      atRisk,
      overstock,
      noMovementCount: noMovement.length,
      noMovementValue: noMovement.reduce((s, r) => s + r.stock * r.unitCost, 0),
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

/* ── Vistas sincrónicas para la landing ───────────────────────────
   La landing no debe mostrar skeletons: es la primera impresión. */

export function getStockPreview(limit = 4) {
  const rows = buildStockRows()
  const byState = { ok: [], watch: [], low: [] }
  for (const r of rows) byState[stockState(r)].push(r)

  const picked = []
  for (const s of ['ok', 'low', 'watch']) {
    if (byState[s][0]) picked.push(byState[s][0])
  }
  for (const r of rows) {
    if (picked.length >= limit) break
    if (!picked.includes(r)) picked.push(r)
  }
  return rows.filter((r) => picked.slice(0, limit).includes(r))
}

export function getDemandPreview() {
  return { observed: DEMAND_MB1180.observed, forecast: DEMAND_MB1180.forecast }
}

export const IS_MOCK_DATA = USE_MOCK
export { PRODUCTS, WAREHOUSES, SUPPLIERS }
