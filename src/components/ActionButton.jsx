import { useId } from 'react'

/* ─────────────────────────────────────────────────────────────
   From Uiverse.io by Creatlydev — base real de este botón.

   NO reemplaza a <CtaButton/>. Son dos piezas distintas:
     · CtaButton  → llamada a la acción de marketing (landing)
     · ActionButton → acción operativa dentro del panel
   Nunca coinciden en pantalla.

   SE CONSERVA del original:
     · la estructura y los nombres de clase: .button, .button-decor,
       .button-content, .button__icon, .button__text
     · la variable --clr que pinta relleno y caja de ícono
     · el .button-decor que entra desde translateX(-100%) al hover y el
       texto que vira a blanco
     · el SVG completo del original, con su máscara y su degradado

   SE ADAPTA a SOLVUS:
     · --clr pasa de #00ad54 al teal de marca vía token
     · border-radius 1.5rem → 3px, que es el radio del sistema; la
       píldora rompía con el resto de superficies del panel
     · los IDs del SVG se namespacean con useId(): los del original son
       fijos y romperían máscara y degradado al montar dos instancias
     · alto mínimo de 44px para área táctil
     · estado pending y disabled, que el original no contemplaba
     · prefers-reduced-motion desactiva el desplazamiento del relleno

   El ícono del original —un envío dentro de un círculo— se conserva
   porque encaja con la acción real: despachar una orden a proveedor.
   ───────────────────────────────────────────────────────────── */

export default function ActionButton({
  label = 'Generar orden',
  onClick,
  pending = false,
  disabled = false,
}) {
  const uid = useId().replace(/:/g, '')
  const maskId = `ab-mask-${uid}`
  const gradId = `ab-grad-${uid}`

  return (
    <>
      <style>{`
        .button {
          text-decoration: none;
          line-height: 1;
          border-radius: 3px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 8px 18px rgba(11, 44, 64, 0.10);
          background-color: var(--surface);
          color: var(--ink);
          border: 1px solid var(--rule-strong);
          cursor: pointer;
          min-height: 44px;
          display: inline-flex;
          align-items: stretch;
          max-width: 100%;
        }

        .button:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .button-decor {
          position: absolute;
          inset: 0;
          background-color: var(--clr);
          transform: translateX(-100%);
          transition: transform 0.3s;
          z-index: 0;
        }

        .button-content {
          display: flex;
          align-items: center;
          font-weight: 600;
          position: relative;
          overflow: hidden;
          min-width: 0;
        }

        .button__icon {
          width: 48px;
          align-self: stretch;
          background-color: var(--clr);
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .button__text {
          display: inline-block;
          transition: color 0.2s;
          padding: 2px 1.5rem 2px;
          padding-left: 0.75rem;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          max-width: 200px;
          font-size: 15px;
        }

        .button:not(:disabled):hover .button__text,
        .button:not(:disabled):focus-visible .button__text {
          color: #fff;
        }

        .button:not(:disabled):hover .button-decor,
        .button:not(:disabled):focus-visible .button-decor {
          transform: translate(0);
        }

        .button:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .button-decor { transition: none; }
        }
      `}</style>

      <button
        className="button"
        style={{ '--clr': 'var(--accent)' }}
        onClick={onClick}
        disabled={disabled || pending}
        aria-busy={pending || undefined}
      >
        <span className="button-decor" aria-hidden="true"></span>
        <div className="button-content">
          <div className="button__icon">
            <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" aria-hidden="true">
              <circle opacity="0.5" cx="25" cy="25" r="23" fill={`url(#${gradId})`}></circle>
              <mask id={maskId} fill="#fff">
                <path fillRule="evenodd" clipRule="evenodd" d="M34.42 15.93c.382-1.145-.706-2.234-1.851-1.852l-18.568 6.189c-1.186.395-1.362 2-.29 2.644l5.12 3.072a1.464 1.464 0 001.733-.167l5.394-4.854a1.464 1.464 0 011.958 2.177l-5.154 4.638a1.464 1.464 0 00-.276 1.841l3.101 5.17c.644 1.072 2.25.896 2.645-.29L34.42 15.93z"></path>
              </mask>
              <path fillRule="evenodd" clipRule="evenodd" d="M34.42 15.93c.382-1.145-.706-2.234-1.851-1.852l-18.568 6.189c-1.186.395-1.362 2-.29 2.644l5.12 3.072a1.464 1.464 0 001.733-.167l5.394-4.854a1.464 1.464 0 011.958 2.177l-5.154 4.638a1.464 1.464 0 00-.276 1.841l3.101 5.17c.644 1.072 2.25.896 2.645-.29L34.42 15.93z" fill="#fff"></path>
              <path d="M25.958 20.962l-1.47-1.632 1.47 1.632zm2.067.109l-1.632 1.469 1.632-1.469zm-.109 2.068l-1.469-1.633 1.47 1.633zm-5.154 4.638l-1.469-1.632 1.469 1.632zm-.276 1.841l-1.883 1.13 1.883-1.13zM34.42 15.93l-2.084-.695 2.084.695zm-19.725 6.42l18.568-6.189-1.39-4.167-18.567 6.19 1.389 4.166zm5.265 1.75l-5.12-3.072-2.26 3.766 5.12 3.072 2.26-3.766zm2.072 3.348l5.394-4.854-2.938-3.264-5.394 4.854 2.938 3.264zm5.394-4.854a.732.732 0 01-1.034-.054l3.265-2.938a3.66 3.66 0 00-5.17-.272l2.939 3.265zm-1.034-.054a.732.732 0 01.054-1.034l2.938 3.265a3.66 3.66 0 00.273-5.169l-3.265 2.938zm.054-1.034l-5.154 4.639 2.938 3.264 5.154-4.638-2.938-3.265zm1.023 12.152l-3.101-5.17-3.766 2.26 3.101 5.17 3.766-2.26zm4.867-18.423l-6.189 18.568 4.167 1.389 6.19-18.568-4.168-1.389zm-8.633 20.682c1.61 2.682 5.622 2.241 6.611-.725l-4.167-1.39a.732.732 0 011.322-.144l-3.766 2.26zm-6.003-8.05a3.66 3.66 0 004.332-.419l-2.938-3.264a.732.732 0 01.866-.084l-2.26 3.766zm3.592-1.722a3.66 3.66 0 00-.69 4.603l3.766-2.26c.18.301.122.687-.138.921l-2.938-3.264zm11.97-9.984a.732.732 0 01-.925-.926l4.166 1.389c.954-2.861-1.768-5.583-4.63-4.63l1.39 4.167zm-19.956 2.022c-2.967.99-3.407 5.003-.726 6.611l2.26-3.766a.732.732 0 01-.145 1.322l-1.39-4.167z" fill="#fff" mask={`url(#${maskId})`}></path>
              <defs>
                <linearGradient id={gradId} x1="25" y1="2" x2="25" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fff" stopOpacity="0.71"></stop>
                  <stop offset="1" stopColor="#fff" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="button__text">{pending ? 'Generando…' : label}</span>
        </div>
      </button>
    </>
  )
}
