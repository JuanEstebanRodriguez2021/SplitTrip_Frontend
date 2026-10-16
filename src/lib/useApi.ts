import { useCallback, useEffect, useState } from 'react'

interface Result<T> {
  key: string
  data: T | undefined
  error: unknown
}

/**
 * Runs an API call when the component mounts and whenever `key` changes.
 * Call reload() to fetch again, e.g. after creating or deleting something.
 * While reloading, the previous data stays on screen.
 */
export function useApi<T>(loader: () => Promise<T>, key: string) {
  const [version, setVersion] = useState(0)
  const requestKey = `${key}:${version}`
  const [result, setResult] = useState<Result<T>>()

  useEffect(() => {
    let cancelled = false
    loader().then(
      (data) => {
        if (!cancelled) setResult({ key: requestKey, data, error: null })
      },
      (error: unknown) => {
        if (!cancelled) setResult({ key: requestKey, data: undefined, error })
      },
    )
    return () => {
      cancelled = true
    }
    // The loader is a new function on every render; requestKey decides when to fetch.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  return {
    data: result?.data,
    error: result?.error ?? null,
    loading: result?.key !== requestKey,
    reload,
  }
}