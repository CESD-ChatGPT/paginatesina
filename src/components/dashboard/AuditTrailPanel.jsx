import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getAuditLog } from '../../data/audit'
import { EmptyBlock } from '../States'

const fmt = (d) =>
  new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

export default function AuditTrailPanel() {
  const { can } = useAuth()
  const [log] = useState(() => getAuditLog())

  if (!can('viewAudit')) {
    return (
      <section className="panel p-5" aria-label="Auditoría">
        <h2 className="t-h3 mb-2">Auditoría</h2>
        <p className="t-small">Tu rol de sesión no tiene permiso para ver el historial de auditoría.</p>
      </section>
    )
  }

  return (
    <section className="panel" aria-label="Auditoría">
      <div className="px-4 sm:px-5 py-4 border-b border-rule">
        <h2 className="t-h3 mb-1">Auditoría</h2>
        <p className="t-small">Quién cambió qué, cuándo y por qué — se resetea al recargar la página.</p>
      </div>

      {log.length === 0 ? (
        <div className="p-5">
          <EmptyBlock
            title="Sin eventos todavía"
            hint="Generar una orden, transferir stock o aplicar un ajuste queda registrado acá."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-rule">
                <th scope="col" className="t-label text-left px-4 sm:px-5 py-2.5 font-medium">Cuándo</th>
                <th scope="col" className="t-label text-left px-2 py-2.5 font-medium">Usuario</th>
                <th scope="col" className="t-label text-left px-2 py-2.5 font-medium">Acción</th>
                <th scope="col" className="t-label text-left px-2 py-2.5 font-medium hidden sm:table-cell">
                  Objetivo
                </th>
                <th scope="col" className="t-label text-left px-4 sm:px-5 py-2.5 font-medium hidden md:table-cell">
                  Detalle
                </th>
              </tr>
            </thead>
            <tbody>
              {log.map((ev) => (
                <tr key={ev.id} className="border-b border-rule last:border-b-0">
                  <td className="t-mono text-[11px] px-4 sm:px-5 py-3 text-muted whitespace-nowrap">
                    {fmt(ev.at)}
                  </td>
                  <td className="text-[13px] px-2 py-3 whitespace-nowrap">{ev.user}</td>
                  <td className="text-[13px] px-2 py-3">{ev.action}</td>
                  <td className="t-mono text-[12px] px-2 py-3 hidden sm:table-cell whitespace-nowrap">
                    {ev.target}
                  </td>
                  <td className="text-[12px] px-4 sm:px-5 py-3 text-graphite hidden md:table-cell">
                    {ev.detail}
                    {ev.reason && <span className="text-muted"> · {ev.reason}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
