import { useLayoutEffect, useRef } from 'react'
import { Database, Activity, AlertCircle, Lightbulb, Zap } from 'lucide-react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/motion'

/* Storytelling del ciclo que define al producto: no son 5 cards sueltas,
   es una secuencia — cada etapa alimenta a la siguiente. En vez de una
   metáfora genérica, en desktop se ancla y se recorre con scroll (pin +
   scrub): es el único lugar del sitio donde eso se justifica, porque acá
   el scroll SÍ representa el avance real de un proceso secuencial, no
   una animación decorativa. En mobile (sin espacio para pinnear) y con
   prefers-reduced-motion cae al mismo patrón de reveal por batch que
   Features/CTA — no un sistema de motion nuevo. */

const STAGES = [
  { icon: Database, title: 'Datos', detail: 'Ventas, stock por depósito y tiempos de entrega de cada proveedor.' },
  { icon: Activity, title: 'Analiza', detail: 'Cruza el consumo reciente contra el histórico y el lead time de reposición.' },
  { icon: AlertCircle, title: 'Detecta', detail: 'Stock crítico, riesgo de quiebre, sobrestock, consumo anómalo.' },
  { icon: Lightbulb, title: 'Recomienda', detail: 'Cuánto pedir y a qué proveedor, con el porqué de cada número.' },
  { icon: Zap, title: 'Acción', detail: 'Generás la orden, transferís stock o ajustás el conteo — en un clic.' },
]

export default function AutomationStory() {
  const sectionRef = useRef(null)
  const lineRef = useRef(null)
  const stageRefs = useRef([])

  useLayoutEffect(() => {
    const section = sectionRef.current
    const stages = stageRefs.current.filter(Boolean)
    const line = lineRef.current
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches
    const reduced = prefersReducedMotion()

    if (reduced) {
      gsap.set(stages, { clearProps: 'all' })
      if (line) gsap.set(line, { clearProps: 'all' })
      return
    }

    if (!isDesktop) {
      const ctx = gsap.context(() => {
        gsap.set(stages, { autoAlpha: 0, y: 16 })
        ScrollTrigger.batch(stages, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }),
        })
      }, section)
      return () => ctx.revert()
    }

    const ctx = gsap.context(() => {
      gsap.set(line, { scaleX: 0, transformOrigin: 'left center' })
      gsap.set(stages, { opacity: 0.35 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.6}`,
          scrub: 0.6,
          pin: true,
          invalidateOnRefresh: true,
        },
      })

      stages.forEach((el, i) => {
        tl.to(line, { scaleX: (i + 1) / stages.length, duration: 1, ease: 'none' }, i)
        tl.to(el, { opacity: 1, duration: 0.4 }, i)
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className="section-pad rule-bottom overflow-hidden" ref={sectionRef}>
      <div className="shell">
        <div className="flex items-baseline gap-4 mb-12 md:mb-16">
          <span className="t-mono text-[13px] text-muted">00</span>
          <h2 className="t-h2 max-w-[24ch]">Así automatiza SOLVUS el control de stock</h2>
        </div>

        <div className="relative">
          <div
            className="hidden lg:block absolute top-[22px] left-0 right-0 h-px"
            style={{ background: 'var(--rule)' }}
          >
            <div ref={lineRef} className="h-px w-full" style={{ background: 'var(--accent)' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-10">
            {STAGES.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={s.title} ref={(el) => (stageRefs.current[i] = el)}>
                  <div
                    className="w-11 h-11 flex items-center justify-center mb-4 border"
                    style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px', background: 'var(--surface)' }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: 'var(--accent)' }}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="t-mono text-[11px] text-muted mb-1">0{i + 1}</p>
                  <h3 className="t-h3 mb-1.5">{s.title}</h3>
                  <p className="t-small">{s.detail}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
