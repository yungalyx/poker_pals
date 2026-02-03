import type { Card as CardType } from '@/types'
import { Card } from './Card'

interface HandProps {
  cards: [CardType, CardType]
  label?: string
  size?: 'sm' | 'md' | 'lg'
  highlight?: boolean
}

export function Hand({ cards, label, size = 'md', highlight = false }: HandProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
          {label}
        </span>
      )}
      <div
        className={`
          flex gap-2 p-2 rounded-2xl
          ${highlight ? 'bg-white/10 ring-2 ring-white/30' : ''}
        `}
      >
        <Card card={cards[0]} size={size} />
        <Card card={cards[1]} size={size} />
      </div>
    </div>
  )
}
