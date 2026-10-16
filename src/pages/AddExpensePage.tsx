import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { errorMessage } from '../api/client'
import { tripsApi } from '../api/trips'
import type { Trip } from '../api/types'
import { Avatar } from '../components/Avatar'
import { LoadError, Loading } from '../components/LoadState'
import { groupDigits, money, plural, todayIso } from '../lib/format'
import { useApi } from '../lib/useApi'

export default function AddExpensePage() {
  const tripId = Number(useParams().tripId)
  const { data: trip, error, loading, reload } = useApi(() => tripsApi.get(tripId), `trip-${tripId}`)

  if (loading && !trip) return <Loading />
  if (error || !trip) return <LoadError error={error} onRetry={reload} />
  return <ExpenseForm trip={trip} />
}

function ExpenseForm({ trip }: { trip: Trip }) {
  const navigate = useNavigate()
  const people = trip.participants

  const [description, setDescription] = useState('')
  const [digits, setDigits] = useState('')
  const [date, setDate] = useState(todayIso())
  const [paidById, setPaidById] = useState<number | undefined>(trip.myParticipantId ?? people[0]?.id)
  const [splitIds, setSplitIds] = useState<Set<number>>(() => new Set(people.map((p) => p.id)))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const amount = Number(digits || 0)
  const share = splitIds.size > 0 ? amount / splitIds.size : 0
  const allSelected = splitIds.size === people.length
  const canSave = description.trim() !== '' && amount > 0 && splitIds.size > 0 && paidById !== undefined

  function toggle(id: number) {
    const next = new Set(splitIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSplitIds(next)
  }

  function toggleAll() {
    setSplitIds(allSelected ? new Set() : new Set(people.map((p) => p.id)))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSave || paidById === undefined) return
    setError(null)
    setSaving(true)
    try {
      await tripsApi.createExpense(trip.id, {
        description: description.trim(),
        amount,
        date,
        paidById,
        splitAmongIds: people.filter((p) => splitIds.has(p.id)).map((p) => p.id),
      })
      navigate(`/trips/${trip.id}`)
    } catch (err) {
      setError(errorMessage(err, 'No pudimos guardar el gasto. Revisa los datos.'))
      setSaving(false)
    }
  }

  return (
    <div className="container container-narrow">
      <form className="card sheet" onSubmit={handleSubmit}>
        <header className="sheet-header">
          <div>
            <span className="sheet-kicker">{trip.name}</span>
            <h1>Agregar gasto</h1>
          </div>
          <Link to={`/trips/${trip.id}`} className="sheet-close" aria-label="Cerrar">
            ×
          </Link>
        </header>

        <div className="sheet-body">
          <label className="field">
            <span>Descripción</span>
            <input
              placeholder="Almuerzo en Taganga"
              maxLength={120}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Monto</span>
              <div className="money-input">
                <span aria-hidden="true">$</span>
                <input
                  inputMode="numeric"
                  placeholder="0"
                  value={groupDigits(digits)}
                  onChange={(e) => setDigits(e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 12))}
                />
              </div>
            </label>
            <label className="field">
              <span>Fecha</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
          </div>

          <fieldset className="field">
            <legend>¿Quién pagó?</legend>
            <div className="person-chips">
              {people.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={paidById === p.id ? 'person-chip person-chip-selected' : 'person-chip'}
                  aria-pressed={paidById === p.id}
                  onClick={() => setPaidById(p.id)}
                >
                  <Avatar name={p.name} size="sm" tone={paidById === p.id ? 'solid' : 'neutral'} />
                  {p.name}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <div className="section-head">
              <legend>¿Entre quiénes se divide?</legend>
              <button type="button" className="link-button" onClick={toggleAll}>
                {allSelected ? 'Ninguno' : 'Todos'}
              </button>
            </div>
            <div className="stack stack-tight">
              {people.map((p) => {
                const checked = splitIds.has(p.id)
                return (
                  <label key={p.id} className={checked ? 'split-row split-row-on' : 'split-row'}>
                    <input type="checkbox" checked={checked} onChange={() => toggle(p.id)} />
                    <Avatar name={p.name} size="sm" tone="neutral" />
                    <span className="split-name">{p.name}</span>
                    <span className="muted">{checked ? money(share) : '—'}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div className="share-box">
            <div>
              <strong>Cada uno pone</strong>
              <span>
                {groupDigits(digits) || '0'} ÷ {plural(splitIds.size, 'persona', 'personas')}
              </span>
            </div>
            <strong className="share-amount">{money(share)}</strong>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-actions">
            <Link to={`/trips/${trip.id}`} className="btn btn-secondary">
              Cancelar
            </Link>
            <button type="submit" className="btn btn-primary" disabled={!canSave || saving}>
              {saving ? 'Guardando…' : 'Guardar gasto'}
            </button>
          </div>
        </div>
      </form>
      <p className="muted small center">El saldo de cada participante se actualiza al guardar.</p>
    </div>
  )
}