/* ═══════════════════════════════════════════════════════════════
   CENTRO DE NOTIFICACIONES

   No hay un feed en tiempo real — no existe backend que lo empuje (ver
   nota de "no simular tiempo real" en el resto del proyecto). Lo que sí
   es real: se arma leyendo las alertas activas y los últimos eventos de
   auditoría en el momento en que se abre el centro, y el estado
   leído/no leído se persiste en localStorage por id estable, así que
   sobrevive a un recargado de página aunque los datos mock no.
   ═══════════════════════════════════════════════════════════════ */
import { getAlerts } from '../data/recommendations'
import { getAuditLog } from '../data/audit'

const READ_KEY = 'solvus-notifications-read'

function loadReadIds() {
  try {
    const raw = localStorage.getItem(READ_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveReadIds(set) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...set]))
  } catch {
    // localStorage puede no estar disponible — el estado leído/no leído
    // es una comodidad, no algo crítico; se degrada en silencio.
  }
}

const SEVERITY_TO_LEVEL = { alta: 'alta', media: 'media', baja: 'baja' }

export async function getNotifications() {
  const [alerts, log] = await Promise.all([getAlerts(), Promise.resolve(getAuditLog())])
  const read = loadReadIds()

  const fromAlerts = alerts.map((a) => ({
    id: `notif-alert-${a.id}`,
    kind: 'alert',
    level: SEVERITY_TO_LEVEL[a.severity] ?? 'media',
    title: a.detected,
    subtitle: `${a.sku} · ${a.productName}`,
    read: read.has(`notif-alert-${a.id}`),
  }))

  const fromAudit = log.slice(0, 8).map((ev) => ({
    id: `notif-audit-${ev.id}`,
    kind: 'audit',
    level: 'info',
    title: ev.action,
    subtitle: `${ev.target} · ${ev.user}`,
    read: read.has(`notif-audit-${ev.id}`),
  }))

  return [...fromAlerts, ...fromAudit]
}

export function markNotificationRead(id) {
  const read = loadReadIds()
  read.add(id)
  saveReadIds(read)
}

export function markAllNotificationsRead(ids) {
  const read = loadReadIds()
  for (const id of ids) read.add(id)
  saveReadIds(read)
}
