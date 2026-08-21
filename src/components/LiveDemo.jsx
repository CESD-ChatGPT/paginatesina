import { useEffect, useState } from 'react'
import { stockState, STATE_LABEL, STATE_TOKEN } from '../data/inventory'
import { predictReorderQty } from '../data/recommendations'
import { supplierName } from '../data/suppliers'
import CtaButton from './CtaButton'

/* Mismo SKU y mismas cifras que cualquiera que entre al panel demo ve en
   "Recomienda" — no es un número inventado para la landing, es el dato
   real del catálogo mock corrido a través de las mismas funciones que
   usa el panel (stockState, predictReorderQty). Si algún día ese cálculo
   cambia, este ejemplo cambia solo con él en vez de quedar desincronizado. */
const DEMO_ROW = {
  sku: 'MB-1180',
  name: 'Monitor 24" IPS',
  stock: 18,
  reorder: 45,
  unitCost: 190,
  dailySalesAvg: 2.1,
  dailySalesRecent: 2.3,
  supplierId: 'sup-tecno',
}

const STEP_LABELS = ['Detecta', 'Analiza', 'Recomienda']

/* Transición de paso con CSS simple, no Framer Motion: este componente
   vive en la landing pública (bundle principal), y Framer Motion está
   deliberadamente aislado al panel autenticado para no engordar ese
   bundle — ver App.jsx y el README. Un fade con estado + rAF alcanza. */
function FadeStep({ show, children }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!show) {
      setMounted(false)
      return
    }
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [show])

  if (!show) return null

  return (
    <div
      className="transition-all duration-300 ease-out"
      style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(8px)' }}
    >
      {children}
    </div>
  )
}

export default function LiveDemo() {
  const [step, setStep] = useState(0)
  const state = stockState(DEMO_ROW)
  const reorder = predictReorderQty(DEMO_ROW)

  return (
    <section className="section-pad rule-bottom" id="demo">
      <div className="shell">
        <div className="flex items-baseline gap-4 mb-12 md:mb-16">
          <span className="t-mono text-[13px] text-muted">02</span>
          <h2 className="t-h2 max-w-[20ch]">SOLVUS en acción</h2>
        </div>

        <div className="grid grid-cols-12 gap-y-10 gap-x-8 mb-14">
          <div className="col-span-12 lg:col-span-5">
            <p className="t-body text-[15px] mb-6 max-w-[42ch]">
              Un caso real del catálogo demo: un monitor cuya venta se aceleró y cuyo stock ya
              cruzó el punto de reposición. Mirá cómo lo procesa el motor de reglas, paso a paso.
            </p>

            <ol className="flex flex-wrap items-center gap-2 mb-8">
              {STEP_LABELS.map((label, i) => (
                <li key={label} className="flex items-center gap-2">
                  <span
                    className="t-mono text-[11px] w-6 h-6 flex items-center justify-center border"
                    style={{
                      borderColor: i <= step ? 'var(--accent)' : 'var(--rule-strong)',
                      color: i <= step ? 'var(--accent)' : 'var(--muted)',
                      borderRadius: '50%',
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[12px]" style={{ color: i <= step ? 'var(--ink)' : 'var(--muted)' }}>
                    {label}
                  </span>
                  {i < STEP_LABELS.length - 1 && (
                    <span className="w-4 h-px" style={{ background: 'var(--rule)' }} aria-hidden="true" />
                  )}
                </li>
              ))}
            </ol>

            {step < STEP_LABELS.length - 1 ? (
              <button
                onClick={() => setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1))}
                className="inline-flex items-center justify-center min-h-[44px] px-5 text-[14px] font-medium border transition-colors hover:border-ink hover:bg-[var(--surface)]"
                style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px' }}
              >
                {step === 0 ? 'Analizar' : 'Ver recomendación'}
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <CtaButton label="Probarlo con tu inventario" />
                <button
                  onClick={() => setStep(0)}
                  className="t-mono text-[12px] underline underline-offset-4 hover:text-[var(--accent)]"
                >
                  Ver de nuevo
                </button>
              </div>
            )}
          </div>

          <div className="col-span-12 lg:col-span-7 lg:pl-4">
            <div className="panel p-6">
              <FadeStep show={step >= 0}>
                <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-rule">
                  <div>
                    <p className="t-mono text-[11px] text-muted mb-1">{DEMO_ROW.sku}</p>
                    <p className="text-[14px] font-medium">{DEMO_ROW.name}</p>
                  </div>
                  <span className="t-mono text-[11px]" style={{ color: STATE_TOKEN[state] }}>
                    {STATE_LABEL[state]}
                  </span>
                </div>
                <p className="t-figure text-[22px] mb-1">
                  {DEMO_ROW.stock} <span className="text-muted text-[14px]">/ {DEMO_ROW.reorder} u.</span>
                </p>
                <p className="t-small">Stock consolidado por debajo del punto de reposición.</p>
              </FadeStep>

              <FadeStep show={step >= 1}>
                <div className="mt-5 pt-5 border-t border-rule grid grid-cols-2 gap-4">
                  <div>
                    <p className="t-label mb-1">Venta reciente</p>
                    <p className="t-figure text-[16px]">{DEMO_ROW.dailySalesRecent} u./día</p>
                  </div>
                  <div>
                    <p className="t-label mb-1">Lead time proveedor</p>
                    <p className="t-figure text-[16px]">{reorder.status === 'ok' ? reorder.leadTimeDays : '—'} días</p>
                  </div>
                </div>
              </FadeStep>

              <FadeStep show={step >= 2}>
                <div className="mt-5 pt-5 border-t border-rule">
                  <p className="t-label mb-1.5">Recomendación</p>
                  {reorder.status === 'ok' ? (
                    <p className="text-[14px] leading-relaxed">
                      Reponer <span className="t-figure font-medium">{reorder.qty} u.</span> a{' '}
                      {supplierName(DEMO_ROW.supplierId)} — cubre el consumo proyectado durante los{' '}
                      {reorder.leadTimeDays} días de entrega, con colchón de seguridad.
                    </p>
                  ) : (
                    <p className="text-[14px]">{reorder.reason}</p>
                  )}
                </div>
              </FadeStep>
            </div>
          </div>
        </div>

        {/* Valorización: solo la idea, no el cálculo en vivo — ese vive en
            el panel. Acá alcanza con mostrar de dónde sale el número. */}
        <div className="panel p-6 md:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-6">
            <h3 className="t-h3">Cómo se arma el valor estimado del depósito</h3>
            <span className="t-mono text-[11px] text-muted">Ejemplo ilustrativo</span>
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
              {[
                ['Costo de proveedor', 'USD 200'],
                ['Retail oficial', 'USD 300'],
                ['Marketplace', 'USD 270'],
              ].map(([label, val]) => (
                <div key={label} className="p-3 border" style={{ borderColor: 'var(--rule)', borderRadius: '2px' }}>
                  <p className="t-mono text-[10px] text-muted mb-1">{label}</p>
                  <p className="t-figure text-[15px]">{val}</p>
                </div>
              ))}
            </div>
            <span className="hidden md:block t-mono text-[13px] text-muted px-2" aria-hidden="true">
              →
            </span>
            <div
              className="p-4 border shrink-0 md:w-[210px]"
              style={{ borderColor: 'var(--accent)', borderRadius: '2px', background: 'var(--accent-wash)' }}
            >
              <p className="t-mono text-[10px] text-muted mb-1">Valor estimado (~)</p>
              <p className="t-figure text-[20px] mb-1">USD 270 / u.</p>
              <p className="t-mono text-[11px]" style={{ color: 'var(--warning)' }}>
                Confianza media
              </p>
            </div>
          </div>
          <p className="t-small mt-5 max-w-[64ch]">
            Se cruzan varias fuentes de precio y se toma la mediana; con una sola fuente, o si
            son muy dispares entre sí, la confianza baja. Cuando no hay ninguna coincidencia
            confiable, se usa el costo de catálogo como piso — nunca un número inventado.
          </p>
        </div>
      </div>
    </section>
  )
}
