import { useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../contexts/AuthContext'
import { inventoryService, PRODUCTS } from '../../data/inventory'
import { WAREHOUSES } from '../../data/warehouses'
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../States'
import PanelButton from '../PanelButton'

/* El conteo cargado es el total del SKU sumando todos los depósitos
   (así vive `physicalCounts` en inventory.js). Al aplicar el ajuste hay
   que elegir en qué depósito se asienta la diferencia — se suma el
   diff al stock actual de ESE depósito, no se pisa con el total
   contado, porque el total contado no es lo que ese depósito puntual
   debería tener. */
function ApplyAdjustmentRow({ sku, diff, canAdjust, getWarehouseStock, onApplied }) {
  const [warehouseId, setWarehouseId] = useState(WAREHOUSES[0].id)
  const [reason, setReason] = useState('')
  const [state, setState] = useState({ status: 'idle' })

  const currentWhStock = getWarehouseStock(sku, warehouseId)
  const newQty = currentWhStock + diff

  async function handleApply() {
    setState({ status: 'pending' })
    try {
      await inventoryService.applyInventoryAdjustment(sku, warehouseId, newQty, reason || 'Ajuste por conteo físico')
      setState({ status: 'done' })
      onApplied?.()
    } catch (e) {
      setState({ status: 'error', error: e })
    }
  }

  if (state.status === 'done') {
    return (
      <p className="t-mono text-[11px]" style={{ color: 'var(--positive)' }}>
        Ajuste aplicado.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex flex-wrap items-center gap-2 justify-end">
        <select
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
          disabled={!canAdjust}
          className="t-mono text-[11px] min-h-[36px] px-2 border"
          style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px', background: 'var(--surface)' }}
        >
          {WAREHOUSES.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo"
          disabled={!canAdjust}
          className="t-mono text-[11px] min-h-[36px] px-2 border w-28"
          style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px', background: 'var(--surface)' }}
        />
        <PanelButton
          label="Aplicar"
          pendingLabel="Aplicando…"
          onClick={handleApply}
          pending={state.status === 'pending'}
          disabled={!canAdjust || diff === 0}
          variant="secondary"
        />
      </div>
      <p className="t-mono text-[10px] text-muted">
        {WAREHOUSES.find((w) => w.id === warehouseId)?.name}: {currentWhStock} → {newQty}
      </p>
      {state.status === 'error' && <ErrorBlock error={state.error} onRetry={handleApply} />}
    </div>
  )
}

export default function PhysicalCountPanel() {
  const { can } = useAuth()
  const canAdjust = can('adjust')
  const [refreshKey, setRefreshKey] = useState(0)
  const rows = useAsync(() => inventoryService.getStockRows(), [refreshKey])
  const warehouseStock = useAsync(() => inventoryService.getStockByWarehouse(), [refreshKey])
  const counts = useAsync(() => inventoryService.getPhysicalCounts(), [refreshKey])

  const [sku, setSku] = useState('')
  const [counted, setCounted] = useState('')
  const [saveState, setSaveState] = useState({ status: 'idle' })

  async function handleSaveCount() {
    if (!sku || counted === '') return
    setSaveState({ status: 'pending' })
    try {
      await inventoryService.setPhysicalCount(sku, Number(counted))
      setSaveState({ status: 'done' })
      setSku('')
      setCounted('')
      setRefreshKey((k) => k + 1)
    } catch (e) {
      setSaveState({ status: 'error', error: e })
    }
  }

  const rowsBySku = rows.status === 'success' ? new Map(rows.data.map((r) => [r.sku, r])) : new Map()
  const getWarehouseStock = (targetSku, warehouseId) =>
    warehouseStock.status === 'success'
      ? warehouseStock.data.find((r) => r.sku === targetSku && r.warehouseId === warehouseId)?.stock ?? 0
      : 0
  const pending = counts.status === 'success' ? Object.entries(counts.data) : []
  const ready = rows.status === 'success' && counts.status === 'success' && warehouseStock.status === 'success'

  return (
    <>
      <section className="panel p-5 mb-6" aria-label="Registrar conteo físico">
        <h2 className="t-h3 mb-1">Inventario físico</h2>
        <p className="t-small mb-5 max-w-[62ch]">
          Cargá el resultado de un conteo físico por SKU. Se compara contra el stock en sistema
          antes de aplicar cualquier ajuste — nada se corrige automáticamente.
        </p>

        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="t-label block mb-1.5">Producto</span>
            <select
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="min-h-[44px] px-3 border t-mono text-[13px] min-w-[220px]"
              style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px', background: 'var(--surface)' }}
            >
              <option value="">Seleccionar…</option>
              {PRODUCTS.map((p) => (
                <option key={p.sku} value={p.sku}>
                  {p.sku} — {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="t-label block mb-1.5">Cantidad contada</span>
            <input
              type="number"
              min={0}
              value={counted}
              onChange={(e) => setCounted(e.target.value)}
              className="min-h-[44px] px-3 border t-figure text-[14px] w-28"
              style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px', background: 'var(--surface)' }}
            />
          </label>
          <PanelButton
            label="Guardar conteo"
            pendingLabel="Guardando…"
            onClick={handleSaveCount}
            pending={saveState.status === 'pending'}
            disabled={!sku || counted === ''}
          />
        </div>
        {sku && rowsBySku.has(sku) && (
          <p className="t-mono text-[11px] text-muted mt-3">
            Stock en sistema (todos los depósitos): {rowsBySku.get(sku).stock} u.
          </p>
        )}
        {saveState.status === 'error' && (
          <div className="mt-3">
            <ErrorBlock error={saveState.error} onRetry={handleSaveCount} />
          </div>
        )}
      </section>

      <section className="panel" aria-label="Conteos pendientes de revisión">
        <div className="px-4 sm:px-5 py-4 border-b border-rule">
          <h2 className="t-h3">Conteos pendientes</h2>
        </div>
        {!ready && (
          <div className="p-5">
            <LoadingBlock label="Cargando conteos" rows={3} />
          </div>
        )}
        {ready &&
          (pending.length === 0 ? (
            <div className="p-5">
              <EmptyBlock title="Sin conteos pendientes" hint="Los conteos cargados y sin aplicar aparecen acá." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-rule">
                    <th scope="col" className="t-label text-left px-4 sm:px-5 py-2.5 font-medium">SKU</th>
                    <th scope="col" className="t-label text-right px-2 py-2.5 font-medium">Sistema</th>
                    <th scope="col" className="t-label text-right px-2 py-2.5 font-medium">Contado</th>
                    <th scope="col" className="t-label text-right px-2 py-2.5 font-medium">Diferencia</th>
                    <th scope="col" className="t-label text-right px-4 sm:px-5 py-2.5 font-medium">Aplicar</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map(([countedSku, countedQty]) => {
                    const row = rowsBySku.get(countedSku)
                    if (!row) return null
                    const diff = countedQty - row.stock
                    return (
                      <tr key={countedSku} className="border-b border-rule last:border-b-0">
                        <td className="px-4 sm:px-5 py-3 t-mono text-[13px]">{countedSku}</td>
                        <td className="t-figure text-[13px] px-2 py-3 text-right">{row.stock}</td>
                        <td className="t-figure text-[13px] px-2 py-3 text-right">{countedQty}</td>
                        <td
                          className="t-figure text-[13px] px-2 py-3 text-right"
                          style={{
                            color: diff === 0 ? 'var(--muted)' : diff > 0 ? 'var(--positive)' : 'var(--alert)',
                          }}
                        >
                          {diff > 0 ? '+' : ''}
                          {diff}
                        </td>
                        <td className="px-4 sm:px-5 py-3">
                          <ApplyAdjustmentRow
                            sku={countedSku}
                            diff={diff}
                            canAdjust={canAdjust}
                            getWarehouseStock={getWarehouseStock}
                            onApplied={() => setRefreshKey((k) => k + 1)}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
      </section>
    </>
  )
}
