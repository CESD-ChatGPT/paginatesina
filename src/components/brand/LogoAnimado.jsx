import { useLayoutEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../../lib/motion'

/* Logo de SOLVUS con animación de entrada: la "S" se dibuja trazo a trazo,
   los chevrones entran y la palabra aparece letra por letra. Se dispara una
   vez, cuando el logo entra en pantalla. Con reducción de movimiento se muestra
   el logo completo sin animar.

   Usa las mismas formas que <Isotipo/> (src/components/brand/Logo.jsx); si se
   cambia el símbolo oficial, hay que actualizar también los paths acá. */

const LETRAS = 'SOLVUS'.split('')

export default function LogoAnimado({ size = 40, className = '' }) {
  const ref = useRef(null)
  const trazoRef = useRef(null)

  useLayoutEffect(() => {
    const raiz = ref.current
    const trazo = trazoRef.current
    if (!raiz || !trazo) return

    const letras = raiz.querySelectorAll('[data-letra]')
    if (prefersReducedMotion()) return

    const longitud = trazo.getTotalLength()
    gsap.set(trazo, { strokeDasharray: longitud, strokeDashoffset: longitud })
    gsap.set(raiz.querySelectorAll('[data-chevron]'), { scale: 0, transformOrigin: '50% 50%' })
    gsap.set(letras, { opacity: 0, y: 8 })

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
    tl.to(trazo, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' })
      .to(raiz.querySelectorAll('[data-chevron]'), { scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(2)' }, '-=0.3')
      .to(letras, { opacity: 1, y: 0, duration: 0.45, stagger: 0.06 }, '-=0.2')

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          observador.disconnect()
          tl.play()
        }
      },
      { threshold: 0.4 },
    )
    observador.observe(raiz)

    return () => {
      observador.disconnect()
      tl.kill()
    }
  }, [])

  return (
    <span ref={ref} className={`inline-flex items-center gap-2.5 ${className}`} role="img" aria-label="SOLVUS">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        <path
          ref={trazoRef}
          d="M52 14H26.5a10.5 10.5 0 0 0 0 21h11a10.5 10.5 0 0 1 0 21H12"
          stroke="currentColor"
          strokeWidth="7.5"
          strokeLinecap="square"
        />
        <path data-chevron d="M52 14 40 24.5h12V14Z" fill="currentColor" />
        <path data-chevron d="M12 56l12-10.5H12V56Z" fill="currentColor" />
      </svg>
      <span aria-hidden="true" style={{ fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1, whiteSpace: 'nowrap' }}>
        {LETRAS.map((l, i) => (
          <span key={i} data-letra style={{ display: 'inline-block' }}>
            {l}
          </span>
        ))}
      </span>
    </span>
  )
}
