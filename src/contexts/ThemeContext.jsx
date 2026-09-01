import { createContext, useState, useEffect } from 'react'

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

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('theme', next)
      } catch {
        // sin persistencia, pero el tema igual cambia en esta sesión
      }
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
