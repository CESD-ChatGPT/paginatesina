import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { LogOut, AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAsync } from '../hooks/useAsync'
import {
  inventoryService,
  stockState,
  STATE_LABEL,
  STATE_TOKEN,
  IS_MOCK_DATA,
} from '../data/inventory'
import { Isologotipo } from '../components/brand/Logo'
import DemandChart from '../components/charts/DemandChart'
import CategoryBars from '../components/charts/CategoryBars'
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../components/States'
import ActionButton from '../components/ActionButton'
import BarsLoader from '../components/BarsLoader'

function StatTile({ label, value, prefix, note, tone }) {
  return (
    <div className="py-5 px-4 sm:px-5" style={{ background: 'var(--surface)' }}>
      <p className="t-label mb-2">{label}</p>
      {/* El prefijo va aparte y más chico: si se mete dentro de la cifra,
          "USD 48.9k" parte en dos líneas en celdas de ~135px. */}
      <p className="mb-1.5 leading-none" style={tone ? { color: tone } : undefined}>
        {prefix && <span className="t-mono text-[12px] text-muted mr-1">{prefix}</span>}
        <span className="t-figure text-[22px] sm:text-[26px]">{value}</span>
      </p>
      {note && <p className="t-mono text-[11px] text-muted">{note}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const kpis = useAsync(() => inventoryService.getKpis(), [])
  const rows = useAsync(() => inventoryService.getStockRows(), [])
  const demand = useAsync(() => inventoryService.getDemandSeries(), [])
  const categories = useAsync(() => inventoryService.getCategoryBreakdown(), [])

  const [order, setOrder] = useState({ status: 'idle', data: null })

  const lowSkus =
    rows.status === 'success'
      ? rows.data.filter((r) => stockState(r) === 'low').map((r) => r.sku)
      : []

  async function handleCreateOrder() {
    setOrder({ status: 'pending', data: null })
    try {
      const draft = await inventoryService.createReplenishmentOrder(lowSkus)
      setOrder({ status: 'done', data: draft })
    } catch (e) {
      setOrder({ status: 'error', data: null, error: e })
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    // reducedMotion="user": scopeado acá porque Framer Motion solo se usa
    // en el panel (este swap y las barras de CategoryBars). Ponerlo en la
    // raíz de App forzaba framer-motion al bundle principal aunque la
    // landing anónima nunca lo necesite — ver App.jsx.
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen">
      {/* Barra del panel — distinta de la navbar pública: acá el usuario
          ya está adentro, así que manda la identidad de sesión. */}
      <header className="rule-bottom sticky top-0 z-40" style={{ background: 'var(--surface)' }}>
        <div className="shell py-3 flex items-center justify-between gap-4">
          <span className="text-ink">
            <Isologotipo size={24} />
          </span>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-medium leading-tight">{user?.name}</p>
              <p className="t-mono text-[11px] text-muted">{user?.warehouse}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 min-h-[44px] px-3 text-[13px] font-medium text-graphite hover:text-[var(--accent)] transition-colors"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span className="hidden xs:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="shell py-8 md:py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-8">
          <h1 className="t-h2 text-[1.75rem]">Panel de inventario</h1>
          <p className="t-mono text-[11px] text-muted">{user?.role}</p>
        </div>

        {/* Aviso honesto: no hay backend conectado todavía */}
        {IS_MOCK_DATA && (
          <div
            className="flex gap-2.5 items-start p-3 mb-8 border"
            style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px' }}
          >
            <AlertTriangle
              className="w-4 h-4 shrink-0 mt-0.5"
              style={{ color: 'var(--warning)' }}
              aria-hidden="true"
            />
            <p className="text-[13px] text-graphite leading-snug">
              <span className="font-medium text-ink">Datos de demostración.</span> El
              proyecto todavía no tiene un backend conectado; estas cifras provienen
              del adaptador mock en <span className="t-mono text-[12px]">src/data/inventory.js</span>.
            </p>
          </div>
        )}

        {/* KPIs — cifras sueltas: fichas, no gráficos de una barra */}
        <section className="panel mb-6" aria-label="Indicadores">
          {kpis.status === 'loading' && (
            <div className="p-5">
              <LoadingBlock label="Cargando indicadores" rows={2} />
            </div>
          )}
          {kpis.status === 'error' && (
            <div className="p-5">
              <ErrorBlock error={kpis.error} />
            </div>
          )}
          {kpis.status === 'success' && (
            /* gap-px sobre el color de regla: da divisores de 1px exactos en
               cualquier configuración de columnas, sin dobles bordes contra
               el marco del panel. */
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-px"
              style={{ background: 'var(--rule)' }}
            >
              <StatTile
                label="SKU activos"
                value={kpis.data.skuCount}
                note="en depósito central"
              />
              <StatTile
                label="Capital inmovilizado"
                prefix="USD"
                value={`${(kpis.data.capital / 1000).toFixed(1)}k`}
                note="stock × costo unitario"
              />
              <StatTile
                label="Bajo punto de reposición"
                value={kpis.data.belowReorder}
                note="requieren orden"
                tone={kpis.data.belowReorder > 0 ? 'var(--alert)' : undefined}
              />
              <StatTile
                label="Por quebrar"
                value={kpis.data.atRisk}
                note="dentro del 15% del punto"
                tone={kpis.data.atRisk > 0 ? 'var(--warning)' : undefined}
              />
            </div>
          )}
        </section>

        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Pronóstico */}
          <section className="col-span-12 lg:col-span-7 panel p-5" aria-label="Pronóstico de demanda">
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <h2 className="t-h3">Demanda · MB-1180</h2>
              {demand.status === 'success' && (
                <span className="t-mono text-[11px] text-muted">
                  confianza {(demand.data.confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>

            {demand.status === 'loading' && (
              <div
                className="flex flex-col items-center justify-center gap-3 py-6"
                role="status"
                aria-live="polite"
              >
                <BarsLoader scale={0.62} />
                <span className="t-mono text-[11px] text-muted">Proyectando demanda…</span>
              </div>
            )}
            {demand.status === 'error' && <ErrorBlock error={demand.error} />}
            {demand.status === 'success' &&
              (demand.data.observed.length === 0 ? (
                <EmptyBlock
                  title="Sin histórico suficiente"
                  hint="Necesitamos al menos 3 meses de ventas para proyectar demanda."
                />
              ) : (
                <DemandChart
                  observed={demand.data.observed}
                  forecast={demand.data.forecast}
                />
              ))}
          </section>

          {/* Categorías */}
          <section className="col-span-12 lg:col-span-5 panel p-5" aria-label="Capital por categoría">
            <h2 className="t-h3 mb-1">Capital por categoría</h2>
            <p className="t-small mb-4">Dónde está inmovilizado el dinero.</p>

            {categories.status === 'loading' && <LoadingBlock label="Cargando categorías" rows={4} />}
            {categories.status === 'error' && <ErrorBlock error={categories.error} />}
            {categories.status === 'success' &&
              (categories.data.length === 0 ? (
                <EmptyBlock title="Sin categorías cargadas" />
              ) : (
                <CategoryBars data={categories.data} />
              ))}
          </section>
        </div>

        {/* Tabla de stock */}
        <section className="panel" aria-label="Detalle de inventario">
          <div className="px-4 sm:px-5 py-4 border-b border-rule flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div>
              <h2 className="t-h3">Inventario</h2>
              {lowSkus.length > 0 && order.status !== 'done' && (
                <p className="t-mono text-[11px] mt-1" style={{ color: 'var(--alert)' }}>
                  {lowSkus.length} SKU bajo el punto de reposición
                </p>
              )}
            </div>

            {/* Acción real del panel: hasta ahora no tenía ninguna.
                El swap botón -> confirmación era un pop instantáneo;
                AnimatePresence lo cruza en vez de cortar. */}
            {rows.status === 'success' && (
              <AnimatePresence mode="wait" initial={false}>
                {order.status === 'done' ? (
                  <motion.p
                    key="done"
                    className="t-mono text-[12px]"
                    style={{ color: 'var(--positive)' }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    Borrador {order.data.id} generado · {order.data.skus.length} SKU
                  </motion.p>
                ) : (
                  <motion.div
                    key="action"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Etiqueta corta a propósito: el .button__text del
                        original trunca con ellipsis, y "Generar orden de
                        reposición" se cortaba. El subtítulo de arriba ya
                        da el contexto. */}
                    <ActionButton
                      label="Generar orden"
                      onClick={handleCreateOrder}
                      pending={order.status === 'pending'}
                      disabled={lowSkus.length === 0}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {order.status === 'error' && (
            <div className="px-5 pt-4">
              <ErrorBlock error={order.error} onRetry={handleCreateOrder} />
            </div>
          )}

          {rows.status === 'loading' && (
            <div className="p-5">
              <LoadingBlock label="Cargando inventario" rows={5} />
            </div>
          )}
          {rows.status === 'error' && (
            <div className="p-5">
              <ErrorBlock error={rows.error} />
            </div>
          )}
          {rows.status === 'success' &&
            (rows.data.length === 0 ? (
              <EmptyBlock title="No hay productos cargados" hint="Conectá tu ERP para importar el catálogo." />
            ) : (
              /* En mobile no se hace scroll horizontal: producto y categoría
                 se pliegan bajo el SKU para que Stock y Estado — las dos
                 columnas por las que se entra a esta tabla — queden siempre
                 a la vista. */
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-rule">
                    <th scope="col" className="t-label text-left px-4 sm:px-5 py-2.5 font-medium">SKU</th>
                    <th scope="col" className="t-label text-left px-2 py-2.5 font-medium hidden md:table-cell">
                      Producto
                    </th>
                    <th scope="col" className="t-label text-left px-2 py-2.5 font-medium hidden md:table-cell">
                      Categoría
                    </th>
                    <th scope="col" className="t-label text-right px-2 py-2.5 font-medium">Stock</th>
                    <th scope="col" className="t-label text-right px-4 sm:px-5 py-2.5 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.data.map((r) => {
                    const st = stockState(r)
                    return (
                      <tr
                        key={r.sku}
                        className="border-b border-rule last:border-b-0 transition-colors hover:bg-[var(--surface-sunken)]"
                      >
                        <td className="px-4 sm:px-5 py-3 align-top">
                          <span className="t-mono text-[13px] whitespace-nowrap">{r.sku}</span>
                          <span className="block md:hidden text-[12px] text-graphite leading-tight mt-0.5">
                            {r.name}
                          </span>
                          <span className="block md:hidden t-mono text-[11px] text-muted leading-tight">
                            {r.category}
                          </span>
                        </td>
                        <td className="text-[13px] px-2 py-3 hidden md:table-cell">{r.name}</td>
                        <td className="text-[13px] px-2 py-3 text-graphite hidden md:table-cell">
                          {r.category}
                        </td>
                        <td className="t-figure text-[13px] px-2 py-3 text-right whitespace-nowrap align-top">
                          {r.stock}
                          <span className="text-muted"> / {r.reorder}</span>
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-right whitespace-nowrap align-top">
                          <span className="t-mono text-[11px]" style={{ color: STATE_TOKEN[st] }}>
                            {STATE_LABEL[st]}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ))}
        </section>
      </main>
    </div>
    </MotionConfig>
  )
}
