/* ═══════════════════════════════════════════════════════════════
   MOTOR DE REGLAS: ALERTAS Y RECOMENDACIONES

   Todo lo que sale de acá está atado a un número concreto de
   inventory.js — nunca es un consejo genérico. Cada alerta/recomendación
   declara qué se detectó, qué datos se usaron y por qué importa, para
   que la UI pueda mostrar esa cadena completa en vez de solo un título.

   Es un motor de reglas explícitas (umbrales configurables en
   inventory.js), no un modelo de demanda: cuando falta el dato que hace
   falta para proyectar algo (ritmo de venta, proveedor con lead time),
   la respuesta es "faltan datos", nunca un número inventado.
   ═══════════════════════════════════════════════════════════════ */

import { inventoryService, stockState, NO_MOVEMENT_DAYS, OVERSTOCK_RATIO } from './inventory'
import { supplierById } from './suppliers'

const SEVERITY_RANK = { alta: 0, media: 1, baja: 2 }

export async function getAlerts() {
  const [rows, physicalCounts] = await Promise.all([
    inventoryService.getStockRows(),
    inventoryService.getPhysicalCounts(),
  ])

  const alerts = []

  for (const row of rows) {
    const state = stockState(row)

    if (state === 'low') {
      alerts.push({
        id: `crit-${row.sku}`,
        type: 'critical_stock',
        severity: 'alta',
        sku: row.sku,
        productName: row.name,
        detected: `Stock actual (${row.stock} u.) por debajo del punto de reposición (${row.reorder} u.).`,
        dataUsed: 'Stock consolidado de todos los depósitos vs. punto de reposición configurado.',
        why: 'Vender al ritmo actual sin reponer deja el producto sin stock antes de la próxima compra.',
        action: 'Generar orden de reposición ahora.',
      })
    }

    if (state === 'watch' && row.dailySalesRecent > 0) {
      const daysToStockout = row.stock / row.dailySalesRecent
      const supplier = supplierById(row.supplierId)
      if (supplier && daysToStockout <= supplier.leadTimeDays) {
        alerts.push({
          id: `risk-${row.sku}`,
          type: 'breakout_risk',
          severity: 'alta',
          sku: row.sku,
          productName: row.name,
          detected: `Al ritmo de venta reciente (${row.dailySalesRecent.toFixed(1)} u./día) el stock se agota en ~${Math.floor(daysToStockout)} días, antes de que llegue un pedido a ${supplier.name} (${supplier.leadTimeDays} días).`,
          dataUsed: 'Venta diaria reciente, stock consolidado y tiempo de entrega del proveedor asignado.',
          why: 'El plazo de entrega del proveedor es mayor al tiempo que queda de stock.',
          action: 'Anticipar la orden de compra o buscar una fuente de reposición más rápida.',
        })
      }
    }

    if (row.stock > row.reorder * OVERSTOCK_RATIO) {
      alerts.push({
        id: `over-${row.sku}`,
        type: 'overstock',
        severity: 'media',
        sku: row.sku,
        productName: row.name,
        detected: `Stock actual (${row.stock} u.) más del doble del punto de reposición (${row.reorder} u.).`,
        dataUsed: 'Stock consolidado vs. punto de reposición.',
        why: 'Capital inmovilizado por encima de lo que la rotación del producto justifica.',
        action: 'Pausar próximas reposiciones o evaluar redistribución entre depósitos.',
      })
    }

    if (row.daysSinceLastSale > NO_MOVEMENT_DAYS) {
      alerts.push({
        id: `nomove-${row.sku}`,
        type: 'no_movement',
        severity: row.stock * row.unitCost > 1000 ? 'alta' : 'media',
        sku: row.sku,
        productName: row.name,
        detected: `Sin ventas registradas hace ${row.daysSinceLastSale} días (umbral: ${NO_MOVEMENT_DAYS}).`,
        dataUsed: 'Fecha de última venta por SKU.',
        why: 'El capital inmovilizado en un producto sin rotación no genera retorno.',
        action: 'Revisar exhibición/canal, considerar liquidación o transferencia a un depósito con más demanda.',
      })
    }

    if (row.dailySalesAvg > 0) {
      const change = (row.dailySalesRecent - row.dailySalesAvg) / row.dailySalesAvg
      if (change >= 0.5) {
        alerts.push({
          id: `anomhigh-${row.sku}`,
          type: 'anomalous_consumption',
          severity: 'media',
          sku: row.sku,
          productName: row.name,
          detected: `Venta diaria reciente (${row.dailySalesRecent.toFixed(1)} u./día) ${Math.round(change * 100)}% por encima del promedio histórico (${row.dailySalesAvg.toFixed(1)} u./día).`,
          dataUsed: 'Promedio histórico de venta diaria vs. venta diaria reciente.',
          why: 'Un salto de consumo sostenido agota el stock antes de lo previsto si no se ajusta la reposición.',
          action: 'Confirmar la causa (promoción, estacionalidad, carga de datos) y ajustar la cantidad de reposición.',
        })
      } else if (change <= -0.5 && row.daysSinceLastSale <= NO_MOVEMENT_DAYS) {
        alerts.push({
          id: `anomlow-${row.sku}`,
          type: 'anomalous_consumption',
          severity: 'baja',
          sku: row.sku,
          productName: row.name,
          detected: `Venta diaria reciente (${row.dailySalesRecent.toFixed(1)} u./día) ${Math.round(Math.abs(change) * 100)}% por debajo del promedio histórico (${row.dailySalesAvg.toFixed(1)} u./día).`,
          dataUsed: 'Promedio histórico de venta diaria vs. venta diaria reciente.',
          why: 'Una caída de consumo sin llegar a "sin movimiento" puede anticipar sobrestock si se sigue reponiendo al ritmo anterior.',
          action: 'Revisar demanda antes de la próxima reposición.',
        })
      }
    }

    const counted = physicalCounts[row.sku]
    if (counted != null && counted !== row.stock) {
      alerts.push({
        id: `diff-${row.sku}`,
        type: 'inventory_diff',
        severity: 'media',
        sku: row.sku,
        productName: row.name,
        detected: `Conteo físico registrado (${counted} u.) difiere del stock en sistema (${row.stock} u.).`,
        dataUsed: 'Último conteo físico cargado vs. stock consolidado en sistema.',
        why: 'La diferencia puede deberse a error de carga, merma o venta no registrada.',
        action: 'Revisar y aplicar el ajuste de inventario físico.',
      })
    }
  }

  return alerts.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
}

/* Cantidad de reposición sugerida = consumo durante el lead time del
   proveedor + un colchón de seguridad, menos lo que ya hay en stock.
   Si falta el dato que hace falta (ritmo de venta o proveedor con lead
   time), lo dice — no devuelve un número construido sobre un supuesto. */
export function predictReorderQty(row) {
  const rate = row.dailySalesRecent > 0 ? row.dailySalesRecent : row.dailySalesAvg
  const supplier = supplierById(row.supplierId)

  if (!supplier?.leadTimeDays) {
    return { status: 'faltan_datos', reason: 'No hay un proveedor con tiempo de entrega asignado para este producto.' }
  }
  if (!rate || rate <= 0) {
    return { status: 'faltan_datos', reason: 'No hay suficiente historial de venta para proyectar consumo.' }
  }

  const demandDuringLeadTime = rate * supplier.leadTimeDays
  const safetyStock = row.reorder * 0.2
  const qty = Math.max(0, Math.ceil(demandDuringLeadTime + safetyStock - row.stock))

  return {
    status: 'ok',
    qty,
    consumptionRate: rate,
    leadTimeDays: supplier.leadTimeDays,
    supplierName: supplier.name,
    demandDuringLeadTime: Math.round(demandDuringLeadTime * 10) / 10,
    safetyStock: Math.round(safetyStock * 10) / 10,
  }
}

export async function getRecommendations(limit = 6) {
  const [alerts, rows] = await Promise.all([getAlerts(), inventoryService.getStockRows()])
  const bySku = new Map(rows.map((r) => [r.sku, r]))

  const actionable = alerts.filter((a) =>
    ['critical_stock', 'breakout_risk', 'overstock', 'no_movement'].includes(a.type)
  )

  // Un mismo SKU puede disparar más de una alerta (p. ej. sobrestock Y sin
  // movimiento a la vez) — legítimo en Alertas, que lista todo, pero acá
  // "Recomienda" es un resumen curado: se queda con la de mayor severidad
  // por producto (alerts ya viene ordenada por severidad) para no repetir
  // el mismo SKU en dos tarjetas.
  const bestPerSku = new Map()
  for (const a of actionable) {
    if (!bestPerSku.has(a.sku)) bestPerSku.set(a.sku, a)
  }

  return [...bestPerSku.values()].slice(0, limit).map((a) => ({
    ...a,
    reorder: ['critical_stock', 'breakout_risk'].includes(a.type) ? predictReorderQty(bySku.get(a.sku)) : null,
  }))
}

/* Borrador de orden de compra agrupado por proveedor: solo productos que
   ya no están en rango y para los que se pudo proyectar una cantidad. */
export async function getPurchaseOrderDraft() {
  const rows = await inventoryService.getStockRows()
  const candidates = rows.filter((r) => stockState(r) !== 'ok')

  const bySupplier = new Map()
  for (const row of candidates) {
    const prediction = predictReorderQty(row)
    if (prediction.status !== 'ok' || prediction.qty <= 0) continue
    const supplier = supplierById(row.supplierId)
    if (!bySupplier.has(row.supplierId)) {
      bySupplier.set(row.supplierId, {
        supplierId: row.supplierId,
        supplierName: supplier?.name ?? row.supplierId,
        leadTimeDays: supplier?.leadTimeDays ?? null,
        items: [],
      })
    }
    bySupplier.get(row.supplierId).items.push({ sku: row.sku, name: row.name, qty: prediction.qty, unitCost: row.unitCost })
  }

  return [...bySupplier.values()]
}
