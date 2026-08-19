import { createContext, useContext, useState, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════════════
   AUTENTICACIÓN

   ESTADO ACTUAL: **MOCK.** El proyecto es un sitio estático servido
   por GitHub Pages: no hay backend contra el cual autenticar, así que
   no existe un login "real" posible hoy.

   Lo que sí es real acá: la arquitectura. El resto de la app consume
   `useAuth()` y no sabe nada del origen. Para conectar un backend,
   reemplazá el cuerpo de `signIn`/`signOut` en `mockAuthProvider` por
   las llamadas HTTP correspondientes — no cambia nada más.

   ⚠ La sesión se guarda en sessionStorage. Eso es adecuado para una
   demo, NO para producción: un backend real debe emitir un token
   httpOnly y validarlo del lado del servidor. No trates esto como
   una barrera de seguridad — es solo navegación.
   ═══════════════════════════════════════════════════════════════ */

const DEMO_EMAIL = 'demo@solvus.io'
const DEMO_PASSWORD = 'solvus2026'

const mockAuthProvider = {
  async signIn({ email, password }) {
    await new Promise((r) => setTimeout(r, 700)) // latencia simulada

    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      const err = new Error('Credenciales incorrectas')
      err.code = 'invalid_credentials'
      throw err
    }

    return {
      name: 'Paula Ferrari',
      email: DEMO_EMAIL,
      role: 'Jefa de operaciones',
      warehouse: 'Depósito central',
    }
  },

  async signOut() {
    await new Promise((r) => setTimeout(r, 150))
  },
}

const SESSION_KEY = 'solvus-session'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [pending, setPending] = useState(false)

  const signIn = useCallback(async (credentials) => {
    setPending(true)
    try {
      const u = await mockAuthProvider.signIn(credentials)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(u))
      setUser(u)
      return u
    } finally {
      setPending(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    await mockAuthProvider.signOut()
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, pending, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}

/* Credenciales de la demo, mostradas en la pantalla de login.
   Se exportan para que exista un solo lugar donde viven. */
export const DEMO_CREDENTIALS = { email: DEMO_EMAIL, password: DEMO_PASSWORD }
