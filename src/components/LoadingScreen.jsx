import { useEffect, useState } from 'react'
import BarsLoader from './BarsLoader'

/* Intro de la primera visita.
   La animación vive ahora en <BarsLoader/> (componente reutilizable);
   acá solo queda el ciclo de vida de la pantalla.

   Dura ~0,7 s y aparece en cada visita. Con prefers-reduced-motion no
   se muestra en absoluto. */

const VISIBLE_MS = 700

export default function LoadingScreen() {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') return 'done'
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'done'
    return 'visible'
  })

  useEffect(() => {
    if (state !== 'visible') return
    const timer = setTimeout(() => setState('done'), VISIBLE_MS)
    const saltar = (e) => {
      if (e.type === 'keydown' && e.key !== 'Escape') return
      setState('done')
    }
    window.addEventListener('keydown', saltar)
    window.addEventListener('pointerdown', saltar)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', saltar)
      window.removeEventListener('pointerdown', saltar)
    }
  }, [state])

  if (state === 'done') return null

  return (
    <>
      <style>{`
        .intro {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: var(--paper);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 26px;
          animation: introOut 320ms ease-out ${VISIBLE_MS - 60}ms forwards;
        }

        @keyframes introOut {
          to { opacity: 0; visibility: hidden; }
        }
      `}</style>

      <div className="intro" role="status" aria-label="Cargando SOLVUS">
        <BarsLoader scale={0.8} />
        <p className="t-label">SOLVUS</p>
      </div>
    </>
  )
}
