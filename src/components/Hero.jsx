import { useRef, useLayoutEffect } from 'react'
import CtaButton from './CtaButton'
import StockPanel from './StockPanel'
import { useSectionLink } from '../hooks/useSectionLink'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/motion'

/* Composición asimétrica y anclada a la izquierda (no centrada):
   bloque tipográfico + panel de producto real, con la banda de
   métricas separada por hairline como pie de un libro mayor.

   MOTION: el hero es lo primero que se ve, así que su entrada es una
   secuencia orquestada al montar (no un fade genérico) — el encabezado
   se descubre línea por línea, como un renglón que se destapa, y el
   resto entra en cascada detrás. La banda de métricas vive más abajo
   (puede quedar fuera de pantalla en mobile) y por eso se dispara por
   scroll, con las cifras contando desde cero — el único lugar de la
   página donde un número "cuenta": refuerza la lectura de precisión/
   libro-mayor en vez de ser un efecto decorativo suelto. */

const FIGURES = [
  {
    to: -32,
    label: 'Capital inmovilizado',
    note: 'promedio a 6 meses',
    format: (v) => `${v <= -0.5 ? '−' : ''}${Math.abs(Math.round(v))}%`,
  },
  {
    to: 94,
    label: 'Precisión de pronóstico',
    note: 'sobre 1,2M de SKU',
    format: (v) => `${Math.round(v)}%`,
  },
  {
    to: 11,
    label: 'Ahorro semanal por equipo',
    note: 'gestión manual evitada',
    format: (v) => `${Math.round(v)} h`,
  },
]

export default function Hero() {
  const goToSection = useSectionLink()
  const rootRef = useRef(null)
  const figuresRef = useRef([])

  useLayoutEffect(() => {
    const root = rootRef.current
    const reduced = prefersReducedMotion()

    const ctx = gsap.context(() => {
      const lines = root.querySelectorAll('.hero-line')
      const label = root.querySelector('.hero-label')
      const body = root.querySelector('.hero-body')
      const ctaItems = root.querySelectorAll('.hero-cta > *')
      const note = root.querySelector('.hero-note')
      const panel = root.querySelector('.hero-panel')

      if (reduced) {
        // Estado final inmediato: nada de secuencia, todo visible ya.
        gsap.set([label, lines, body, ctaItems, note, panel], { clearProps: 'all' })
      } else {
        gsap.set(lines, { yPercent: 100 })
        gsap.set([label, body, ctaItems, note], { autoAlpha: 0, y: 14 })
        gsap.set(panel, { autoAlpha: 0, x: 28 })

        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .to(label, { autoAlpha: 1, y: 0, duration: 0.5 })
          .to(lines, { yPercent: 0, duration: 0.75, stagger: 0.09 }, '-=0.2')
          .to(body, { autoAlpha: 1, y: 0, duration: 0.55 }, '-=0.4')
          .to(ctaItems, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.08 }, '-=0.35')
          .to(note, { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.25')
          .to(panel, { autoAlpha: 1, x: 0, duration: 0.7, ease: 'power3.out' }, '-=0.55')
      }

      // Banda de métricas: puede quedar fuera de pantalla en mobile, así
      // que se dispara por scroll y no por el montaje del hero.
      const figureEls = figuresRef.current.filter(Boolean)
      if (figureEls.length) {
        if (reduced) {
          figureEls.forEach((el, i) => {
            const valueEl = el.querySelector('.hero-figure-value')
            valueEl.textContent = FIGURES[i].format(FIGURES[i].to)
          })
        } else {
          gsap.set(figureEls, { autoAlpha: 0, y: 10 })
          ScrollTrigger.batch(figureEls, {
            start: 'top 90%',
            once: true,
            onEnter: (batch) => {
              gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: 'power2.out',
              })
              batch.forEach((el) => {
                const i = figureEls.indexOf(el)
                const valueEl = el.querySelector('.hero-figure-value')
                const proxy = { v: 0 }
                gsap.to(proxy, {
                  v: FIGURES[i].to,
                  duration: 0.9,
                  delay: 0.1,
                  ease: 'power2.out',
                  onUpdate: () => {
                    valueEl.textContent = FIGURES[i].format(proxy.v)
                  },
                })
              })
            },
          })
        }
      }
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section className="rule-bottom" ref={rootRef}>
      <div className="shell pt-28 pb-0 md:pt-36">
        <div className="grid grid-cols-12 gap-y-12 gap-x-8 items-start">
          {/* Bloque tipográfico */}
          <div className="col-span-12 lg:col-span-6">
            <p className="t-label mb-5 hero-label">Control de inventario con IA</p>

            <h1 className="t-display mb-6">
              <span className="block overflow-hidden">
                <span className="block hero-line">Dejá de comprar</span>
              </span>
              <span className="block overflow-hidden">
                <span className="block hero-line">stock a ciegas.</span>
              </span>
            </h1>

            <p className="t-body mb-8 hero-body">
              SOLVUS lee el histórico de tu depósito, proyecta la demanda real de cada
              SKU y te dice qué reponer, cuánto y cuándo — antes de que se quiebre o de
              que te sobre.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center hero-cta">
              <CtaButton label="Probar 14 días" />
              <a
                href="#features"
                onClick={(e) => goToSection(e, 'features')}
                className="inline-flex items-center justify-center px-5 py-3 text-[15px] font-medium border border-rule-strong hover:border-ink hover:bg-[var(--surface)] transition-colors"
                style={{ borderRadius: '2px' }}
              >
                Ver cómo funciona
              </a>
            </div>

            <p className="t-small mt-6 text-muted hero-note">
              Sin tarjeta. Se conecta a tu ERP o planilla en el día.
            </p>
          </div>

          {/* Panel de producto */}
          <div className="col-span-12 lg:col-span-6 lg:pl-4 hero-panel">
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
              ref={(el) => (figuresRef.current[i] = el)}
              className={[
                'py-6 sm:py-7',
                i > 0 ? 'border-t sm:border-t-0 sm:border-l border-rule sm:pl-6' : '',
                i === 0 ? 'sm:pr-6' : '',
              ].join(' ')}
            >
              <p className="t-figure text-2xl md:text-[28px] mb-1.5 hero-figure-value tabular-nums">
                {f.format(f.to)}
              </p>
              <p className="text-[13px] font-medium mb-0.5">{f.label}</p>
              <p className="t-mono text-[11px] text-muted">{f.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
