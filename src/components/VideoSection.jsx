/* Video de campaña de Stockus (41 s, vertical). Se sirve desde public/video. */

const ESCENAS = [
  { n: '01', titulo: 'Buscar a mano', texto: 'El costo de no saber dónde está cada producto.' },
  { n: '02', titulo: 'La luz guía', texto: 'El operario va directo al estante, sin revisar cajas.' },
  { n: '03', titulo: 'La balanza registra', texto: 'Cada salida queda anotada sin escribir nada.' },
  { n: '04', titulo: 'Precio y demo', texto: 'Instalación incluida, pagos en cuotas y contacto por WhatsApp.' },
]

export default function VideoSection() {
  const src = `${import.meta.env.BASE_URL}video/stockus-campana.mp4`

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
              Un video vertical de 41 segundos que recorre el problema de buscar a mano,
              la solución con luz y balanza, y cómo pedir una demo.
            </p>

            <ol className="flex flex-col">
              {ESCENAS.map(({ n, titulo, texto }) => (
                <li key={n} className="grid grid-cols-[48px_1fr] gap-x-4 py-5 border-t border-rule last:border-b">
                  <span className="t-mono text-[13px] text-muted pt-1">{n}</span>
                  <div>
                    <h3 className="t-h3 mb-1">{titulo}</h3>
                    <p className="t-body text-[15px]">{texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:col-start-8 flex flex-col items-center lg:items-end">
            <video
              src={src}
              controls
              playsInline
              poster={`${import.meta.env.BASE_URL}video/stockus-campana.jpg`}
              preload="metadata"
              aria-label="Video de Stockus, de SOLVUS: cómo funciona en el depósito"
              className="block w-full max-w-[340px] rounded-[3px] border border-rule"
            />
            <p className="t-mono text-[11px] text-muted mt-3">Video · 41 s · vertical</p>
          </div>
        </div>
      </div>
    </section>
  )
}
