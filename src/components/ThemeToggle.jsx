import { useContext } from 'react'
import { ThemeContext } from '../contexts/ThemeContext'

/* From Uiverse.io by Yaya12085 — adaptado: escalado para navbar,
   colores de marca y transición día/noche */
export function ThemeToggleButton() {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <>
      <style>{`
        .toggle-container {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .toggle-label {
          height: 34px;
          width: 68px;
          background-color: #ffffff;
          border-radius: 17px;
          -webkit-box-shadow: inset 0 0 4px 2px rgba(255, 255, 255, 1),
            inset 0 0 12px 1px rgba(0, 0, 0, 0.488), 6px 12px 18px rgba(0, 0, 0, 0.096),
            inset 0 0 0 2px rgba(0, 0, 0, 0.3);
          box-shadow: inset 0 0 4px 2px rgba(255, 255, 255, 1),
            inset 0 0 12px 1px rgba(0, 0, 0, 0.488), 6px 12px 18px rgba(0, 0, 0, 0.096),
            inset 0 0 0 2px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          cursor: pointer;
          position: relative;
          transition: transform 0.4s, background-color 0.4s;
        }

        [data-theme="dark"] .toggle-label,
        :root:not([data-theme="light"]) .toggle-label {
          background-color: #1e293b;
          -webkit-box-shadow: inset 0 0 4px 2px rgba(148, 163, 184, 0.4),
            inset 0 0 12px 1px rgba(0, 0, 0, 0.6), 6px 12px 18px rgba(0, 0, 0, 0.3),
            inset 0 0 0 2px rgba(0, 212, 255, 0.35);
          box-shadow: inset 0 0 4px 2px rgba(148, 163, 184, 0.4),
            inset 0 0 12px 1px rgba(0, 0, 0, 0.6), 6px 12px 18px rgba(0, 0, 0, 0.3),
            inset 0 0 0 2px rgba(0, 212, 255, 0.35);
        }

        .toggle-label:hover {
          -webkit-transform: perspective(100px) rotateX(5deg) rotateY(-5deg);
          transform: perspective(100px) rotateX(5deg) rotateY(-5deg);
        }

        #theme-checkbox:checked ~ .toggle-label:hover {
          -webkit-transform: perspective(100px) rotateX(-5deg) rotateY(5deg);
          transform: perspective(100px) rotateX(-5deg) rotateY(5deg);
        }

        #theme-checkbox {
          display: none;
        }

        #theme-checkbox:checked ~ .toggle-label::before {
          left: 38px;
          background-color: #fbbf24;
          background-image: linear-gradient(130deg, #fde68a 10%, #ffffff 11%, #f59e0b 62%);
          transition: 0.4s;
        }

        .toggle-label::before {
          position: absolute;
          content: "";
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background-color: #000000;
          background-image: linear-gradient(130deg, #334155 10%, #00d4ff 11%, #0f172a 62%);
          left: 5px;
          -webkit-box-shadow: 0 2px 1px rgba(0, 0, 0, 0.3), 6px 6px 6px rgba(0, 0, 0, 0.3);
          box-shadow: 0 2px 1px rgba(0, 0, 0, 0.3), 6px 6px 6px rgba(0, 0, 0, 0.3);
          transition: 0.4s;
        }
      `}</style>

      <div className="toggle-container">
        <input
          type="checkbox"
          id="theme-checkbox"
          checked={theme === 'light'}
          onChange={toggleTheme}
          aria-label="Cambiar tema claro/oscuro"
        />
        <label htmlFor="theme-checkbox" className="toggle-label"></label>
      </div>
    </>
  )
}
