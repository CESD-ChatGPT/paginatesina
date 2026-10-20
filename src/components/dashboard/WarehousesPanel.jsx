import { useEffect, useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../contexts/AuthContext'
import { inventoryService } from '../../data/inventory'
import { WAREHOUSES } from '../../data/warehouses'
import { LoadingBlock, ErrorBlock } from '../States'
import TransferDrawer from './TransferDrawer'

const emptyTotals = () => Object.fromEntries(WAREHOUSES.map((w) => [w.id, { units: 0, value: 0 }]))

export default function WarehousesPanel() {
  const { can } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const stock = useAsync(() => inventoryService.getStockByWarehouse(), [refreshKey])
  const [openSku, setOpenSku] = useState(null)

  // Derivados de la última respuesta exitosa, no de `stock` directo: useAsync
  // vuelve a "loading" (data: null) en cada refetch tras una mutación, y si
  // `items`/`totals` colapsaran a vacío en ese instante, el drawer de
  // transferencia abierto perdería su producto (item desaparece de la
  // lista), se desmontaría y reaparecería sin su mensaje de confirmación —
  // el usuario vería el formulario en blanco después de confirmar su propia
  // transferencia. Mantener el último dato bueno evita ese parpadeo.
  const [items, setItems] = useState([])
  const [totals, setTotals] = useState(emptyTotals)

  useEffect(() => {
    if (stock.status !== 'success') return
    const bySku = new Map()
    const t = emptyTotals()
    for (const row of stock.data) {
      if (!bySku.has(row.sku)) {
        bySku.set(row.sku, { sku: row.sku, name: row.name, unitCost: row.unitCost, perWarehouse: {} })
      }
      bySku.get(row.sku).perWarehouse[row.warehouseId] = row.stock
      t[row.warehouseId].units += row.stock
      t[row.warehouseId].value += row.stock * row.unitCost
    }
    setItems([...bySku.values()])
    setTotals(t)
  }, [stock])

  const openItem = items.find((i) => i.sku === openSku) ?? null
  const canTransfer = can('transfer')
  const showLoading = stock.status === 'loading' && items.length === 0

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {WAREHOUSES.map((w) => (
          <div key={w.id} className="panel p-5">
            <p className="t-label mb-1">{w.name}</p>
            <p className="t-small mb-3">{w.city}</p>
            <div className="flex gap-8">
              <div>
                <p className="t-mono text-[11px] text-muted mb-1">Unidades</p>
                <p className="t-figure text-[20px]">{totals[w.id]?.units ?? 0}</p>
              </div>
              <div>
                <p className="t-mono text-[11px] text-muted mb-1">Valor de catálogo</p>
                <p className="t-figure text-[20px]">
                  <span className="t-mono text-[11px] text-muted mr-1">USD</span>
                  {Math.round(totals[w.id]?.value ?? 0).toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="panel" aria-label="Distribución por depósito">
        <div className="px-4 sm:px-5 py-4 border-b border-rule">
          <h2 className="t-h3">Distribución por depósito</h2>
          {!canTransfer && (
            <p className="t-mono text-[11px] text-muted mt-1">
              Tu rol de sesión no tiene permiso para transferir stock.
            </p>
          )}
        </div>

        {showLoading && (
          <div className="p-5">
            <LoadingBlock label="Cargando distribución" rows={5} />
          </div>
        )}
        {stock.status === 'error' && items.length === 0 && (
          <div className="p-5">
            <ErrorBlock error={stock.error} />
          </div>
        )}
        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-rule">
                  <th scope="col" className="t-label text-left px-4 sm:px-5 py-2.5 font-medium">SKU</th>
                  <th scope="col" className="t-label text-left px-2 py-2.5 font-medium hidden md:table-cell">
                    Producto
                  </th>
                  {WAREHOUSES.map((w) => (
                    <th key={w.id} scope="col" className="t-label text-right px-2 py-2.5 font-medium">
                      {w.name.replace('Depósito ', '')}
                    </th>
                  ))}
                  <th scope="col" className="t-label text-right px-4 sm:px-5 py-2.5 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.sku} className="border-b border-rule last:border-b-0">
                    <td className="px-4 sm:px-5 py-3 t-mono text-[13px] whitespace-nowrap">{item.sku}</td>
                    <td className="text-[13px] px-2 py-3 hidden md:table-cell">{item.name}</td>
                    {WAREHOUSES.map((w) => (
                      <td key={w.id} className="t-figure text-[13px] px-2 py-3 text-right">
                        {item.perWarehouse[w.id] ?? 0}
                      </td>
                    ))}
                    <td className="px-4 sm:px-5 py-3 text-right">
                      <button
                        onClick={() => setOpenSku(item.sku)}
                        disabled={!canTransfer}
                        className="t-mono text-[11px] underline underline-offset-4 hover:text-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline min-h-[44px] px-1"
                      >
                        Transferir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <TransferDrawer
        item={openItem}
        onClose={() => setOpenSku(null)}
        onDone={() => setRefreshKey((k) => k + 1)}
      />
    </>
  )
}
