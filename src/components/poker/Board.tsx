import type { Card as CardType } from '@/types'
import { Card } from './Card'

interface BoardProps {
  cards: CardType[]
  size?: 'sm' | 'md' | 'lg'
}

export function Board({ cards, size = 'md' }: BoardProps) {
  // Show 5 card slots, empty if not dealt
  const slots = [0, 1, 2, 3, 4]

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
        Board
      </span>
      <div className="flex gap-1">
        {slots.map((i) => (
          <div key={i}>
            {cards[i] ? (
              <Card card={cards[i]} size={size} />
            ) : (
              <EmptySlot size={size} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptySlot({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-8 h-11',
    md: 'w-12 h-16',
    lg: 'w-16 h-22',
  }

  return (
    <div
      className={`
        ${sizes[size]}
        bg-gray-200 dark:bg-gray-700
        border border-dashed border-gray-400 dark:border-gray-500
        rounded-md
      `}
    />
  )
}
