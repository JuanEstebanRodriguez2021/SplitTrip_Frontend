import { NavLink, useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { firstName } from '../lib/format'
import { Avatar } from './Avatar'
import Logo from './Logo'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Logo />

        <nav className="main-nav" aria-label="Principal">
          <NavLink to="/">
            Grupos
          </NavLink>
        </nav>

        {user && (
          <div className="user-menu">
            <span className="user-chip">
              <Avatar name={user.name} size="sm" tone="solid" />
              <span className="user-chip-name">{firstName(user.name)}</span>
            </span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  )
}