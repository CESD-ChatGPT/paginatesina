import { ArrowRight } from 'lucide-react'

/* From Uiverse.io by Creatlydev — conservado: el relleno que entra desde
   la izquierda al hover y la caja de ícono adosada.
   Adaptado al sistema: esquinas rectas, acento único y variante para
   la banda invertida. */
export default function CtaButton({ label = 'Comenzar', variant = 'default', onClick }) {
  return (
    <>
      <style>{`
        .cta-btn {
          position: relative;
          display: inline-flex;
          align-items: stretch;
          overflow: hidden;
          border-radius: 2px;
          border: 1px solid var(--rule-strong);
          background: var(--surface);
          color: var(--ink);
          font-family: inherit;
          flex-shrink: 0;
          max-width: 100%;
        }

        .cta-btn--inverse {
          border-color: var(--inverse-rule);
          background: var(--inverse-bg);
          color: var(--inverse-ink);
        }

        .cta-btn__fill {
          position: absolute;
          inset: 0;
          background: var(--accent);
          transform: translateX(-100%);
          transition: transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1);
          z-index: 0;
        }

        .cta-btn:hover .cta-btn__fill,
        .cta-btn:focus-visible .cta-btn__fill {
          transform: translateX(0);
        }

        .cta-btn__body {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          min-width: 0;
        }

        .cta-btn__icon {
          display: grid;
          place-items: center;
          width: 44px;
          align-self: stretch;
          background: var(--accent);
          color: var(--accent-ink);
          flex-shrink: 0;
          transition: background 260ms ease;
        }

        .cta-btn__label {
          padding: 12px 20px 12px 14px;
          font-size: 15px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 200ms ease;
        }

        .cta-btn:hover .cta-btn__label,
        .cta-btn:focus-visible .cta-btn__label {
          color: var(--accent-ink);
        }

        .cta-btn svg {
          width: 17px;
          height: 17px;
          transition: transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1);
        }

        .cta-btn:hover svg {
          transform: translateX(2px);
        }

        @media (max-width: 639px) {
          .cta-btn {
            width: 100%;
          }
          .cta-btn__body {
            width: 100%;
          }
          .cta-btn__label {
            flex: 1;
            text-align: left;
          }
        }
      `}</style>

      <button
        className={`cta-btn${variant === 'inverse' ? ' cta-btn--inverse' : ''}`}
        onClick={onClick}
      >
        <span className="cta-btn__fill" aria-hidden="true" />
        <span className="cta-btn__body">
          <span className="cta-btn__icon" aria-hidden="true">
            <ArrowRight strokeWidth={2} />
          </span>
          <span className="cta-btn__label">{label}</span>
        </span>
      </button>
    </>
  )
}
