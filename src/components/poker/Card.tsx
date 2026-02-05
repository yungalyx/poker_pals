import type { Card as CardType } from '@/types'

interface CardProps {
  card: CardType
  size?: 'sm' | 'md' | 'lg'
}

const suitSymbols: Record<string, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
}

const suitColors: Record<string, string> = {
  s: 'text-gray-900',
  c: 'text-gray-900',
  h: 'text-red-500',
  d: 'text-red-500',
}

const rankDisplay: Record<string, string> = {
  T: '10',
  J: 'J',
  Q: 'Q',
  K: 'K',
  A: 'A',
}

const sizes = {
  sm: {
    card: 'w-10 h-14',
    rank: 'text-base',
    suit: 'text-xl',
  },
  md: {
    card: 'w-14 h-20',
    rank: 'text-xl',
    suit: 'text-3xl',
  },
  lg: {
    card: 'w-20 h-28',
    rank: 'text-3xl',
    suit: 'text-5xl',
  },
}

export function Card({ card, size = 'md' }: CardProps) {
  const rank = card[0]
  const suit = card[1]
  const displayRank = rankDisplay[rank] || rank
  const isTen = displayRank === '10'
  const symbol = suitSymbols[suit]
  const color = suitColors[suit]
  const sizeConfig = sizes[size]

  return (
    <div className="relative">
      {/* Dotted outline shadow offset behind */}
      <div
        className={`
          ${sizeConfig.card}
          absolute top-1 left-1
          border-2 border-dashed border-white/50
          rounded-lg
        `}
      />
      {/* Main card */}
      <div
        className={`
          ${sizeConfig.card}
          ${color}
          relative
          bg-white
          border-2 border-gray-200 dark:border-gray-300
          rounded-lg
          flex flex-col items-center justify-center gap-0.5
          font-bold
          select-none
          overflow-visible
        `}
      >
        <span className={`${sizeConfig.rank} font-bold ${isTen ? '-tracking-[0.1em]' : ''}`}>{displayRank}</span>
        <span className={`${sizeConfig.suit}`}>{symbol}</span>
      </div>
    </div>
  )
}
