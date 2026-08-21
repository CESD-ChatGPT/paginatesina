import { useAuth } from '../../contexts/AuthContext'
import { ROLES, ROLE_LABEL } from '../../lib/permissions'

/* Selector de demostración: no hay múltiples cuentas reales para probar
   los 4 roles, así que la sesión activa puede simular cualquiera de
   ellos. Ver nota en lib/permissions.js — no reemplaza autorización real. */
export default function RoleSwitcher() {
  const { user, setRole } = useAuth()
  if (!user) return null

  return (
    <label className="flex items-center gap-2">
      <span className="t-mono text-[10px] text-muted whitespace-nowrap hidden lg:inline">Rol (demo)</span>
      <select
        value={user.role}
        onChange={(e) => setRole(e.target.value)}
        aria-label="Simular rol de sesión"
        className="t-mono text-[11px] min-h-[36px] px-2 border"
        style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px', background: 'var(--surface)' }}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABEL[r]}
          </option>
        ))}
      </select>
    </label>
  )
}
