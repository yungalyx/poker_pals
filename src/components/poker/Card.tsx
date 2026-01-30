import type { Card as CardType } from '@/types'

interface CardProps {
  card: CardType
  size?: 'sm' | 'md' | 'lg'
}

const suitSymbols: Record<string, string> = {
  s: '\u2660', // spade
  h: '\u2665', // heart
  d: '\u2666', // diamond
  c: '\u2663', // club
}

const suitColors: Record<string, string> = {
  s: 'text-gray-900',
  c: 'text-gray-900',
  h: 'text-red-600',
  d: 'text-red-600',
}

const rankDisplay: Record<string, string> = {
  T: '10',
  J: 'J',
  Q: 'Q',
  K: 'K',
  A: 'A',
}

const sizes = {
  sm: 'w-8 h-11 text-xs',
  md: 'w-12 h-16 text-sm',
  lg: 'w-16 h-22 text-lg',
}

export function Card({ card, size = 'md' }: CardProps) {
  const rank = card[0]
  const suit = card[1]
  const displayRank = rankDisplay[rank] || rank
  const symbol = suitSymbols[suit]
  const color = suitColors[suit]

  return (
    <div
      className={`
        ${sizes[size]}
        ${color}
        bg-white
        border border-gray-300
        rounded-md
        flex flex-col items-center justify-center
        font-bold
        shadow-sm
        select-none
      `}
    >
      <span className="leading-none">{displayRank}</span>
      <span className="leading-none">{symbol}</span>
    </div>
  )
}
