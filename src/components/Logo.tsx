import { Link } from 'react-router'

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={light ? 'logo logo-light' : 'logo'} aria-label="SplitTrip, ir al inicio">
      <span className="logo-mark" aria-hidden="true" />
      <span className="logo-text">
        <span className="logo-name">
          Split<span>Trip</span>
        </span>
        <span className="logo-tagline">Viaja, comparte, liquida</span>
      </span>
    </Link>
  )
}