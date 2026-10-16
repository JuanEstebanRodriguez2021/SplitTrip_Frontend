export type TripCategory = 'TRIP' | 'DINNER' | 'HOME' | 'PARTY'

export interface User {
  id: number
  name: string
  email: string
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface MessageResponse {
  message: string
}

export interface Participant {
  id: number
  name: string
}

export interface TripSummary {
  id: number
  name: string
  category: TripCategory
  participantCount: number
  participantNames: string[]
  expenseCount: number
  totalSpent: number
  startDate: string | null
  endDate: string | null
  myBalance: number
}

export interface Trip {
  id: number
  name: string
  category: TripCategory
  participants: Participant[]
  expenseCount: number
  totalSpent: number
  startDate: string | null
  endDate: string | null
  myParticipantId: number | null
  myBalance: number
}

export interface Expense {
  id: number
  description: string
  amount: number
  date: string
  paidBy: Participant
  splitAmong: Participant[]
}

export interface Balance {
  participant: Participant
  totalPaid: number
  totalShare: number
  balance: number
}

export interface Settlement {
  from: Participant
  to: Participant
  amount: number
}