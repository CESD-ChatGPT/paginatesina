import { AlertCircle, PackageX, Clock, Activity, GitCompare } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { getAlerts } from '../../data/recommendations'
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../States'

const TYPE_LABEL = {
  critical_stock: 'Stock crítico',
  breakout_risk: 'Riesgo de quiebre',
  overstock: 'Sobrestock',
  no_movement: 'Sin movimiento',
  anomalous_consumption: 'Consumo anómalo',
  inventory_diff: 'Diferencia de inventario',
}

const TYPE_ICON = {
  critical_stock: AlertCircle,
  breakout_risk: Clock,
  overstock: PackageX,
  no_movement: Clock,
  anomalous_consumption: Activity,
  inventory_diff: GitCompare,
}

const SEVERITY_TOKEN = { alta: 'var(--alert)', media: 'var(--warning)', baja: 'var(--muted)' }

export default function AlertsPanel() {
  const alerts = useAsync(() => getAlerts(), [])

  return (
    <section className="panel p-5" aria-label="Alertas">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h2 className="t-h3">Alertas</h2>
        {alerts.status === 'success' && (
          <span className="t-mono text-[11px] text-muted">{alerts.data.length} activas</span>
        )}
      </div>
      <p className="t-small mb-5 max-w-[62ch]">
        Stock crítico, riesgo de quiebre, sobrestock, sin movimiento, consumo anómalo y
        diferencias de inventario — todo lo que el motor de reglas detectó recorriendo el
        inventario actual.
      </p>

      {alerts.status === 'loading' && <LoadingBlock label="Analizando inventario" rows={5} />}
      {alerts.status === 'error' && <ErrorBlock error={alerts.error} />}
      {alerts.status === 'success' &&
        (alerts.data.length === 0 ? (
          <EmptyBlock title="Sin alertas activas" hint="Nada requiere atención en este momento." />
        ) : (
          <ul className="flex flex-col">
            {alerts.data.map((a) => {
              const Icon = TYPE_ICON[a.type] ?? AlertCircle
              return (
                <li
                  key={a.id}
                  className="flex gap-3 items-start py-3 border-b border-rule last:border-b-0"
                >
                  <Icon
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: SEVERITY_TOKEN[a.severity] }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-0.5">
                      <span className="t-mono text-[11px]" style={{ color: SEVERITY_TOKEN[a.severity] }}>
                        {TYPE_LABEL[a.type]}
                      </span>
                      <span className="t-mono text-[11px] text-muted">{a.sku}</span>
                      <span className="text-[12px] text-graphite">{a.productName}</span>
                    </div>
                    <p className="text-[13px] leading-snug">{a.detected}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        ))}
    </section>
  )
}
