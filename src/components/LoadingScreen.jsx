import { useEffect, useState } from 'react'

/* From Uiverse.io by Nawsome — conservada la animación de barras con la
   bola rebotando (que además lee como niveles de stock, coherente con el
   producto).
   Adaptado: la versión anterior bloqueaba el contenido 2,5 s en una página
   estática que carga en menos de 1 s. Ahora dura ~0,7 s y solo aparece en
   la primera visita de la sesión. */

const VISIBLE_MS = 700

export default function LoadingScreen() {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') return 'done'
    // Se omite por completo si ya se vio en la sesión o si el usuario
    // pidió menos movimiento: no tiene sentido retenerle el contenido.
    if (sessionStorage.getItem('seen-intro')) return 'done'
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'done'
    return 'visible'
  })

  useEffect(() => {
    if (state !== 'visible') return
    sessionStorage.setItem('seen-intro', '1')
    const timer = setTimeout(() => setState('done'), VISIBLE_MS)
    return () => clearTimeout(timer)
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
          gap: 22px;
          animation: introOut 320ms ease-out ${VISIBLE_MS - 60}ms forwards;
        }

        @keyframes introOut {
          to { opacity: 0; visibility: hidden; }
        }

        .loader {
          position: relative;
          width: 75px;
          height: 100px;
          transform: scale(0.8);
        }

        .loader__bar {
          position: absolute;
          bottom: 0;
          width: 10px;
          height: 50%;
          background: var(--ink);
          transform-origin: center bottom;
        }

        .loader__bar:nth-child(1) { left: 0px;  transform: scale(1, 0.2); animation: barUp1 4s infinite; }
        .loader__bar:nth-child(2) { left: 15px; transform: scale(1, 0.4); animation: barUp2 4s infinite; }
        .loader__bar:nth-child(3) { left: 30px; transform: scale(1, 0.6); animation: barUp3 4s infinite; }
        .loader__bar:nth-child(4) { left: 45px; transform: scale(1, 0.8); animation: barUp4 4s infinite; }
        .loader__bar:nth-child(5) { left: 60px; transform: scale(1, 1);   animation: barUp5 4s infinite; }

        .loader__ball {
          position: absolute;
          bottom: 10px;
          left: 0;
          width: 10px;
          height: 10px;
          background: var(--accent);
          border-radius: 50%;
          animation: ball624 4s infinite;
        }

        @keyframes ball624 {
          0%   { transform: translate(0, 0); }
          5%   { transform: translate(8px, -14px); }
          10%  { transform: translate(15px, -10px); }
          17%  { transform: translate(23px, -24px); }
          20%  { transform: translate(30px, -20px); }
          27%  { transform: translate(38px, -34px); }
          30%  { transform: translate(45px, -30px); }
          37%  { transform: translate(53px, -44px); }
          40%  { transform: translate(60px, -40px); }
          50%  { transform: translate(60px, 0); }
          57%  { transform: translate(53px, -14px); }
          60%  { transform: translate(45px, -10px); }
          67%  { transform: translate(37px, -24px); }
          70%  { transform: translate(30px, -20px); }
          77%  { transform: translate(22px, -34px); }
          80%  { transform: translate(15px, -30px); }
          87%  { transform: translate(7px, -44px); }
          90%  { transform: translate(0, -40px); }
          100% { transform: translate(0, 0); }
        }

        @keyframes barUp1 {
          0%, 40% { transform: scale(1, 0.2); }
          50%, 90% { transform: scale(1, 1); }
          100% { transform: scale(1, 0.2); }
        }
        @keyframes barUp2 {
          0%, 40% { transform: scale(1, 0.4); }
          50%, 90% { transform: scale(1, 0.8); }
          100% { transform: scale(1, 0.4); }
        }
        @keyframes barUp3 {
          0%, 100% { transform: scale(1, 0.6); }
        }
        @keyframes barUp4 {
          0%, 40% { transform: scale(1, 0.8); }
          50%, 90% { transform: scale(1, 0.4); }
          100% { transform: scale(1, 0.8); }
        }
        @keyframes barUp5 {
          0%, 40% { transform: scale(1, 1); }
          50%, 90% { transform: scale(1, 0.2); }
          100% { transform: scale(1, 1); }
        }

        /* Sin movimiento: se resuelve de inmediato */
        @media (prefers-reduced-motion: reduce) {
          .intro { animation-delay: 0ms; animation-duration: 1ms; }
        }
      `}</style>

      <div className="intro" role="status" aria-label="Cargando SOLVUS">
        <div className="loader" aria-hidden="true">
          <div className="loader__bar"></div>
          <div className="loader__bar"></div>
          <div className="loader__bar"></div>
          <div className="loader__bar"></div>
          <div className="loader__bar"></div>
          <div className="loader__ball"></div>
        </div>
        <p className="t-label">SOLVUS</p>
      </div>
    </>
  )
}
