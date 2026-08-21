/* ═══════════════════════════════════════════════════════════════
   ROLES Y PERMISOS

   Separa "qué puede hacer" (role, un valor de sistema) de "cómo se
   llama su puesto" (jobTitle, un texto libre para mostrar) — antes
   AuthContext usaba un solo campo para ambas cosas.

   Con un solo login mock no hay forma de probar los 4 roles con cuentas
   reales, así que el panel expone un selector de "rol de sesión" para
   quien lo use — es una herramienta de demostración explícita, rotulada
   como tal, no un mecanismo de seguridad: cambiar de rol acá no
   reemplaza a un backend que emita permisos por usuario.
   ═══════════════════════════════════════════════════════════════ */

export const ROLES = ['administrador', 'supervisor', 'operador', 'consulta']

export const ROLE_LABEL = {
  administrador: 'Administrador',
  supervisor: 'Supervisor',
  operador: 'Operador',
  consulta: 'Consulta',
}

const PERMISSIONS = {
  administrador: { transfer: true, adjust: true, createOrder: true, viewAudit: true },
  supervisor: { transfer: true, adjust: true, createOrder: true, viewAudit: true },
  operador: { transfer: true, adjust: true, createOrder: false, viewAudit: false },
  consulta: { transfer: false, adjust: false, createOrder: false, viewAudit: false },
}

export function can(role, permission) {
  return Boolean(PERMISSIONS[role]?.[permission])
}
