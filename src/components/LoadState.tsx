import { errorMessage } from '../api/client'

export function Loading({ text = 'Cargando…' }: { text?: string }) {
  return (
    <div className="load-state" role="status">
      <span className="spinner" aria-hidden="true" />
      {text}
    </div>
  )
}

export function LoadError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="load-state load-error" role="alert">
      <p>{errorMessage(error, 'No pudimos cargar la información.')}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  )
}