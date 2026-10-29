import { useEffect, useRef, useState } from 'react'

/* Video de campaña de Stockus (58 s, vertical). Cada escena tiene el segundo
   en el que empieza: al tocarla, el video salta ahí.

   El archivo se carga con Media Source Extensions: se baja entero en una sola
   petición y el navegador lo arma en memoria. Así se puede saltar a cualquier
   punto aunque el servidor no acepte pedidos por rangos (lo que hace que un
   <video> normal no pueda buscar). Se carga cuando la sección está por entrar
   en pantalla, para no pesar en la carga inicial. */

const ESCENAS = [
  { n: '01', t: 4, titulo: 'Buscar a mano', texto: 'El costo de no saber dónde está cada producto.' },
  { n: '02', t: 18, titulo: 'La luz guía', texto: 'El operario va directo al estante, sin revisar cajas.' },
  { n: '03', t: 28, titulo: 'Todo a la vista', texto: 'Cada producto y cada depósito, en un solo panel.' },
  { n: '04', t: 47, titulo: 'Precio y demo', texto: 'Instalación incluida, pagos en cuotas y contacto por WhatsApp.' },
]

const CODEC = 'video/mp4; codecs="avc1.4D401F, mp4a.40.2"'

const fmt = (t) => `0:${String(t).padStart(2, '0')}`

export default function VideoSection() {
  const base = import.meta.env.BASE_URL
  const videoRef = useRef(null)
  const cargarRef = useRef(null)
  const [escena, setEscena] = useState(-1)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const url = `${base}video/stockus-campana-frag.mp4`
    let objectUrl = null
    let cargado = false
    let cancelado = false

    function cargar() {
      if (cargado) return
      cargado = true

      if (!('MediaSource' in window) || !MediaSource.isTypeSupported(CODEC)) {
        // Navegador sin MSE: se reproduce directo. Saltar puede no funcionar.
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
            sb.addEventListener('updateend', () => {
              if (ms.readyState === 'open') ms.endOfStream()
            }, { once: true })
            sb.appendBuffer(datos)
          } catch {
            video.src = url
          }
        },
        { once: true },
      )
    }

    cargarRef.current = cargar

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          observador.disconnect()
          cargar()
        }
      },
      { rootMargin: '300px' },
    )
    observador.observe(video)

    return () => {
      cancelado = true
      observador.disconnect()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [base])

  // Marca la escena que se está viendo, según el tiempo actual del video.
  function alCambiarTiempo(e) {
    const t = e.currentTarget.currentTime
    const idx = ESCENAS.reduce((acc, esc, i) => (t >= esc.t ? i : acc), -1)
    if (idx !== escena) setEscena(idx)
  }

  function irA(t) {
    const v = videoRef.current
    if (!v) return
    cargarRef.current?.()
    const saltar = () => {
      v.currentTime = t
      v.play().catch(() => {})
    }
    // Antes de tener la duración, el navegador descarta el salto: esperamos los metadatos.
    if (v.readyState >= 1) saltar()
    else v.addEventListener('loadedmetadata', saltar, { once: true })
  }

  return (
    <section className="section-pad rule-bottom" id="video">
      <div className="shell">
        <div className="flex items-baseline gap-4 mb-12 md:mb-16">
          <span className="t-mono text-[13px] text-muted">02</span>
          <h2 className="t-h2 max-w-[20ch]">Así funciona en el depósito</h2>
        </div>

        <div className="grid grid-cols-12 gap-y-12 gap-x-8 items-start">
          <div className="col-span-12 lg:col-span-6">
            <p className="t-body text-[16px] max-w-[46ch] mb-10">
              Un video vertical de menos de un minuto que recorre el problema de buscar a mano,
              la solución con luz y panel de stock, y cómo pedir una demo.
            </p>

            <ol className="flex flex-col">
              {ESCENAS.map(({ n, t, titulo, texto }, i) => (
                <li key={n} className="border-t border-rule last:border-b">
                  <button
                    type="button"
                    onClick={() => irA(t)}
                    aria-current={i === escena ? 'step' : undefined}
                    className={`w-full grid grid-cols-[48px_1fr_auto] gap-x-4 py-5 text-left transition-colors hover:text-[var(--accent)] ${
                      i === escena ? 'text-[var(--accent)]' : ''
                    }`}
                  >
                    <span className="t-mono text-[13px] text-muted pt-1">{n}</span>
                    <div>
                      <h3 className="t-h3 mb-1">{titulo}</h3>
                      <p className="t-body text-[15px]">{texto}</p>
                    </div>
                    <span className="t-mono text-[12px] text-muted pt-1">▶ {fmt(t)}</span>
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
              poster={`${base}video/stockus-campana.jpg`}
              onTimeUpdate={alCambiarTiempo}
              aria-label="Video de Stockus, de SOLVUS: cómo funciona en el depósito"
              className="block w-full max-w-[340px] rounded-[3px] border border-rule"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
