import { useEffect, useState } from 'react'
import { PackagePlus, Warehouse } from 'lucide-react'
import { inventoryService, WAREHOUSES } from '../../data/inventory'
import BarcodeScanner from './BarcodeScanner'
import ImportPanel from './ImportPanel'
import { useAuth } from '../../contexts/AuthContext'
import { can } from '../../lib/permissions'

/* ═══════════════════════════════════════════════════════════════
   ALTA DE PRODUCTOS

   El panel sabía leer un inventario y operarlo, pero no crearlo: con
   el mock los productos venían dados. Una cuenta real arranca vacía,
   así que sin esta pantalla no hay forma de empezar.

   El primer depósito también se da de alta acá: sin ninguno, un
   producto no tiene dónde apoyar su stock y el alta quedaría a medias.
   ═══════════════════════════════════════════════════════════════ */

const CATEGORIAS = ['Periféricos', 'Pantallas', 'Componentes', 'Accesorios']

function Campo({ id, label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="t-label">{label}</label>
      {children}
      {hint && <p className="t-mono text-[10px] text-muted">{hint}</p>}
    </div>
  )
}

const inputCls =
  'min-h-[42px] px-3 text-[14px] border bg-[var(--surface)] text-ink outline-none ' +
  'focus-visible:border-[var(--accent)] transition-colors'
const inputStyle = { borderColor: 'var(--rule-strong)', borderRadius: '2px' }

export default function NewProductPanel() {
  const { user } = useAuth()
  const puedeCargar = can(user?.role, 'adjust')

  const [depositos, setDepositos] = useState(WAREHOUSES)
  const [aceptaAltas, setAceptaAltas] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [ok, setOk] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    sku: '', name: '', category: CATEGORIAS[0], unitCost: '',
    ean: '', reorderPoint: '', warehouseCode: '', initialQty: '',
  })
  const [nuevoDeposito, setNuevoDeposito] = useState({ code: '', name: '' })

  useEffect(() => {
    let vivo = true
    inventoryService.aceptaAltas().then((v) => vivo && setAceptaAltas(v))
    inventoryService.getWarehouses?.().then((w) => {
      if (vivo && w?.length) setDepositos(w)
    }).catch(() => {})
    return () => { vivo = false }
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function guardarDeposito(e) {
    e.preventDefault()
    setError(''); setOk('')
    if (!nuevoDeposito.code.trim() || !nuevoDeposito.name.trim()) {
      setError('El depósito necesita código y nombre.')
      return
    }
    setEnviando(true)
    try {
      await inventoryService.createWarehouse(nuevoDeposito)
      const w = await inventoryService.getWarehouses()
      setDepositos(w)
      setForm((f) => ({ ...f, warehouseCode: nuevoDeposito.code.trim() }))
      setNuevoDeposito({ code: '', name: '' })
      setOk(`Depósito ${nuevoDeposito.code.trim()} creado.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  async function guardarProducto(e) {
    e.preventDefault()
    setError(''); setOk('')

    if (!form.sku.trim() || !form.name.trim()) {
      setError('El SKU y el nombre son obligatorios.')
      return
    }
    const costo = Number(form.unitCost)
    const punto = Number(form.reorderPoint)
    const cantidad = form.initialQty === '' ? 0 : Number(form.initialQty)
    if (!Number.isFinite(costo) || costo < 0) {
      setError('El costo unitario tiene que ser un número de cero para arriba.')
      return
    }
    if (!Number.isFinite(punto) || punto < 0) {
      setError('El punto de reposición tiene que ser un número de cero para arriba.')
      return
    }
    if (!Number.isFinite(cantidad) || cantidad < 0) {
      setError('La cantidad inicial tiene que ser un número de cero para arriba.')
      return
    }
    if (cantidad > 0 && !form.warehouseCode) {
      setError('Elegí en qué depósito entra ese stock inicial.')
      return
    }

    setEnviando(true)
    try {
      await inventoryService.createProduct({ ...form, unitCost: costo, reorderPoint: punto, initialQty: cantidad })
      setOk(`${form.sku.trim()} cargado. Ya aparece en el inventario.`)
      setForm({
        sku: '', name: '', category: form.category, unitCost: '',
        ean: '', reorderPoint: '', warehouseCode: form.warehouseCode, initialQty: '',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (!puedeCargar) {
    return (
      <div className="panel p-6">
        <h2 className="t-h3 mb-1.5">Alta de productos</h2>
        <p className="text-[13px] text-graphite">
          Tu rol es de consulta: podés ver el inventario pero no cargarlo.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {aceptaAltas !== false && <ImportPanel onImportado={() => setOk('Catálogo importado.')} />}

      {aceptaAltas === false && (
        <div className="panel p-4" style={{ borderColor: 'var(--warning)' }}>
          <p className="text-[13px] text-graphite leading-snug">
            <span className="font-medium text-ink">Estás viendo el depósito de ejemplo.</span>{' '}
            Para cargar tu propio inventario, corré{' '}
            <span className="t-mono text-[12px]">supabase/schema.sql</span> en el SQL
            Editor de tu proyecto de Supabase y recargá esta página.
          </p>
        </div>
      )}

      <section className="panel p-6">
        <h2 className="t-h3 mb-1.5 flex items-center gap-2">
          <PackagePlus className="w-4 h-4" style={{ color: 'var(--accent)' }} aria-hidden="true" />
          Cargar un producto
        </h2>
        <p className="text-[13px] text-graphite mb-5 max-w-[62ch]">
          El punto de reposición es el umbral que dispara las alertas y las
          recomendaciones de compra. El costo unitario alimenta el capital
          inmovilizado y la valorización del depósito.
        </p>

        <form onSubmit={guardarProducto} className="grid gap-4 sm:grid-cols-2 max-w-[760px]">
          <Campo id="np-sku" label="SKU" hint="Único por cuenta">
            <input id="np-sku" className={inputCls} style={inputStyle}
              value={form.sku} onChange={set('sku')} placeholder="MB-1180" required />
          </Campo>

          <Campo id="np-name" label="Producto">
            <input id="np-name" className={inputCls} style={inputStyle}
              value={form.name} onChange={set('name')} placeholder='Monitor 24" IPS' required />
          </Campo>

          <Campo id="np-cat" label="Categoría">
            <select id="np-cat" className={inputCls} style={inputStyle}
              value={form.category} onChange={set('category')}>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Campo>

          <Campo id="np-ean" label="EAN" hint="Opcional — habilita el match por código">
            <div className="flex gap-2">
              <input id="np-ean" className={inputCls} style={inputStyle}
                value={form.ean} onChange={set('ean')} placeholder="8806091234567" />
              <BarcodeScanner
                label="Escanear"
                onLeido={(codigo) => setForm((f) => ({ ...f, ean: codigo }))}
              />
            </div>
          </Campo>

          <Campo id="np-cost" label="Costo unitario (USD)">
            <input id="np-cost" type="number" min="0" step="0.01" className={inputCls} style={inputStyle}
              value={form.unitCost} onChange={set('unitCost')} placeholder="190" required />
          </Campo>

          <Campo id="np-reorder" label="Punto de reposición" hint="Dispara alertas por debajo de este número">
            <input id="np-reorder" type="number" min="0" step="1" className={inputCls} style={inputStyle}
              value={form.reorderPoint} onChange={set('reorderPoint')} placeholder="45" required />
          </Campo>

          <Campo id="np-wh" label="Depósito">
            <select id="np-wh" className={inputCls} style={inputStyle}
              value={form.warehouseCode} onChange={set('warehouseCode')}>
              <option value="">Sin asignar</option>
              {depositos.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </Campo>

          <Campo id="np-qty" label="Stock inicial" hint="Dejalo en cero si todavía no entró mercadería">
            <input id="np-qty" type="number" min="0" step="1" className={inputCls} style={inputStyle}
              value={form.initialQty} onChange={set('initialQty')} placeholder="0" />
          </Campo>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-4 pt-1">
            <button type="submit" disabled={enviando || aceptaAltas === false}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 text-[14px] font-medium disabled:opacity-45"
              style={{ background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: '2px' }}>
              {enviando ? 'Guardando…' : 'Cargar producto'}
            </button>
            {ok && <p className="text-[13px]" style={{ color: 'var(--positive)' }}>{ok}</p>}
            {error && <p className="text-[13px]" style={{ color: 'var(--alert)' }}>{error}</p>}
          </div>
        </form>
      </section>

      <section className="panel p-6">
        <h2 className="t-h3 mb-1.5 flex items-center gap-2">
          <Warehouse className="w-4 h-4" style={{ color: 'var(--accent)' }} aria-hidden="true" />
          Agregar un depósito
        </h2>
        <p className="text-[13px] text-graphite mb-5 max-w-[62ch]">
          El stock vive por depósito, no por producto: hace falta al menos uno
          antes de cargar mercadería, y tener varios es lo que habilita las
          transferencias.
        </p>

        <form onSubmit={guardarDeposito} className="grid gap-4 sm:grid-cols-2 max-w-[560px]">
          <Campo id="nw-code" label="Código" hint="Corto: DC, SUR, EXT">
            <input id="nw-code" className={inputCls} style={inputStyle}
              value={nuevoDeposito.code}
              onChange={(e) => setNuevoDeposito((d) => ({ ...d, code: e.target.value }))}
              placeholder="DC" />
          </Campo>
          <Campo id="nw-name" label="Nombre">
            <input id="nw-name" className={inputCls} style={inputStyle}
              value={nuevoDeposito.name}
              onChange={(e) => setNuevoDeposito((d) => ({ ...d, name: e.target.value }))}
              placeholder="Depósito central" />
          </Campo>
          <div className="sm:col-span-2">
            <button type="submit" disabled={enviando || aceptaAltas === false}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 text-[14px] font-medium border disabled:opacity-45"
              style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px' }}>
              Crear depósito
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
