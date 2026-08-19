import { Github, Linkedin, Twitter } from 'lucide-react'

const COLUMNS = [
  { title: 'Producto', items: ['Pronóstico', 'Reposición', 'Multidepósito', 'Integraciones'] },
  { title: 'Recursos', items: ['Documentación', 'API', 'Estado del servicio', 'Changelog'] },
  { title: 'Empresa', items: ['Nosotros', 'Clientes', 'Trabajá con nosotros', 'Contacto'] },
  { title: 'Legal', items: ['Términos', 'Privacidad', 'Seguridad', 'Cookies'] },
]

const SOCIAL = [
  { icon: Twitter, label: 'Twitter' },
  { icon: Linkedin, label: 'LinkedIn' },
  { icon: Github, label: 'GitHub' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="rule-top">
      <div className="shell py-14 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-10">
          {/* Marca */}
          <div className="col-span-2 md:col-span-4">
            <p className="font-semibold text-[15px] tracking-tight mb-3">
              Stock<span className="t-mono" style={{ color: 'var(--accent)' }}>AI</span>
            </p>
            <p className="t-small max-w-[30ch]">
              Control de inventario con pronóstico de demanda para operaciones que no
              pueden permitirse un quiebre de stock.
            </p>
          </div>

          {/* Columnas de enlaces */}
          {COLUMNS.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h3 className="t-label mb-2">{col.title}</h3>
              <ul>
                {col.items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="inline-flex items-center min-h-[44px] py-1 text-[13px] text-graphite hover:text-[var(--accent)] transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Renglón de cierre */}
      <div className="rule-top">
        <div className="shell py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="t-mono text-[11px] text-muted order-2 sm:order-1">
            © {year} StockAI
          </p>
          <div className="flex items-center gap-1 order-1 sm:order-2">
            {SOCIAL.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid place-items-center w-11 h-11 text-muted hover:text-[var(--accent)] transition-colors"
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
