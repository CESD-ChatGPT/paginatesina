/* Botón operativo genérico para acciones del panel que no son "generar
   orden de compra" (esa es <ActionButton/>, con su propio ícono e
   identidad — no se reutiliza fuera de ese flujo). Transferencias,
   ajustes de conteo y confirmaciones de este tipo comparten esta pieza
   más simple en vez de forzar el ícono de ActionButton donde no aplica. */
export default function PanelButton({
  label,
  pendingLabel = 'Procesando…',
  onClick,
  pending = false,
  disabled = false,
  variant = 'primary',
  type = 'button',
}) {
  const isPrimary = variant === 'primary'
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className="inline-flex items-center justify-center min-h-[44px] px-4 text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        background: isPrimary ? 'var(--accent)' : 'transparent',
        color: isPrimary ? 'var(--accent-ink)' : 'var(--ink)',
        border: isPrimary ? 'none' : '1px solid var(--rule-strong)',
        borderRadius: '3px',
      }}
    >
      {pending ? pendingLabel : label}
    </button>
  )
}
