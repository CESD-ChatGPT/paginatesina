/* Sección de producto: Stockus, de SOLVUS. Solo describe lo que el
   sistema hace hoy; sin cifras de resultados que no estén comprobadas. */

const DIFERENCIALES = [
  {
    titulo: 'Guía con luz',
    texto: 'Una tira LED ilumina la ubicación del producto. El operario no busca: va directo al estante.',
  },
  {
    titulo: 'Pesaje automático',
    texto: 'Una celda de carga registra cada entrada y salida. El stock se actualiza sin anotar nada.',
  },
  {
    titulo: 'Sin internet',
    texto: 'El servidor local (Raspberry Pi) funciona en el depósito aunque se corte la conexión.',
  },
  {
    titulo: 'Instalación incluida',
    texto: 'Lo instalamos y configuramos en tu depósito, y te capacitamos al equipo.',
  },
]

export default function ProductSection() {
  return (
    <section className="section-pad rule-bottom" id="stockus">
      <div className="shell">
        <div className="flex items-baseline gap-4 mb-12 md:mb-16">
          <span className="t-mono text-[13px] text-muted">01</span>
          <h2 className="t-h2 max-w-[24ch]">Stockus, de SOLVUS</h2>
        </div>

        <p className="t-body text-[15px] max-w-[52ch] mb-12">
          Stockus es el sistema de control de stock de SOLVUS. Combina una app web con hardware
          en el depósito para que encontrar y registrar productos sea más rápido y confiable.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-10">
          {DIFERENCIALES.map(({ titulo, texto }) => (
            <div key={titulo} className="border-t border-rule pt-5">
              <h3 className="t-h3 mb-2">{titulo}</h3>
              <p className="t-body text-[15px] max-w-[40ch]">{texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
