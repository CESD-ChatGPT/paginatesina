import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { inventoryService } from '../../data/inventory'
import { WAREHOUSES, warehouseName } from '../../data/warehouses'
import { ErrorBlock } from '../States'
import PanelButton from '../PanelButton'
import { useEscapeClose } from '../../hooks/useEscapeClose'
import { useFocusTrap } from '../../hooks/useFocusTrap'

/* Flujo de transferencia: depósito origen → producto (ya viene fijo del
   contexto que abrió el drawer) → cantidad → depósito destino →
   confirmar. Muta stockByWarehouse de verdad (ver inventory.js), así
   que al confirmar el número en pantalla cambia — no es un formulario
   decorativo. */
export default function TransferDrawer({ item, onClose, onDone }) {
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [qty, setQty] = useState('')
  const [state, setState] = useState({ status: 'idle' })
  const dialogRef = useRef(null)
  useEscapeClose(!!item, onClose)
  useFocusTrap(dialogRef, !!item)

  // Se resetea por sku, no por referencia de `item`: un refetch de fondo
  // (el mismo drawer sigue abierto tras confirmar) crea un objeto `item`
  // nuevo con los mismos datos, y resetear por referencia ahí borraba el
  // estado "listo" recién alcanzado — el usuario veía el formulario vacío
  // en vez de la confirmación de su propia transferencia.
  useEffect(() => {
    if (!item) return
    const withStock = WAREHOUSES.find((w) => (item.perWarehouse[w.id] ?? 0) > 0)
    const other = WAREHOUSES.find((w) => w.id !== withStock?.id)
    setFromId(withStock?.id ?? WAREHOUSES[0].id)
    setToId(other?.id ?? WAREHOUSES[1]?.id ?? '')
    setQty('')
    setState({ status: 'idle' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.sku])

  if (!item) return null

  const available = item.perWarehouse[fromId] ?? 0
  const qtyNum = Number(qty)
  const valid = fromId && toId && fromId !== toId && qtyNum > 0 && qtyNum <= available

  async function handleConfirm() {
    setState({ status: 'pending' })
    try {
      await inventoryService.transferStock({ sku: item.sku, fromWarehouseId: fromId, toWarehouseId: toId, qty: qtyNum })
      setState({ status: 'done' })
      onDone?.()
    } catch (e) {
      setState({ status: 'error', error: e })
    }
  }

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(10,10,10,0.35)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Transferir stock · ${item.sku}`}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] z-50 overflow-y-auto"
            style={{ background: 'var(--surface)', borderLeft: '1px solid var(--rule-strong)' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <div className="p-5 rule-bottom flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="t-mono text-[12px] text-muted mb-1">{item.sku}</p>
                <h3 className="t-h3">{item.name}</h3>
              </div>
              <button
                onClick={onClose}
                className="t-mono text-[12px] underline underline-offset-4 hover:text-[var(--accent)] shrink-0"
              >
                Cerrar
              </button>
            </div>

            <div className="p-5">
              {state.status === 'done' ? (
                <p className="text-[13px]" style={{ color: 'var(--positive)' }}>
                  Transferencia registrada: {qtyNum} u. de {warehouseName(fromId)} a {warehouseName(toId)}.
                </p>
              ) : (
                <>
                  <label className="block mb-4">
                    <span className="t-label block mb-1.5">Desde</span>
                    <select
                      value={fromId}
                      onChange={(e) => setFromId(e.target.value)}
                      className="w-full min-h-[44px] px-3 border t-mono text-[13px]"
                      style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px', background: 'var(--surface)' }}
                    >
                      {WAREHOUSES.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} — {item.perWarehouse[w.id] ?? 0} u.
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block mb-4">
                    <span className="t-label block mb-1.5">Hacia</span>
                    <select
                      value={toId}
                      onChange={(e) => setToId(e.target.value)}
                      className="w-full min-h-[44px] px-3 border t-mono text-[13px]"
                      style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px', background: 'var(--surface)' }}
                    >
                      {WAREHOUSES.filter((w) => w.id !== fromId).map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} — {item.perWarehouse[w.id] ?? 0} u.
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block mb-1.5">
                    <span className="t-label block mb-1.5">Cantidad</span>
                    <input
                      type="number"
                      min={1}
                      max={available}
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      className="w-full min-h-[44px] px-3 border t-figure text-[14px]"
                      style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px', background: 'var(--surface)' }}
                    />
                  </label>
                  <p className="t-mono text-[11px] text-muted mb-5">Disponible en origen: {available} u.</p>

                  {state.status === 'error' && (
                    <div className="mb-4">
                      <ErrorBlock error={state.error} onRetry={handleConfirm} />
                    </div>
                  )}

                  <PanelButton
                    label="Confirmar transferencia"
                    pendingLabel="Transfiriendo…"
                    onClick={handleConfirm}
                    pending={state.status === 'pending'}
                    disabled={!valid}
                  />
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
