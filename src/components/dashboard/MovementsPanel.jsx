import { useEffect, useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal } from 'lucide-react'
import { inventoryService } from '../../data/inventory'
import { useAuth } from '../../contexts/AuthContext'
import { can } from '../../lib/permissions'
import { LoadingBlock, EmptyBlock } from '../States'

/* ═══════════════════════════════════════════════════════════════
   MOVIMIENTOS — entradas y salidas

   El panel sabía cuánto había pero no qué pasó. Sin este registro no
   hay pronóstico de demanda, ni rotación, ni forma de auditar una
   diferencia de conteo: todo eso se calcula sobre movimientos, no
   sobre saldos.

   Tres tipos, y la diferencia importa:
     · compra  → entra mercadería (suma)
     · venta   → sale vendida (resta, y alimenta la demanda)
     · ajuste  → corrección sin contraparte comercial

   Un ajuste no es una venta aunque las dos resten. Si se mezclan, el
   pronóstico empieza a contar roturas y robos como demanda.
   ═══════════════════════════════════════════════════════════════ */

const TIPOS = [
  { id: 'compra', label: 'Entrada', signo: 1, Icon: ArrowDownToLine, ayuda: 'Llegó mercadería del proveedor.' },
  { id: 'venta', label: 'Salida', signo: -1, Icon: ArrowUpFromLine, ayuda: 'Se vendió o se despachó. Alimenta el pronóstico.' },
  { id: 'ajuste', label: 'Ajuste', signo: 0, Icon: SlidersHorizontal, ayuda: 'Corrección: rotura, merma, error de carga.' },
]

const inputCls =
  'min-h-[42px] px-3 text-[14px] border bg-[var(--surface)] text-ink outline-none ' +
  'focus-visible:border-[var(--accent)] transition-colors w-full'
const inputStyle = { borderColor: 'var(--rule-strong)', borderRadius: '2px' }

function Campo({ id, label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <label htmlFor={id} className="t-label">{label}</label>
      {children}
      {hint && <p className="t-mono text-[10px] text-muted">{hint}</p>}
    </div>
  )
}

export default function MovementsPanel() {
  const { user } = useAuth()
  const puedeOperar = can(user?.role, 'adjust')

  const [soportado, setSoportado] = useState(null)
  const [productos, setProductos] = useState([])
  const [depositos, setDepositos] = useState([])
  const [historial, setHistorial] = useState(null)

  const [tipo, setTipo] = useState('compra')
  const [sku, setSku] = useState('')
  const [deposito, setDeposito] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [ok, setOk] = useState('')
  const [error, setError] = useState('')

  async function refrescar() {
    const [filas, movs] = await Promise.all([
      inventoryService.getStockRows().catch(() => []),
      inventoryService.getMovimientos(60).catch(() => []),
    ])
    setProductos(filas)
    setHistorial(movs)
  }

  useEffect(() => {
    let vivo = true
    inventoryService.registraMovimientos().then((v) => vivo && setSoportado(v))
    inventoryService.getWarehouses().then((w) => vivo && setDepositos(w)).catch(() => {})
    refrescar()
    return () => { vivo = false }
  }, [])

  const tipoActivo = TIPOS.find((t) => t.id === tipo)

  async function registrar(e) {
    e.preventDefault()
    setError(''); setOk('')

    const n = Number(cantidad)
    if (!sku) return setError('Elegí el producto.')
    if (!deposito) return setError('Elegí el depósito.')
    if (!Number.isFinite(n) || n === 0) return setError('La cantidad tiene que ser distinta de cero.')
    if (tipo !== 'ajuste' && n < 0) return setError('Poné la cantidad en positivo; el signo lo pone el tipo de movimiento.')

    /* En entrada y salida el signo lo decide el tipo, no el usuario:
       escribir «-5» en una salida restaría dos veces. En ajuste sí se
       permite el signo, porque puede corregir para cualquier lado. */
    const delta = tipo === 'ajuste' ? n : n * tipoActivo.signo

    setEnviando(true)
    try {
      const r = await inventoryService.registrarMovimiento({
        sku, depositoCodigo: deposito, delta, tipo, motivo: motivo.trim() || null,
      })
      setOk(`${sku}: ${r.antes} → ${r.despues} en ${deposito}.`)
      setCantidad(''); setMotivo('')
      await refrescar()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (!puedeOperar) {
    return (
      <div className="panel p-6">
        <h2 className="t-h3 mb-1.5">Movimientos</h2>
        <p className="text-[13px] text-graphite">
          Tu rol es de consulta: podés ver el historial pero no registrar movimientos.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {soportado === false && (
        <div className="panel p-4" style={{ borderColor: 'var(--warning)' }}>
          <p className="text-[13px] text-graphite leading-snug">
            <span className="font-medium text-ink">El depósito de ejemplo no registra movimientos.</span>{' '}
            Conectá Firebase para llevar el histórico de entradas y salidas.
          </p>
        </div>
      )}

      <section className="panel p-6">
        <h2 className="t-h3 mb-1.5">Registrar un movimiento</h2>
        <p className="text-[13px] text-graphite mb-5 max-w-[62ch]">
          Cada entrada y salida queda asentada con autor, fecha y motivo. Es lo
          que alimenta el pronóstico de demanda y lo que permite explicar
          después una diferencia de conteo.
        </p>

        <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Tipo de movimiento">
          {TIPOS.map((t) => {
            const activo = t.id === tipo
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipo(t.id)}
                aria-pressed={activo}
                className="inline-flex items-center gap-2 min-h-[40px] px-4 text-[13px] font-medium border transition-colors"
                style={{
                  borderRadius: '2px',
                  borderColor: activo ? 'var(--accent)' : 'var(--rule-strong)',
                  background: activo ? 'var(--accent)' : 'transparent',
                  color: activo ? 'var(--accent-ink)' : 'var(--ink)',
                }}
              >
                <t.Icon className="w-4 h-4" aria-hidden="true" />
                {t.label}
              </button>
            )
          })}
        </div>
        <p className="t-mono text-[11px] text-muted mb-5">{tipoActivo.ayuda}</p>

        <form onSubmit={registrar} className="grid gap-4 sm:grid-cols-2 max-w-[760px]">
          <Campo id="mv-sku" label="Producto">
            <select id="mv-sku" className={inputCls} style={inputStyle}
              value={sku} onChange={(e) => setSku(e.target.value)}>
              <option value="">Seleccionar…</option>
              {productos.map((p) => (
                <option key={p.sku} value={p.sku}>{p.sku} · {p.name}</option>
              ))}
            </select>
          </Campo>

          <Campo id="mv-dep" label="Depósito">
            <select id="mv-dep" className={inputCls} style={inputStyle}
              value={deposito} onChange={(e) => setDeposito(e.target.value)}>
              <option value="">Seleccionar…</option>
              {depositos.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Campo>

          <Campo id="mv-cant" label="Cantidad"
            hint={tipo === 'ajuste' ? 'Puede ser negativa' : 'En positivo: el signo lo pone el tipo'}>
            <input id="mv-cant" type="number" step="1" className={inputCls} style={inputStyle}
              value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="0" />
          </Campo>

          <Campo id="mv-motivo" label="Motivo" hint="Opcional, pero se agradece al auditar">
            <input id="mv-motivo" type="text" className={inputCls} style={inputStyle}
              value={motivo} onChange={(e) => setMotivo(e.target.value)}
              placeholder={tipo === 'ajuste' ? 'Rotura en depósito' : 'Remito 0001-00234'} />
          </Campo>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-4 pt-1">
            <button type="submit" disabled={enviando || soportado === false}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 text-[14px] font-medium disabled:opacity-45"
              style={{ background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: '2px' }}>
              {enviando ? 'Registrando…' : 'Registrar'}
            </button>
            {ok && <p className="text-[13px]" style={{ color: 'var(--positive)' }}>{ok}</p>}
            {error && <p className="text-[13px]" style={{ color: 'var(--alert)' }}>{error}</p>}
          </div>
        </form>
      </section>

      <section className="panel p-6" aria-label="Historial de movimientos">
        <h2 className="t-h3 mb-4">Últimos movimientos</h2>

        {historial === null && <LoadingBlock label="Cargando movimientos" rows={4} />}
        {historial !== null && historial.length === 0 && (
          <EmptyBlock
            title="Todavía no hay movimientos"
            hint="Registrá la primera entrada o salida. Con tres meses de salidas aparece el pronóstico de demanda."
          />
        )}
        {historial !== null && historial.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '620px' }}>
              <thead>
                <tr className="border-b border-rule">
                  <th className="t-label text-left pb-2">Fecha</th>
                  <th className="t-label text-left pb-2">SKU</th>
                  <th className="t-label text-left pb-2">Tipo</th>
                  <th className="t-label text-right pb-2">Cantidad</th>
                  <th className="t-label text-left pb-2 pl-4">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((m) => (
                  <tr key={m.id} className="border-b border-rule last:border-b-0">
                    <td className="t-mono text-[11px] text-muted py-2.5">
                      {m.at ? m.at.toISOString().slice(0, 10) : '—'}
                    </td>
                    <td className="t-mono text-[12px] py-2.5">{m.sku}</td>
                    <td className="text-[12.5px] py-2.5 capitalize">{m.tipo}</td>
                    <td className="t-figure text-[13px] text-right py-2.5"
                      style={{ color: m.delta > 0 ? 'var(--positive)' : 'var(--alert)' }}>
                      {m.delta > 0 ? '+' : ''}{m.delta}
                    </td>
                    <td className="text-[12px] text-graphite py-2.5 pl-4">{m.motivo || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
