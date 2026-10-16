import { useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ApiError, errorMessage } from '../api/client'
import { tripsApi } from '../api/trips'
import type { TripCategory } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { Avatar } from '../components/Avatar'
import { CATEGORIES, CATEGORY_ORDER } from '../lib/format'

export default function CreateTripPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [category, setCategory] = useState<TripCategory>('TRIP')
  const [participants, setParticipants] = useState<string[]>([])
  const [newName, setNewName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const everyone = [user?.name ?? '', ...participants]

  function addParticipant() {
    const candidate = newName.trim()
    if (!candidate) return
    if (everyone.some((n) => n.toLowerCase() === candidate.toLowerCase())) {
      setNameError(`${candidate} ya está en el grupo.`)
      return
    }
    setParticipants([...participants, candidate])
    setNewName('')
    setNameError(null)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      addParticipant()
    }
  }

  function removeParticipant(target: string) {
    setParticipants(participants.filter((n) => n !== target))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    setError(null)
    setSaving(true)
    try {
      const trip = await tripsApi.create({ name: name.trim(), category, participants })
      navigate(`/trips/${trip.id}`, { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? 'Revisa los datos: puede haber nombres repetidos.'
          : errorMessage(err),
      )
      setSaving(false)
    }
  }

  return (
    <div className="container container-narrow">
      <Link to="/" className="back-link">
        ← Volver a mis grupos
      </Link>
      <h1>Crear grupo</h1>
      <p className="muted">Ponle nombre, suma a tu parche y empieza a dividir.</p>

      <form className="card form-card" onSubmit={handleSubmit}>
        <label className="field">
          <span>Nombre del grupo</span>
          <input
            placeholder="Fin de semana en Guatapé"
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <small className="muted">Tip: usa algo que todos reconozcan, como el plan o la fecha.</small>
        </label>

        <div className="option-grid" role="radiogroup" aria-label="Tipo de grupo">
          {CATEGORY_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={category === id}
              className={category === id ? 'option option-active' : 'option'}
              onClick={() => setCategory(id)}
            >
              <span aria-hidden="true">{CATEGORIES[id].emoji}</span> {CATEGORIES[id].label}
            </button>
          ))}
        </div>

        <div className="section-head">
          <strong>Participantes · {everyone.length}</strong>
          <span className="muted small">Tú ya estás incluido</span>
        </div>

        <div className="person-chips">
          {user && (
            <span className="person-chip person-chip-me">
              <Avatar name={user.name} size="sm" />
              {user.name} (tú)
            </span>
          )}
          {participants.map((person) => (
            <span key={person} className="person-chip">
              <Avatar name={person} size="sm" />
              {person}
              <button
                type="button"
                className="chip-remove"
                aria-label={`Quitar a ${person}`}
                onClick={() => removeParticipant(person)}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="add-row">
          <span className="add-row-icon" aria-hidden="true">+</span>
          <input
            placeholder="Escribe un nombre y pulsa Enter, ej. Sofía"
            aria-label="Nombre del participante"
            maxLength={60}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="button" className="btn btn-soft btn-sm" onClick={addParticipant} disabled={!newName.trim()}>
            Agregar
          </button>
        </div>
        {nameError && <small className="field-error">{nameError}</small>}

        <div className="info-box">
          <strong>¿Cómo se divide?</strong> Por defecto todo se reparte en partes iguales. Podrás elegir entre quiénes
          se divide cada gasto.
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <div className="form-actions">
          <Link to="/" className="btn btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary" disabled={!name.trim() || saving}>
            {saving ? 'Guardando…' : 'Guardar grupo →'}
          </button>
        </div>
      </form>
    </div>
  )
}