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

/* Valores del proyecto SOLVUS, con las variables de entorno teniendo
   prioridad por si se quiere apuntar a otro proyecto sin tocar código.

   ¿Por qué están en el repo y no solo en .env? Porque .env está
   gitignoreado: un build desde otra máquina o un contenedor limpio no lo
   tendría y la app caería a modo demo **en silencio**, haciendo
   desaparecer el registro del sitio publicado sin ningún error visible.
   Con estos valores como respaldo, cualquier `npm run build` produce el
   mismo resultado en cualquier lado.

   Que la anon key esté acá no es una filtración: es pública por diseño y
   ya viaja dentro del bundle que sirve GitHub Pages — cualquiera puede
   leerla desde el navegador. Lo que protege los datos es Row Level
   Security en Supabase, no el secreto de esta clave. La que NUNCA puede
   estar acá es la service_role. */
const FALLBACK_URL = 'https://sncbnwuwjrdkvzuyenue.supabase.co'
const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuY2Jud3V3anJka3Z6dXllbnVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxOTE0ODgsImV4cCI6MjEwMzc2NzQ4OH0.SXFOVSRPgsW1-DamNxxbWZQZpQdgEIiOhZQ6u-SWj-Y'

const url = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY

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
