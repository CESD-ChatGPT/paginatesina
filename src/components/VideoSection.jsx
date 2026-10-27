/* Video de campaña de Stockus (41 s, vertical). Se sirve desde public/video. */

export default function VideoSection() {
  const src = `${import.meta.env.BASE_URL}video/stockus-campana.mp4`

  return (
    <section className="section-pad rule-bottom" id="video">
      <div className="shell">
        <div className="flex items-baseline gap-4 mb-12 md:mb-16">
          <span className="t-mono text-[13px] text-muted">02</span>
          <h2 className="t-h2 max-w-[20ch]">Así funciona</h2>
        </div>

        <div className="grid grid-cols-12 gap-y-10 gap-x-8 items-center">
          <div className="col-span-12 lg:col-span-5">
            <p className="t-body text-[15px] max-w-[42ch]">
              Un video de 41 segundos: el problema de buscar a mano, la luz que guía al producto,
              la balanza que registra el stock y el precio con cuotas.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-7 flex justify-center">
            <video
              src={src}
              controls
              playsInline
              preload="metadata"
              aria-label="Video de Stockus, de SOLVUS"
              className="w-full max-w-[320px] rounded-[3px] border border-rule"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
