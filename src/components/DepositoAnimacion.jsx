import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { buildData, dibujarEscena, clamp, win, TW, FONDOS } from './deposito/escena'
import { ThemeContext } from '../contexts/ThemeContext'
import { prefersReducedMotion } from '../lib/motion'
import BotonBrillo from './BotonBrillo'

/* Animación corta del efecto de Stockus en un depósito: del desorden a un
   depósito donde cada producto está a un LED de distancia. Arranca sola
   cuando la sección entra en pantalla, se pausa al salir y se puede
   recorrer estado por estado. Con reducción de movimiento queda en el
   estado final, sin reproducirse sola.

   Es una ilustración con datos de ejemplo (leche, estante C), no el resultado
   de un depósito real. */

const PASOS = [
  { etiqueta: '01 · El problema', titulo: 'El stock se lleva de memoria', alerta: true },
  { etiqueta: '02 · La consecuencia', titulo: 'Se pierde tiempo y se cometen errores', alerta: true },
  { etiqueta: '03 · Ingreso con Stockus', titulo: 'Registrás ingresos y egresos desde web o chat' },
  { etiqueta: '04 · Ubicación con LEDs', titulo: 'Preguntás y el LED te muestra dónde está' },
  { etiqueta: '05 · Resultado', titulo: 'Stock claro. Cada producto, a un LED de distancia.' },
]

/* Segundos que dura cada estado fijo y cada transición por unidad de TW. */
const PAUSA = 2.6
const POR_TRAMO = 2.8

function tramos() {
  const out = []
  for (let i = 0; i < 5; i++) {
    out.push({ hold: i, len: i === 0 ? PAUSA * 0.6 : PAUSA })
    if (i < 4) out.push({ tr: i, len: TW[i] * POR_TRAMO })
  }
  return out
}
const TRAMOS = tramos()
const TOTAL = TRAMOS.reduce((a, b) => a + b.len, 0)

function posicion(x) {
  let rest = x
  for (const q of TRAMOS) {
    if (rest <= q.len || q === TRAMOS[TRAMOS.length - 1]) return q.hold != null ? q.hold : q.tr + clamp(q.len ? rest / q.len : 1)
    rest -= q.len
  }
  return 4
}

function tiempoDeEstado(i) {
  let acc = 0
  for (const q of TRAMOS) {
    if (q.hold === i) break
    acc += q.len
  }
  return acc
}

export default function DepositoAnimacion() {
  const { theme } = useContext(ThemeContext)
  const tema = theme === 'dark' ? 'oscuro' : 'claro'
  const reducir = useMemo(() => prefersReducedMotion(), [])
  const [t, setT] = useState(reducir ? TOTAL : 0)
  const [reproduciendo, setReproduciendo] = useState(false)
  const raiz = useRef(null)
  const raf = useRef(0)
  const ultimo = useRef(null)
  const tRef = useRef(t)
  const empezo = useRef(reducir)
  const pausaUsuario = useRef(false)
  const datos = useMemo(() => buildData(), [])

  tRef.current = t

  function parar() {
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = 0
    ultimo.current = null
  }

  function bucle(ts) {
    if (ultimo.current == null) ultimo.current = ts
    const dt = Math.min(0.1, (ts - ultimo.current) / 1000)
    ultimo.current = ts
    // En loop: al terminar, vuelve al principio sin cortar.
    let nuevo = tRef.current + dt
    if (nuevo >= TOTAL) nuevo -= TOTAL
    tRef.current = nuevo
    setT(nuevo)
    raf.current = requestAnimationFrame(bucle)
  }

  function reproducir(desdeCero) {
    parar()
    if (desdeCero) {
      tRef.current = 0
      setT(0)
    }
    setReproduciendo(true)
    raf.current = requestAnimationFrame(bucle)
  }

  function pausar() {
    parar()
    setReproduciendo(false)
  }

  useEffect(() => {
    const el = raiz.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.4) {
          if (!empezo.current) {
            empezo.current = true
            reproducir(true)
          } else if (!pausaUsuario.current && !raf.current) {
            // Volvió a la vista: sigue donde estaba, salvo que la hayan pausado a mano.
            reproducir(false)
          }
        } else {
          pausar()
        }
      },
      { threshold: [0, 0.4] },
    )
    obs.observe(el)
    return () => {
      obs.disconnect()
      parar()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function irA(i) {
    parar()
    tRef.current = tiempoDeEstado(i)
    setT(tRef.current)
    pausaUsuario.current = false
    setReproduciendo(true)
    raf.current = requestAnimationFrame(bucle)
  }

  function alternar() {
    if (reproduciendo) {
      pausaUsuario.current = true
      pausar()
    } else {
      pausaUsuario.current = false
      reproducir(false)
    }
  }

  const p = posicion(t)
  const cuenta = p < 1.4 ? 0 : p < 3.5 ? Math.round(20 * win(p, 1.5, 2.0)) : p < 3.8 ? 20 : 19
  const opacidad = (i) => clamp(1 - Math.abs(p - i) * 2.3)
  const chatOp = [
    clamp(1 - Math.max(0, 1.55 - p) * 4) * clamp(1 - Math.max(0, p - 2) * 2.3),
    opacidad(3),
    opacidad(4),
  ]

  const burbuja = (lado) =>
    lado === 'usuario'
      ? { alignSelf: 'flex-end', background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: '14px 14px 2px 14px', fontWeight: 500, fontSize: 'clamp(18px, 2vw, 24px)', lineHeight: 1.2, padding: '10px 16px' }
      : { alignSelf: 'flex-start', background: 'var(--surface)', border: '1px solid var(--rule-strong)', color: 'var(--ink)', borderRadius: '14px 14px 14px 2px', fontSize: 16, lineHeight: 1.3, padding: '10px 14px', display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 6 }

  const Cuenta = () => (
    <span className="t-mono" style={{ fontSize: 22, fontWeight: 600, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
      {cuenta}
    </span>
  )

  return (
    <section className="section-pad rule-bottom" id="deposito">
      <div className="shell">
        <div className="flex items-baseline gap-4 mb-6">
          <h2 className="t-h2 titulo-reveal max-w-[22ch]">Así cambia un depósito</h2>
        </div>
        <p className="t-mono text-[11px] text-muted mb-10 md:mb-14">Ilustración con datos de ejemplo.</p>

        <div ref={raiz} className="grid grid-cols-12 gap-y-10 gap-x-8 items-center">
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
            <ol className="sr-only">
              {PASOS.map((s) => (
                <li key={s.etiqueta}>{s.etiqueta}: {s.titulo}</li>
              ))}
            </ol>

            <div aria-hidden="true" style={{ display: 'grid', minHeight: 96 }}>
              {PASOS.map((s, i) => (
                <div
                  key={s.etiqueta}
                  style={{ gridArea: '1 / 1', opacity: opacidad(i), transform: `translateY(${((i - p) * 18).toFixed(1)}px)`, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}
                >
                  <span className="t-label" style={{ color: s.alerta ? 'var(--alert)' : 'var(--accent)' }}>{s.etiqueta}</span>
                  <h3 className="t-h3" style={{ fontSize: 'clamp(24px, 3vw, 38px)', lineHeight: 1.08, textWrap: 'balance' }}>{s.titulo}</h3>
                </div>
              ))}
            </div>

            <div aria-hidden="true" style={{ display: 'grid', minHeight: 100 }}>
              <div style={{ gridArea: '1 / 1', opacity: chatOp[0], transform: `translateY(${((2 - p) * -14).toFixed(1)}px)`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={burbuja('usuario')}>Ingresaron 20 cajas de leche</div>
                <div style={burbuja('sistema')}>Registrado. Leche entera: <Cuenta /> u.</div>
              </div>
              <div style={{ gridArea: '1 / 1', opacity: chatOp[1], transform: `translateY(${((3 - p) * -14).toFixed(1)}px)`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={burbuja('usuario')}>¿Dónde está la leche?</div>
                <div style={burbuja('sistema')}>Estante C, nivel 2. LED encendido.</div>
              </div>
              <div style={{ gridArea: '1 / 1', opacity: chatOp[2], transform: `translateY(${((4 - p) * -14).toFixed(1)}px)`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={burbuja('usuario')}>Retiro 1 caja de leche</div>
                <div style={burbuja('sistema')}>Stock actualizado. Leche entera: <Cuenta /> u.</div>
              </div>
            </div>

            <div className="flex items-center gap-x-14 gap-y-8 flex-wrap mt-2">
              <div className="flex items-center gap-2.5">
              {PASOS.map((s, i) => (
                <button
                  key={s.etiqueta}
                  type="button"
                  onClick={() => irA(i)}
                  aria-label={`Ir al estado ${i + 1}: ${s.titulo}`}
                  className="py-3"
                  style={{ width: 32 }}
                >
                  <span style={{ display: 'block', height: 3, background: 'var(--rule-strong)' }}>
                    <span style={{ display: 'block', height: 3, background: i < 2 ? 'var(--alert)' : 'var(--accent)', transformOrigin: 'left', transform: `scaleX(${clamp(1 - Math.abs(p - i) * 1.6)})` }} />
                  </span>
                </button>
              ))}
              </div>
              <BotonBrillo onClick={alternar} aria-pressed={reproduciendo}>
                {reproduciendo ? 'Pausa' : 'Reproducir'}
              </BotonBrillo>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7">
            <div
              style={{ background: FONDOS[tema], border: '1px solid var(--rule-strong)', borderRadius: 3, aspectRatio: '930 / 715', width: '100%', maxHeight: '78vh', overflow: 'hidden' }}
            >
              {dibujarEscena(p, datos, tema)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
