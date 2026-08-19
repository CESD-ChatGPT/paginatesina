import { AlertCircle, Inbox } from 'lucide-react'

/* Estados compartidos por todo lo que consume la capa de datos.
   Se centralizan para que carga/error/vacío se vean igual en toda la app. */

export function Skeleton({ className = '', height = 16 }) {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{ height, background: 'var(--surface-sunken)', borderRadius: '2px' }}
      aria-hidden="true"
    />
  )
}

export function LoadingBlock({ label = 'Cargando datos', rows = 3 }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} height={i === 0 ? 24 : 14} className={i === 0 ? 'w-1/3' : 'w-full'} />
        ))}
      </div>
    </div>
  )
}

export function ErrorBlock({ error, onRetry }) {
  return (
    <div
      role="alert"
      className="flex gap-3 items-start p-4 border"
      style={{ borderColor: 'var(--alert)', borderRadius: '2px' }}
    >
      <AlertCircle
        className="w-[18px] h-[18px] shrink-0 mt-0.5"
        style={{ color: 'var(--alert)' }}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="t-h3 mb-1" style={{ color: 'var(--alert)' }}>
          No se pudieron cargar los datos
        </p>
        <p className="t-small mb-3">{error?.message ?? 'Error desconocido.'}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="t-mono text-[12px] underline underline-offset-4 hover:text-[var(--accent)]"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  )
}

export function EmptyBlock({ title = 'Sin datos todavía', hint }) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-4">
      <Inbox className="w-6 h-6 mb-3 text-muted" strokeWidth={1.5} aria-hidden="true" />
      <p className="t-h3 mb-1">{title}</p>
      {hint && <p className="t-small max-w-[38ch]">{hint}</p>}
    </div>
  )
}
