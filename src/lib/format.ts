import type { TripCategory } from '../api/types'

const numberFormat = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 })

/** 845000 -> "$845.000", -104000 -> "-$104.000" */
export function money(value: number): string {
  const formatted = `$${numberFormat.format(Math.abs(value))}`
  return value < 0 ? `-${formatted}` : formatted
}

/** 151000 -> "+$151.000", -12000 -> "-$12.000", 0 -> "$0" */
export function signedMoney(value: number): string {
  return value > 0 ? `+${money(value)}` : money(value)
}

/** Digits typed by the user -> "180.000" */
export function groupDigits(digits: string): string {
  return digits ? numberFormat.format(Number(digits)) : ''
}

export type BalanceStatus = 'owed' | 'owes' | 'settled'

/** Balances under half a cent count as settled. */
export function balanceStatus(balance: number): BalanceStatus {
  if (balance > 0.005) return 'owed'
  if (balance < -0.005) return 'owes'
  return 'settled'
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function parseIso(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return { year, month, day }
}

/** "2026-09-14" -> "14 sep" */
export function shortDate(iso: string): string {
  const { month, day } = parseIso(iso)
  return `${day} ${MONTHS[month - 1]}`
}

/** "12 – 15 sep", "28 sep", "28 sep – 2 oct", or null without dates. */
export function dateRange(start: string | null, end: string | null): string | null {
  if (!start || !end) return null
  if (start === end) return shortDate(start)
  const a = parseIso(start)
  const b = parseIso(end)
  if (a.year === b.year && a.month === b.month) return `${a.day} – ${b.day} ${MONTHS[b.month - 1]}`
  return `${shortDate(start)} – ${shortDate(end)}`
}

/** Today's date as "YYYY-MM-DD" in local time. */
export function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}

export const CATEGORIES: Record<TripCategory, { label: string; emoji: string; tint: string }> = {
  TRIP: { label: 'Viaje', emoji: '✈️', tint: 'var(--tint-green)' },
  DINNER: { label: 'Cena', emoji: '🍽️', tint: 'var(--tint-amber)' },
  HOME: { label: 'Casa', emoji: '🏠', tint: 'var(--tint-gray)' },
  PARTY: { label: 'Fiesta', emoji: '🎉', tint: 'var(--tint-pink)' },
}

export const CATEGORY_ORDER: TripCategory[] = ['TRIP', 'DINNER', 'HOME', 'PARTY']