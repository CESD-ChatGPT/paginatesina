/* ═══════════════════════════════════════════════════════════════
   ADAPTADOR SUPABASE — inventario real, por usuario, desde cero

   Implementa la misma interfaz que el adaptador mock de inventory.js.
   La UI no sabe cuál de los dos está atendiendo.

   Dos diferencias de fondo con el mock, y las dos son a propósito:

   1. Una cuenta nueva arranca VACÍA. No se siembran productos de
      ejemplo. Un depósito con datos inventados es peor que uno
      vacío: parece que el sistema sabe algo que no sabe.

   2. La serie de demanda se agrega desde stock_moves reales. Si no
      hay movimientos, no hay serie — y la pantalla lo dice en vez de
      dibujar una curva.

   El esquema y sus políticas de RLS están en supabase/schema.sql.
   ═══════════════════════════════════════════════════════════════ */

import { getSupabase } from '../lib/supabase'

/* Un solo lugar donde se decide qué hacer con un error de PostgREST.
   `42P01` es "la tabla no existe": pasa cuando alguien conectó
   Supabase pero todavía no corrió el esquema, y hay que distinguirlo
   de un fallo real para poder caer al mock con un aviso útil. */
export class EsquemaFaltanteError extends Error {
  constructor() {
    super('Las tablas de inventario todavía no existen en Supabase.')
    this.name = 'EsquemaFaltanteError'
  }
}

function revisar({ data, error }) {
  if (error) {
    if (error.code === '42P01') throw new EsquemaFaltanteError()
    throw new Error(error.message)
  }
  return data
}

async function cliente() {
  const supabase = await getSupabase()
  if (!supabase) throw new Error('Supabase no está configurado.')
  return supabase
}

async function usuarioActual() {
  const supabase = await cliente()
  const { data } = await supabase.auth.getUser()
  if (!data?.user) throw new Error('No hay sesión activa.')
  return data.user
}

/* Las filas de la UI usan sku como identidad; la base usa uuid. Este
   índice evita ir y volver a la base por cada operación puntual. */
async function indicePorSku() {
  const supabase = await cliente()
  const productos = revisar(
    await supabase.from('products').select('id, sku')
  )
  return new Map(productos.map((p) => [p.sku, p.id]))
}

function diasDesde(fecha) {
  if (!fecha) return null
  const ms = Date.now() - new Date(fecha).getTime()
  return Math.floor(ms / 86_400_000)
}

/* La UI espera filas planas con el stock ya consolidado entre
   depósitos, igual que las construía el mock. */
function aFilaDeStock(producto) {
  const niveles = producto.stock_levels || []
  const stock = niveles.reduce((s, n) => s + n.qty, 0)
  const ultimaVenta = niveles.reduce(
    (max, n) => (n.last_sale_at && n.last_sale_at > max ? n.last_sale_at : max),
    ''
  )
  return {
    sku: producto.sku,
    name: producto.name,
    category: producto.category,
    unitCost: Number(producto.unit_cost),
    ean: producto.ean,
    reorder: producto.reorder_point,
    supplierId: producto.supplier_id,
    stock,
    lastSaleAt: ultimaVenta || null,
    daysSinceLastSale: diasDesde(ultimaVenta),
  }
}

/* El motor de recomendaciones compara la velocidad de venta reciente
   contra el promedio largo: así distingue "siempre se vendió poco" de
   "se aceleró esta semana". Con datos reales eso no es un campo del
   producto, se calcula sobre los movimientos. */
const VENTANA_LARGA = 90
const VENTANA_CORTA = 14

function velocidades(movimientos) {
  const ahora = Date.now()
  const porProducto = new Map()
  for (const m of movimientos) {
    const dias = (ahora - new Date(m.created_at).getTime()) / 86_400_000
    if (dias > VENTANA_LARGA) continue
    const acc = porProducto.get(m.product_id) || { largo: 0, corto: 0 }
    acc.largo += Math.abs(m.delta)
    if (dias <= VENTANA_CORTA) acc.corto += Math.abs(m.delta)
    porProducto.set(m.product_id, acc)
  }
  return porProducto
}

export const supabaseAdapter = {
  async getStockRows() {
    const supabase = await cliente()
    const [productos, ventas] = await Promise.all([
      supabase
        .from('products')
        .select('id, sku, name, category, unit_cost, ean, reorder_point, supplier_id, stock_levels (qty, last_sale_at)')
        .order('sku')
        .then(revisar),
      supabase
        .from('stock_moves')
        .select('product_id, delta, created_at')
        .eq('kind', 'venta')
        .then(revisar),
    ])

    const vel = velocidades(ventas)
    return productos.map((p) => {
      const v = vel.get(p.id) || { largo: 0, corto: 0 }
      return {
        ...aFilaDeStock(p),
        dailySalesAvg: v.largo / VENTANA_LARGA,
        dailySalesRecent: v.corto / VENTANA_CORTA,
      }
    })
  },

  async getStockByWarehouse() {
    const supabase = await cliente()
    const data = revisar(
      await supabase
        .from('stock_levels')
        .select('qty, last_sale_at, warehouse_id, warehouses (code, name), products (sku, name, category, unit_cost, ean, reorder_point)')
    )
    return data
      .filter((r) => r.products)
      .map((r) => ({
        sku: r.products.sku,
        name: r.products.name,
        category: r.products.category,
        unitCost: Number(r.products.unit_cost),
        ean: r.products.ean,
        reorder: r.products.reorder_point,
        warehouseId: r.warehouses?.code || r.warehouse_id,
        warehouseName: r.warehouses?.name || '',
        stock: r.qty,
        lastSaleAt: r.last_sale_at,
      }))
  },

  async getDemandSeries() {
    const supabase = await cliente()
    /* El SKU con más salidas es el que mejor representa la demanda
       del depósito; es también el que al usuario le importa mirar. */
    const ventas = revisar(
      await supabase
        .from('stock_moves')
        .select('product_id, delta, created_at, products (sku)')
        .eq('kind', 'venta')
        .order('created_at')
    )
    if (!ventas.length) return null

    const porSku = new Map()
    for (const m of ventas) {
      const sku = m.products?.sku
      if (!sku) continue
      if (!porSku.has(sku)) porSku.set(sku, [])
      porSku.get(sku).push(m)
    }
    const [sku, movimientos] = [...porSku.entries()]
      .sort((a, b) => b[1].length - a[1].length)[0]

    const porMes = new Map()
    for (const m of movimientos) {
      const mes = m.created_at.slice(0, 7)
      porMes.set(mes, (porMes.get(mes) || 0) + Math.abs(m.delta))
    }
    /* {t, v} es la forma que ya consumen DemandChart y
       compareDemandPeriods; el adaptador se adapta al contrato, no al
       revés. */
    const observed = [...porMes.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([t, v]) => ({ t, v }))

    /* Con menos de tres meses no hay tendencia que proyectar, y una
       proyección de dos puntos es una línea arbitraria disfrazada de
       pronóstico. Se devuelve lo observado y nada más. */
    if (observed.length < 3) return { sku, observed, forecast: [], confidence: null }

    const ventana = observed.slice(-3)
    const promedio = ventana.reduce((s, p) => s + p.v, 0) / ventana.length
    const pendiente = (ventana[2].v - ventana[0].v) / 2
    const ultimoMes = observed[observed.length - 1].t
    const forecast = [1, 2, 3].map((i) => {
      const d = new Date(`${ultimoMes}-01T00:00:00Z`)
      d.setUTCMonth(d.getUTCMonth() + i)
      return {
        t: d.toISOString().slice(0, 7),
        v: Math.max(0, Math.round(promedio + pendiente * i)),
      }
    })

    /* La confianza baja cuanto más dispersa es la serie: con pocos
       meses o mucha variación, decirlo es más honesto que un 94% fijo. */
    const media = observed.reduce((s, p) => s + p.v, 0) / observed.length
    const desvio = Math.sqrt(
      observed.reduce((s, p) => s + (p.v - media) ** 2, 0) / observed.length
    )
    const variacion = media === 0 ? 1 : desvio / media
    const confidence = Math.max(0.4, Math.min(0.95, 1 - variacion))

    return { sku, observed, forecast, confidence }
  },

  async createReplenishmentOrder(skus) {
    const supabase = await cliente()
    const usuario = await usuarioActual()
    const id = `OC-${Date.now().toString().slice(-6)}`
    revisar(
      await supabase.from('audit_events').insert({
        user_id: usuario.id,
        actor_name: usuario.user_metadata?.name || 'Sistema',
        action: 'Generó orden de compra',
        target: `${skus.length} SKU`,
        detail: id,
      })
    )
    return { id, skus, createdAt: new Date() }
  },

  async transferStock({ sku, fromWarehouseId, toWarehouseId, qty }) {
    const supabase = await cliente()
    const usuario = await usuarioActual()

    const depositos = revisar(
      await supabase.from('warehouses').select('id, code')
        .in('code', [fromWarehouseId, toWarehouseId])
    )
    const idDe = (code) => depositos.find((d) => d.code === code)?.id
    const origen = idDe(fromWarehouseId)
    const destino = idDe(toWarehouseId)
    if (!origen || !destino) throw new Error('No se encontró alguno de los depósitos.')

    const productos = await indicePorSku()
    const productId = productos.get(sku)
    if (!productId) throw new Error(`No se encontró el SKU ${sku}.`)

    const [nivelOrigen] = revisar(
      await supabase.from('stock_levels').select('id, qty')
        .eq('product_id', productId).eq('warehouse_id', origen)
    )
    if (!nivelOrigen || nivelOrigen.qty < qty) {
      throw new Error(`Stock insuficiente en ${fromWarehouseId} para transferir ${qty} unidades.`)
    }

    revisar(
      await supabase.from('stock_levels')
        .update({ qty: nivelOrigen.qty - qty }).eq('id', nivelOrigen.id)
    )

    const [nivelDestino] = revisar(
      await supabase.from('stock_levels').select('id, qty')
        .eq('product_id', productId).eq('warehouse_id', destino)
    )
    if (nivelDestino) {
      revisar(
        await supabase.from('stock_levels')
          .update({ qty: nivelDestino.qty + qty }).eq('id', nivelDestino.id)
      )
    } else {
      revisar(
        await supabase.from('stock_levels').insert({
          user_id: usuario.id, product_id: productId, warehouse_id: destino, qty,
        })
      )
    }

    revisar(
      await supabase.from('stock_moves').insert([
        { user_id: usuario.id, product_id: productId, warehouse_id: origen, delta: -qty, kind: 'transferencia' },
        { user_id: usuario.id, product_id: productId, warehouse_id: destino, delta: qty, kind: 'transferencia' },
      ])
    )
    revisar(
      await supabase.from('audit_events').insert({
        user_id: usuario.id,
        actor_name: usuario.user_metadata?.name || 'Sistema',
        action: 'Transferencia entre depósitos',
        target: sku,
        detail: `${qty} u. ${fromWarehouseId} → ${toWarehouseId}`,
      })
    )
    return { sku, fromWarehouseId, toWarehouseId, qty }
  },

  async setPhysicalCount(sku, counted) {
    const supabase = await cliente()
    const usuario = await usuarioActual()
    const productos = await indicePorSku()
    const productId = productos.get(sku)
    if (!productId) throw new Error(`No se encontró el SKU ${sku}.`)

    revisar(
      await supabase.from('physical_counts')
        .upsert({ user_id: usuario.id, product_id: productId, counted },
                { onConflict: 'user_id,product_id' })
    )
    return this.getPhysicalCounts()
  },

  async getPhysicalCounts() {
    const supabase = await cliente()
    const data = revisar(
      await supabase.from('physical_counts').select('counted, products (sku)')
    )
    return Object.fromEntries(
      data.filter((c) => c.products).map((c) => [c.products.sku, c.counted])
    )
  },

  async applyInventoryAdjustment(sku, warehouseId, newQty, reason) {
    const supabase = await cliente()
    const usuario = await usuarioActual()

    /* Mismo control que en el mock: el conteo se carga consolidado y
       el ajuste se asienta en un solo depósito, así que la diferencia
       puede superar lo que ese depósito tiene. Sin esto queda stock
       negativo, que después envenena KPIs, alertas y transferencias.
       La columna también lo rechaza (check qty >= 0), pero el mensaje
       de Postgres no le dice nada útil a quien está cargando. */
    if (!Number.isFinite(newQty) || newQty < 0) {
      throw new Error(
        `El ajuste dejaría el stock en ${newQty} u. Elegí el depósito donde ` +
          `realmente sobra o falta la diferencia, o cargá el conteo por depósito.`
      )
    }

    const productos = await indicePorSku()
    const productId = productos.get(sku)
    if (!productId) throw new Error(`No se encontró el SKU ${sku}.`)

    const [deposito] = revisar(
      await supabase.from('warehouses').select('id').eq('code', warehouseId)
    )
    if (!deposito) throw new Error('No se encontró ese depósito.')

    const [nivel] = revisar(
      await supabase.from('stock_levels').select('id, qty')
        .eq('product_id', productId).eq('warehouse_id', deposito.id)
    )
    if (!nivel) throw new Error('No se encontró el registro de stock para ese depósito.')

    const before = nivel.qty
    revisar(await supabase.from('stock_levels').update({ qty: newQty }).eq('id', nivel.id))
    revisar(
      await supabase.from('stock_moves').insert({
        user_id: usuario.id, product_id: productId, warehouse_id: deposito.id,
        delta: newQty - before, kind: 'ajuste', reason,
      })
    )
    revisar(
      await supabase.from('audit_events').insert({
        user_id: usuario.id,
        actor_name: usuario.user_metadata?.name || 'Sistema',
        action: 'Ajuste por conteo físico',
        target: sku,
        detail: `${before} → ${newQty} u.`,
        reason,
      })
    )
    revisar(
      await supabase.from('physical_counts').delete()
        .eq('product_id', productId).eq('user_id', usuario.id)
    )
    return { sku, before, after: newQty }
  },

  /* ── Altas: lo que el mock no necesitaba y una cuenta vacía sí ── */

  async createWarehouse({ code, name }) {
    const supabase = await cliente()
    const usuario = await usuarioActual()
    const [fila] = revisar(
      await supabase.from('warehouses')
        .insert({ user_id: usuario.id, code: code.trim(), name: name.trim() })
        .select()
    )
    return fila
  },

  async createSupplier({ name, leadTimeDays, frequency }) {
    const supabase = await cliente()
    const usuario = await usuarioActual()
    const [fila] = revisar(
      await supabase.from('suppliers')
        .insert({
          user_id: usuario.id,
          name: name.trim(),
          lead_time_days: Number(leadTimeDays) || 7,
          frequency: frequency || 'Mensual',
        })
        .select()
    )
    return fila
  },

  async createProduct({ sku, name, category, unitCost, ean, reorderPoint, warehouseCode, initialQty }) {
    const supabase = await cliente()
    const usuario = await usuarioActual()

    const [producto] = revisar(
      await supabase.from('products')
        .insert({
          user_id: usuario.id,
          sku: sku.trim(),
          name: name.trim(),
          category: category?.trim() || 'Sin categoría',
          unit_cost: Number(unitCost) || 0,
          ean: ean?.trim() || null,
          reorder_point: Number(reorderPoint) || 0,
        })
        .select()
    )

    const cantidad = Number(initialQty) || 0
    if (warehouseCode && cantidad > 0) {
      const [deposito] = revisar(
        await supabase.from('warehouses').select('id').eq('code', warehouseCode)
      )
      if (deposito) {
        revisar(
          await supabase.from('stock_levels').insert({
            user_id: usuario.id, product_id: producto.id,
            warehouse_id: deposito.id, qty: cantidad,
          })
        )
        revisar(
          await supabase.from('stock_moves').insert({
            user_id: usuario.id, product_id: producto.id,
            warehouse_id: deposito.id, delta: cantidad, kind: 'compra',
            reason: 'Carga inicial',
          })
        )
      }
    }

    revisar(
      await supabase.from('audit_events').insert({
        user_id: usuario.id,
        actor_name: usuario.user_metadata?.name || 'Sistema',
        action: 'Alta de producto',
        target: producto.sku,
        detail: cantidad > 0 ? `${cantidad} u. iniciales` : 'sin stock inicial',
      })
    )
    return producto
  },

  async getWarehouses() {
    const supabase = await cliente()
    const data = revisar(
      await supabase.from('warehouses').select('id, code, name').order('code')
    )
    return data.map((d) => ({ id: d.code, name: d.name }))
  },

  async getSuppliers() {
    const supabase = await cliente()
    const data = revisar(
      await supabase.from('suppliers')
        .select('id, name, lead_time_days, frequency, last_purchase_at').order('name')
    )
    return data.map((s) => ({
      id: s.id,
      name: s.name,
      leadTimeDays: s.lead_time_days,
      frequency: s.frequency,
      lastPurchaseAt: s.last_purchase_at,
    }))
  },

  async getAuditEvents() {
    const supabase = await cliente()
    const data = revisar(
      await supabase.from('audit_events')
        .select('id, actor_name, action, target, detail, reason, created_at')
        .order('created_at', { ascending: false })
        .limit(200)
    )
    return data.map((e) => ({
      id: e.id,
      user: e.actor_name,
      action: e.action,
      target: e.target,
      detail: e.detail,
      reason: e.reason,
      at: new Date(e.created_at),
    }))
  },
}
