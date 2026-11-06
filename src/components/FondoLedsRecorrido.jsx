import { useContext, useEffect, useRef } from 'react'
import { ThemeContext } from '../contexts/ThemeContext'
import { prefersReducedMotion } from '../lib/motion'
import { PASO, COLORES } from './FondoLeds'

/* Grilla de LED para el fondo de "Así automatiza SOLVUS el control de stock".
   Una luz recorre la grilla de izquierda a derecha según el avance del
   scroll, junto a los pasos de la automatización: los LED que ya pasó
   quedan encendidos suave, y los que rodean a la luz brillan fuerte.

   El padre avisa el avance (0 a 1) llamando a la función que se entrega por
   `registrar`. El canvas sigue ese valor con un pequeño retraso y deja de
   dibujar apenas lo alcanza. Con reducción de movimiento queda dibujado con
   todos los LED encendidos suave, sin recorrido. */

const SIGMA = 62

export default function FondoLedsRecorrido({ registrar }) {
  const ref = useRef(null)
  const valor = useRef(0)
  const { theme } = useContext(ThemeContext)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const col = COLORES[theme] || COLORES.light
    const [r, g, b] = col.led
    const quieto = prefersReducedMotion()

    let ancho = 0
    let alto = 0
    let dpr = 1
    let fijo = null
    let objetivo = quieto ? 1 : valor.current
    let actual = objetivo
    let raf = 0

    function armar() {
      const rect = canvas.getBoundingClientRect()
      ancho = Math.max(1, Math.round(rect.width))
      alto = Math.max(1, Math.round(rect.height))
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = ancho * dpr
      canvas.height = alto * dpr
      fijo = document.createElement('canvas')
      fijo.width = canvas.width
      fijo.height = canvas.height
      const f = fijo.getContext('2d')
      f.scale(dpr, dpr)
      f.fillStyle = col.base
      for (let x = PASO / 2; x < ancho + PASO; x += PASO) {
        for (let y = PASO / 2; y < alto + PASO; y += PASO) {
          f.beginPath()
          f.arc(x, y, 1.4, 0, Math.PI * 2)
          f.fill()
        }
      }
    }

    function dibujar() {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(fijo, 0, 0)
      ctx.scale(dpr, dpr)
      const x0 = ancho * 0.06
      const x1 = ancho * 0.94
      const cabeza = x0 + actual * (x1 - x0)
      const medio = alto / 2
      for (let x = PASO / 2; x < ancho + PASO; x += PASO) {
        const d = x - cabeza
        const pasado = d <= 0 ? 0.4 : 0
        const cerca = Math.exp(-(d * d) / (2 * SIGMA * SIGMA))
        for (let y = PASO / 2; y < alto + PASO; y += PASO) {
          // Más brillo en la franja central, donde están los pasos.
          const banda = 0.45 + 0.55 * Math.exp(-Math.pow((y - medio) / (alto * 0.38), 2))
          const i = Math.max(pasado, cerca) * banda
          if (i < 0.04) continue
          if (i > 0.45) {
            const halo = ctx.createRadialGradient(x, y, 0, x, y, 14)
            halo.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${col.brillo * i})`)
            halo.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
            ctx.fillStyle = halo
            ctx.beginPath()
            ctx.arc(x, y, 14, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.25 + 0.75 * i})`
          ctx.beginPath()
          ctx.arc(x, y, 1.8 + 1.2 * i, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    function seguir() {
      const dif = objetivo - actual
      if (Math.abs(dif) < 0.0007) {
        actual = objetivo
        raf = 0
        dibujar()
        return
      }
      actual += dif * 0.14
      dibujar()
      raf = requestAnimationFrame(seguir)
    }

    function mover(v) {
      objetivo = Math.min(1, Math.max(0, v))
      valor.current = objetivo
      if (quieto) return
      if (!raf) raf = requestAnimationFrame(seguir)
    }

    armar()
    dibujar()
    registrar?.(mover)

    const ro = new ResizeObserver(() => {
      armar()
      dibujar()
    })
    ro.observe(canvas)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      ro.disconnect()
      registrar?.(null)
    }
  }, [theme, registrar])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%)',
      }}
    />
  )
}
