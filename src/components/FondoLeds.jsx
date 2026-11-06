import { useContext, useEffect, useRef } from 'react'
import { ThemeContext } from '../contexts/ThemeContext'
import { prefersReducedMotion } from '../lib/motion'

/* Fondo del hero: una grilla de puntos, como los LED de una tira, donde
   algunos se encienden y se apagan despacio. Hay una versión para fondo
   claro (puntos teal) y otra para fondo oscuro (puntos celestes con brillo).
   Se dibuja en un canvas: los puntos fijos se pintan una sola vez y por
   cuadro solo se redibujan los que brillan. Se pausa fuera de pantalla y,
   con reducción de movimiento, queda quieto. */

export const PASO = 28
export const COLORES = {
  light: { base: 'rgba(31, 108, 130, 0.18)', led: [31, 108, 130], brillo: 0.28 },
  dark: { base: 'rgba(95, 212, 240, 0.17)', led: [95, 212, 240], brillo: 0.4 },
}

/* Para la banda invertida de "Puesta en marcha": LEDs en el teal de la marca (nada
   celeste), según el color de la banda y no del tema. En modo claro la banda es
   petróleo oscuro y los puntos son teal más intenso, para que se lean sin brillar
   como los del hero; en modo oscuro la banda es blanca y valen los del hero claro. */
export const COLORES_BANDA = {
  light: { base: 'rgba(31, 108, 130, 0.6)', led: [38, 128, 154], brillo: 0.35 },
  dark: COLORES.light,
}

/* Aleatorio con semilla: al redimensionar, los mismos puntos brillan. */
function semilla(n) {
  let s = n
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export default function FondoLeds({ colores = COLORES, mascara = true }) {
  const ref = useRef(null)
  const { theme } = useContext(ThemeContext)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const col = colores[theme] || colores.light
    const quieto = prefersReducedMotion()

    let ancho = 0
    let alto = 0
    let dpr = 1
    let fijo = null
    let leds = []
    let raf = 0
    let visible = true
    let ultimo = 0

    function armar() {
      const r = canvas.getBoundingClientRect()
      ancho = Math.max(1, Math.round(r.width))
      alto = Math.max(1, Math.round(r.height))
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = ancho * dpr
      canvas.height = alto * dpr

      fijo = document.createElement('canvas')
      fijo.width = canvas.width
      fijo.height = canvas.height
      const f = fijo.getContext('2d')
      f.scale(dpr, dpr)
      f.fillStyle = col.base
      const rnd = semilla(7)
      leds = []
      const cols = Math.ceil(ancho / PASO) + 1
      const filas = Math.ceil(alto / PASO) + 1
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < filas; j++) {
          const x = i * PASO + PASO / 2
          const y = j * PASO + PASO / 2
          f.beginPath()
          f.arc(x, y, 1.4, 0, Math.PI * 2)
          f.fill()
          if (rnd() < 0.035) leds.push({ x, y, fase: rnd() * Math.PI * 2, vel: 0.3 + rnd() * 0.5 })
        }
      }
    }

    function dibujar(t) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(fijo, 0, 0)
      ctx.scale(dpr, dpr)
      const [r, g, b] = col.led
      for (const l of leds) {
        const i = quieto ? 0.55 : Math.pow(Math.max(0, Math.sin(t * l.vel + l.fase)), 3)
        if (i < 0.03) continue
        const halo = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, 15)
        halo.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${col.brillo * i})`)
        halo.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
        ctx.fillStyle = halo
        ctx.beginPath()
        ctx.arc(l.x, l.y, 15, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + 0.7 * i})`
        ctx.beginPath()
        ctx.arc(l.x, l.y, 2.3, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function bucle(ts) {
      raf = requestAnimationFrame(bucle)
      if (ts - ultimo < 33) return
      ultimo = ts
      dibujar(ts / 1000)
    }

    function arrancar() {
      if (quieto || raf || !visible) return
      raf = requestAnimationFrame(bucle)
    }
    function parar() {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }

    armar()
    dibujar(0)
    arrancar()

    const ro = new ResizeObserver(() => {
      armar()
      dibujar(performance.now() / 1000)
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) arrancar()
      else parar()
    })
    io.observe(canvas)

    return () => {
      parar()
      ro.disconnect()
      io.disconnect()
    }
  }, [theme, colores])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={mascara ? { WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)', maskImage: 'linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)' } : undefined}
    />
  )
}
