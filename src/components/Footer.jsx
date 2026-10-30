import { Isologotipo } from './brand/Logo'
import { WHATSAPP_DEMO } from '../lib/app'
import { useSectionLink } from '../hooks/useSectionLink'

/* Solo enlaces que llevan a algo real: secciones de la landing, la demo por
   WhatsApp y los términos. Las columnas de demo (API, Changelog, Estado…)
   se quitaron porque no existen todavía. */
const RECORRER = [
  { label: 'Producto', section: 'stockus' },
  { label: 'Video de campaña', section: 'video' },
  { label: 'Preguntas frecuentes', section: 'faq' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const goToSection = useSectionLink()

  return (
    <footer className="rule-top">
      <div className="shell py-14 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-10">
          {/* Marca */}
          <div className="col-span-2 md:col-span-6">
            <span className="inline-flex text-ink mb-3">
              <Isologotipo size={24} />
            </span>
            <p className="t-small max-w-[34ch]">
              Control de inventario con pronóstico de demanda para operaciones que no
              pueden permitirse un quiebre de stock.
            </p>
          </div>

          {/* Recorrer la landing */}
          <div className="md:col-span-3">
            <h3 className="t-label mb-2">Recorrer</h3>
            <ul>
              {RECORRER.map(({ label, section }) => (
                <li key={section}>
                  <a
                    href={`#${section}`}
                    onClick={(e) => goToSection(e, section)}
                    className="inline-flex items-center min-h-[44px] py-1 text-[13px] text-graphite hover:text-[var(--accent)] transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="md:col-span-3">
            <h3 className="t-label mb-2">Contacto</h3>
            <ul>
              <li>
                <a
                  href={WHATSAPP_DEMO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center min-h-[44px] py-1 text-[13px] text-graphite hover:text-[var(--accent)] transition-colors"
                >
                  Pedí tu demo por WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="#/terminos"
                  className="inline-flex items-center min-h-[44px] py-1 text-[13px] text-graphite hover:text-[var(--accent)] transition-colors"
                >
                  Términos y condiciones
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Renglón de cierre */}
      <div className="rule-top">
        <div className="shell py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="t-mono text-[11px] text-muted order-2 sm:order-1">
            © {year} Stockus, producto de SOLVUS · Tu inventario, bajo control.
          </p>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              const instantaneo =
                window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
                window.matchMedia('(max-width: 1023px)').matches
              window.scrollTo({ top: 0, behavior: instantaneo ? 'instant' : 'smooth' })
            }}
            className="order-1 sm:order-2 inline-flex items-center min-h-[44px] px-2 t-mono text-[12px] text-muted hover:text-[var(--accent)] transition-colors"
          >
            Volver arriba ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
