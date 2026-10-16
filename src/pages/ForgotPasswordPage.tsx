import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import { authApi } from '../api/auth'
import { errorMessage } from '../api/client'
import AuthLayout from '../components/AuthLayout'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await authApi.forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      {sent ? (
        <div className="auth-form">
          <div className="big-emoji" aria-hidden="true">📬</div>
          <h1>Revisa tu correo</h1>
          <p className="muted">
            Si <strong>{email.trim()}</strong> tiene una cuenta, te enviamos un enlace para cambiar la clave. Vence
            en 1 hora.
          </p>
          <Link to="/login" className="btn btn-secondary btn-block">
            Volver a iniciar sesión
          </Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <h1>¿Olvidaste tu clave?</h1>
          <p className="muted">Escribe tu correo y te mandamos un enlace para crear una nueva.</p>

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

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={!email.trim() || submitting}>
            {submitting ? 'Enviando…' : 'Enviar enlace'}
          </button>

          <p className="auth-footer">
            <Link to="/login" className="link">
              ← Volver a iniciar sesión
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  )
}