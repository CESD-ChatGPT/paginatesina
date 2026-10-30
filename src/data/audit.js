/* ═══════════════════════════════════════════════════════════════
   AUDITORÍA

   Registro en memoria de qué cambió, quién lo cambió y cuándo. Se
   resetea al recargar la página por la misma razón que el resto de las
   mutaciones de esta capa (inventory.js): no hay backend que lo persista.

   El "quién" se lo informa AuthContext vía setAuditUser() — ver abajo.
   Este módulo lo consumen otros módulos de datos, no componentes, así
   que no debe arrastrar React ni un <Provider> para registrar un evento,
   ni conocer cómo guarda la sesión cada proveedor de auth.
   ═══════════════════════════════════════════════════════════════ */

let events = []

/* Quién está operando. Lo empuja AuthContext cada vez que cambia la
   sesión, en vez de que este módulo vaya a buscarlo al almacenamiento.

   Antes leía sessionStorage directamente, y esa clave solo la escribe el
   provider mock: con Supabase real nunca existía, así que TODOS los
   eventos quedaban firmados como "Sistema". Una auditoría que no sabe
   atribuir no sirve para lo único que tiene que hacer. */
let currentUser = 'Sistema'

export function setAuditUser(name) {
  currentUser = name || 'Sistema'
}

export function recordEvent({ action, target, detail, reason }) {
  const event = {
    id: `EV-${Date.now().toString().slice(-6)}-${events.length}`,
    user: currentUser,
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
