import { useRef } from 'react'

/* Video de campaña de Stockus (58 s, vertical). Se sirve desde public/video.
   Cada escena tiene el segundo en el que empieza: al tocarla, el video salta ahí. */

const ESCENAS = [
  { n: '01', t: 4, titulo: 'Buscar a mano', texto: 'El costo de no saber dónde está cada producto.' },
  { n: '02', t: 18, titulo: 'La luz guía', texto: 'El operario va directo al estante, sin revisar cajas.' },
  { n: '03', t: 28, titulo: 'Todo a la vista', texto: 'Cada producto y cada depósito, en un solo panel.' },
  { n: '04', t: 47, titulo: 'Precio y demo', texto: 'Instalación incluida, pagos en cuotas y contacto por WhatsApp.' },
]

const fmt = (t) => `0:${String(t).padStart(2, '0')}`

export default function VideoSection() {
  const src = `${import.meta.env.BASE_URL}video/stockus-campana.mp4`
  const videoRef = useRef(null)

  function irA(t) {
    const v = videoRef.current
    if (!v) return
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
              {ESCENAS.map(({ n, t, titulo, texto }) => (
                <li key={n} className="border-t border-rule last:border-b">
                  <button
                    type="button"
                    onClick={() => irA(t)}
                    className="w-full grid grid-cols-[48px_1fr_auto] gap-x-4 py-5 text-left hover:text-[var(--accent)] transition-colors"
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
              src={src}
              controls
              playsInline
              poster={`${import.meta.env.BASE_URL}video/stockus-campana.jpg`}
              preload="metadata"
              aria-label="Video de Stockus, de SOLVUS: cómo funciona en el depósito"
              className="block w-full max-w-[340px] rounded-[3px] border border-rule"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
