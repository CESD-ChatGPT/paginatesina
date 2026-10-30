import { useEffect } from 'react'

/* Cierre con Escape para cualquier overlay (drawer, dropdown, modal).
   Se centraliza porque el panel ya tiene cuatro de estos (drawers de
   valorización/transferencia, notificaciones, command palette) y todos
   necesitan el mismo comportamiento. */
export function useEscapeClose(active, onClose) {
  useEffect(() => {
    if (!active) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [active, onClose])
}
