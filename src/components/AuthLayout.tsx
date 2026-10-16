import type { ReactNode } from 'react'
import Logo from './Logo'

/** Split screen used by login, register and password pages. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page">
      <header className="auth-topbar">
        <Logo />
      </header>

      <div className="auth-card">
        <section className="auth-promo" aria-hidden="true">
          <Logo light />
          <h2>El parche viaja, SplitTrip hace las cuentas</h2>
          <p>Divide gastos de viajes, cenas y salidas sin enredos. Todos aportan, nadie se estresa.</p>

          <div className="promo-tiles">
            <div className="promo-tile">
              <strong>Viaje a Santa Marta</strong>
              <span>$845.000 · 5 amigos</span>
            </div>
            <div className="promo-tile promo-tile-light">
              <strong>A paz y salvo</strong>
              <span>3 pagos mínimos</span>
            </div>
            <div className="promo-tile">
              <strong>Cena cumple</strong>
              <span>$320.500 · 6 amigos</span>
            </div>
          </div>
        </section>

        <section className="auth-panel">{children}</section>
      </div>
    </div>
  )
}