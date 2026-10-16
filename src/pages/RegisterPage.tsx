import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import { authApi } from '../api/auth'
import { ApiError, errorMessage } from '../api/client'
import AuthLayout from '../components/AuthLayout'
import PasswordRules from '../components/PasswordRules'
import { isStrongPassword } from '../lib/password'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [resent, setResent] = useState(false)

  const passwordsMatch = password === confirm
  const canSubmit = name.trim() !== '' && email.trim() !== '' && isStrongPassword(password) && passwordsMatch

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    setError(null)
    setSubmitting(true)
    try {
      await authApi.register(name.trim(), email.trim(), password)
      setRegistered(true)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Ese correo ya está registrado.')
      } else if (err instanceof ApiError && err.status === 400) {
        setError(err.fieldErrors.email ? 'Revisa el correo electrónico.' : 'Revisa los datos del formulario.')
      } else {
        setError(errorMessage(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    try {
      await authApi.resendVerification(email.trim())
      setResent(true)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  if (registered) {
    return (
      <AuthLayout>
        <div className="auth-form">
          <div className="big-emoji" aria-hidden="true">📬</div>
          <h1>Revisa tu correo</h1>
          <p className="muted">
            Te enviamos un enlace a <strong>{email.trim()}</strong> para confirmar tu cuenta. Vence en 24 horas.
          </p>
          {resent ? (
            <div className="alert alert-success">Listo, te enviamos un nuevo enlace.</div>
          ) : (
            <button type="button" className="btn btn-secondary btn-block" onClick={handleResend}>
              No me llegó, reenviar enlace
            </button>
          )}
          {error && <div className="alert alert-error">{error}</div>}
          <p className="auth-footer">
            ¿Ya lo confirmaste?{' '}
            <Link to="/login" className="link">
              Inicia sesión
            </Link>
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>Crea tu cuenta</h1>
        <p className="muted">Arma grupos, registra gastos y liquida sin enredos.</p>

        <label className="field">
          <span>Nombre</span>
          <input
            autoComplete="given-name"
            placeholder="Camila"
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Correo electrónico</span>
          <input
            type="email"
            autoComplete="email"
            placeholder="camila@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <PasswordRules password={password} />

        <label className="field">
          <span>Repite la contraseña</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {confirm && !passwordsMatch && <small className="field-error">Las contraseñas no coinciden.</small>}
        </label>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={!canSubmit || submitting}>
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>

        <p className="auth-footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="link">
            Inicia sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}