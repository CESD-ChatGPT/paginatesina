import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/motion'

/* Efectos de la landing que no pertenecen a una sección en particular:
     · barra de progreso de lectura, arriba de todo
     · los títulos de sección (.titulo-reveal) se descubren de abajo hacia
       arriba la primera vez que entran en pantalla
   Con reducción de movimiento no se anima nada: la barra no se muestra y
   los títulos quedan visibles. */

export default function EfectosLanding() {
  const barra = useRef(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap.to(barra.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.2 },
      })

      const titulos = gsap.utils.toArray('.titulo-reveal')
      gsap.set(titulos, { clipPath: 'inset(0 0 100% 0)', y: 28 })
      ScrollTrigger.batch(titulos, {
        start: 'top 88%',
        once: true,
        onEnter: (lote) =>
          gsap.to(lote, {
            clipPath: 'inset(0 0 -12% 0)',
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            clearProps: 'clipPath',
          }),
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={barra}
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left"
      style={{ background: 'var(--accent)', transform: 'scaleX(0)' }}
    />
  )
}
