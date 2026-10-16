import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { tripsApi } from '../api/trips'
import type { TripCategory, TripSummary } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { AvatarStack } from '../components/Avatar'
import { LoadError, Loading } from '../components/LoadState'
import { balanceStatus, CATEGORIES, dateRange, firstName, money, plural } from '../lib/format'
import { useApi } from '../lib/useApi'

const FILTERS: { id: string; label: string; categories: TripCategory[] | null }[] = [
  { id: 'all', label: 'Todos', categories: null },
  { id: 'trips', label: 'Viajes', categories: ['TRIP'] },
  { id: 'outings', label: 'Salidas', categories: ['DINNER', 'PARTY'] },
  { id: 'home', label: 'Casa', categories: ['HOME'] },
]

function balanceText(balance: number): string {
  switch (balanceStatus(balance)) {
    case 'owed':
      return `Te deben ${money(balance)}`
    case 'owes':
      return `Debes ${money(-balance)}`
    default:
      return 'Estás a paz y salvo'
  }
}

export default function TripsPage() {
  const { user } = useAuth()
  const { data: trips, error, loading, reload } = useApi(() => tripsApi.list(), 'trips')
  const [query, setQuery] = useState('')
  const [filterId, setFilterId] = useState('all')

  const visible = useMemo(() => {
    const filter = FILTERS.find((f) => f.id === filterId)
    const text = query.trim().toLowerCase()
    return (trips ?? []).filter((trip) => {
      const matchesFilter = !filter?.categories || filter.categories.includes(trip.category)
      const matchesText =
        !text ||
        trip.name.toLowerCase().includes(text) ||
        trip.participantNames.some((name) => name.toLowerCase().includes(text))
      return matchesFilter && matchesText
    })
  }, [trips, query, filterId])

  const total = (trips ?? []).reduce((sum, trip) => sum + trip.myBalance, 0)

  return (
    <div className="container">
      <section className="page-hero">
        <div>
          {user && <span className="pill">Hola, {firstName(user.name)}</span>}
          <h1>Mis grupos</h1>
          {trips && (
            <p className="muted">
              {plural(trips.length, 'grupo activo', 'grupos activos')}
              {trips.length > 0 && ` · ${balanceText(total)}${balanceStatus(total) === 'settled' ? '' : ' en total'}`}
            </p>
          )}
        </div>
        <Link to="/trips/new" className="btn btn-primary btn-lg">
          + Crear grupo
        </Link>
      </section>

      {loading && !trips && <Loading text="Cargando tus grupos…" />}
      {!!error && <LoadError error={error} onRetry={reload} />}

      {trips && trips.length === 0 && (
        <div className="empty-state">
          <div className="big-emoji" aria-hidden="true">🧳</div>
          <h2>Aún no tienes grupos</h2>
          <p className="muted">Crea tu primer grupo, suma a tu parche y empieza a dividir.</p>
          <Link to="/trips/new" className="btn btn-primary">
            Crear grupo
          </Link>
        </div>
      )}

      {trips && trips.length > 0 && (
        <>
          <div className="toolbar">
            <input
              type="search"
              className="search"
              placeholder="Buscar grupo o amigo…"
              aria-label="Buscar grupo o amigo"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="chips" role="group" aria-label="Filtrar por tipo">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={filter.id === filterId ? 'chip chip-active' : 'chip'}
                  aria-pressed={filter.id === filterId}
                  onClick={() => setFilterId(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="muted center">No hay grupos que coincidan con la búsqueda.</p>
          ) : (
            <div className="trip-grid">
              {visible.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TripCard({ trip }: { trip: TripSummary }) {
  const category = CATEGORIES[trip.category]
  const range = dateRange(trip.startDate, trip.endDate)
  const status = balanceStatus(trip.myBalance)

  return (
    <article className="card trip-card">
      <div className="trip-card-top">
        <span className="category-icon" style={{ background: category.tint }} aria-hidden="true">
          {category.emoji}
        </span>
        <span className="tag">{range ?? 'Sin gastos'}</span>
      </div>

      <h2 className="trip-card-title">{trip.name}</h2>
      <p className="muted small">
        {plural(trip.participantCount, 'participante', 'participantes')} ·{' '}
        <span className={`balance-text balance-${status}`}>{balanceText(trip.myBalance)}</span>
      </p>

      <div className="trip-card-bottom">
        <AvatarStack names={trip.participantNames} />
        <div className="total">
          <span className="muted small">Total gastado</span>
          <strong>{money(trip.totalSpent)}</strong>
        </div>
      </div>

      <Link to={`/trips/${trip.id}`} className="btn btn-soft btn-block stretched-link">
        Ver detalle
      </Link>
    </article>
  )
}