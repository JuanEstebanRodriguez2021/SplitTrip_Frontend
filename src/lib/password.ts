/** Same rules as the backend's PasswordPolicy. */
export const PASSWORD_RULES = [
  { label: 'Entre 8 y 72 caracteres', test: (p: string) => p.length >= 8 && p.length <= 72 },
  { label: 'Una mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Un número', test: (p: string) => /\d/.test(p) },
  { label: 'Un carácter especial (!@#$…)', test: (p: string) => /[^A-Za-z0-9\s]/.test(p) },
]

export function isStrongPassword(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password))
}