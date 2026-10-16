import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../api/auth'
import { onUnauthorized } from '../api/client'
import { clearSession, loadSession, saveSession, setToken } from '../api/session'
import type { User } from '../api/types'

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadSession()?.user ?? null)

  const logout = useCallback(() => {
    clearSession()
    setToken(null)
    setUser(null)
  }, [])

  const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    const response = await authApi.login(email, password, rememberMe)
    const session = {
      token: response.accessToken,
      user: response.user,
      expiresAt: Date.now() + response.expiresIn * 1000,
    }
    saveSession(session, rememberMe)
    setToken(session.token)
    setUser(session.user)
  }, [])

  // An expired or invalid token sends the user back to the login screen
  useEffect(() => onUnauthorized(logout), [logout])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}