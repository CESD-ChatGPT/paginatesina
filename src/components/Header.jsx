import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggleButton } from './ThemeToggle'
import { Isotipo, Logotipo } from './brand/Logo'
import { useAuth } from '../contexts/AuthContext'

/* ─────────────────────────────────────────────────────────────
   From Uiverse.io by mymiamo — base real de esta navbar.

   SE CONSERVA del original:
     · la píldora .menu con backdrop-filter blur+saturate+contrast
     · el pseudo-elemento .menu::after con las tres sombras inset que
       le dan el borde de vidrio
     · la estructura de cada enlace: SVG arriba, <span> con la etiqueta
       abajo, en columna, flex:1 1 0
     · el hover con fondo translúcido + las mismas sombras inset + el
       giro leve, y el :active con scale(0.98)
     · el estado .active diferenciado
     · los cuatro SVG del original

   SE ADAPTA a SOLVUS:
     · `rotate(2.2)` del original es CSS inválido (le falta unidad y por
       eso no hacía nada): se corrige a `rotate(1.5deg)`
     · el azul de Apple rgba(0,122,255,.404) pasa al petróleo/teal de marca
     · --glass-border y --ease-spring quedaban sin definir en el original
     · se fija arriba y se le suma marca y toggle, porque acá es la navbar
       superior y no una barra flotante suelta
     · los cuatro destinos se mapean a la navegación real (ver NAV_ITEMS);
       el cuarto es sensible a la sesión: Ingresar / Panel
     · en móvil las etiquetas se ocultan y quedan los íconos con
       aria-label, para que entren cuatro destinos + marca + toggle
   ───────────────────────────────────────────────────────────── */

/* Los SVG son los del componente original, reasignados al destino que
   representan en SOLVUS. */
const IconInicio = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
    <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
  </svg>
)

/* La carpeta del original representa acá el catálogo de SKU */
const IconProducto = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
  </svg>
)

/* El calendario del original representa acá la puesta en marcha */
const IconArranque = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" />
  </svg>
)

/* El engranaje del original representa acá el panel operativo */
const IconPanel = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.004 10.407c.138.435-.216.842-.672.842h-3.465a.75.75 0 0 1-.65-.375l-1.732-3c-.229-.396-.053-.907.393-1.004a5.252 5.252 0 0 1 6.126 3.537ZM8.12 8.464c.307-.338.838-.235 1.066.16l1.732 3a.75.75 0 0 1 0 .75l-1.732 3c-.229.397-.76.5-1.067.161A5.23 5.23 0 0 1 6.75 12a5.23 5.23 0 0 1 1.37-3.536ZM10.878 17.13c-.447-.098-.623-.608-.394-1.004l1.733-3.002a.75.75 0 0 1 .65-.375h3.465c.457 0 .81.407.672.842a5.252 5.252 0 0 1-6.126 3.539Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M21 12.75a.75.75 0 1 0 0-1.5h-.783a8.22 8.22 0 0 0-.237-1.357l.734-.267a.75.75 0 1 0-.513-1.41l-.735.268a8.24 8.24 0 0 0-.689-1.192l.6-.503a.75.75 0 1 0-.964-1.149l-.6.504a8.3 8.3 0 0 0-1.054-.885l.391-.678a.75.75 0 1 0-1.299-.75l-.39.676a8.188 8.188 0 0 0-1.295-.47l.136-.77a.75.75 0 0 0-1.477-.26l-.136.77a8.36 8.36 0 0 0-1.377 0l-.136-.77a.75.75 0 1 0-1.477.26l.136.77c-.448.121-.88.28-1.294.47l-.39-.676a.75.75 0 0 0-1.3.75l.392.678a8.29 8.29 0 0 0-1.054.885l-.6-.504a.75.75 0 1 0-.965 1.149l.6.503a8.243 8.243 0 0 0-.689 1.192L3.8 8.216a.75.75 0 1 0-.513 1.41l.735.267a8.222 8.222 0 0 0-.238 1.356h-.783a.75.75 0 0 0 0 1.5h.783c.042.464.122.917.238 1.356l-.735.268a.75.75 0 0 0 .513 1.41l.735-.268c.197.417.428.816.69 1.191l-.6.504a.75.75 0 0 0 .963 1.15l.601-.505c.326.323.679.62 1.054.885l-.392.68a.75.75 0 0 0 1.3.75l.39-.679c.414.192.847.35 1.294.471l-.136.77a.75.75 0 0 0 1.477.261l.137-.772a8.332 8.332 0 0 0 1.376 0l.136.772a.75.75 0 1 0 1.477-.26l-.136-.771a8.19 8.19 0 0 0 1.294-.47l.391.677a.75.75 0 1 0 1.3-.75l-.393-.679a8.29 8.29 0 0 0 1.054-.885l.601.504a.75.75 0 0 0 .964-1.15l-.6-.503c.261-.375.492-.774.69-1.191l.735.267a.75.75 0 1 0 .512-1.41l-.734-.267c.115-.439.195-.892.237-1.356h.784Zm-2.657-3.06a6.744 6.744 0 0 0-1.19-2.053 6.784 6.784 0 0 0-1.82-1.51A6.705 6.705 0 0 0 12 5.25a6.8 6.8 0 0 0-1.225.11 6.7 6.7 0 0 0-2.15.793 6.784 6.784 0 0 0-2.952 3.489.76.76 0 0 1-.036.098A6.74 6.74 0 0 0 5.251 12a6.74 6.74 0 0 0 3.366 5.842l.009.005a6.704 6.704 0 0 0 2.18.798l.022.003a6.792 6.792 0 0 0 2.368-.004 6.704 6.704 0 0 0 2.205-.811 6.785 6.785 0 0 0 1.762-1.484l.009-.01.009-.01a6.743 6.743 0 0 0 1.18-2.066c.253-.707.39-1.469.39-2.263a6.74 6.74 0 0 0-.408-2.309Z" />
  </svg>
)

export default function Header() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  /* Con HashRouter el hash lo ocupa el router, así que un href="#features"
     lo interpretaría como ruta y rompería la navegación. Las secciones de
     la landing se resuelven desplazando a mano. */
  function goToSection(e, id) {
    e.preventDefault()
    const scroll = () =>
      document.getElementById(id)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      })

    if (pathname !== '/') {
      navigate('/')
      requestAnimationFrame(() => requestAnimationFrame(scroll))
    } else {
      scroll()
    }
  }

  // Destinos reales del proyecto, no los del componente original
  const NAV_ITEMS = [
    { to: '/', label: 'Inicio', Icon: IconInicio, active: pathname === '/' },
    { section: 'features', label: 'Producto', Icon: IconProducto },
    { section: 'contact', label: 'Arranque', Icon: IconArranque },
    user
      ? { to: '/panel', label: 'Panel', Icon: IconPanel, active: pathname === '/panel' }
      : { to: '/login', label: 'Ingresar', Icon: IconPanel, active: pathname === '/login' },
  ]

  return (
    <>
      <style>{`
        .navbar {
          --glass-border: rgba(255, 255, 255, 0.22);
          --ease-spring: cubic-bezier(0.23, 1, 0.320, 1);
          position: fixed;
          top: 12px;
          top: calc(12px + env(safe-area-inset-top));
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 20px);
          max-width: 860px;
          z-index: 50;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .navbar__brand {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 44px;
          padding-left: 4px;
          color: var(--ink);
          text-decoration: none;
          flex-shrink: 0;
          font-size: 15px;
        }

        /* Píldora del original */
        .menu {
          flex: 1 1 auto;
          min-width: 0;
          position: relative;
          backdrop-filter: blur(12px) saturate(180%) contrast(110%);
          -webkit-backdrop-filter: blur(12px) saturate(180%) contrast(110%);
          background: color-mix(in srgb, var(--accent) 88%, transparent);
          border: 1px solid var(--glass-border);
          box-shadow: 0 10px 30px rgba(11, 44, 64, 0.14);
          padding: 6px;
          border-radius: 99rem;
          display: flex;
          justify-content: center;
          gap: 4px;
        }

        .menu::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          box-shadow:
            inset 2px 2px 5px -2px rgba(255, 255, 255, 0.4),
            inset -2px -2px 5px 2px rgba(255, 255, 255, 0.4),
            inset 0 -2px 0 rgba(255, 255, 255, 0.2);
          pointer-events: none;
        }

        .menu a {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1 1 0;
          min-width: 0;
          min-height: 44px;
          /* --accent-ink sigue al tema: blanco sobre el teal oscuro del
             modo claro, petróleo sobre el teal claro del oscuro.
             El blanco fijo del original daba 2.42:1 en modo oscuro.
             Sólido, no semitransparente: el 90% del original le restaba
             contraste sin aportar nada. */
          color: var(--accent-ink);
          text-decoration: none;
          padding: 7px 6px;
          border-radius: 999rem;
          -webkit-tap-highlight-color: transparent;
          transition:
            background 0.18s var(--ease-spring),
            color 0.18s var(--ease-spring),
            transform 0.18s var(--ease-spring),
            box-shadow 0.3s ease-in-out;
        }

        .menu a:hover {
          background-color: color-mix(in srgb, var(--surface) 32%, transparent);
          box-shadow:
            inset 2px 2px 5px -2px rgba(255, 255, 255, 0.4),
            inset -2px -1px 5px 0 rgba(255, 255, 255, 0.4),
            inset 0 -2px 0 rgba(255, 255, 255, 0.2);
          /* el original decía rotate(2.2) — sin unidad, era CSS inválido */
          transform: rotate(1.5deg);
          color: var(--accent-ink);
        }

        .menu a svg {
          width: 1.25rem;
          height: 1.25rem;
          flex-shrink: 0;
        }

        .menu a span {
          font-size: 0.75rem;
          font-weight: 600;
          line-height: 1;
          margin-top: 4px;
          white-space: nowrap;
        }

        .menu a.active {
          background: color-mix(in srgb, var(--surface) 94%, transparent);
          color: var(--accent);
        }

        .menu a.active:hover {
          background: var(--surface);
          color: var(--accent);
        }

        .menu a:active {
          transform: scale(0.98);
        }

        .menu a:focus-visible {
          outline: 2px solid var(--accent-ink);
          outline-offset: -2px;
        }

        /* Móvil: solo íconos. Cuatro destinos + marca + toggle no entran
           con etiquetas por debajo de ~640px. */
        @media (max-width: 639px) {
          .menu a span { display: none; }
          .menu a { padding: 10px 6px; }
          .navbar__brand-word { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .menu a { transition: background 0.18s ease, color 0.18s ease; }
          .menu a:hover, .menu a:active { transform: none; }
        }
      `}</style>

      <header>
        <nav className="navbar" aria-label="Navegación principal">
          <Link to="/" className="navbar__brand" aria-label="SOLVUS — inicio">
            <Isotipo size={22} />
            <Logotipo className="navbar__brand-word" />
          </Link>

          <div className="menu">
            {NAV_ITEMS.map(({ to, section, label, Icon, active }) =>
              section ? (
                <a
                  key={section}
                  href={`#${section}`}
                  onClick={(e) => goToSection(e, section)}
                  aria-label={label}
                >
                  <Icon />
                  <span>{label}</span>
                </a>
              ) : (
                <Link
                  key={to}
                  to={to}
                  className={active ? 'active' : undefined}
                  aria-current={active ? 'page' : undefined}
                  aria-label={label}
                >
                  <Icon />
                  <span>{label}</span>
                </Link>
              )
            )}
          </div>

          <ThemeToggleButton />
        </nav>
      </header>
    </>
  )
}
