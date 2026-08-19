import { useContext } from 'react'
import { ThemeContext } from '../contexts/ThemeContext'

/* From Uiverse.io by Yaya12085 — conservado: el patrón checkbox oculto +
   label con perilla deslizante y el leve giro en perspectiva al hover.
   Adaptado al sistema: se quita el relieve skeuomórfico (sombras internas
   pesadas, gradientes cromados) y se alinea a tinta/papel. */
export function ThemeToggleButton() {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <>
      <style>{`
        .switch {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        #theme-checkbox {
          position: absolute;
          opacity: 0;
          width: 1px;
          height: 1px;
        }

        .switch__track {
          position: relative;
          display: block;
          height: 28px;
          width: 50px;
          border-radius: 2px;
          border: 1px solid var(--rule-strong);
          background: var(--surface-sunken);
          cursor: pointer;
          transition: border-color 200ms ease, background 200ms ease,
            transform 300ms cubic-bezier(0.22, 0.61, 0.36, 1);
        }

        /* Área táctil de 44px sin agrandar el control visualmente */
        .switch__track::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          min-width: 44px;
          height: 44px;
        }

        .switch__track:hover {
          border-color: var(--muted);
          transform: perspective(120px) rotateY(-4deg);
        }

        #theme-checkbox:checked ~ .switch__track:hover {
          transform: perspective(120px) rotateY(4deg);
        }

        #theme-checkbox:focus-visible ~ .switch__track {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        /* Perilla en grafito, no en tinta plena: es un control secundario
           y no debe competir con el CTA de la barra. */
        .switch__track::before {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          height: 20px;
          width: 20px;
          border-radius: 1px;
          background: var(--graphite);
          transition: transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1),
            background 200ms ease;
          z-index: 1;
        }

        #theme-checkbox:checked ~ .switch__track::before {
          transform: translateX(22px);
          background: var(--accent);
        }
      `}</style>

      <div className="switch">
        <input
          type="checkbox"
          id="theme-checkbox"
          checked={theme === 'dark'}
          onChange={toggleTheme}
        />
        <label
          htmlFor="theme-checkbox"
          className="switch__track"
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          <span className="sr-only">
            {theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          </span>
        </label>
      </div>
    </>
  )
}
