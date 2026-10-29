import { useEffect, useRef } from 'react'

/* Cómo funciona el ChatBot Stock: capítulos del video real de Vento.
   Cada capítulo se carga con Media Source Extensions, igual que el video de
   campaña: una sola descarga y saltos a cualquier punto aunque el servidor no
   acepte pedidos por rangos. Se carga cuando el capítulo está por entrar en
   pantalla. */

const CAPITULOS = [
  {
    n: '01',
    titulo: 'Ingresar al ChatBot',
    texto: 'Crear la cuenta y entrar con usuario y PIN.',
    src: 'videos/capitulo-1.mp4',
  },
  {
    n: '02',
    titulo: 'Sumar stock con confirmación',
    texto: 'Escribís la orden y el ChatBot pide confirmar antes de cambiar el inventario.',
    src: 'videos/capitulo-2.mp4',
  },
  {
    n: '03',
    titulo: 'Restar stock por SKU',
    texto: 'Elegís el producto por su código y restás la cantidad.',
    src: 'videos/capitulo-3.mp4',
  },
  {
    n: '04',
    titulo: 'Dashboard y alertas',
    texto: 'Stock por ubicación, productos para reponer y alertas de mínimo.',
    src: 'videos/capitulo-4.mp4',
  },
  {
    n: '05',
    titulo: 'Movimientos y cierre de sesión',
    texto: 'Historial de entradas y salidas, y salir del sistema.',
    src: 'videos/capitulo-5.mp4',
  },
]

const CODEC = 'video/mp4; codecs="avc1.4D401F, mp4a.40.2"'

function Capitulo({ capitulo }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const base = import.meta.env.BASE_URL
    const url = `${base}${capitulo.src}`
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
  }, [capitulo.src])

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      preload="metadata"
      aria-label={`Capítulo ${capitulo.n}: ${capitulo.titulo}`}
      className="block w-full rounded-[3px] border border-rule bg-black"
    />
  )
}

export default function ComoFunciona() {
  return (
    <section className="section-pad rule-bottom" id="como-funciona">
      <div className="shell">
        <div className="flex items-baseline gap-4 mb-12 md:mb-16">
          <span className="t-mono text-[13px] text-muted">03</span>
          <h2 className="t-h2 max-w-[24ch]">Cómo funciona el ChatBot Stock</h2>
        </div>

        <p className="t-body text-[16px] max-w-[60ch] mb-12">
          Un recorrido real por el ChatBot, en cinco capítulos. Podés verlos en orden o
          elegir el que te interese.
        </p>

        <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-14">
          {CAPITULOS.map((c) => (
            <li key={c.n} className="flex flex-col gap-4">
              <Capitulo capitulo={c} />
              <div>
                <p className="t-mono text-[12px] text-muted mb-1">Capítulo {c.n}</p>
                <h3 className="t-h3 mb-1">{c.titulo}</h3>
                <p className="t-body text-[15px]">{c.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
