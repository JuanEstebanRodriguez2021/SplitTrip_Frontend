import { PASSWORD_RULES } from '../lib/password'

/** Live checklist under the password field. */
export default function PasswordRules({ password }: { password: string }) {
  return (
    <ul className="password-rules" aria-label="Requisitos de la clave">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password)
        return (
          <li key={rule.label} className={ok ? 'ok' : undefined}>
            <span aria-hidden="true">{ok ? '✓' : '•'}</span> {rule.label}
          </li>
        )
      })}
    </ul>
  )
}