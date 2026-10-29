import { useEffect, useRef, useState } from 'react'

/* Cómo funciona el ChatBot Stock: un solo video con los cinco capítulos del
   ChatBot real de Vento. El video se carga con Media Source Extensions: una
   descarga y saltos a cualquier punto aunque el servidor no acepte pedidos por
   rangos. Se carga cuando la sección está por entrar en pantalla. */

const CAPITULOS = [
  { t: 3, titulo: 'Ingresar al ChatBot', texto: 'Crear la cuenta y entrar con usuario y PIN.' },
  { t: 17, titulo: 'Restar stock por SKU', texto: 'Elegís el producto por su código, restás la cantidad y el ChatBot confirma el cambio.' },
  { t: 34, titulo: 'Dashboard y alertas', texto: 'Stock por ubicación, productos para reponer y alertas de mínimo.' },
  { t: 51, titulo: 'Movimientos y cierre de sesión', texto: 'Historial de entradas y salidas, y salir del sistema.' },
]

const CODEC = 'video/mp4; codecs="avc1.4D401F, mp4a.40.2"'

const fmt = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`

export default function ComoFunciona() {
  const videoRef = useRef(null)
  const [capitulo, setCapitulo] = useState(-1)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const url = `${import.meta.env.BASE_URL}videos/como-funciona.mp4`
    let objectUrl = null
    let cargado = false
    let cancelado = false

    function cargar() {
      if (cargado) return
      cargado = true

      if (!('MediaSource' in window) || !MediaSource.isTypeSupported(CODEC)) {
        video.src = url
        return
      }

      const ms = new MediaSource()
      objectUrl = URL.createObjectURL(ms)
      video.src = objectUrl

      ms.addEventListener(
        'sourceopen',
        async () => {
          try {
            const respuesta = await fetch(url)
            const datos = await respuesta.arrayBuffer()
            if (cancelado) return
            const sb = ms.addSourceBuffer(CODEC)
            sb.addEventListener(
              'updateend',
              () => {
                if (ms.readyState === 'open') ms.endOfStream()
              },
              { once: true },
            )
            sb.appendBuffer(datos)
          } catch {
            video.src = url
          }
        },
        { once: true },
      )
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          observador.disconnect()
          cargar()
        }
      },
      { rootMargin: '400px' },
    )
    observador.observe(video)

    return () => {
      cancelado = true
      observador.disconnect()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [])

  function irA(t) {
    const v = videoRef.current
    if (!v) return
    const saltar = () => {
      v.currentTime = t
      v.play().catch(() => {})
    }
    if (v.readyState >= 1) saltar()
    else v.addEventListener('loadedmetadata', saltar, { once: true })
  }

  function alCambiarTiempo(e) {
    const t = e.currentTarget.currentTime
    const idx = CAPITULOS.reduce((acc, c, i) => (t >= c.t ? i : acc), -1)
    if (idx !== capitulo) setCapitulo(idx)
  }

  return (
    <section className="section-pad rule-bottom" id="como-funciona">
      <div className="shell">
        <div className="flex items-baseline gap-4 mb-12 md:mb-16">
          <span className="t-mono text-[13px] text-muted">03</span>
          <h2 className="t-h2 max-w-[24ch]">Cómo funciona el ChatBot Stock</h2>
        </div>

        <div className="grid grid-cols-12 gap-y-12 gap-x-8 items-start">
          <div className="col-span-12 lg:col-span-6">
            <p className="t-body text-[16px] max-w-[46ch] mb-10">
              Un recorrido real por el ChatBot en poco más de un minuto, con la velocidad ajustada para verlo bien. Elegí un
              capítulo o mirá todo seguido.
            </p>

            <ol className="flex flex-col">
              {CAPITULOS.map((c, i) => (
                <li key={c.t} className="border-t border-rule last:border-b">
                  <button
                    type="button"
                    onClick={() => irA(c.t)}
                    aria-current={i === capitulo ? 'step' : undefined}
                    className={`w-full grid grid-cols-[48px_1fr_auto] gap-x-4 py-5 text-left transition-colors hover:text-[var(--accent)] ${
                      i === capitulo ? 'text-[var(--accent)]' : ''
                    }`}
                  >
                    <span className="t-mono text-[13px] text-muted pt-1">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className="t-h3 mb-1">{c.titulo}</h3>
                      <p className="t-body text-[15px]">{c.texto}</p>
                    </div>
                    <span className="t-mono text-[12px] text-muted pt-1">▶ {fmt(c.t)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:col-start-8 flex flex-col items-center lg:items-end">
            <video
              ref={videoRef}
              controls
              playsInline
              preload="metadata"
              onTimeUpdate={alCambiarTiempo}
              aria-label="Video: cómo funciona el ChatBot Stock"
              className="block w-full rounded-[3px] border border-rule bg-black"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
