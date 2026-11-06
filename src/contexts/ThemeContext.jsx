import { createContext, useState, useEffect } from 'react'
import { flushSync } from 'react-dom'

export const ThemeContext = createContext()

/* localStorage puede tirar excepción, no solo devolver null: modo
   privado, cookies de terceros bloqueadas, cuota llena. Como esto corre
   en el provider más externo, una excepción acá no rompe el tema —
   deja la app entera sin renderizar. El script de index.html ya protege
   esta misma lectura; faltaba acá. */
function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  try {
    return localStorage.getItem('theme') || 'light'
  } catch {
    return 'light'
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  /* El cambio de tema se extiende desde el botón como una onda circular
     (View Transitions API). Sin soporte, o con movimiento reducido, cambia
     de golpe. */
  const toggleTheme = (e) => {
    const next = theme === 'dark' ? 'light' : 'dark'
    const aplicar = () => {
      flushSync(() => setTheme(next))
      try {
        localStorage.setItem('theme', next)
      } catch {
        // sin persistencia, pero el tema igual cambia en esta sesión
      }
    }
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reducir) {
      aplicar()
      return
    }
    const x = e?.clientX ?? window.innerWidth / 2
    const y = e?.clientY ?? window.innerHeight / 2
    document.documentElement.style.setProperty('--vt-x', `${x}px`)
    document.documentElement.style.setProperty('--vt-y', `${y}px`)
    document.startViewTransition(aplicar)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
