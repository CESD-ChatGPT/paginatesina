/* ═══════════════════════════════════════════════════════════════
   AUDITORÍA

   Registro en memoria de qué cambió, quién lo cambió y cuándo. Se
   resetea al recargar la página por la misma razón que el resto de las
   mutaciones de esta capa (inventory.js): no hay backend que lo persista.

   El "quién" se lee directo de sessionStorage (misma clave que usa
   AuthContext) en vez de importar el contexto de React — este módulo lo
   consumen otros módulos de datos, no componentes, y no debe arrastrar
   React ni un <Provider> para poder registrar un evento.
   ═══════════════════════════════════════════════════════════════ */

import { SESSION_KEY } from '../contexts/AuthContext'

let events = []

function currentUserName() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw).name : 'Sistema'
  } catch {
    return 'Sistema'
  }
}

export function recordEvent({ action, target, detail, reason }) {
  const event = {
    id: `EV-${Date.now().toString().slice(-6)}-${events.length}`,
    user: currentUserName(),
    action,
    target,
    detail,
    reason: reason ?? null,
    at: new Date(),
  }
  events = [event, ...events]
  return event
}

export function getAuditLog() {
  return events
}
