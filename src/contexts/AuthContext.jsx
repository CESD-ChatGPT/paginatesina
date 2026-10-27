import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { can as canForRole } from '../lib/permissions'
import { setAuditUser } from '../data/audit'

/* ═══════════════════════════════════════════════════════════════
   SESIÓN LOCAL

   La app no tiene login: el acceso y la identidad de quien opera los
   maneja Vento. Mientras tanto, el panel corre con una sesión fija y
   el rol se elige con el selector del encabezado (ver lib/permissions.js:
   es un selector de demostración, no un control de acceso).

   El resto de la app consume `useAuth()` con la misma forma de antes.
   ═══════════════════════════════════════════════════════════════ */

const SESION = {
  name: 'Usuario del panel',
  role: 'administrador',
  warehouse: 'Depósito central',
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [roleOverride, setRoleOverride] = useState(null)
  const user = { ...SESION, role: roleOverride ?? SESION.role }

  /* La auditoría registra quién operó: se le informa el nombre fijo. */
  useEffect(() => {
    setAuditUser(user.name)
  }, [user.name])

  const setRole = useCallback((role) => setRoleOverride(role), [])
  const can = useCallback((permission) => canForRole(user.role, permission), [user.role])

  return (
    <AuthContext.Provider value={{ user, initializing: false, pending: false, setRole, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
