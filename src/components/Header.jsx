import { ThemeToggleButton } from './ThemeToggle'

/* From Uiverse.io by mymiamo — conservado: la barra flotante fija con
   backdrop-filter y el realce de fondo al hover sobre cada enlace.
   Adaptado: esquinas del sistema en vez de píldora, superficie sólida en
   vez de glass azul, y enlaces solo de texto. El ícono sobre etiqueta del
   original es un patrón de tab bar inferior de móvil; en una barra
   superior de 2 ítems agregaba ruido sin ayudar a escanear. */
export default function Header() {
  const LINKS = [
    { href: '#features', label: 'Producto' },
    { href: '#contact', label: 'Implementación' },
  ]

  return (
    <>
      <style>{`
        .nav {
          position: fixed;
          top: 12px;
          top: calc(12px + env(safe-area-inset-top));
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 24px);
          max-width: 1000px;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 8px 8px 16px;
          border-radius: 3px;
          border: 1px solid var(--rule);
          /* Opacidad alta: la barra se superpone al contenido al hacer
             scroll y el contraste del texto no puede depender de lo que
             pase por debajo. */
          background: color-mix(in srgb, var(--surface) 94%, transparent);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: background 300ms ease, border-color 300ms ease;
        }

        .nav__brand {
          display: inline-flex;
          align-items: center;
          min-height: 44px;
          font-weight: 600;
          font-size: 15px;
          letter-spacing: -0.02em;
          white-space: nowrap;
          color: var(--ink);
          text-decoration: none;
        }

        .nav__brand span {
          font-family: 'IBM Plex Mono', monospace;
          color: var(--accent);
        }

        .nav__links {
          display: none;
          align-items: center;
          gap: 4px;
          margin-left: auto;
        }

        @media (min-width: 620px) {
          .nav__links {
            display: flex;
          }
        }

        .nav__link {
          display: inline-flex;
          align-items: center;
          min-height: 44px;
          padding: 0 12px;
          font-size: 14px;
          font-weight: 500;
          color: var(--graphite);
          text-decoration: none;
          border-radius: 2px;
          white-space: nowrap;
          transition: color 180ms ease, background-color 180ms ease;
        }

        .nav__link:hover {
          color: var(--ink);
          background: var(--surface-sunken);
        }

        .nav__right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .nav__cta {
          display: inline-flex;
          align-items: center;
          min-height: 44px;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 500;
          border-radius: 2px;
          background: var(--accent);
          color: var(--accent-ink);
          text-decoration: none;
          white-space: nowrap;
          transition: opacity 180ms ease;
        }

        .nav__cta:hover {
          opacity: 0.88;
        }

        /* El CTA se mantiene en todos los anchos: es la acción principal.
           Solo se compacta el padding en pantallas muy angostas. */
        @media (max-width: 419px) {
          .nav__cta {
            padding: 0 13px;
          }
        }
      `}</style>

      <header>
        <nav className="nav" aria-label="Navegación principal">
          <a href="#" className="nav__brand">
            Stock<span>AI</span>
          </a>

          <div className="nav__links">
            {LINKS.map((link) => (
              <a key={link.href} href={link.href} className="nav__link">
                {link.label}
              </a>
            ))}
          </div>

          <div className="nav__right">
            <ThemeToggleButton />
            <a href="#contact" className="nav__cta">
              Probar
            </a>
          </div>
        </nav>
      </header>
    </>
  )
}
