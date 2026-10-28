/* Preguntas frecuentes de Stockus. Solo afirma lo que el producto y el
   presupuesto ya definen; lo que aún se fija por contrato se dice así. */

const PREGUNTAS = [
  {
    q: '¿Necesita internet?',
    a: 'El equipo funciona en el depósito aunque se corte la conexión. El servidor local guarda los movimientos y la app se usa desde la red del depósito.',
  },
  {
    q: '¿Qué incluye el precio?',
    a: 'El hardware, la instalación y la capacitación inicial del equipo. El alcance del soporte y de la garantía se detalla en el presupuesto antes de firmar.',
  },
  {
    q: '¿Se puede pagar en cuotas?',
    a: 'Sí. Hay opciones de pago en cuotas y, si lo querés, un abono mensual de soporte. Las condiciones se confirman en el presupuesto.',
  },
  {
    q: '¿Cuánto tarda la instalación?',
    a: 'Depende del depósito y del plan contratado. Lo confirmamos en el presupuesto, antes de empezar.',
  },
  {
    q: '¿Hace falta saber de tecnología?',
    a: 'No. Instalamos el equipo y capacitamos a quien va a usarlo en el día a día del depósito.',
  },
  {
    q: '¿Cómo pido una demo?',
    a: 'Tocá "Pedí tu demo": se abre WhatsApp con un mensaje listo para enviar. Te respondemos para coordinar día y horario.',
  },
  {
    q: '¿Puedo ver el panel antes de contratar?',
    a: 'Sí. En la demo te mostramos el panel con datos de ejemplo, antes de que decidas nada.',
  },
  {
    q: '¿Qué pasa con mis datos?',
    a: 'Los datos de contacto que nos dejes se usan solo para coordinar la demo. Ver los términos y condiciones en el pie de página.',
  },
]

export default function Faq() {
  return (
    <section className="section-pad rule-bottom" id="faq">
      <div className="shell">
        <div className="flex items-baseline gap-4 mb-12 md:mb-16">
          <span className="t-mono text-[13px] text-muted">03</span>
          <h2 className="t-h2 max-w-[20ch]">Preguntas frecuentes</h2>
        </div>

        <div className="max-w-[760px]">
          {PREGUNTAS.map(({ q, a }) => (
            <details key={q} className="group border-t border-rule last:border-b py-5">
              <summary className="flex items-center justify-between gap-6 cursor-pointer list-none min-h-[44px] text-[16px] font-medium">
                {q}
                <span aria-hidden="true" className="t-mono text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="t-body text-[15px] mt-3 max-w-[60ch]">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
