/* Formulario de la encuesta: enlace directo y código QR para abrirlo desde
   el celular. Las respuestas van al Google Form, no a este sitio. */

const FORMULARIO_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdB32yqJErporlnN2mRoVZX6Mqai__Xt0wDZIsVVU93anO8Bw/viewform'

export default function Formulario() {
  return (
    <section className="section-pad rule-bottom" id="formulario">
      <div className="shell">
        <div className="flex items-baseline gap-4 mb-12 md:mb-16">
          <span className="t-mono text-[13px] text-muted">04</span>
          <h2 className="t-h2 max-w-[24ch]">Formulario</h2>
        </div>

        <div className="grid grid-cols-12 gap-y-12 gap-x-8 items-start">
          <div className="col-span-12 lg:col-span-6">
            <p className="t-body text-[16px] max-w-[46ch] mb-8">
              Encuesta anónima de tres minutos sobre control de materiales y tecnología en la secundaria. No pide
              nombre ni datos de contacto. Se abre desde el enlace o escaneando el código QR.
            </p>
            <a
              href={FORMULARIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-h-[48px] px-6 text-[15px] font-medium"
              style={{ background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: '2px' }}
            >
              Abrir el formulario
            </a>
            <p className="t-mono text-[12px] text-muted mt-4 break-all">{FORMULARIO_URL}</p>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:col-start-8 flex flex-col items-center lg:items-end">
            <img
              src={`${import.meta.env.BASE_URL}formulario-qr.svg`}
              alt="Código QR que abre el formulario de la encuesta"
              width="260"
              height="260"
              className="block w-[260px] h-[260px] p-4 bg-white border border-rule rounded-[3px]"
            />
            <p className="t-mono text-[11px] text-muted mt-3">Escanealo con la cámara del celular</p>
          </div>
        </div>
      </div>
    </section>
  )
}
