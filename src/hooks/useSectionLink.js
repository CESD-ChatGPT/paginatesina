import { useNavigate, useLocation } from 'react-router-dom'

/* Con HashRouter el hash lo ocupa el router (#/panel, #/login), así que un
   href="#features" crudo se interpreta como ruta y rompe la navegación en
   vez de desplazar. Cualquier enlace a una sección de la landing debe pasar
   por acá — antes esta lógica solo vivía en Header y el mismo bug quedó
   duplicado en Hero y CTA con hrefs crudos. */
export function useSectionLink() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return function goToSection(e, id) {
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
}
