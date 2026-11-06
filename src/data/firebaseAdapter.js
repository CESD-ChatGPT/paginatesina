/* ═══════════════════════════════════════════════════════════════
   ADAPTADOR FIRESTORE

   Implementa la misma interfaz que el resto de los adaptadores. La
   UI no sabe cuál está atendiendo.

   DOS COSAS QUE EL ESQUEMA ANTERIOR NO TENÍA

   · `costoUnitario` en cada producto y en cada movimiento. El costo
     del producto es el actual; el del movimiento es el que regía
     cuando entró la mercadería. Guardar los dos permite valorizar
     el stock a costo histórico y no reescribir el pasado cada vez
     que cambia una lista de precios.

   · `movimientos` como registro de todo lo que entra y sale. Sin
     esto el sistema sabe cuánto hay pero no qué pasó, y entonces no
     hay pronóstico, ni rotación, ni forma de auditar una diferencia
     de conteo. Los saldos de `stock` se derivan de acá.

   El aislamiento es estructural: todo cuelga de `usuarios/{uid}`,
   así que un documento de otra cuenta ni siquiera está en una ruta
   a la que se pueda apuntar. Las reglas están en firestore.rules.
   ═══════════════════════════════════════════════════════════════ */

import { getFirebase } from '../lib/firebase'

export class SinSesionError extends Error {
  constructor() {
    super('No hay sesión activa.')
    this.name = 'SinSesionError'
  }
}

async function ctx() {
  const fb = await getFirebase()
  if (!fb) throw new Error('Firebase no está configurado.')
  /* authStateReady espera a que Firebase termine de leer IndexedDB.
     Sin esto, currentUser es null durante los primeros milisegundos
     aunque la sesión exista, y la capa de datos concluía "no hay
     sesión" justo después de un login exitoso. */
  await fb.auth.authStateReady()
  const uid = fb.auth.currentUser?.uid
  if (!uid) throw new SinSesionError()
  return { ...fb, uid }
}

/* Atajos sobre el SDK modular, que pide pasar las funciones sueltas
   y vuelve ilegible cada consulta si se repite en todos lados. */
function col(fb, uid, nombre) {
  return fb.sdkDb.collection(fb.db, 'usuarios', uid, nombre)
}
function doc(fb, uid, nombre, id) {
  return fb.sdkDb.doc(fb.db, 'usuarios', uid, nombre, id)
}
async function todos(fb, ref) {
  const snap = await fb.sdkDb.getDocs(ref)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

const VENTANA_LARGA = 90
const VENTANA_CORTA = 14

function aFecha(valor) {
  if (!valor) return null
  if (typeof valor.toDate === 'function') return valor.toDate()
  return new Date(valor)
}

function diasDesde(fecha) {
  if (!fecha) return null
  return Math.floor((Date.now() - fecha.getTime()) / 86_400_000)
}

export const firebaseAdapter = {
  async getStockRows() {
    const fb = await ctx()
    const [productos, stock, movimientos] = await Promise.all([
      todos(fb, col(fb, fb.uid, 'productos')),
      todos(fb, col(fb, fb.uid, 'stock')),
      todos(fb, col(fb, fb.uid, 'movimientos')),
    ])

    /* Velocidad de venta sobre movimientos reales: compara los
       últimos 14 días contra los últimos 90 para distinguir
       "siempre se vendió poco" de "se aceleró esta semana". */
    const ahora = Date.now()
    const vel = new Map()
    for (const m of movimientos) {
      if (m.tipo !== 'venta') continue
      const fecha = aFecha(m.creadoEn)
      if (!fecha) continue
      const dias = (ahora - fecha.getTime()) / 86_400_000
      if (dias > VENTANA_LARGA) continue
      const acc = vel.get(m.productoId) || { largo: 0, corto: 0, ultima: null }
      acc.largo += Math.abs(m.delta)
      if (dias <= VENTANA_CORTA) acc.corto += Math.abs(m.delta)
      if (!acc.ultima || fecha > acc.ultima) acc.ultima = fecha
      vel.set(m.productoId, acc)
    }

    const porProducto = new Map()
    for (const s of stock) {
      const acc = porProducto.get(s.productoId) || 0
      porProducto.set(s.productoId, acc + (Number(s.cantidad) || 0))
    }

    return productos.map((p) => {
      const v = vel.get(p.id) || { largo: 0, corto: 0, ultima: null }
      const costo = Number(p.costoUnitario)
      return {
        id: p.id,
        sku: p.sku,
        name: p.nombre,
        category: p.categoria || 'Sin categoría',
        /* null y no cero cuando falta: cero es un número y se suma. */
        unitCost: Number.isFinite(costo) ? costo : null,
        ean: p.ean || null,
        reorder: Number(p.puntoReposicion) || 0,
        unit: p.unidad || 'Unidad',
        supplierId: p.proveedorId || null,
        stock: porProducto.get(p.id) || 0,
        lastSaleAt: v.ultima ? v.ultima.toISOString().slice(0, 10) : null,
        daysSinceLastSale: diasDesde(v.ultima),
        dailySalesAvg: v.largo / VENTANA_LARGA,
        dailySalesRecent: v.corto / VENTANA_CORTA,
      }
    })
  },

  async getStockByWarehouse() {
    const fb = await ctx()
    const [productos, depositos, stock] = await Promise.all([
      todos(fb, col(fb, fb.uid, 'productos')),
      todos(fb, col(fb, fb.uid, 'depositos')),
      todos(fb, col(fb, fb.uid, 'stock')),
    ])
    const porId = new Map(productos.map((p) => [p.id, p]))
    const depPorId = new Map(depositos.map((d) => [d.id, d]))

    return stock
      .filter((s) => porId.has(s.productoId))
      .map((s) => {
        const p = porId.get(s.productoId)
        const d = depPorId.get(s.depositoId)
        const costo = Number(p.costoUnitario)
        return {
          sku: p.sku,
          name: p.nombre,
          category: p.categoria || 'Sin categoría',
          unitCost: Number.isFinite(costo) ? costo : null,
          reorder: Number(p.puntoReposicion) || 0,
          warehouseId: d?.codigo || s.depositoId,
          warehouseName: d?.nombre || '',
          stock: Number(s.cantidad) || 0,
          lastSaleAt: s.ultimaVentaEn || null,
        }
      })
  },

  async getDemandSeries() {
    const fb = await ctx()
    const [productos, movimientos] = await Promise.all([
      todos(fb, col(fb, fb.uid, 'productos')),
      todos(fb, col(fb, fb.uid, 'movimientos')),
    ])
    const ventas = movimientos.filter((m) => m.tipo === 'venta')
    if (!ventas.length) return null

    const porProducto = new Map()
    for (const m of ventas) {
      if (!porProducto.has(m.productoId)) porProducto.set(m.productoId, [])
      porProducto.get(m.productoId).push(m)
    }
    /* El SKU con más salidas representa mejor la demanda del
       depósito, y es el que al usuario le importa mirar. */
    const [productoId, lista] = [...porProducto.entries()]
      .sort((a, b) => b[1].length - a[1].length)[0]
    const sku = productos.find((p) => p.id === productoId)?.sku ?? null

    const porMes = new Map()
    for (const m of lista) {
      const fecha = aFecha(m.creadoEn)
      if (!fecha) continue
      const mes = fecha.toISOString().slice(0, 7)
      porMes.set(mes, (porMes.get(mes) || 0) + Math.abs(m.delta))
    }
    const observed = [...porMes.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([t, v]) => ({ t, v }))

    /* Con menos de tres meses no hay tendencia: una proyección de
       dos puntos es una recta arbitraria disfrazada de pronóstico. */
    if (observed.length < 3) return { sku, observed, forecast: [], confidence: null }

    const ventana = observed.slice(-3)
    const promedio = ventana.reduce((s, p) => s + p.v, 0) / ventana.length
    const pendiente = (ventana[2].v - ventana[0].v) / 2
    const ultimo = observed[observed.length - 1].t
    const forecast = [1, 2, 3].map((i) => {
      const d = new Date(`${ultimo}-01T00:00:00Z`)
      d.setUTCMonth(d.getUTCMonth() + i)
      return { t: d.toISOString().slice(0, 7), v: Math.max(0, Math.round(promedio + pendiente * i)) }
    })

    const media = observed.reduce((s, p) => s + p.v, 0) / observed.length
    const desvio = Math.sqrt(observed.reduce((s, p) => s + (p.v - media) ** 2, 0) / observed.length)
    const variacion = media === 0 ? 1 : desvio / media
    return { sku, observed, forecast, confidence: Math.max(0.4, Math.min(0.95, 1 - variacion)) }
  },

  /* ── Movimientos: el registro que antes no existía ──────────── */

  async registrarMovimiento({ sku, depositoCodigo, delta, tipo, motivo, costoUnitario }) {
    const fb = await ctx()
    const cantidad = Number(delta)
    if (!Number.isFinite(cantidad) || cantidad === 0) {
      throw new Error('El movimiento necesita una cantidad distinta de cero.')
    }

    const productos = await todos(fb, col(fb, fb.uid, 'productos'))
    const producto = productos.find((p) => p.sku === sku)
    if (!producto) throw new Error(`No se encontró el SKU ${sku}.`)

    const depositos = await todos(fb, col(fb, fb.uid, 'depositos'))
    const deposito = depositos.find((d) => d.codigo === depositoCodigo)
    if (!deposito) throw new Error(`No se encontró el depósito ${depositoCodigo}.`)

    const idStock = `${producto.id}_${deposito.id}`
    const refStock = doc(fb, fb.uid, 'stock', idStock)
    const snap = await fb.sdkDb.getDoc(refStock)
    const actual = snap.exists() ? Number(snap.data().cantidad) || 0 : 0
    const siguiente = actual + cantidad

    /* El stock negativo envenena los KPI, las alertas y las órdenes
       sugeridas de toda la sesión, así que se corta acá. */
    if (siguiente < 0) {
      throw new Error(
        `No alcanza el stock: hay ${actual} ${producto.unidad || 'u.'} de ${producto.sku} ` +
          `en ${depositoCodigo} y el movimiento pide ${Math.abs(cantidad)}.`
      )
    }

    const ahora = new Date()
    await fb.sdkDb.setDoc(
      refStock,
      {
        productoId: producto.id,
        depositoId: deposito.id,
        cantidad: siguiente,
        ...(tipo === 'venta' ? { ultimaVentaEn: ahora.toISOString().slice(0, 10) } : {}),
      },
      { merge: true }
    )

    /* El costo del movimiento es el que regía cuando entró, no el
       actual: permite valorizar a costo histórico sin reescribir el
       pasado cuando cambia una lista de precios. */
    await fb.sdkDb.addDoc(col(fb, fb.uid, 'movimientos'), {
      productoId: producto.id,
      depositoId: deposito.id,
      delta: cantidad,
      tipo,
      motivo: motivo || null,
      costoUnitario: Number.isFinite(Number(costoUnitario))
        ? Number(costoUnitario)
        : Number(producto.costoUnitario) || null,
      creadoEn: ahora.toISOString(),
      actor: fb.auth.currentUser?.displayName || fb.auth.currentUser?.email || 'Sistema',
    })

    await this.registrarAuditoria({
      accion: tipo === 'venta' ? 'Salida registrada' : tipo === 'compra' ? 'Entrada registrada' : 'Ajuste de stock',
      objetivo: producto.sku,
      detalle: `${actual} → ${siguiente} ${producto.unidad || 'u.'} en ${depositoCodigo}`,
      motivo,
    })

    return { sku, antes: actual, despues: siguiente }
  },

  async getMovimientos(limite = 100) {
    const fb = await ctx()
    const [productos, movimientos, depositos] = await Promise.all([
      todos(fb, col(fb, fb.uid, 'productos')),
      todos(fb, col(fb, fb.uid, 'movimientos')),
      todos(fb, col(fb, fb.uid, 'depositos')),
    ])
    const pId = new Map(productos.map((p) => [p.id, p]))
    const dId = new Map(depositos.map((d) => [d.id, d]))
    return movimientos
      .map((m) => ({
        id: m.id,
        sku: pId.get(m.productoId)?.sku ?? '—',
        producto: pId.get(m.productoId)?.nombre ?? '—',
        deposito: dId.get(m.depositoId)?.codigo ?? '—',
        delta: m.delta,
        tipo: m.tipo,
        motivo: m.motivo,
        costoUnitario: m.costoUnitario,
        at: aFecha(m.creadoEn),
        actor: m.actor,
      }))
      .sort((a, b) => (b.at?.getTime() ?? 0) - (a.at?.getTime() ?? 0))
      .slice(0, limite)
  },

  async registrarAuditoria({ accion, objetivo, detalle, motivo }) {
    const fb = await ctx()
    await fb.sdkDb.addDoc(col(fb, fb.uid, 'auditoria'), {
      actor: fb.auth.currentUser?.displayName || fb.auth.currentUser?.email || 'Sistema',
      accion,
      objetivo: objetivo || null,
      detalle: detalle || null,
      motivo: motivo || null,
      creadoEn: new Date().toISOString(),
    })
  },

  async getAuditEvents(limite = 200) {
    const fb = await ctx()
    const filas = await todos(fb, col(fb, fb.uid, 'auditoria'))
    return filas
      .map((e) => ({
        id: e.id,
        user: e.actor,
        action: e.accion,
        target: e.objetivo,
        detail: e.detalle,
        reason: e.motivo,
        at: aFecha(e.creadoEn),
      }))
      .sort((a, b) => (b.at?.getTime() ?? 0) - (a.at?.getTime() ?? 0))
      .slice(0, limite)
  },

  /* ── Operaciones del panel ──────────────────────────────────── */

  async createReplenishmentOrder(skus) {
    const id = `OC-${Date.now().toString().slice(-6)}`
    await this.registrarAuditoria({
      accion: 'Generó orden de compra',
      objetivo: `${skus.length} SKU`,
      detalle: id,
    })
    return { id, skus, createdAt: new Date() }
  },

  async transferStock({ sku, fromWarehouseId, toWarehouseId, qty }) {
    const cantidad = Number(qty)
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      throw new Error('La transferencia necesita una cantidad mayor que cero.')
    }
    await this.registrarMovimiento({
      sku, depositoCodigo: fromWarehouseId, delta: -cantidad,
      tipo: 'transferencia', motivo: `Hacia ${toWarehouseId}`,
    })
    await this.registrarMovimiento({
      sku, depositoCodigo: toWarehouseId, delta: cantidad,
      tipo: 'transferencia', motivo: `Desde ${fromWarehouseId}`,
    })
    return { sku, fromWarehouseId, toWarehouseId, qty: cantidad }
  },

  async setPhysicalCount(sku, counted) {
    const fb = await ctx()
    const productos = await todos(fb, col(fb, fb.uid, 'productos'))
    const producto = productos.find((p) => p.sku === sku)
    if (!producto) throw new Error(`No se encontró el SKU ${sku}.`)
    await fb.sdkDb.setDoc(doc(fb, fb.uid, 'conteos', producto.id), {
      productoId: producto.id,
      contado: Number(counted) || 0,
      creadoEn: new Date().toISOString(),
    })
    return this.getPhysicalCounts()
  },

  async getPhysicalCounts() {
    const fb = await ctx()
    const [productos, conteos] = await Promise.all([
      todos(fb, col(fb, fb.uid, 'productos')),
      todos(fb, col(fb, fb.uid, 'conteos')),
    ])
    const pId = new Map(productos.map((p) => [p.id, p]))
    return Object.fromEntries(
      conteos.filter((c) => pId.has(c.productoId)).map((c) => [pId.get(c.productoId).sku, c.contado])
    )
  },

  async applyInventoryAdjustment(sku, warehouseId, newQty, reason) {
    const fb = await ctx()
    const objetivo = Number(newQty)
    if (!Number.isFinite(objetivo) || objetivo < 0) {
      throw new Error(`El ajuste dejaría el stock en ${newQty} u., y no puede ser negativo.`)
    }

    const [productos, depositos] = await Promise.all([
      todos(fb, col(fb, fb.uid, 'productos')),
      todos(fb, col(fb, fb.uid, 'depositos')),
    ])
    const producto = productos.find((p) => p.sku === sku)
    const deposito = depositos.find((d) => d.codigo === warehouseId)
    if (!producto || !deposito) throw new Error('No se encontró el producto o el depósito.')

    const refStock = doc(fb, fb.uid, 'stock', `${producto.id}_${deposito.id}`)
    const snap = await fb.sdkDb.getDoc(refStock)
    const antes = snap.exists() ? Number(snap.data().cantidad) || 0 : 0

    /* Se asienta como movimiento y no como una escritura directa:
       un ajuste es un hecho con autor y motivo, y tiene que quedar
       en el registro como cualquier otro. */
    if (objetivo !== antes) {
      await this.registrarMovimiento({
        sku, depositoCodigo: warehouseId, delta: objetivo - antes,
        tipo: 'ajuste', motivo: reason,
      })
    }

    const conteos = await todos(fb, col(fb, fb.uid, 'conteos'))
    const conteo = conteos.find((c) => c.productoId === producto.id)
    if (conteo) await fb.sdkDb.deleteDoc(doc(fb, fb.uid, 'conteos', conteo.id))

    return { sku, before: antes, after: objetivo }
  },

  /* ── Altas ──────────────────────────────────────────────────── */

  async createProduct({ sku, name, category, unitCost, ean, reorderPoint, warehouseCode, initialQty, unidad }) {
    const fb = await ctx()
    const limpio = String(sku).trim()
    const productos = await todos(fb, col(fb, fb.uid, 'productos'))
    if (productos.some((p) => p.sku === limpio)) {
      throw new Error(`Ya existe un producto con el SKU ${limpio}.`)
    }

    const costo = Number(unitCost)
    const ref = await fb.sdkDb.addDoc(col(fb, fb.uid, 'productos'), {
      sku: limpio,
      nombre: String(name).trim(),
      categoria: String(category || '').trim() || 'Sin categoría',
      costoUnitario: Number.isFinite(costo) ? costo : null,
      ean: String(ean || '').trim() || null,
      puntoReposicion: Number(reorderPoint) || 0,
      unidad: unidad || 'Unidad',
      creadoEn: new Date().toISOString(),
    })

    const cantidad = Number(initialQty) || 0
    if (warehouseCode && cantidad > 0) {
      await this.registrarMovimiento({
        sku: limpio, depositoCodigo: warehouseCode, delta: cantidad,
        tipo: 'compra', motivo: 'Carga inicial', costoUnitario: costo,
      })
    } else {
      await this.registrarAuditoria({
        accion: 'Alta de producto', objetivo: limpio, detalle: 'sin stock inicial',
      })
    }
    return { id: ref.id, sku: limpio }
  },

  async createWarehouse({ code, name }) {
    const fb = await ctx()
    const limpio = String(code).trim()
    const depositos = await todos(fb, col(fb, fb.uid, 'depositos'))
    if (depositos.some((d) => d.codigo === limpio)) {
      throw new Error(`Ya existe un depósito con el código ${limpio}.`)
    }
    const ref = await fb.sdkDb.addDoc(col(fb, fb.uid, 'depositos'), {
      codigo: limpio,
      nombre: String(name).trim(),
      creadoEn: new Date().toISOString(),
    })
    return { id: ref.id, code: limpio, name }
  },

  async createSupplier({ name, leadTimeDays, frequency }) {
    const fb = await ctx()
    const ref = await fb.sdkDb.addDoc(col(fb, fb.uid, 'proveedores'), {
      nombre: String(name).trim(),
      leadTimeDias: Number(leadTimeDays) || 7,
      frecuencia: frequency || 'Mensual',
      creadoEn: new Date().toISOString(),
    })
    return { id: ref.id, name }
  },

  async getWarehouses() {
    const fb = await ctx()
    const filas = await todos(fb, col(fb, fb.uid, 'depositos'))
    return filas
      .map((d) => ({ id: d.codigo, name: d.nombre }))
      .sort((a, b) => a.id.localeCompare(b.id))
  },

  async getSuppliers() {
    const fb = await ctx()
    const filas = await todos(fb, col(fb, fb.uid, 'proveedores'))
    return filas.map((s) => ({
      id: s.id,
      name: s.nombre,
      leadTimeDays: s.leadTimeDias,
      frequency: s.frecuencia,
    }))
  },
}
