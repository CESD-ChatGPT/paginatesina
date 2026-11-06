/* Sección de producto: Stockus, de SOLVUS. Solo describe lo que el
   sistema hace hoy; sin cifras de resultados que no estén comprobadas. */

import CajasEstante from './CajasEstante'

const DIFERENCIALES = [
  {
    titulo: 'Guía con luz',
    texto: 'Una tira LED ilumina la ubicación del producto. El operario no busca: va directo al estante.',
  },
  {
    titulo: 'Panel de stock',
    texto: 'Stock por depósito y por ubicación, en un solo panel. Sin planillas ni cuadernos.',
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
    <section className="section-pad rule-bottom relative overflow-hidden" id="stockus">
      <div className="shell">
        <div className="flex items-baseline gap-4 mb-12 md:mb-16">
          <h2 className="t-h2 titulo-reveal max-w-[24ch]">Stockus, de SOLVUS</h2>
        </div>

        <p className="t-body text-[15px] max-w-[52ch] mb-12">
          Stockus es el sistema de control de stock de SOLVUS. Combina una app web con hardware
          en el depósito para que encontrar y registrar productos sea más rápido y confiable.
        </p>

        <CajasEstante cajas={DIFERENCIALES} />
      </div>
    </section>
  )
}
