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

/* ⚠️ ESTE CHEQUEO NO ES UNA BARRERA DE SEGURIDAD.

   Hoy el rol viaja en `user_metadata` de Supabase, y ese campo lo puede
   reescribir el propio usuario:

       supabase.auth.updateUser({ data: { role: 'administrador' } })

   O sea que cualquiera con cuenta puede darse el rol más alto. Hoy no
   tiene consecuencia —solo esconde botones sobre datos que son iguales
   para todos— pero deja de ser inocuo en cuanto haya datos reales.

   Cuando se migre a tablas en Supabase, el rol tiene que mudarse a una
   tabla `profiles` donde el usuario pueda LEER su fila pero no escribir
   la columna `role`, y las políticas RLS tienen que consultar esa tabla,
   nunca este valor. Este `can()` se queda solo para decidir qué mostrar. */
export function can(role, permission) {
  return Boolean(PERMISSIONS[role]?.[permission])
}
