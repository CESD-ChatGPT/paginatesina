import { useContext } from 'react'
import { Moon, Sun } from 'lucide-react'
import { ThemeContext } from '../contexts/ThemeContext'

/* ─────────────────────────────────────────────────────────────
   El control anterior venía de Uiverse (pista tipo píldora con
   cuatro box-shadow inset, perilla con gradiente cromado y un giro
   en perspectiva al hover). Se reemplaza porque contradecía el
   sistema en todo lo que el sistema define:

     · radios de 1–4 px ("esquinas rectas: estantería, celda, libro
       contable") contra una píldora de 16 px
     · ninguna otra superficie del panel usa sombra —las tarjetas son
       borde de 1 px, box-shadow: none— contra cuatro sombras apiladas
     · los demás controles de la barra (buscar, notificaciones, rol)
       miden 36 px de alto, borde 1 px y radio 2 px

   Además costaba 64 px de ancho en una barra de 375 px, y era parte
   de por qué "Salir" quedaba fuera de pantalla en teléfono.

   Ahora es el mismo botón que la campana: 36×36, radio 2, borde
   rule-strong, ícono de 16. Se conserva del original lo que valía —
   área táctil de 44 px y foco visible— y se suma aria-pressed, que
   antes no estaba.
   ───────────────────────────────────────────────────────────── */

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  const isDark = theme === 'dark'
  const label = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
  const Icon = isDark ? Sun : Moon

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      /* El after invisible lleva el área táctil a 44 px sin agrandar
         el botón ni empujar a los vecinos. */
      className="relative inline-flex items-center justify-center shrink-0 min-h-[36px] min-w-[36px] border transition-colors hover:text-[var(--accent)] after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-full after:h-11"
      style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px' }}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
    </button>
  )
}
