import { Navigate, Outlet, useLocation } from 'react-router'
import Header from '../components/Header'
import { useAuth } from './AuthContext'

/** Pages for logged-in users: shows the header, or sends to /login. */
export function PrivateLayout() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return (
    <>
      <Header />
      <main className="page">
        <Outlet />
      </main>
    </>
  )
}

/** Login and register: if you're already logged in, go to your trips. */
export function GuestOnly() {
  const { user } = useAuth()
  return user ? <Navigate to="/" replace /> : <Outlet />
}