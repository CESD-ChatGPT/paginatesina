/* ═══════════════════════════════════════════════════════════════
   CLIENTE DE SUPABASE

   Es el único lugar del proyecto que sabe que existe Supabase. Si algún
   día se cambia de proveedor de auth, se reemplaza este archivo y el
   provider de AuthContext — nada más.

   LAS CLAVES NO ESTÁN EN EL REPO. Se leen de variables de entorno de
   Vite (VITE_*), que se inyectan en tiempo de build. Ver .env.example
   y el README para los pasos de configuración.

   ⚠ La anon key de Supabase es pública por diseño: viaja al navegador y
   cualquiera puede leerla. Eso NO es un descuido — lo que protege los
   datos es Row Level Security del lado de Supabase, no el secreto de la
   clave. Nunca pongas acá la service_role key: esa sí es secreta y
   bypassea RLS.

   CARGA DIFERIDA: el SDK pesa ~59 KB gzip. Con un import estático caía
   en el bundle principal, o sea que un visitante anónimo de la landing
   —que nunca va a autenticarse— lo descargaba igual. Con import()
   dinámico queda en su propio chunk: si no hay credenciales configuradas
   no se pide nunca, y si las hay se pide después del primer pintado.
   ═══════════════════════════════════════════════════════════════ */

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/* Se considera configurado solo si las dos variables existen y no son
   los placeholders del .env.example — si alguien copia el archivo pero
   no lo completa, queremos caer al modo demo, no romper el login. */
export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('tu-proyecto') && !anonKey.includes('tu-anon-key')
)

let clientPromise = null

/* Devuelve el cliente, creándolo la primera vez. Memoizado a nivel de
   promesa (no de valor) para que dos llamadas simultáneas durante el
   arranque no disparen dos imports ni dos clientes. */
export function getSupabase() {
  if (!isSupabaseConfigured) return Promise.resolve(null)
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url, anonKey)
    )
  }
  return clientPromise
}
