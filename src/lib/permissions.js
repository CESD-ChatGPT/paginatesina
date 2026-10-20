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

/* ⚠️ ESTE CHEQUEO NO ES UNA BARRERA DE SEGURIDAD, y nunca lo será.

   `can()` decide qué MOSTRAR. Nada más. Corre en el navegador, donde
   el usuario puede cambiar cualquier valor que quiera.

   Quién puede escribir qué lo decide Postgres, en las políticas de Row
   Level Security de supabase/schema.sql. Ahí el rol se lee de la tabla
   `profiles`, y esa tabla tiene el candado donde tiene que estar: el
   cliente puede actualizar su nombre y su puesto, nunca su rol —

       revoke update on public.profiles from authenticated;
       grant  update (name, job_title) on public.profiles to authenticated;

   Antes el rol vivía en `user_metadata` de Supabase, que el propio
   usuario reescribe con una línea:

       supabase.auth.updateUser({ data: { role: 'administrador' } })

   El selector de rol del panel sigue existiendo como simulador de
   demostración y solo afecta a este `can()`: cambiar de rol ahí no
   cambia lo que el servidor deja hacer. */
export function can(role, permission) {
  return Boolean(PERMISSIONS[role]?.[permission])
}
