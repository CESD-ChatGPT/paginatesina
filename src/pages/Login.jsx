import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useAuth, DEMO_CREDENTIALS } from '../contexts/AuthContext'
import { Isologotipo } from '../components/brand/Logo'

export default function Login() {
  const { signIn, pending } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from ?? '/panel'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({})
  const [formError, setFormError] = useState(null)

  const emailError =
    touched.email && !email.trim()
      ? 'Ingresá tu correo'
      : touched.email && !/^\S+@\S+\.\S+$/.test(email.trim())
      ? 'El formato del correo no es válido'
      : null

  const passwordError = touched.password && !password ? 'Ingresá tu contraseña' : null

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    setFormError(null)

    if (!email.trim() || !password || emailError) return

    try {
      await signIn({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      setFormError(
        err.code === 'invalid_credentials'
          ? 'Correo o contraseña incorrectos. Revisá los datos e intentá de nuevo.'
          : 'No pudimos iniciar sesión. Intentá otra vez en unos segundos.'
      )
    }
  }

  const field =
    'w-full px-3 py-2.5 text-[15px] bg-surface border text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]'

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panel de marca — se oculta en mobile para no empujar el formulario */}
      <div
        className="hidden lg:flex flex-col justify-between p-12"
        style={{ background: 'var(--inverse-bg)', color: 'var(--inverse-ink)' }}
      >
        <Link to="/" className="inline-flex" style={{ color: 'var(--inverse-ink)' }}>
          <Isologotipo size={30} />
        </Link>

        <div>
          <p className="t-h2 max-w-[16ch] mb-5">Tu inventario, bajo control.</p>
          <p
            className="text-[15px] leading-relaxed max-w-[38ch]"
            style={{ color: 'var(--inverse-graphite)' }}
          >
            Pronóstico de demanda por SKU, alertas por excepción y reposición
            asistida — sobre los datos de tu propio depósito.
          </p>
        </div>

        <p className="t-mono text-[11px]" style={{ color: 'var(--inverse-graphite)' }}>
          © {new Date().getFullYear()} SOLVUS
        </p>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[380px]">
          <Link to="/" className="inline-flex lg:hidden mb-10 text-ink">
            <Isologotipo size={28} />
          </Link>

          <h1 className="t-h2 text-[1.75rem] mb-2">Iniciar sesión</h1>
          <p className="t-small mb-8">Accedé al panel de tu depósito.</p>

          {/* Credenciales de demo: el proyecto no tiene backend todavía */}
          <div
            className="mb-6 p-3 border text-[13px] leading-relaxed"
            style={{
              background: 'var(--accent-wash)',
              borderColor: 'var(--rule)',
              borderRadius: '2px',
            }}
          >
            <p className="t-label mb-1.5" style={{ color: 'var(--accent)' }}>
              Entorno de demostración
            </p>
            <p className="text-graphite">
              Usuario <span className="t-mono text-ink">{DEMO_CREDENTIALS.email}</span>
              <br />
              Clave <span className="t-mono text-ink">{DEMO_CREDENTIALS.password}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Error general — anunciado a lectores de pantalla */}
            {formError && (
              <div
                role="alert"
                className="flex gap-2.5 items-start mb-5 p-3 border reveal"
                style={{ borderColor: 'var(--alert)', borderRadius: '2px' }}
              >
                <AlertCircle
                  className="w-[18px] h-[18px] shrink-0 mt-px"
                  style={{ color: 'var(--alert)' }}
                  aria-hidden="true"
                />
                <p className="text-[13px] leading-snug" style={{ color: 'var(--alert)' }}>
                  {formError}
                </p>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="email" className="t-label block mb-1.5">
                Correo
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                className={field}
                style={{
                  borderRadius: '2px',
                  borderColor: emailError ? 'var(--alert)' : 'var(--rule-strong)',
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
                placeholder="nombre@empresa.com"
              />
              {emailError && (
                <p id="email-error" className="text-[12px] mt-1.5" style={{ color: 'var(--alert)' }}>
                  {emailError}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="t-label block mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={field}
                style={{
                  borderRadius: '2px',
                  borderColor: passwordError ? 'var(--alert)' : 'var(--rule-strong)',
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'password-error' : undefined}
                placeholder="••••••••"
              />
              {passwordError && (
                <p
                  id="password-error"
                  className="text-[12px] mt-1.5"
                  style={{ color: 'var(--alert)' }}
                >
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full inline-flex items-center justify-center gap-2 min-h-[46px] px-5 text-[15px] font-medium transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-ink)',
                borderRadius: '2px',
              }}
            >
              {pending && (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              )}
              {pending ? 'Verificando…' : 'Entrar'}
            </button>
          </form>

          <p className="t-small mt-6 text-center">
            <Link to="/" className="underline underline-offset-4 hover:text-[var(--accent)]">
              Volver al sitio
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
