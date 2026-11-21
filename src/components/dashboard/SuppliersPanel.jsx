import { useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../contexts/AuthContext'
import { SUPPLIERS } from '../../data/suppliers'
import { inventoryService } from '../../data/inventory'
import { getPurchaseOrderDraft } from '../../data/recommendations'
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../States'
import PanelButton from '../PanelButton'

function SupplierOrderGroup({ group, canCreate }) {
  const [state, setState] = useState({ status: 'idle' })

  async function handleCreate() {
    setState({ status: 'pending' })
    try {
      const skus = group.items.map((i) => i.sku)
      const draft = await inventoryService.createReplenishmentOrder(skus)
      setState({ status: 'done', draft })
    } catch (e) {
      setState({ status: 'error', error: e })
    }
  }

  const total = group.items.reduce((s, i) => s + i.qty * i.unitCost, 0)

  return (
    <div className="p-4 border" style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px' }}>
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h3 className="text-[14px] font-medium">{group.supplierName}</h3>
        <span className="t-mono text-[11px] text-muted">{group.leadTimeDays} días de entrega</span>
      </div>
      <ul className="flex flex-col gap-1.5 my-3">
        {group.items.map((i) => (
          <li key={i.sku} className="flex justify-between gap-2 text-[13px]">
            <span className="t-mono text-muted">{i.sku}</span>
            <span className="flex-1 px-2 truncate">{i.name}</span>
            <span className="t-figure">{i.qty} u.</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-rule">
        <p className="t-mono text-[11px] text-muted">Est. USD {Math.round(total).toLocaleString('es-AR')}</p>
        {state.status === 'done' ? (
          <p className="t-mono text-[12px]" style={{ color: 'var(--positive)' }}>
            Orden {state.draft.id} generada
          </p>
        ) : (
          <PanelButton
            label="Generar orden"
            pendingLabel="Generando…"
            onClick={handleCreate}
            pending={state.status === 'pending'}
            disabled={!canCreate}
            variant="secondary"
          />
        )}
      </div>
      {state.status === 'error' && (
        <div className="mt-3">
          <ErrorBlock error={state.error} onRetry={handleCreate} />
        </div>
      )}
    </div>
  )
}

export default function SuppliersPanel() {
  const { can } = useAuth()
  const draft = useAsync(() => getPurchaseOrderDraft(), [])
  const canCreate = can('createOrder')

  return (
    <>
      <section className="panel p-5 mb-6" aria-label="Proveedores">
        <h2 className="t-h3 mb-4">Proveedores</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-rule">
                <th scope="col" className="t-label text-left px-2 py-2 font-medium">Proveedor</th>
                <th scope="col" className="t-label text-right px-2 py-2 font-medium">Lead time</th>
                <th scope="col" className="t-label text-right px-2 py-2 font-medium hidden sm:table-cell">
                  Frecuencia
                </th>
                <th scope="col" className="t-label text-right px-2 py-2 font-medium hidden sm:table-cell">
                  Última compra
                </th>
              </tr>
            </thead>
            <tbody>
              {SUPPLIERS.map((s) => (
                <tr key={s.id} className="border-b border-rule last:border-b-0">
                  <td className="text-[13px] px-2 py-2.5">{s.name}</td>
                  <td className="t-mono text-[12px] px-2 py-2.5 text-right">{s.leadTimeDays} días</td>
                  <td className="t-mono text-[12px] px-2 py-2.5 text-right hidden sm:table-cell">{s.frequency}</td>
                  <td className="t-mono text-[12px] px-2 py-2.5 text-right hidden sm:table-cell">
                    {s.lastPurchaseAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel p-5" aria-label="Borrador de orden de compra">
        <h2 className="t-h3 mb-1">Orden de compra sugerida</h2>
        <p className="t-small mb-5 max-w-[62ch]">
          Agrupada por proveedor a partir de la cantidad de reposición proyectada para cada SKU
          fuera de rango.
        </p>

        {draft.status === 'loading' && <LoadingBlock label="Calculando cantidades" rows={4} />}
        {draft.status === 'error' && <ErrorBlock error={draft.error} />}
        {draft.status === 'success' &&
          (draft.data.length === 0 ? (
            <EmptyBlock
              title="Nada para pedir por ahora"
              hint="No hay SKU fuera de rango con datos suficientes para proyectar cantidad."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {draft.data.map((g) => (
                <SupplierOrderGroup key={g.supplierId} group={g} canCreate={canCreate} />
              ))}
            </div>
          ))}
      </section>
    </>
  )
}
