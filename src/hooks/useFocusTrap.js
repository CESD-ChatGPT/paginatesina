import { useEffect } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/* Foco enfocado apenas se abre + Tab que rota dentro del overlay en vez
   de escaparse a la página de atrás. Sin esto, un lector de pantalla o
   un usuario de teclado tabulando desde un drawer abierto termina en el
   contenido tapado por el fondo oscurecido. */
export function useFocusTrap(containerRef, active) {
  useEffect(() => {
    if (!active || !containerRef.current) return
    const container = containerRef.current
    const focusables = () => [...container.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null)

    const previouslyFocused = document.activeElement
    focusables()[0]?.focus()

    function handleKey(e) {
      if (e.key !== 'Tab') return
      const els = focusables()
      if (els.length === 0) return
      const firstEl = els[0]
      const lastEl = els[els.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    container.addEventListener('keydown', handleKey)
    return () => {
      container.removeEventListener('keydown', handleKey)
      previouslyFocused?.focus?.()
    }
  }, [active, containerRef])
}
