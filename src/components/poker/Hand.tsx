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
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {label}
        </span>
      )}
      <div
        className={`
          flex gap-1
          ${highlight ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg p-1' : ''}
        `}
      >
        <Card card={cards[0]} size={size} />
        <Card card={cards[1]} size={size} />
      </div>
    </div>
  )
}
