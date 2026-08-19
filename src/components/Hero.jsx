import CtaButton from './CtaButton'
import StockPanel from './StockPanel'

/* Composición asimétrica y anclada a la izquierda (no centrada):
   bloque tipográfico + panel de producto real, con la banda de
   métricas separada por hairline como pie de un libro mayor. */

const FIGURES = [
  { value: '−32%', label: 'Capital inmovilizado', note: 'promedio a 6 meses' },
  { value: '94%', label: 'Precisión de pronóstico', note: 'sobre 1,2M de SKU' },
  { value: '11 h', label: 'Ahorro semanal por equipo', note: 'gestión manual evitada' },
]

export default function Hero() {
  return (
    <section className="rule-bottom">
      <div className="shell pt-28 pb-0 md:pt-36">
        <div className="grid grid-cols-12 gap-y-12 gap-x-8 items-start">
          {/* Bloque tipográfico */}
          <div className="col-span-12 lg:col-span-6 reveal">
            <p className="t-label mb-5">Control de inventario con IA</p>

            <h1 className="t-display mb-6">
              Dejá de comprar
              <br />
              stock a ciegas.
            </h1>

            <p className="t-body mb-8">
              SOLVUS lee el histórico de tu depósito, proyecta la demanda real de cada
              SKU y te dice qué reponer, cuánto y cuándo — antes de que se quiebre o de
              que te sobre.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <CtaButton label="Probar 14 días" />
              <a
                href="#features"
                className="inline-flex items-center justify-center px-5 py-3 text-[15px] font-medium border border-rule-strong hover:border-ink hover:bg-[var(--surface)] transition-colors"
                style={{ borderRadius: '2px' }}
              >
                Ver cómo funciona
              </a>
            </div>

            <p className="t-small mt-6 text-muted">
              Sin tarjeta. Se conecta a tu ERP o planilla en el día.
            </p>
          </div>

          {/* Panel de producto */}
          <div className="col-span-12 lg:col-span-6 lg:pl-4 reveal" style={{ animationDelay: '90ms' }}>
            <StockPanel />
          </div>
        </div>
      </div>

      {/* Banda de métricas: renglón de cierre, dividido por hairlines */}
      <div className="shell mt-16 md:mt-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 rule-top">
          {FIGURES.map((f, i) => (
            <div
              key={f.label}
              className={[
                'py-6 sm:py-7',
                i > 0 ? 'border-t sm:border-t-0 sm:border-l border-rule sm:pl-6' : '',
                i === 0 ? 'sm:pr-6' : '',
              ].join(' ')}
            >
              <p className="t-figure text-2xl md:text-[28px] mb-1.5">{f.value}</p>
              <p className="text-[13px] font-medium mb-0.5">{f.label}</p>
              <p className="t-mono text-[11px] text-muted">{f.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
