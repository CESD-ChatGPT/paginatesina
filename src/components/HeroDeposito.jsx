import { useContext, useEffect, useMemo, useRef } from 'react'
import { buildData, dibujarEscena, FONDOS } from './deposito/escena'
import { ThemeContext } from '../contexts/ThemeContext'
import { gsap, prefersReducedMotion } from '../lib/motion'

/* Ilustración del hero: el depósito ya ordenado, con la tira LED marcando
   un producto. Es la misma escena de "Así cambia un depósito", fija en el
   estado en que la luz señala la caja (el pulso lo hace CSS). Con el mouse,
   la escena se inclina apenas hacia el puntero. Sin texto: lo primero que se
   ve es el depósito, no la explicación. */

const ESTADO_LED = 3.0

export default function HeroDeposito() {
  const marco = useRef(null)
  const { theme } = useContext(ThemeContext)
  const tema = theme === 'dark' ? 'oscuro' : 'claro'
  const datos = useMemo(() => buildData(), [])

  useEffect(() => {
    const el = marco.current
    if (!el || prefersReducedMotion()) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const seccion = el.closest('section') || document.body
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.8, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.8, ease: 'power3.out' })

    function mover(e) {
      const r = seccion.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      ry(x * 6)
      rx(-y * 5)
    }
    function salir() {
      rx(0)
      ry(0)
    }
    gsap.set(el, { transformPerspective: 1000 })
    seccion.addEventListener('pointermove', mover)
    seccion.addEventListener('pointerleave', salir)
    return () => {
      seccion.removeEventListener('pointermove', mover)
      seccion.removeEventListener('pointerleave', salir)
    }
  }, [])

  return (
    <div className="hero-escena">
      <div
        ref={marco}
        style={{ background: FONDOS[tema], border: '1px solid var(--rule-strong)', borderRadius: 3, aspectRatio: '930 / 715', width: '100%', overflow: 'hidden', willChange: 'transform' }}
      >
        {dibujarEscena(ESTADO_LED, datos, tema)}
      </div>
      <p className="t-mono text-[11px] text-muted mt-3">Ilustración con datos de ejemplo.</p>
    </div>
  )
}
