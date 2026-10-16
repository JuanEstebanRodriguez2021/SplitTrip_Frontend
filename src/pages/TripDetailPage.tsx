import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { ApiError, errorMessage } from '../api/client'
import { tripsApi } from '../api/trips'
import type { Balance, Expense, Settlement, Trip } from '../api/types'
import { Avatar } from '../components/Avatar'
import { LoadError, Loading } from '../components/LoadState'
import { balanceStatus, CATEGORIES, dateRange, money, plural, shortDate, signedMoney } from '../lib/format'
import { useApi } from '../lib/useApi'

type Tab = 'expenses' | 'balances' | 'settle'

const TABS: { id: Tab; label: string }[] = [
  { id: 'expenses', label: 'Gastos' },
  { id: 'balances', label: 'Balances' },
  { id: 'settle', label: 'Liquidar' },
]

async function loadTrip(tripId: number) {
  const [trip, expenses, balances, settlements] = await Promise.all([
    tripsApi.get(tripId),
    tripsApi.expenses(tripId),
    tripsApi.balances(tripId),
    tripsApi.settlements(tripId),
  ])
  return { trip, expenses, balances, settlements }
}

export default function TripDetailPage() {
  const tripId = Number(useParams().tripId)
  const { data, error, loading, reload } = useApi(() => loadTrip(tripId), `trip-${tripId}`)
  const [tab, setTab] = useState<Tab>('expenses')

  if (loading && !data) return <Loading text="Cargando el grupo…" />

  if (error instanceof ApiError && error.status === 404) {
    return (
      <div className="container empty-state">
        <div className="big-emoji" aria-hidden="true">🔍</div>
        <h2>No encontramos este grupo</h2>
        <Link to="/" className="btn btn-primary">
          Volver a mis grupos
        </Link>
      </div>
    )
  }
  if (error || !data) return <LoadError error={error} onRetry={reload} />

  const { trip, expenses, balances, settlements } = data

  async function handleDelete(expense: Expense) {
    if (!window.confirm(`¿Eliminar "${expense.description}"? Los balances se recalculan.`)) return
    try {
      await tripsApi.deleteExpense(trip.id, expense.id)
      reload()
    } catch (err) {
      window.alert(errorMessage(err, 'No pudimos eliminar el gasto.'))
    }
  }

  return (
    <>
      <TripHero trip={trip} />

      <div className="container detail-body">
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? 'tab tab-active' : 'tab'}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'expenses' && (
          <div className="detail-grid">
            <section>
              <div className="section-head">
                <h2>Gastos del grupo</h2>
                <span className="muted small">Orden: recientes</span>
              </div>
              <ExpenseList tripId={trip.id} expenses={expenses} onDelete={handleDelete} />
            </section>
            <aside>
              <div className="section-head">
                <h2>Balances</h2>
              </div>
              <BalanceList balances={balances} myParticipantId={trip.myParticipantId} />
              <SettleCard settlements={settlements} onSeeAll={() => setTab('settle')} />
            </aside>
          </div>
        )}

        {tab === 'balances' && (
          <section className="narrow-section">
            <div className="section-head">
              <h2>Balances</h2>
              <span className="muted small">Lo que pagó cada uno frente a lo que le toca</span>
            </div>
            <BalanceList balances={balances} myParticipantId={trip.myParticipantId} />
            <AddParticipantForm tripId={trip.id} onAdded={reload} />
          </section>
        )}

        {tab === 'settle' && (
          <section className="narrow-section">
            <SettlementPlan settlements={settlements} myParticipantId={trip.myParticipantId} />
          </section>
        )}
      </div>

      <Link to={`/trips/${trip.id}/expenses/new`} className="fab">
        + Agregar gasto
      </Link>
    </>
  )
}

function TripHero({ trip }: { trip: Trip }) {
  const category = CATEGORIES[trip.category]
  const range = dateRange(trip.startDate, trip.endDate)
  const status = balanceStatus(trip.myBalance)
  const details = [
    plural(trip.participants.length, 'participante', 'participantes'),
    range,
    plural(trip.expenseCount, 'gasto', 'gastos'),
  ].filter(Boolean)

  return (
    <section className="trip-hero">
      <div className="container trip-hero-inner">
        <div>
          <Link to="/" className="back-link back-link-light">
            ← Mis grupos
          </Link>
          <div className="trip-hero-title">
            <span className="category-icon category-icon-lg" aria-hidden="true">
              {category.emoji}
            </span>
            <div>
              <h1>{trip.name}</h1>
              <p>{details.join(' · ')}</p>
            </div>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat stat-dark">
            <span>Total gastado</span>
            <strong>{money(trip.totalSpent)}</strong>
          </div>
          <div className="stat stat-light">
            <span>{status === 'owed' ? 'Te deben' : status === 'owes' ? 'Debes' : 'Tu saldo'}</span>
            <strong className={`balance-${status}`}>
              {status === 'settled' ? 'A paz y salvo' : signedMoney(trip.myBalance)}
            </strong>
          </div>
        </div>
      </div>
    </section>
  )
}

function ExpenseList({
  tripId,
  expenses,
  onDelete,
}: {
  tripId: number
  expenses: Expense[]
  onDelete: (expense: Expense) => void
}) {
  return (
    <div className="stack">
      {expenses.map((expense) => (
        <article key={expense.id} className="card expense-card">
          <span className="expense-icon" aria-hidden="true">
            🧾
          </span>
          <div className="expense-info">
            <strong>{expense.description}</strong>
            <span className="muted small">
              {expense.paidBy.name} pagó · {shortDate(expense.date)}
            </span>
            <span className="tag tag-green">
              Entre {expense.splitAmong.length} · {money(expense.amount / expense.splitAmong.length)} c/u
            </span>
          </div>
          <div className="expense-side">
            <strong className="expense-amount">{money(expense.amount)}</strong>
            <button
              type="button"
              className="icon-button"
              aria-label={`Eliminar ${expense.description}`}
              onClick={() => onDelete(expense)}
            >
              🗑
            </button>
          </div>
        </article>
      ))}

      <div className="empty-card">
        <div className="big-emoji" aria-hidden="true">🧾</div>
        <h3>{expenses.length === 0 ? 'Aún no hay gastos en este grupo' : 'Aún no hay más gastos en este grupo'}</h3>
        <p className="muted">
          {expenses.length === 0
            ? 'Registra el primero y SplitTrip calcula quién le debe a quién.'
            : 'Todo al día por aquí. Agrega el próximo gasto del parche.'}
        </p>
        <Link to={`/trips/${tripId}/expenses/new`} className="btn btn-primary btn-sm">
          Agregar gasto
        </Link>
      </div>
    </div>
  )
}

function BalanceList({ balances, myParticipantId }: { balances: Balance[]; myParticipantId: number | null }) {
  const max = Math.max(1, ...balances.map((b) => Math.abs(b.balance)))

  return (
    <div className="stack">
      {balances.map((b) => {
        const status = balanceStatus(b.balance)
        const tone = status === 'owed' ? 'positive' : status === 'owes' ? 'negative' : 'neutral'
        const label = status === 'owed' ? 'Le deben' : status === 'owes' ? 'Debe' : 'A paz y salvo'
        const isMe = b.participant.id === myParticipantId
        return (
          <article key={b.participant.id} className="card balance-card">
            <div className="balance-row">
              <Avatar name={b.participant.name} tone={tone} />
              <div className="balance-info">
                <strong>
                  {b.participant.name}
                  {isMe && <span className="muted"> (tú)</span>}
                </strong>
                <span className="muted small">
                  Pagó {money(b.totalPaid)} · Le toca {money(b.totalShare)}
                </span>
              </div>
              <div className={`balance-amount balance-${status}`}>
                <strong>{status === 'settled' ? money(0) : signedMoney(b.balance)}</strong>
                <span>{label}</span>
              </div>
            </div>
            <div className="bar">
              <span
                className={`bar-fill bar-${status}`}
                style={{ width: `${(Math.abs(b.balance) / max) * 100}%` }}
              />
            </div>
          </article>
        )
      })}
    </div>
  )
}

function SettleCard({ settlements, onSeeAll }: { settlements: Settlement[]; onSeeAll: () => void }) {
  return (
    <div className="card settle-card">
      <h3>🤝 Liquidar</h3>
      {settlements.length === 0 ? (
        <p className="muted">Todos están a paz y salvo. ¡Nada que pagar!</p>
      ) : (
        <>
          <p className="muted">
            Con solo {plural(settlements.length, 'pago', 'pagos')} todos quedan a paz y salvo. Es el mínimo
            necesario.
          </p>
          <ul className="settle-mini">
            {settlements.slice(0, 4).map((s, index) => (
              <li key={index}>
                <span>
                  {s.from.name} <span className="arrow">→</span> {s.to.name}
                </span>
                <strong>{money(s.amount)}</strong>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-primary btn-block" onClick={onSeeAll}>
            Ver plan completo
          </button>
        </>
      )}
    </div>
  )
}

function SettlementPlan({
  settlements,
  myParticipantId,
}: {
  settlements: Settlement[]
  myParticipantId: number | null
}) {
  if (settlements.length === 0) {
    return (
      <div className="empty-card">
        <div className="big-emoji" aria-hidden="true">🎉</div>
        <h3>Todos están a paz y salvo</h3>
        <p className="muted">No hay pagos pendientes en este grupo.</p>
      </div>
    )
  }

  return (
    <>
      <div className="section-head">
        <h2>Plan para liquidar</h2>
      </div>
      <p className="muted">
        Con {plural(settlements.length, 'pago', 'pagos')} todos quedan a paz y salvo. Es el mínimo necesario.
      </p>
      <div className="stack">
        {settlements.map((s, index) => {
          const involvesMe = s.from.id === myParticipantId || s.to.id === myParticipantId
          return (
            <article key={index} className={involvesMe ? 'card settle-row settle-row-me' : 'card settle-row'}>
              <span className="step">{index + 1}</span>
              <Avatar name={s.from.name} tone="negative" />
              <span className="settle-names">
                <strong>{s.from.id === myParticipantId ? 'Tú' : s.from.name}</strong>
                <span className="muted"> le paga a </span>
                <strong>{s.to.id === myParticipantId ? 'ti' : s.to.name}</strong>
              </span>
              <Avatar name={s.to.name} tone="positive" />
              <strong className="settle-amount">{money(s.amount)}</strong>
            </article>
          )
        })}
      </div>
    </>
  )
}

function AddParticipantForm({ tripId, onAdded }: { tripId: number; onAdded: () => void }) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    setError(null)
    setSaving(true)
    try {
      await tripsApi.addParticipant(tripId, name.trim())
      setName('')
      onAdded()
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400 ? 'Ya hay alguien con ese nombre.' : errorMessage(err),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="add-row add-row-card" onSubmit={handleSubmit}>
      <span className="add-row-icon" aria-hidden="true">+</span>
      <input
        placeholder="Agregar a alguien al grupo, ej. Sofía"
        aria-label="Nombre del nuevo participante"
        maxLength={60}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit" className="btn btn-soft btn-sm" disabled={!name.trim() || saving}>
        Agregar
      </button>
      {error && <small className="field-error add-row-error">{error}</small>}
    </form>
  )
}