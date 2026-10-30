/* ─────────────────────────────────────────────────────────────
   MARCA SOLVUS

   ⚠ EL ISOTIPO ES UNA RECONSTRUCCIÓN, NO EL ARCHIVO OFICIAL.
   Se vectorizó a partir de una captura de baja resolución porque el
   proyecto no incluye ningún asset de marca. Es fiel en forma y
   proporción pero no es idéntico al original.

   PARA REEMPLAZARLO: sustituí únicamente los <path> de <Isotipo/> por
   los del SVG oficial. Nada más en el proyecto necesita cambiar —
   navbar, login, footer y favicon consumen estos componentes.

   Variantes según manual de marca:
     <Isotipo/>       solo el símbolo
     <Logotipo/>      solo la palabra
     <Isologotipo/>   símbolo + palabra (horizontal o apilado)
   ───────────────────────────────────────────────────────────── */

export function Isotipo({ size = 28, className = '', title }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
      fill="none"
      style={{ flexShrink: 0 }}
    >
      {title ? <title>{title}</title> : null}
      {/* "S" angular: dos chevrones enfrentados unidos por el trazo central */}
      <path
        d="M52 14H26.5a10.5 10.5 0 0 0 0 21h11a10.5 10.5 0 0 1 0 21H12"
        stroke="currentColor"
        strokeWidth="7.5"
        strokeLinecap="square"
      />
      <path d="M52 14 40 24.5h12V14Z" fill="currentColor" />
      <path d="M12 56l12-10.5H12V56Z" fill="currentColor" />
    </svg>
  )
}

export function Logotipo({ className = '' }) {
  return (
    <span
      className={className}
      style={{ fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1, whiteSpace: 'nowrap' }}
    >
      SOLVUS
    </span>
  )
}

export function Isologotipo({ size = 28, stacked = false, className = '' }) {
  return (
    <span
      className={`inline-flex items-center ${stacked ? 'flex-col gap-1.5' : 'gap-2.5'} ${className}`}
    >
      <Isotipo size={size} title="SOLVUS" />
      <Logotipo />
    </span>
  )
}
