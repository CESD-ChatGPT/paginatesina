import { useContext } from 'react'
import { ThemeContext } from '../contexts/ThemeContext'

/* ─────────────────────────────────────────────────────────────
   From Uiverse.io by Yaya12085 — base real de este componente.

   SE CONSERVA del original:
     · el patrón #checkbox oculto + label hermano (`~`)
     · la pista con las cuatro capas de box-shadow inset que la hunden
     · la perilla circular con gradiente cromado (linear-gradient 130deg)
     · el desplazamiento de la perilla al estado marcado
     · el giro en perspectiva al hover, invertido cuando está marcado
     · las transiciones de 0.4s

   SE ADAPTA a SOLVUS:
     · escala 120×60 → 64×32 (la original ocupaba media navbar)
       manteniendo las proporciones: perilla = 2/3 de la altura,
       offset = 1/6, y las sombras escaladas en la misma razón
     · el negro del estado marcado pasa al petróleo/teal de marca
     · la pista se apoya en los tokens de superficie para funcionar
       en ambos temas
     · se conecta al ThemeContext existente (no duplica sistema de temas)
     · focus-visible y área táctil de 44px, que el original no traía
   ───────────────────────────────────────────────────────────── */

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  const isDark = theme === 'dark'

  return (
    <>
      <style>{`
        .theme-switch {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        #theme-checkbox {
          display: none;
        }

        .theme-switch__label {
          height: 32px;
          width: 64px;
          background-color: var(--surface);
          border-radius: 16px;
          box-shadow:
            inset 0 0 3px 2px rgba(255, 255, 255, 0.9),
            inset 0 0 11px 1px rgba(11, 44, 64, 0.42),
            5px 11px 16px rgba(11, 44, 64, 0.10),
            inset 0 0 0 2px rgba(11, 44, 64, 0.28);
          display: flex;
          align-items: center;
          cursor: pointer;
          position: relative;
          transition: transform 0.4s, background-color 0.4s, box-shadow 0.4s;
        }

        /* Área táctil de 44px sin agrandar el control */
        .theme-switch__label::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 44px;
        }

        .theme-switch__label:hover {
          transform: perspective(100px) rotateX(5deg) rotateY(-5deg);
        }

        #theme-checkbox:checked ~ .theme-switch__label:hover {
          transform: perspective(100px) rotateX(-5deg) rotateY(5deg);
        }

        #theme-checkbox:focus-visible ~ .theme-switch__label {
          outline: 2px solid var(--accent);
          outline-offset: 3px;
        }

        /* Perilla — gradiente cromado del original */
        .theme-switch__label::before {
          position: absolute;
          content: "";
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background-color: #ffffff;
          background-image: linear-gradient(
            130deg,
            #b9c6cc 10%,
            #ffffff 11%,
            #93a7b1 62%
          );
          left: 5px;
          box-shadow:
            0 1px 1px rgba(11, 44, 64, 0.3),
            5px 5px 6px rgba(11, 44, 64, 0.3);
          transition: 0.4s;
          z-index: 1;
        }

        /* Estado marcado = modo oscuro. El negro del original pasa al
           petróleo de marca con el teal como luz. */
        #theme-checkbox:checked ~ .theme-switch__label::before {
          left: 37px;
          background-color: var(--surface);
          background-image: linear-gradient(315deg, #0b2c40 0%, #1f6c82 70%);
        }

        #theme-checkbox:checked ~ .theme-switch__label {
          background-color: var(--surface-sunken);
          box-shadow:
            inset 0 0 3px 2px rgba(147, 167, 177, 0.25),
            inset 0 0 11px 1px rgba(0, 0, 0, 0.55),
            5px 11px 16px rgba(0, 0, 0, 0.25),
            inset 0 0 0 2px rgba(31, 108, 130, 0.45);
        }

        @media (prefers-reduced-motion: reduce) {
          .theme-switch__label,
          .theme-switch__label::before {
            transition: none;
          }
          .theme-switch__label:hover,
          #theme-checkbox:checked ~ .theme-switch__label:hover {
            transform: none;
          }
        }
      `}</style>

      <div className="theme-switch">
        <input
          type="checkbox"
          id="theme-checkbox"
          checked={isDark}
          onChange={toggleTheme}
        />
        <label
          htmlFor="theme-checkbox"
          className="theme-switch__label"
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          <span className="sr-only">
            {isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          </span>
        </label>
      </div>
    </>
  )
}
