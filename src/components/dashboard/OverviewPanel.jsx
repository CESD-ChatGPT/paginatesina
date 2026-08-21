import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { inventoryService, stockState, STATE_LABEL, STATE_TOKEN } from '../../data/inventory'
import { useAsync } from '../../hooks/useAsync'
import { loadKpiPrefs, saveKpiPrefs } from '../../lib/dashboardPrefs'
import { compareDemandPeriods } from '../../lib/periodCompare'
import { toCsv, downloadCsv } from '../../lib/csv'
import DemandChart from '../charts/DemandChart'
import CategoryBars from '../charts/CategoryBars'
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../States'
import ActionButton from '../ActionButton'
import BarsLoader from '../BarsLoader'

function StatTile({ label, value, prefix, note, tone }) {
  return (
    <div className="py-5 px-4 sm:px-5" style={{ background: 'var(--surface)' }}>
      <p className="t-label mb-2">{label}</p>
      <p className="mb-1.5 leading-none" style={tone ? { color: tone } : undefined}>
        {prefix && <span className="t-mono text-[12px] text-muted mr-1">{prefix}</span>}
        <span className="t-figure text-[22px] sm:text-[26px]">{value}</span>
      </p>
      {note && <p className="t-mono text-[11px] text-muted">{note}</p>}
    </div>
  )
}

const KPI_DEFS = {
  skuCount: { label: 'SKU activos', render: (d) => ({ value: d.skuCount, note: 'en depósito central' }) },
  capital: {
    label: 'Capital inmovilizado',
    render: (d) => ({ prefix: 'USD', value: `${(d.capital / 1000).toFixed(1)}k`, note: 'stock × costo unitario' }),
  },
  belowReorder: {
    label: 'Bajo punto de reposición',
    render: (d) => ({
      value: d.belowReorder,
      note: 'requieren orden',
      tone: d.belowReorder > 0 ? 'var(--alert)' : undefined,
    }),
  },
  atRisk: {
    label: 'Por quebrar',
    render: (d) => ({
      value: d.atRisk,
      note: 'dentro del 15% del punto',
      tone: d.atRisk > 0 ? 'var(--warning)' : undefined,
    }),
  },
  overstock: {
    label: 'Sobrestock',
    render: (d) => ({
      value: d.overstock,
      note: 'más del doble del punto',
      tone: d.overstock > 0 ? 'var(--warning)' : undefined,
    }),
  },
  noMovement: {
    label: 'Sin movimiento',
    render: (d) => ({
      prefix: d.noMovementCount > 0 ? 'USD' : undefined,
      value: d.noMovementCount > 0 ? `${(d.noMovementValue / 1000).toFixed(1)}k` : 0,
      note: `${d.noMovementCount} SKU · 60+ días`,
      tone: d.noMovementCount > 0 ? 'var(--warning)' : undefined,
    }),
  },
}
const KPI_IDS = Object.keys(KPI_DEFS)

function KpiPersonalizer({ prefs, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function toggleHidden(id) {
    const hidden = prefs.hidden.includes(id) ? prefs.hidden.filter((x) => x !== id) : [...prefs.hidden, id]
    onChange({ ...prefs, hidden })
  }

  function move(id, dir) {
    const idx = prefs.order.indexOf(id)
    const swapWith = idx + dir
    if (swapWith < 0 || swapWith >= prefs.order.length) return
    const order = [...prefs.order]
    ;[order[idx], order[swapWith]] = [order[swapWith], order[idx]]
    onChange({ ...prefs, order })
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="t-mono text-[11px] text-muted underline underline-offset-4 hover:text-[var(--accent)]"
      >
        Personalizar
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-[calc(100%+6px)] w-[270px] z-30 p-3"
            style={{ background: 'var(--surface)', border: '1px solid var(--rule-strong)', borderRadius: '3px' }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <p className="t-label mb-2">Indicadores visibles</p>
            <ul className="flex flex-col gap-1.5">
              {prefs.order.map((id, i) => (
                <li key={id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`kpi-${id}`}
                    checked={!prefs.hidden.includes(id)}
                    onChange={() => toggleHidden(id)}
                  />
                  <label htmlFor={`kpi-${id}`} className="text-[12px] flex-1">
                    {KPI_DEFS[id].label}
                  </label>
                  <button
                    onClick={() => move(id, -1)}
                    disabled={i === 0}
                    className="text-muted disabled:opacity-30 w-5 h-5"
                    aria-label={`Subir ${KPI_DEFS[id].label}`}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(id, 1)}
                    disabled={i === prefs.order.length - 1}
                    className="text-muted disabled:opacity-30 w-5 h-5"
                    aria-label={`Bajar ${KPI_DEFS[id].label}`}
                  >
                    ↓
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function OverviewPanel() {
  const kpis = useAsync(() => inventoryService.getKpis(), [])
  const rows = useAsync(() => inventoryService.getStockRows(), [])
  const demand = useAsync(() => inventoryService.getDemandSeries(), [])
  const categories = useAsync(() => inventoryService.getCategoryBreakdown(), [])

  const [kpiPrefs, setKpiPrefs] = useState(() => loadKpiPrefs(KPI_IDS))
  function handlePrefsChange(next) {
    setKpiPrefs(next)
    saveKpiPrefs(next)
  }

  const [order, setOrder] = useState({ status: 'idle', data: null })

  const lowSkus =
    rows.status === 'success' ? rows.data.filter((r) => stockState(r) === 'low').map((r) => r.sku) : []

  async function handleCreateOrder() {
    setOrder({ status: 'pending', data: null })
    try {
      const draft = await inventoryService.createReplenishmentOrder(lowSkus)
      setOrder({ status: 'done', data: draft })
    } catch (e) {
      setOrder({ status: 'error', data: null, error: e })
    }
  }

  const visibleKpis = kpiPrefs.order.filter((id) => !kpiPrefs.hidden.includes(id))

  const [compareMonths, setCompareMonths] = useState(1)
  const comparison =
    demand.status === 'success' ? compareDemandPeriods(demand.data.observed, compareMonths) : null

  function handleExportInventory() {
    if (rows.status !== 'success') return
    const csv = toCsv(rows.data, [
      { label: 'SKU', value: (r) => r.sku },
      { label: 'Producto', value: (r) => r.name },
      { label: 'Categoría', value: (r) => r.category },
      { label: 'Stock', value: (r) => r.stock },
      { label: 'Punto de reposición', value: (r) => r.reorder },
      { label: 'Estado', value: (r) => STATE_LABEL[stockState(r)] },
      { label: 'Costo unitario (USD)', value: (r) => r.unitCost },
    ])
    downloadCsv(`solvus-inventario-${new Date().toISOString().slice(0, 10)}.csv`, csv)
  }

  return (
    <>
      {/* KPIs — cifras sueltas: fichas, no gráficos de una barra */}
      <section className="panel mb-6" aria-label="Indicadores">
        <div className="flex items-center justify-end px-4 sm:px-5 pt-3 pb-1">
          <KpiPersonalizer prefs={kpiPrefs} onChange={handlePrefsChange} />
        </div>

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
        {kpis.status === 'success' &&
          (visibleKpis.length === 0 ? (
            <div className="p-5">
              <EmptyBlock title="Sin indicadores visibles" hint='Activalos de nuevo desde "Personalizar".' />
            </div>
          ) : (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px"
              style={{ background: 'var(--rule)' }}
            >
              {visibleKpis.map((id) => (
                <StatTile key={id} label={KPI_DEFS[id].label} {...KPI_DEFS[id].render(kpis.data)} />
              ))}
            </div>
          ))}
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
            <div className="flex flex-col items-center justify-center gap-3 py-6" role="status" aria-live="polite">
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
              <>
                <DemandChart observed={demand.data.observed} forecast={demand.data.forecast} />

                {/* Comparación de período: sobre la serie mensual real, no
                    una serie diaria que no existe en este mock. */}
                <div className="mt-5 pt-4 border-t border-rule">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="t-label">Comparar período</p>
                    <div className="flex gap-1">
                      {[
                        { n: 1, label: 'Mes vs. anterior' },
                        { n: 3, label: 'Trimestre vs. anterior' },
                      ].map((opt) => (
                        <button
                          key={opt.n}
                          onClick={() => setCompareMonths(opt.n)}
                          className="t-mono text-[10px] px-2 py-1 border transition-colors"
                          style={{
                            borderColor: compareMonths === opt.n ? 'var(--accent)' : 'var(--rule-strong)',
                            color: compareMonths === opt.n ? 'var(--accent)' : 'var(--muted)',
                            borderRadius: '2px',
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {comparison ? (
                    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                      <div>
                        <p className="t-mono text-[10px] text-muted mb-0.5">{comparison.currentLabel}</p>
                        <p className="t-figure text-[18px]">{comparison.currentSum} u.</p>
                      </div>
                      <div>
                        <p className="t-mono text-[10px] text-muted mb-0.5">{comparison.previousLabel}</p>
                        <p className="t-figure text-[16px] text-graphite">{comparison.previousSum} u.</p>
                      </div>
                      {comparison.deltaPct !== null && (
                        <p
                          className="t-mono text-[12px]"
                          style={{ color: comparison.deltaPct >= 0 ? 'var(--positive)' : 'var(--alert)' }}
                        >
                          {comparison.deltaPct >= 0 ? '+' : ''}
                          {comparison.deltaPct.toFixed(0)}%
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="t-small">Falta histórico suficiente para este período.</p>
                  )}
                </div>
              </>
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
            <div className="flex items-baseline gap-3">
              <h2 className="t-h3">Inventario</h2>
              {rows.status === 'success' && rows.data.length > 0 && (
                <button
                  onClick={handleExportInventory}
                  className="t-mono text-[11px] underline underline-offset-4 text-muted hover:text-[var(--accent)]"
                >
                  Exportar CSV
                </button>
              )}
            </div>
            {lowSkus.length > 0 && order.status !== 'done' && (
              <p className="t-mono text-[11px] mt-1" style={{ color: 'var(--alert)' }}>
                {lowSkus.length} SKU bajo el punto de reposición
              </p>
            )}
          </div>

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
                      <td className="text-[13px] px-2 py-3 text-graphite hidden md:table-cell">{r.category}</td>
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
    </>
  )
}
