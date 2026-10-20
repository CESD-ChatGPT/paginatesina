import { useEffect, useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { pricingService, CONFIDENCE_LABEL, CONFIDENCE_TOKEN } from '../../data/pricing'
import { toCsv, downloadCsv } from '../../lib/csv'
import { LoadingBlock, ErrorBlock } from '../States'
import ValuationDrawer from './ValuationDrawer'

export default function ValorizationPanel({ focusSku, onFocusHandled }) {
  const valorization = useAsync(() => pricingService.getDepotValorization(), [])
  const [openSku, setOpenSku] = useState(null)

  // Deep-link desde la búsqueda global: si se llegó acá con un SKU
  // puntual (Cmd/Ctrl+K → producto), abrir su detalle apenas cargue.
  useEffect(() => {
    if (focusSku && valorization.status === 'success') {
      setOpenSku(focusSku)
      onFocusHandled?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSku, valorization.status])

  const openItem =
    valorization.status === 'success' ? valorization.data.items.find((i) => i.sku === openSku) ?? null : null

  function handleExport() {
    if (valorization.status !== 'success') return
    const csv = toCsv(valorization.data.items, [
      { label: 'SKU', value: (i) => i.sku },
      { label: 'Producto', value: (i) => i.name },
      { label: 'Estimado unitario', value: (i) => (i.valuation.status === 'ok' ? i.valuation.estimatedUnitPrice : '') },
      { label: 'Moneda', value: (i) => i.valuation.currency ?? '' },
      { label: 'Confianza', value: (i) => (i.valuation.confidence ? CONFIDENCE_LABEL[i.valuation.confidence] : 'sin coincidencia') },
      { label: 'Costo de catálogo', value: (i) => i.unitCost },
    ])
    downloadCsv(`solvus-valorizacion-${new Date().toISOString().slice(0, 10)}.csv`, csv)
  }

  return (
    <>
      <section className="panel p-5 mb-6" aria-label="Valor estimado del depósito">
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <h2 className="t-h3">Valor estimado del depósito</h2>
          {valorization.status === 'success' && (
            <button
              onClick={handleExport}
              className="t-mono text-[11px] underline underline-offset-4 text-muted hover:text-[var(--accent)]"
            >
              Exportar CSV
            </button>
          )}
        </div>
        <p className="t-small mb-5 max-w-[62ch]">
          Construido a partir de precios de referencia externos (marketplace, retail oficial,
          costo de proveedor) cruzados con el stock actual. <strong>Es una aproximación, no una
          tasación</strong> — donde no hay una fuente confiable se usa el costo de catálogo como
          piso conocido, nunca un número inventado.
        </p>

        {valorization.status === 'loading' && <LoadingBlock label="Estimando valor del depósito" rows={3} />}
        {valorization.status === 'error' && <ErrorBlock error={valorization.error} />}

        {valorization.status === 'success' && (
          <>
            <div className="flex flex-wrap gap-x-10 gap-y-4 mb-6 pb-6 border-b border-rule">
              <div>
                <p className="t-label mb-1.5">Estimado (~)</p>
                <p className="t-figure text-[28px]">
                  <span className="t-mono text-[13px] text-muted mr-1">USD</span>
                  {Math.round(valorization.data.estimatedTotal).toLocaleString('es-AR')}
                </p>
              </div>
              <div>
                <p className="t-label mb-1.5">Costo de catálogo</p>
                <p className="t-figure text-[20px] text-graphite">
                  <span className="t-mono text-[12px] text-muted mr-1">USD</span>
                  {Math.round(valorization.data.bookTotal).toLocaleString('es-AR')}
                </p>
              </div>
              <div>
                <p className="t-label mb-1.5">Cobertura externa</p>
                <p className="t-figure text-[20px]">{Math.round(valorization.data.coverageRatio * 100)}%</p>
              </div>
              {valorization.data.overallConfidence && (
                <div>
                  <p className="t-label mb-1.5">Confianza general</p>
                  <p
                    className="t-mono text-[13px] mt-1"
                    style={{ color: CONFIDENCE_TOKEN[valorization.data.overallConfidence] }}
                  >
                    {CONFIDENCE_LABEL[valorization.data.overallConfidence]}
                  </p>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-rule">
                    <th scope="col" className="t-label text-left px-2 py-2 font-medium">SKU</th>
                    <th scope="col" className="t-label text-left px-2 py-2 font-medium hidden sm:table-cell">
                      Producto
                    </th>
                    <th scope="col" className="t-label text-right px-2 py-2 font-medium">Estimado u.</th>
                    <th scope="col" className="t-label text-right px-2 py-2 font-medium hidden sm:table-cell">
                      Confianza
                    </th>
                    <th scope="col" className="t-label text-right px-2 py-2 font-medium">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {valorization.data.items.map((item) => (
                    <tr key={item.sku} className="border-b border-rule last:border-b-0">
                      <td className="t-mono text-[13px] px-2 py-2.5 whitespace-nowrap">{item.sku}</td>
                      <td className="text-[13px] px-2 py-2.5 hidden sm:table-cell">{item.name}</td>
                      <td className="t-figure text-[13px] px-2 py-2.5 text-right whitespace-nowrap">
                        {item.valuation.status === 'ok' ? (
                          <>USD {item.valuation.estimatedUnitPrice.toFixed(2)}</>
                        ) : (
                          <span className="text-muted t-mono text-[11px]">sin coincidencia</span>
                        )}
                      </td>
                      <td className="text-right px-2 py-2.5 hidden sm:table-cell">
                        {item.valuation.confidence ? (
                          <span
                            className="t-mono text-[11px]"
                            style={{ color: CONFIDENCE_TOKEN[item.valuation.confidence] }}
                          >
                            {CONFIDENCE_LABEL[item.valuation.confidence]}
                          </span>
                        ) : (
                          <span className="t-mono text-[11px] text-muted">—</span>
                        )}
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <button
                          onClick={() => setOpenSku(item.sku)}
                          className="t-mono text-[11px] underline underline-offset-4 hover:text-[var(--accent)] min-h-[44px] px-1"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <ValuationDrawer item={openItem} onClose={() => setOpenSku(null)} />
    </>
  )
}
