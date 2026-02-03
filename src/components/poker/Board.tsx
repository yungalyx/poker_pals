import type { Card as CardType } from '@/types'
import { Card } from './Card'

interface BoardProps {
  cards: CardType[]
  size?: 'sm' | 'md' | 'lg'
}

export function Board({ cards, size = 'md' }: BoardProps) {
  const slots = [0, 1, 2, 3, 4]

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-widest opacity-70">
        Board
      </span>
      <div className="flex gap-2">
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
    sm: 'w-10 h-14',
    md: 'w-14 h-20',
    lg: 'w-20 h-28',
  }

  return (
    <div
      className={`
        ${sizes[size]}
        border-2 border-dashed border-white/40
        rounded-lg
      `}
    />
  )
}
