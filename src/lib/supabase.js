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

/* ── Vuelta desde el enlace del correo ──────────────────────────

   Supabase devuelve los tokens en el FRAGMENTO de la URL
   (`.../#access_token=...`). Esta app usa HashRouter, así que el
   fragmento ya está ocupado por el ruteo: los dos se pelean por el
   mismo `#`.

   Verificado en navegador que sin esto la confirmación no funciona de
   ninguna de las dos formas:
   - con `redirect_to` a `#/login`, el fragmento queda
     `#/login#access_token=...` y el SDK no lo reconoce como callback;
   - con `redirect_to` a la raíz, el fragmento sí es válido, pero React
     Router lo reescribe a `#/` (regla `path="*"`) antes de que el SDK
     alcance a leerlo.

   El resultado en ambos casos es el mismo y es el peor posible: la
   cuenta queda creada y confirmada en Supabase, pero el usuario vuelve
   al sitio sin sesión — parece que el registro no se guardó.

   Por eso los tokens se consumen ANTES de montar React (ver main.jsx),
   que es el único momento en que nadie más toca la URL. */

const AUTH_CALLBACK = /(access_token|refresh_token|error_description|error_code)=/

export function hasAuthCallback() {
  if (typeof window === 'undefined') return false
  return AUTH_CALLBACK.test(window.location.hash) || AUTH_CALLBACK.test(window.location.search)
}

/* Rescata los enlaces con la forma vieja: hasta este arreglo el
   `redirect_to` incluía una ruta (`#/login`), así que Supabase devolvía
   `#/login#access_token=...` — dos fragmentos pegados que el SDK no
   reconoce. Los correos ya enviados siguen teniendo esa forma, y si no
   se contempla acá quedan rotos para siempre. Se recorta la parte de
   ruteo dejando el fragmento que el SDK sí entiende.

   Se usa replaceState y no `location.hash = ...` para no dejar el enlace
   roto en el historial: si no, el botón "atrás" vuelve a él. */
function normalizeLegacyFragment() {
  const { hash, pathname, search } = window.location
  const nested = hash.indexOf('#', 1)
  if (nested === -1 || !AUTH_CALLBACK.test(hash.slice(nested))) return
  window.history.replaceState(null, '', pathname + search + hash.slice(nested))
}

/* Devuelve true si quedó una sesión abierta, para que el arranque pueda
   mandar al panel en vez de dejar al usuario en la landing preguntándose
   si el registro funcionó. */
export async function consumeAuthCallback() {
  if (!isSupabaseConfigured || !hasAuthCallback()) return false
  try {
    normalizeLegacyFragment()
    const supabase = await getSupabase()
    // getSession() espera a la inicialización, que es donde el SDK lee
    // el fragmento, guarda la sesión y limpia la URL.
    const { data } = await supabase.auth.getSession()
    return Boolean(data.session)
  } catch {
    return false // un enlace vencido o ya usado no debe romper el arranque
  }
}

/* ¿Hay una sesión guardada de antes? supabase-js la persiste en
   localStorage bajo `sb-<ref>-auth-token`. Mirarlo primero permite que
   un visitante anónimo de la landing —que es la mayoría del tráfico— ni
   siquiera descargue el SDK, en vez de bajar 59 KB para descubrir que no
   había sesión.

   Ante la duda devuelve true: si el nombre de la clave cambiara en una
   versión futura del SDK, o si localStorage no se puede leer, se carga y
   se pregunta de verdad. Equivocarse hacia "cargar de más" cuesta unos
   KB; equivocarse hacia "no cargar" dejaría a alguien con sesión abierta
   viéndose como desconectado, que es mucho peor. */
export function hasStoredSession() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('sb-') && k.includes('auth-token')) return true
    }
    return false
  } catch {
    return true
  }
}

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
