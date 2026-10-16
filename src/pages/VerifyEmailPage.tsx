import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { authApi } from '../api/auth'
import { ApiError, errorMessage } from '../api/client'
import AuthLayout from '../components/AuthLayout'
import { Loading } from '../components/LoadState'

type Status = 'loading' | 'success' | 'error'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'error')
  const [error, setError] = useState(token ? '' : 'El enlace no es válido.')

  // The token can only be used once: avoid a second call in React's dev StrictMode
  const sent = useRef(false)

  useEffect(() => {
    if (!token || sent.current) return
    sent.current = true
    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err: unknown) => {
        setStatus('error')
        setError(
          err instanceof ApiError && err.status === 400
            ? 'El enlace venció o ya fue usado. Inicia sesión para pedir uno nuevo.'
            : errorMessage(err),
        )
      })
  }, [token])

  return (
    <AuthLayout>
      <div className="auth-form">
        {status === 'loading' && <Loading text="Verificando tu correo…" />}

        {status === 'success' && (
          <>
            <div className="big-emoji" aria-hidden="true">🎉</div>
            <h1>¡Correo verificado!</h1>
            <p className="muted">Tu cuenta está lista. Ya puedes entrar a SplitTrip.</p>
            <Link to="/login" className="btn btn-primary btn-block">
              Iniciar sesión
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="big-emoji" aria-hidden="true">😕</div>
            <h1>No pudimos verificarlo</h1>
            <p className="muted">{error}</p>
            <Link to="/login" className="btn btn-secondary btn-block">
              Ir a iniciar sesión
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  )
}