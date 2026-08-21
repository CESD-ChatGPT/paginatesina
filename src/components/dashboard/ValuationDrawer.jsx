import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CONFIDENCE_LABEL, CONFIDENCE_TOKEN } from '../../data/pricing'
import { useEscapeClose } from '../../hooks/useEscapeClose'
import { useFocusTrap } from '../../hooks/useFocusTrap'

/* Drill-down por producto: drawer, no modal centrado — se abre desde la
   fila de la tabla que lo origina y no bloquea la vista general del
   depósito detrás. Framer Motion porque es un estado de interacción de
   React (abierto/cerrado), no una coreografía de scroll. */
export default function ValuationDrawer({ item, onClose }) {
  const dialogRef = useRef(null)
  useEscapeClose(!!item, onClose)
  useFocusTrap(dialogRef, !!item)

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
            aria-label={`Detalle de valorización · ${item.sku}`}
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
              {item.valuation.status === 'sin_match' ? (
                <p className="t-small">
                  No encontramos una coincidencia confiable en ninguna fuente de precios para
                  este producto. Se usa el costo de catálogo (USD {item.unitCost.toFixed(2)}) como
                  referencia hasta tener un dato mejor.
                </p>
              ) : (
                <>
                  <p className="t-small mb-4">
                    Estimado a partir de {item.valuation.quotes.length} fuente
                    {item.valuation.quotes.length > 1 ? 's' : ''}.
                  </p>
                  <ul className="flex flex-col gap-3">
                    {item.valuation.quotes.map((q) => (
                      <li
                        key={q.source}
                        className="p-3 border"
                        style={{ borderColor: 'var(--rule)', borderRadius: '2px' }}
                      >
                        <div className="flex items-baseline justify-between gap-2 mb-1.5">
                          <span className="text-[13px] font-medium">{q.source}</span>
                          <span className="t-figure text-[13px]">
                            {q.currency} {q.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="t-mono text-[11px]" style={{ color: CONFIDENCE_TOKEN[q.confidence] }}>
                            {CONFIDENCE_LABEL[q.confidence]}
                          </span>
                          {q.url && (
                            <a
                              href={q.url}
                              target="_blank"
                              rel="noreferrer"
                              className="t-mono text-[11px] underline underline-offset-4 hover:text-[var(--accent)]"
                            >
                              ver fuente
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
