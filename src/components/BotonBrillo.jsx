/* Botón con relieve y brillo (estilos .btn-brillo en index.css). Con `href`
   se renderiza como enlace, para que siga abriendo en pestaña nueva, copiando
   la dirección, etc.; sin `href`, como botón. */
export default function BotonBrillo({ children, href, className = '', ...resto }) {
  const contenido = (
    <span className="btn-brillo-exterior">
      <span className="btn-brillo-interior">
        <span className="btn-brillo-texto">{children}</span>
      </span>
    </span>
  )
  const clases = `btn-brillo ${className}`.trim()
  return href ? (
    <a href={href} className={clases} {...resto}>
      {contenido}
    </a>
  ) : (
    <button type="button" className={clases} {...resto}>
      {contenido}
    </button>
  )
}
