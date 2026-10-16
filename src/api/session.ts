import type { User } from './types'

const KEY = 'splittrip.session'

export interface Session {
  token: string
  user: User
  expiresAt: number
}

/** "Remember me" sessions live in localStorage; the rest only last while the tab is open. */
function stores(): Storage[] {
  try {
    return [localStorage, sessionStorage]
  } catch {
    return []
  }
}

export function loadSession(): Session | null {
  for (const store of stores()) {
    try {
      const raw = store.getItem(KEY)
      if (!raw) continue
      const session = JSON.parse(raw) as Session
      if (session.expiresAt > Date.now()) return session
      store.removeItem(KEY)
    } catch {
      // Corrupted or blocked storage: ignore it
    }
  }
  return null
}

export function saveSession(session: Session, remember: boolean): void {
  clearSession()
  try {
    ;(remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(session))
  } catch {
    // Storage blocked: the session only lives in memory
  }
}

export function clearSession(): void {
  for (const store of stores()) {
    try {
      store.removeItem(KEY)
    } catch {
      // ignore
    }
  }
}

let currentToken: string | null = loadSession()?.token ?? null

export function getToken(): string | null {
  return currentToken
}

export function setToken(token: string | null): void {
  currentToken = token
}