const COLORS = ['#12a866', '#0b7a4b', '#f2a024', '#4f86e8', '#e0607e', '#8a6fd1']

function colorFor(name: string): string {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return COLORS[hash % COLORS.length]
}

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

type Tone = 'solid' | 'positive' | 'negative' | 'neutral'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  tone?: Tone
}

export function Avatar({ name, size = 'md', tone = 'solid' }: AvatarProps) {
  const style = tone === 'solid' ? { background: colorFor(name) } : undefined
  return (
    <span className={`avatar avatar-${size} avatar-${tone}`} style={style} title={name}>
      {initial(name)}
    </span>
  )
}

/** A, L, M +2 */
export function AvatarStack({ names, max = 3 }: { names: string[]; max?: number }) {
  const shown = names.slice(0, max)
  const rest = names.length - shown.length
  return (
    <span className="avatar-stack">
      {shown.map((name) => (
        <Avatar key={name} name={name} size="sm" />
      ))}
      {rest > 0 && <span className="avatar avatar-sm avatar-more">+{rest}</span>}
    </span>
  )
}