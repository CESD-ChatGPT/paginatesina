import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { can as canForRole } from '../lib/permissions'
import { getSupabase, isSupabaseConfigured, hasStoredSession } from '../lib/supabase'
import { setAuditUser } from '../data/audit'

/* ═══════════════════════════════════════════════════════════════
   AUTENTICACIÓN

   Dos modos, elegidos automáticamente según haya credenciales:

   1. **Supabase (real)** — si VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
      están configuradas. Registro y login reales contra Supabase Auth:
      las cuentas viven en un servidor, la contraseña se hashea del lado
      de ellos, la sesión se renueva sola y sobrevive a cerrar el navegador.

   2. **Mock (demo)** — si no hay credenciales. Credenciales fijas,
      sesión en sessionStorage. Sirve para que el proyecto siga siendo
      navegable sin configurar nada, pero **no es seguridad**: es
      navegación. El registro está deshabilitado en este modo, porque
      no habría dónde guardar la cuenta.

   El resto de la app consume `useAuth()` y no sabe en cuál de los dos
   está — salvo el Login, que muestra u oculta el registro según
   `canRegister`.
   ═══════════════════════════════════════════════════════════════ */

const DEMO_EMAIL = 'demo@solvus.io'
const DEMO_PASSWORD = 'solvus2026'

export const SESSION_KEY = 'solvus-session'

/* Rol por defecto de una cuenta recién registrada. NO es 'administrador'
   a propósito: quien se registra solo no debería auto-asignarse el rol
   con más permisos. 'operador' es el mínimo que permite operar de verdad
   (transferir, ajustar) sin habilitar compras ni auditoría. Un backend
   real lo elevaría desde un panel de administración. */
const DEFAULT_ROLE = 'operador'

/* ── Provider mock ─────────────────────────────────────────────── */

const mockAuthProvider = {
  async signIn({ email, password }) {
    await new Promise((r) => setTimeout(r, 700)) // latencia simulada

    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      const err = new Error('Credenciales incorrectas')
      err.code = 'invalid_credentials'
      throw err
    }

    const user = {
      name: 'Paula Ferrari',
      email: DEMO_EMAIL,
      jobTitle: 'Jefa de operaciones',
      role: 'administrador',
      warehouse: 'Depósito central',
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  },

  async signOut() {
    await new Promise((r) => setTimeout(r, 150))
    sessionStorage.removeItem(SESSION_KEY)
  },

  async restore() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  onChange() {
    return () => {} // el mock no emite cambios externos
  },
}

/* ── Provider Supabase ─────────────────────────────────────────── */

/* Supabase devuelve su propio objeto de usuario; el resto de la app
   espera la forma {name, email, jobTitle, role, warehouse}. La traducción
   vive acá y en ningún otro lado. */
function toAppUser(supabaseUser) {
  if (!supabaseUser) return null
  const meta = supabaseUser.user_metadata ?? {}
  return {
    name: meta.name || supabaseUser.email?.split('@')[0] || 'Usuario',
    email: supabaseUser.email,
    jobTitle: meta.jobTitle || 'Sin puesto asignado',
    role: meta.role || DEFAULT_ROLE,
    warehouse: meta.warehouse || 'Depósito central',
  }
}

/* Los mensajes de error de Supabase vienen en inglés y a veces son
   crípticos. Se traducen acá para que el Login no tenga que saber de
   Supabase, manteniendo un código estable que la UI sí entiende. */
function translateError(error) {
  const msg = (error?.message || '').toLowerCase()
  const err = new Error(error?.message || 'Error de autenticación')

  if (msg.includes('invalid login credentials')) err.code = 'invalid_credentials'
  else if (msg.includes('already registered') || msg.includes('already been registered')) {
    err.code = 'email_taken'
  } else if (msg.includes('email not confirmed')) err.code = 'email_not_confirmed'
  else if (msg.includes('password should be')) err.code = 'weak_password'
  else if (msg.includes('rate limit') || msg.includes('too many')) err.code = 'rate_limited'
  else err.code = 'unknown'

  return err
}

const supabaseAuthProvider = {
  async signIn({ email, password }) {
    const supabase = await getSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) throw translateError(error)
    return toAppUser(data.user)
  },

  async signUp({ name, email, password }) {
    const supabase = await getSupabase()
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // Queda en user_metadata; es lo que lee toAppUser al restaurar sesión.
        data: { name: name.trim(), role: DEFAULT_ROLE, warehouse: 'Depósito central' },
        /* A la raíz, SIN ruta de hash: Supabase agrega los tokens al
           fragmento, y `#/login#access_token=...` no es un callback que
           el SDK sepa leer. Con la raíz queda `#access_token=...`, que
           sí lo es. Quien lo consume es main.jsx, antes de que el router
           toque la URL. */
        emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
      },
    })
    if (error) throw translateError(error)

    /* Si el proyecto tiene confirmación por email activada (default de
       Supabase), acá NO viene sesión: la cuenta existe pero está pendiente
       de verificar. Se distingue del alta directa para que el Login pueda
       mostrar "revisá tu correo" en vez de mandar al panel. */
    return {
      user: toAppUser(data.user),
      needsEmailConfirmation: !data.session,
    }
  },

  /* Los enlaces de confirmación son de un solo uso y vencen (24 h por
     defecto). Sin esto, a quien se le vence queda encerrado: no puede
     entrar porque la cuenta está sin confirmar, y tampoco puede
     registrarse de nuevo porque el correo ya existe. */
  async resendConfirmation(email) {
    const supabase = await getSupabase()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}` },
    })
    if (error) throw translateError(error)
  },

  async signOut() {
    const supabase = await getSupabase()
    const { error } = await supabase.auth.signOut()
    if (error) throw translateError(error)
  },

  async restore() {
    /* Sin sesión guardada no hay nada que restaurar, así que se evita
       descargar el SDK — ver hasStoredSession() en lib/supabase.js. */
    if (!hasStoredSession()) return null
    const supabase = await getSupabase()
    const { data, error } = await supabase.auth.getSession()
    if (error || !data.session) return null
    return toAppUser(data.session.user)
  },

  /* Supabase renueva el token solo y puede cerrar sesión desde otra
     pestaña; sin esto la UI quedaría mostrando un usuario que ya no está.
     La suscripción se arma cuando termina de cargar el SDK, así que el
     cleanup tiene que contemplar que todavía no exista. */
  onChange(handler) {
    let subscription = null
    let cancelled = false

    getSupabase().then((supabase) => {
      if (cancelled || !supabase) return
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        handler(toAppUser(session?.user))
      })
      subscription = data.subscription
    })

    return () => {
      cancelled = true
      subscription?.unsubscribe()
    }
  },
}

const provider = isSupabaseConfigured ? supabaseAuthProvider : mockAuthProvider

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [pending, setPending] = useState(false)
  /* Restaurar la sesión de Supabase es asincrónico. Sin este estado, el
     guard de ruta vería user=null en el primer render y patearía al login
     a alguien que sí tenía sesión abierta. */
  const [initializing, setInitializing] = useState(true)
  const [roleOverride, setRoleOverride] = useState(null)

  useEffect(() => {
    let alive = true

    provider
      .restore()
      .then((restored) => {
        if (alive) setUser(restored)
      })
      .finally(() => {
        if (alive) setInitializing(false)
      })

    return () => {
      alive = false
    }
  }, [])

  /* Escuchar cambios de sesión solo tiene sentido cuando hay una: sirve
     para el refresco de token y para el cierre de sesión desde otra
     pestaña. Suscribirse siempre obligaría a descargar el SDK también
     para el visitante anónimo de la landing, que es justo lo que se
     quiere evitar. La dependencia es un booleano y no el objeto `user`,
     así que un evento de sesión no vuelve a disparar este efecto. */
  /* La auditoría necesita saber quién opera, y no puede deducirlo del
     almacenamiento porque cada provider guarda distinto. Se le informa
     desde acá, que es el único lugar que conoce la sesión activa. */
  useEffect(() => {
    setAuditUser(user?.name)
  }, [user?.name])

  const hasSession = Boolean(user)
  useEffect(() => {
    if (!isSupabaseConfigured) return
    if (!hasSession && !hasStoredSession()) return

    let alive = true
    const unsubscribe = provider.onChange((next) => {
      if (alive) setUser(next)
    })
    return () => {
      alive = false
      unsubscribe()
    }
  }, [hasSession])

  const signIn = useCallback(async (credentials) => {
    setPending(true)
    try {
      const u = await provider.signIn(credentials)
      setUser(u)
      return u
    } finally {
      setPending(false)
    }
  }, [])

  const signUp = useCallback(async (data) => {
    if (!isSupabaseConfigured) {
      const err = new Error('El registro necesita un backend de autenticación configurado.')
      err.code = 'registration_unavailable'
      throw err
    }
    setPending(true)
    try {
      const result = await provider.signUp(data)
      if (!result.needsEmailConfirmation) setUser(result.user)
      return result
    } finally {
      setPending(false)
    }
  }, [])

  const resendConfirmation = useCallback(async (email) => {
    if (!isSupabaseConfigured) {
      const err = new Error('No hay backend de autenticación configurado.')
      err.code = 'registration_unavailable'
      throw err
    }
    return provider.resendConfirmation(email)
  }, [])

  const signOut = useCallback(async () => {
    /* Cerrar sesión localmente pase lo que pase. Si el token ya venció o
       fue revocado, Supabase devuelve error — y si eso propaga, el
       usuario se queda "adentro" después de apretar Salir, que es
       justamente lo contrario de lo que pidió. El estado local manda. */
    try {
      await provider.signOut()
    } catch {
      // el servidor ya no reconoce la sesión: cerrarla acá igual
    }
    setUser(null)
    setRoleOverride(null)
  }, [])

  /* Cambia el rol de la sesión activa. Ver nota en lib/permissions.js:
     es un selector de demostración, no un flujo de autorización real.

     Se guarda aparte del usuario y no dentro de él: Supabase reconstruye
     el objeto desde user_metadata en cada refresco de token o al volver
     a la pestaña, y eso pisaba el rol elegido en medio de una demo. */
  const setRole = useCallback((role) => {
    setRoleOverride(role)
    if (!isSupabaseConfigured) {
      setUser((prev) => {
        if (!prev) return prev
        const next = { ...prev, role }
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
        return next
      })
    }
  }, [])

  /* El usuario que ve la app: el de la sesión, con el rol simulado
     encima si hay uno elegido. */
  const effectiveUser = user && roleOverride ? { ...user, role: roleOverride } : user

  const can = useCallback(
    (permission) => canForRole(effectiveUser?.role, permission),
    [effectiveUser?.role]
  )

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser,
        pending,
        initializing,
        signIn,
        signUp,
        signOut,
        resendConfirmation,
        setRole,
        can,
        canRegister: isSupabaseConfigured,
        isMockAuth: !isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}

/* Credenciales de la demo, mostradas en la pantalla de login cuando no
   hay backend real configurado. Se exportan para que exista un solo
   lugar donde viven. */
export const DEMO_CREDENTIALS = { email: DEMO_EMAIL, password: DEMO_PASSWORD }
