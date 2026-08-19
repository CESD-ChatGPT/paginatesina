import { Boxes, Bell, Workflow, Building2, ShieldCheck } from 'lucide-react'

/* Jerarquía real en lugar de seis cards iguales:
   una capacidad principal (la que define el producto) con evidencia visual,
   y cinco de soporte como renglones compactos separados por hairlines. */

const SUPPORTING = [
  {
    icon: Boxes,
    title: 'Stock en tiempo real',
    description: 'Un solo número de verdad por SKU, sincronizado con tu ERP y tus ventas.',
  },
  {
    icon: Bell,
    title: 'Alertas por excepción',
    description: 'Avisa solo cuando algo se sale del rango esperado. No notifica por notificar.',
  },
  {
    icon: Workflow,
    title: 'Reposición asistida',
    description: 'Genera la orden de compra sugerida; vos aprobás o ajustás antes de enviar.',
  },
  {
    icon: Building2,
    title: 'Multidepósito',
    description: 'Compara rotación entre sucursales y sugiere transferencias antes de comprar.',
  },
  {
    icon: ShieldCheck,
    title: 'Datos aislados',
    description: 'Cifrado en tránsito y en reposo. Tu histórico nunca entrena modelos de terceros.',
  },
]

function DemandChart() {
  return (
    <svg
      viewBox="0 0 320 84"
      className="w-full h-auto"
      role="img"
      aria-label="Curva de demanda histórica y su proyección: la demanda real sube de forma irregular y el pronóstico continúa la tendencia al alza"
    >
      {/* Renglones de referencia */}
      {[20, 42, 64].map((y) => (
        <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="var(--rule)" strokeWidth="1" />
      ))}

      {/* Demanda observada */}
      <polyline
        points="0,62 26,58 53,64 80,48 106,52 133,38 160,42"
        fill="none"
        stroke="var(--graphite)"
        strokeWidth="1.75"
      />

      {/* Proyección */}
      <polyline
        points="160,42 186,34 213,37 240,26 266,30 293,20 320,24"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.75"
        strokeDasharray="4 3"
      />

      {/* Corte entre observado y proyectado */}
      <line x1="160" y1="8" x2="160" y2="76" stroke="var(--rule-strong)" strokeWidth="1" />
      <circle cx="160" cy="42" r="3" fill="var(--accent)" />
    </svg>
  )
}

export default function Features() {
  return (
    <section id="features" className="section-pad rule-bottom">
      <div className="shell">
        {/* Encabezado de sección: índice + título, alineado a la izquierda */}
        <div className="flex items-baseline gap-4 mb-12 md:mb-16">
          <span className="t-mono text-[13px] text-muted">01</span>
          <h2 className="t-h2 max-w-[18ch]">Qué resuelve, concretamente</h2>
        </div>

        {/* Capacidad principal — jerarquía visual dominante */}
        <div className="panel grid grid-cols-12 gap-y-8 mb-px">
          <div className="col-span-12 lg:col-span-6 p-6 md:p-8">
            <p className="t-label mb-4" style={{ color: 'var(--accent)' }}>
              Capacidad principal
            </p>
            <h3 className="t-h2 text-[1.5rem] md:text-[1.75rem] mb-4">
              Pronóstico de demanda por SKU
            </h3>
            <p className="t-body text-[15px] mb-6">
              El modelo aprende de tu histórico de ventas, la estacionalidad y los tiempos
              de entrega de cada proveedor. Cada SKU recibe su propio punto de reposición,
              recalculado a diario.
            </p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 max-w-sm">
              <div>
                <dt className="t-label mb-1">Horizonte</dt>
                <dd className="t-figure text-lg">90 días</dd>
              </div>
              <div>
                <dt className="t-label mb-1">Recálculo</dt>
                <dd className="t-figure text-lg">Diario</dd>
              </div>
            </dl>
          </div>

          <div
            className="col-span-12 lg:col-span-6 p-6 md:p-8 border-t lg:border-t-0 lg:border-l border-rule flex flex-col justify-center"
            style={{ background: 'var(--surface-sunken)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="t-label">Demanda · MB-1180</span>
              <span className="t-mono text-[11px] text-muted">12 meses</span>
            </div>
            <DemandChart />
            <div className="flex items-center gap-5 mt-4">
              <span className="inline-flex items-center gap-2 t-mono text-[11px] text-graphite">
                <span className="w-4 h-px" style={{ background: 'var(--graphite)' }} aria-hidden="true" />
                Observado
              </span>
              <span className="inline-flex items-center gap-2 t-mono text-[11px] text-graphite">
                <span
                  className="w-4 h-px"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(to right, var(--accent) 0 4px, transparent 4px 7px)',
                  }}
                  aria-hidden="true"
                />
                Proyectado
              </span>
            </div>
          </div>
        </div>

        {/* Capacidades de soporte — renglones, no cards.
            El último ocupa el ancho completo y reparte título/descripción
            en dos columnas: cierra la serie en vez de quedar huérfano. */}
        <ul className="grid grid-cols-1 md:grid-cols-2 border-t border-rule">
          {SUPPORTING.map((item, i) => {
            const Icon = item.icon
            const isLast = i === SUPPORTING.length - 1
            const isOrphan = isLast && SUPPORTING.length % 2 === 1

            return (
              <li
                key={item.title}
                className={[
                  'group flex gap-4 py-6 md:py-7 border-b border-rule',
                  isOrphan
                    ? 'md:col-span-2'
                    : i % 2 === 0
                    ? 'md:pr-8'
                    : 'md:pl-8 md:border-l',
                ].join(' ')}
              >
                <span className="t-mono text-[13px] text-muted pt-0.5 shrink-0 tabular-nums">
                  {String(i + 2).padStart(2, '0')}
                </span>
                <Icon
                  className="w-[18px] h-[18px] mt-0.5 shrink-0 text-graphite transition-colors group-hover:text-[var(--accent)]"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <div
                  className={
                    isOrphan
                      ? 'min-w-0 grid md:grid-cols-2 md:gap-8 md:items-baseline flex-1'
                      : 'min-w-0'
                  }
                >
                  <h3 className={isOrphan ? 't-h3 mb-1.5 md:mb-0' : 't-h3 mb-1.5'}>
                    {item.title}
                  </h3>
                  <p className="t-small">{item.description}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
