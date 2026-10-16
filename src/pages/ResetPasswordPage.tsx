import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { authApi } from '../api/auth'
import { ApiError, errorMessage } from '../api/client'
import AuthLayout from '../components/AuthLayout'
import PasswordRules from '../components/PasswordRules'
import { isStrongPassword } from '../lib/password'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(token ? null : 'El enlace no es válido.')
  const [submitting, setSubmitting] = useState(false)

  const passwordsMatch = password === confirm
  const canSubmit = token !== '' && isStrongPassword(password) && passwordsMatch

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    setError(null)
    setSubmitting(true)
    try {
      await authApi.resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? 'El enlace venció o ya fue usado. Pide uno nuevo.'
          : errorMessage(err),
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="auth-form">
          <div className="big-emoji" aria-hidden="true">🔐</div>
          <h1>Clave actualizada</h1>
          <p className="muted">Ya puedes entrar con tu nueva clave.</p>
          <Link to="/login" className="btn btn-primary btn-block">
            Iniciar sesión
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>Crea una nueva clave</h1>
        <p className="muted">Elige una clave segura que no uses en otros sitios.</p>

        <label className="field">
          <span>Nueva contraseña</span>
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
            {error}{' '}
            <Link to="/forgot-password" className="link">
              Pedir otro enlace
            </Link>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={!canSubmit || submitting}>
          {submitting ? 'Guardando…' : 'Guardar clave'}
        </button>
      </form>
    </AuthLayout>
  )
}