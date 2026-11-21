import { useAsync } from '../../hooks/useAsync'
import { getRecommendations } from '../../data/recommendations'
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../States'

const SEVERITY_TOKEN = { alta: 'var(--alert)', media: 'var(--warning)', baja: 'var(--muted)' }

function RecommendationCard({ r }) {
  return (
    <article className="p-4 border" style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px' }}>
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <span className="t-mono text-[12px]" style={{ color: SEVERITY_TOKEN[r.severity] }}>
          {r.sku}
        </span>
        <span className="t-mono text-[11px] text-muted">{r.productName}</span>
      </div>

      <dl className="flex flex-col gap-2.5">
        <div>
          <dt className="t-label mb-0.5">Detectamos</dt>
          <dd className="text-[13px] text-graphite leading-snug">{r.detected}</dd>
        </div>
        <div>
          <dt className="t-label mb-0.5">Con qué datos</dt>
          <dd className="text-[13px] text-graphite leading-snug">{r.dataUsed}</dd>
        </div>
        <div>
          <dt className="t-label mb-0.5">Por qué importa</dt>
          <dd className="text-[13px] text-graphite leading-snug">{r.why}</dd>
        </div>
        <div>
          <dt className="t-label mb-0.5">Acción sugerida</dt>
          <dd className="text-[13px] font-medium">{r.action}</dd>
        </div>
      </dl>

      {r.reorder && (
        <div className="mt-3 pt-3 border-t border-rule">
          {r.reorder.status === 'ok' ? (
            r.reorder.qty > 0 ? (
              <p className="t-mono text-[11px] text-muted">
                Cantidad sugerida: <span className="text-ink font-medium">{r.reorder.qty} u.</span> — cubre{' '}
                {r.reorder.leadTimeDays} días de entrega de {r.reorder.supplierName} + colchón de seguridad.
              </p>
            ) : (
              <p className="t-mono text-[11px] text-muted">
                Cantidad sugerida: <span className="text-ink font-medium">0 u.</span> — el consumo proyectado
                para los {r.reorder.leadTimeDays} días de entrega ya está cubierto por el stock actual, aunque
                esté bajo el punto de reposición estático.
              </p>
            )
          ) : (
            <p className="t-mono text-[11px] text-muted">Cantidad sugerida: faltan datos — {r.reorder.reason}</p>
          )}
        </div>
      )}
    </article>
  )
}

export default function RecommendationsPanel() {
  const recs = useAsync(() => getRecommendations(8), [])

  return (
    <section className="panel p-5" aria-label="SOLVUS Recomienda">
      <h2 className="t-h3 mb-1">SOLVUS Recomienda</h2>
      <p className="t-small mb-5 max-w-[62ch]">
        Cada recomendación está atada a un número concreto del inventario — no es un consejo
        genérico. Ver "Alertas" para el listado completo de condiciones detectadas.
      </p>

      {recs.status === 'loading' && <LoadingBlock label="Analizando inventario" rows={4} />}
      {recs.status === 'error' && <ErrorBlock error={recs.error} />}
      {recs.status === 'success' &&
        (recs.data.length === 0 ? (
          <EmptyBlock title="Sin recomendaciones por ahora" hint="El inventario está dentro de los rangos esperados." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recs.data.map((r) => (
              <RecommendationCard key={r.id} r={r} />
            ))}
          </div>
        ))}
    </section>
  )
}
