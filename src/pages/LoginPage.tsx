import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { authApi } from '../api/auth'
import { ApiError, errorMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import AuthLayout from '../components/AuthLayout'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notVerified, setNotVerified] = useState(false)
  const [resent, setResent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setNotVerified(false)
    setResent(false)
    setSubmitting(true)
    try {
      await login(email, password, rememberMe)
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setNotVerified(true)
        setError('Aún no has verificado tu correo. Revisa tu bandeja de entrada.')
      } else if (err instanceof ApiError && err.status === 401) {
        setError('Correo o clave incorrectos.')
      } else {
        setError(errorMessage(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    try {
      await authApi.resendVerification(email)
      setResent(true)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>Bienvenido de vuelta</h1>
        <p className="muted">Entra para ver tus grupos y saldos.</p>

        <label className="field">
          <span>Correo electrónico</span>
          <input
            type="email"
            autoComplete="email"
            placeholder="camila@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <div className="auth-row">
          <label className="checkbox">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            Recuérdame
          </label>
          <Link to="/forgot-password" className="link">
            ¿Olvidaste tu clave?
          </Link>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
            {notVerified && !resent && (
              <button type="button" className="link-button" onClick={handleResend}>
                Reenviar enlace
              </button>
            )}
            {resent && <span> Te enviamos un nuevo enlace.</span>}
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting || !email || !password}>
          {submitting ? 'Entrando…' : 'Entrar a SplitTrip →'}
        </button>

        <p className="auth-footer">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/register" className="link">
            Crea tu cuenta gratis
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}