import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { AlertCircle, Loader2, MailCheck } from 'lucide-react'
import { useAuth, DEMO_CREDENTIALS } from '../contexts/AuthContext'
import { Isologotipo } from '../components/brand/Logo'

/* Login y registro comparten pantalla: son el mismo formulario con un
   campo más y otro botón, no dos rutas distintas. Separarlos obligaría a
   navegar para corregir un "me equivoqué, ya tengo cuenta".

   El registro solo aparece si hay un backend de auth configurado
   (`canRegister`). Sin backend no se muestra un formulario que no podría
   crear nada — ver AuthContext. */

const MIN_PASSWORD = 8

export default function Login() {
  const { signIn, signUp, resendConfirmation, pending, canRegister, isMockAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from ?? '/panel'

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [touched, setTouched] = useState({})
  const [formError, setFormError] = useState(null)
  const [formErrorCode, setFormErrorCode] = useState(null)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(null)
  /* 'idle' | 'sending' | 'sent' | 'error' — reenvío del correo de
     confirmación, para quien se quedó con un enlace vencido. */
  const [resend, setResend] = useState('idle')

  const isRegister = mode === 'register'

  async function handleResend(target) {
    setResend('sending')
    try {
      await resendConfirmation(target)
      setResend('sent')
    } catch {
      setResend('error')
    }
  }

  function ResendControl({ target }) {
    if (resend === 'sent') {
      return (
        <p className="t-mono text-[11px] mt-2" style={{ color: 'var(--positive)' }}>
          Listo, te enviamos un enlace nuevo. Revisá tu correo.
        </p>
      )
    }
    return (
      <>
        <button
          type="button"
          onClick={() => handleResend(target)}
          disabled={resend === 'sending'}
          className="t-mono text-[11px] mt-2 underline underline-offset-4 hover:text-[var(--accent)] disabled:opacity-60"
        >
          {resend === 'sending' ? 'Enviando…' : 'Enviar un enlace nuevo'}
        </button>
        {resend === 'error' && (
          <p className="t-mono text-[11px] mt-1 text-muted">
            No pudimos reenviarlo. Esperá un minuto e intentá de nuevo.
          </p>
        )}
      </>
    )
  }

  const nameError =
    isRegister && touched.name && !name.trim() ? 'Ingresá tu nombre' : null

  const emailError =
    touched.email && !email.trim()
      ? 'Ingresá tu correo'
      : touched.email && !/^\S+@\S+\.\S+$/.test(email.trim())
      ? 'El formato del correo no es válido'
      : null

  const passwordError =
    touched.password && !password
      ? 'Ingresá tu contraseña'
      : isRegister && touched.password && password.length < MIN_PASSWORD
      ? `Usá al menos ${MIN_PASSWORD} caracteres`
      : null

  const confirmError =
    isRegister && touched.confirm && confirm !== password
      ? 'Las contraseñas no coinciden'
      : null

  function switchMode(next) {
    setMode(next)
    setFormError(null)
    setFormErrorCode(null)
    setTouched({})
    setPassword('')
    setConfirm('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    setFormErrorCode(null)
    setTouched({ name: true, email: true, password: true, confirm: true })

    if (!email.trim() || !password || emailError) return
    if (isRegister && (!name.trim() || password.length < MIN_PASSWORD || confirm !== password)) return

    try {
      if (isRegister) {
        const result = await signUp({ name, email, password })
        if (result.needsEmailConfirmation) {
          setAwaitingConfirmation(email.trim())
          return
        }
        navigate('/panel', { replace: true })
      } else {
        await signIn({ email, password })
        navigate(from, { replace: true })
      }
    } catch (err) {
      setFormError(messageFor(err, isRegister))
      setFormErrorCode(err.code)
    }
  }

  const field =
    'w-full px-3 py-2.5 text-[15px] bg-surface border text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]'

  /* Pantalla posterior al alta cuando Supabase pide verificar el correo:
     la cuenta ya existe pero todavía no hay sesión. Mandar al panel acá
     sería mentir sobre el estado real. */
  if (awaitingConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-[420px] text-center">
          <span className="inline-flex mb-8 text-ink">
            <Isologotipo size={28} />
          </span>
          <MailCheck
            className="w-8 h-8 mx-auto mb-5"
            style={{ color: 'var(--accent)' }}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <h1 className="t-h2 text-[1.5rem] mb-3">Revisá tu correo</h1>
          <p className="t-body text-[15px] mb-2">
            Enviamos un enlace de confirmación a{' '}
            <span className="t-mono text-[14px] text-ink">{awaitingConfirmation}</span>.
          </p>
          <p className="t-small mb-2">
            Tu cuenta ya está creada, pero necesitás confirmar el correo antes de poder
            entrar. Si no lo ves, revisá la carpeta de spam.
          </p>
          {/* div y no p: ResendControl puede renderizar un <p>, y un
              párrafo dentro de otro es anidado inválido. */}
          <div className="mb-8">
            <p className="t-mono text-[11px] text-muted">
              El enlace vence a las 24 horas y sirve una sola vez.
            </p>
            <ResendControl target={awaitingConfirmation} />
          </div>
          <button
            onClick={() => {
              setAwaitingConfirmation(null)
              switchMode('login')
            }}
            className="t-mono text-[12px] underline underline-offset-4 hover:text-[var(--accent)]"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

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

          <h1 className="t-h2 text-[1.75rem] mb-2">
            {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </h1>
          <p className="t-small mb-8">
            {isRegister
              ? 'Registrate para acceder al panel de tu depósito.'
              : 'Accedé al panel de tu depósito.'}
          </p>

          {/* Credenciales de demo: solo cuando no hay backend real */}
          {isMockAuth && (
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
              <p className="text-muted text-[12px] mt-2 leading-snug">
                El registro está deshabilitado porque no hay un backend de autenticación
                configurado todavía.
              </p>
            </div>
          )}

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
                <div className="min-w-0">
                  <p className="text-[13px] leading-snug" style={{ color: 'var(--alert)' }}>
                    {formError}
                  </p>
                  {/* Cuenta sin confirmar: sin esto queda encerrado — no
                      puede entrar ni volver a registrarse. */}
                  {formErrorCode === 'email_not_confirmed' && <ResendControl target={email} />}
                </div>
              </div>
            )}

            {isRegister && (
              <div className="mb-4">
                <label htmlFor="name" className="t-label block mb-1.5">
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={field}
                  style={{
                    borderRadius: '2px',
                    borderColor: nameError ? 'var(--alert)' : 'var(--rule-strong)',
                  }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  aria-invalid={!!nameError}
                  aria-describedby={nameError ? 'name-error' : undefined}
                  placeholder="Paula Ferrari"
                />
                {nameError && (
                  <p id="name-error" className="text-[12px] mt-1.5" style={{ color: 'var(--alert)' }}>
                    {nameError}
                  </p>
                )}
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

            <div className={isRegister ? 'mb-4' : 'mb-6'}>
              <label htmlFor="password" className="t-label block mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                className={field}
                style={{
                  borderRadius: '2px',
                  borderColor: passwordError ? 'var(--alert)' : 'var(--rule-strong)',
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'password-error' : isRegister ? 'password-hint' : undefined}
                placeholder="••••••••"
              />
              {passwordError ? (
                <p
                  id="password-error"
                  className="text-[12px] mt-1.5"
                  style={{ color: 'var(--alert)' }}
                >
                  {passwordError}
                </p>
              ) : (
                isRegister && (
                  <p id="password-hint" className="t-mono text-[11px] text-muted mt-1.5">
                    Mínimo {MIN_PASSWORD} caracteres.
                  </p>
                )
              )}
            </div>

            {isRegister && (
              <div className="mb-6">
                <label htmlFor="confirm" className="t-label block mb-1.5">
                  Repetir contraseña
                </label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  className={field}
                  style={{
                    borderRadius: '2px',
                    borderColor: confirmError ? 'var(--alert)' : 'var(--rule-strong)',
                  }}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                  aria-invalid={!!confirmError}
                  aria-describedby={confirmError ? 'confirm-error' : undefined}
                  placeholder="••••••••"
                />
                {confirmError && (
                  <p
                    id="confirm-error"
                    className="text-[12px] mt-1.5"
                    style={{ color: 'var(--alert)' }}
                  >
                    {confirmError}
                  </p>
                )}
              </div>
            )}

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
              {pending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              {pending
                ? isRegister
                  ? 'Creando cuenta…'
                  : 'Verificando…'
                : isRegister
                ? 'Crear cuenta'
                : 'Entrar'}
            </button>
          </form>

          {canRegister && (
            <p className="t-small mt-6 text-center">
              {isRegister ? '¿Ya tenés cuenta? ' : '¿No tenés cuenta? '}
              <button
                onClick={() => switchMode(isRegister ? 'login' : 'register')}
                className="underline underline-offset-4 hover:text-[var(--accent)]"
              >
                {isRegister ? 'Iniciar sesión' : 'Crear una'}
              </button>
            </p>
          )}

          <p className="t-small mt-4 text-center">
            <Link to="/" className="underline underline-offset-4 hover:text-[var(--accent)]">
              Volver al sitio
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

/* Los códigos los normaliza AuthContext; acá solo se eligen las palabras. */
function messageFor(err, isRegister) {
  switch (err.code) {
    case 'invalid_credentials':
      return 'Correo o contraseña incorrectos. Revisá los datos e intentá de nuevo.'
    case 'email_taken':
      return 'Ya existe una cuenta con ese correo. Probá iniciar sesión.'
    case 'email_not_confirmed':
      return 'Todavía no confirmaste tu correo. Buscá el enlace que te enviamos.'
    case 'weak_password':
      return `La contraseña es demasiado débil. Usá al menos ${MIN_PASSWORD} caracteres.`
    case 'rate_limited':
      return 'Demasiados intentos seguidos. Esperá un minuto antes de volver a probar.'
    case 'registration_unavailable':
      return 'El registro no está disponible: falta configurar el backend de autenticación.'
    default:
      return isRegister
        ? 'No pudimos crear la cuenta. Intentá otra vez en unos segundos.'
        : 'No pudimos iniciar sesión. Intentá otra vez en unos segundos.'
  }
}
