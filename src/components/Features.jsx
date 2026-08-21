import { useRef, useLayoutEffect } from 'react'
import { Boxes, Bell, Workflow, Building2, ShieldCheck } from 'lucide-react'
import DemandChart from './charts/DemandChart'
import { getDemandPreview } from '../data/inventory'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/motion'

/* Jerarquía real en lugar de seis cards iguales:
   una capacidad principal (la que define el producto) con evidencia visual,
   y cinco de soporte como renglones compactos separados por hairlines.

   MOTION: esta sección vivía sin ningún movimiento — todo el contenido
   aparecía ya puesto apenas cargaba la página, sin relación con el scroll.
   Ahora el encabezado, el panel principal y cada renglón de soporte entran
   en cascada la primera vez que se ven, vía ScrollTrigger.batch (una sola
   vez, sin scrub ni pin — esto es contenido de lectura, no una narrativa
   de scroll-jacking). */

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

export default function Features() {
  const sectionRef = useRef(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const targets = section.querySelectorAll('.reveal-el')

    if (prefersReducedMotion()) {
      gsap.set(targets, { clearProps: 'all' })
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(targets, { autoAlpha: 0, y: 16 })
      ScrollTrigger.batch(targets, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
          }),
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section id="features" className="section-pad rule-bottom" ref={sectionRef}>
      <div className="shell">
        {/* Encabezado de sección: índice + título, alineado a la izquierda */}
        <div className="flex items-baseline gap-4 mb-12 md:mb-16 reveal-el">
          <span className="t-mono text-[13px] text-muted">01</span>
          <h2 className="t-h2 max-w-[18ch]">Qué resuelve, concretamente</h2>
        </div>

        {/* Capacidad principal — jerarquía visual dominante */}
        <div className="panel grid grid-cols-12 gap-y-8 mb-px reveal-el">
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
            <DemandChart {...getDemandPreview()} />
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
                  'group flex gap-4 py-6 md:py-7 border-b border-rule reveal-el',
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
