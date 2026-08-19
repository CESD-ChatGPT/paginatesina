import CtaButton from './CtaButton'

/* Banda invertida a sangre completa: rompe el ritmo papel/tinta del resto
   de la página para que el cierre no parezca "otra sección más". */

const STEPS = [
  { n: '01', title: 'Conectás tu fuente', detail: 'ERP, e-commerce o una planilla. Sin migración.' },
  { n: '02', title: 'El modelo lee tu histórico', detail: 'Primeras proyecciones en 48 h.' },
  { n: '03', title: 'Aprobás la primera orden', detail: 'Vos decidís; la IA solo sugiere.' },
]

export default function CTA() {
  return (
    <section
      id="contact"
      className="section-pad"
      style={{ background: 'var(--inverse-bg)', color: 'var(--inverse-ink)' }}
    >
      <div className="shell">
        <div className="flex items-baseline gap-4 mb-12 md:mb-16">
          <span className="t-mono text-[13px]" style={{ color: 'var(--inverse-graphite)' }}>
            02
          </span>
          <h2 className="t-h2 max-w-[16ch]">Puesta en marcha en una semana</h2>
        </div>

        <div className="grid grid-cols-12 gap-y-12 gap-x-8 items-end">
          {/* Pasos de onboarding: sustituyen a las dos cajas genéricas */}
          <ol className="col-span-12 lg:col-span-7">
            {STEPS.map((step, i) => (
              <li
                key={step.n}
                className="grid grid-cols-[auto_1fr] gap-x-5 py-5 border-t"
                style={{
                  borderColor: 'var(--inverse-rule)',
                  borderBottomWidth: i === STEPS.length - 1 ? '1px' : 0,
                  borderBottomStyle: 'solid',
                }}
              >
                <span
                  className="t-mono text-[13px] tabular-nums pt-0.5"
                  style={{ color: 'var(--inverse-graphite)' }}
                >
                  {step.n}
                </span>
                <div>
                  <h3 className="t-h3 mb-1">{step.title}</h3>
                  <p className="t-small" style={{ color: 'var(--inverse-graphite)' }}>
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* Acción */}
          <div className="col-span-12 lg:col-span-5 lg:pl-4">
            <p
              className="text-[15px] leading-relaxed mb-6 max-w-[34ch]"
              style={{ color: 'var(--inverse-graphite)' }}
            >
              Probá con tu propio catálogo durante 14 días. Si el pronóstico no te sirve,
              no pagás nada.
            </p>

            {/* Una sola acción primaria. La secundaria baja a enlace de
                texto para que no compitan al quedar apiladas. */}
            <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-start gap-x-6 gap-y-4">
              <CtaButton label="Probar 14 días" variant="inverse" />
              <a
                href="#contact"
                className="inline-flex items-center min-h-[44px] text-[15px] font-medium underline underline-offset-4 decoration-1 transition-opacity hover:opacity-70"
                style={{ color: 'var(--inverse-graphite)', textDecorationColor: 'currentColor' }}
              >
                Prefiero hablar con alguien
              </a>
            </div>

            <p
              className="t-mono text-[11px] mt-5"
              style={{ color: 'var(--inverse-graphite)' }}
            >
              Sin tarjeta · Cancelás cuando quieras
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
