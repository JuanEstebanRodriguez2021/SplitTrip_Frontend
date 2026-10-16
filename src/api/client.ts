import { getToken } from './session'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:7986/api'

/** Error returned by the backend (Problem Details) or a network failure (status 0). */
export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

let unauthorizedHandler: (() => void) | null = null

/** Called when a logged-in request gets 401 (expired or invalid token). */
export function onUnauthorized(handler: () => void): void {
  unauthorizedHandler = handler
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(API_URL + path, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'No pudimos conectarnos con el servidor. Revisa que el backend esté corriendo.')
  }

  if (response.status === 401 && token) {
    unauthorizedHandler?.()
  }

  if (!response.ok) {
    let detail = response.statusText
    let fieldErrors: Record<string, string> = {}
    try {
      const problem = (await response.json()) as { detail?: string; errors?: Record<string, string> }
      detail = problem.detail ?? detail
      fieldErrors = problem.errors ?? {}
    } catch {
      // Body was not JSON
    }
    throw new ApiError(response.status, detail, fieldErrors)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/** Friendly Spanish message for errors we don't handle specifically. */
export function errorMessage(error: unknown, fallback = 'Algo salió mal. Intenta de nuevo.'): string {
  if (error instanceof ApiError && error.status === 0) return error.message
  return fallback
}