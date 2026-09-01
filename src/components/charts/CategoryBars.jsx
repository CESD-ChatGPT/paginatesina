import { useState } from 'react'
import { motion } from 'framer-motion'

/* Capital inmovilizado por categoría.
   FORMA: barras horizontales — una sola medida comparada entre
   categorías de nombre largo.
   COLOR: secuencial de un tono (rampa teal), más-es-más-oscuro.
   No es categórico: las categorías no son identidades que haya que
   distinguir, se están ordenando por magnitud.

   MOTION: las barras aparecían ya llenas — un chart de barras que no
   comunica magnitud progresivamente pierde la mitad de su punto. Ahora
   cada una crece desde 0 al entrar en pantalla (whileInView, una vez),
   con el mismo stagger que el resto de la página. Framer Motion acá y
   no GSAP: es una transición de layout ligada al estado de un componente
   React que ya se gestiona a sí mismo (hover, datos), no una coreografía
   de sección. */

const money = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}k` : String(n)

// La rampa se recorre de oscuro a claro siguiendo el orden por magnitud
const RAMP = ['var(--seq-5)', 'var(--seq-4)', 'var(--seq-3)', 'var(--seq-2)', 'var(--seq-1)']

export default function CategoryBars({ data, currency = 'USD' }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(...data.map((d) => d.value))
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <ul className="flex flex-col">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100
        const share = ((d.value / total) * 100).toFixed(0)
        const isHover = hover === d.category

        return (
          <li
            key={d.category}
            className="py-2.5 border-b border-rule last:border-b-0 cursor-default"
            onMouseEnter={() => setHover(d.category)}
            onMouseLeave={() => setHover(null)}
          >
            <div className="flex items-baseline justify-between gap-3 mb-1.5">
              <span className="text-[13px] font-medium truncate">{d.category}</span>
              <span className="t-figure text-[13px] shrink-0">
                {currency} {money(d.value)}
                <span
                  className="t-mono text-[11px] ml-2"
                  style={{ color: isHover ? 'var(--graphite)' : 'var(--muted)' }}
                >
                  {share}%
                </span>
              </span>
            </div>

            {/* Pista + barra. La barra lleva un anillo de superficie
                para no fundirse con la pista al solaparse. */}
            <div
              className="w-full h-2 relative"
              style={{ background: 'var(--surface-sunken)', borderRadius: '1px' }}
            >
              <motion.div
                className="h-full"
                style={{
                  background: RAMP[Math.min(i, RAMP.length - 1)],
                  borderRadius: '1px',
                }}
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 0.61, 0.36, 1] }}
                animate={{ opacity: hover && !isHover ? 0.55 : 1 }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
