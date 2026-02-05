'use client'

import { useEffect, useState } from 'react'
import type { Card as CardType } from '@/types'
import { AnimatedCard } from './AnimatedCard'

interface AnimatedBoardProps {
  cards: CardType[]
  size?: 'sm' | 'md' | 'lg'
  animationKey?: string | number
}

export function AnimatedBoard({ cards, size = 'md', animationKey }: AnimatedBoardProps) {
  const [displayedCards, setDisplayedCards] = useState<CardType[]>([])
  const [prevLength, setPrevLength] = useState(0)

  useEffect(() => {
    if (cards.length > prevLength) {
      setDisplayedCards(cards)
    }
    setPrevLength(cards.length)
  }, [cards, prevLength])

  useEffect(() => {
    // Reset board when animation key changes (new hand)
    setDisplayedCards(cards)
    setPrevLength(0)
  }, [animationKey])

  const slots = [0, 1, 2, 3, 4]
  const sizes = {
    sm: 'w-10 h-14',
    md: 'w-14 h-20',
    lg: 'w-20 h-28',
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-widest opacity-70">
        Board
      </span>
      <div className="flex gap-2">
        {slots.map((i) => (
          <div key={`${animationKey}-${i}-${displayedCards[i] || 'empty'}`} className="relative">
            {displayedCards[i] ? (
              <AnimatedCard
                key={`${animationKey}-card-${displayedCards[i]}`}
                card={displayedCards[i]}
                size={size}
                delay={i >= prevLength ? (i - prevLength) * 150 : 0}
                fromPosition="top"
              />
            ) : (
              <div
                className={`
                  ${sizes[size]}
                  border-2 border-dashed border-white/40
                  rounded-lg
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
