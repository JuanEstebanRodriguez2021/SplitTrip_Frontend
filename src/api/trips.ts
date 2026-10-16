import { request } from './client'
import type { Balance, Expense, Participant, Settlement, Trip, TripCategory, TripSummary } from './types'

export interface NewTrip {
  name: string
  category: TripCategory
  participants: string[]
}

export interface NewExpense {
  description: string
  amount: number
  date: string
  paidById: number
  splitAmongIds: number[]
}

export const tripsApi = {
  list: () => request<TripSummary[]>('/trips'),

  get: (tripId: number) => request<Trip>(`/trips/${tripId}`),

  create: (trip: NewTrip) => request<Trip>('/trips', { method: 'POST', body: trip }),

  addParticipant: (tripId: number, name: string) =>
    request<Participant>(`/trips/${tripId}/participants`, { method: 'POST', body: { name } }),

  expenses: (tripId: number) => request<Expense[]>(`/trips/${tripId}/expenses`),

  createExpense: (tripId: number, expense: NewExpense) =>
    request<Expense>(`/trips/${tripId}/expenses`, { method: 'POST', body: expense }),

  deleteExpense: (tripId: number, expenseId: number) =>
    request<void>(`/trips/${tripId}/expenses/${expenseId}`, { method: 'DELETE' }),

  balances: (tripId: number) => request<Balance[]>(`/trips/${tripId}/balances`),

  settlements: (tripId: number) => request<Settlement[]>(`/trips/${tripId}/settlements`),
}