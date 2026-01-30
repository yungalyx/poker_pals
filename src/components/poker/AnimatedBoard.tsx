'use client'

import { useEffect, useState } from 'react'
import type { Card as CardType } from '@/types'
import { AnimatedCard } from './AnimatedCard'

interface AnimatedBoardProps {
  cards: CardType[]
  size?: 'sm' | 'md' | 'lg'
  animationKey?: string | number // Change this to re-trigger animations
}

export function AnimatedBoard({ cards, size = 'md', animationKey }: AnimatedBoardProps) {
  const [displayedCards, setDisplayedCards] = useState<CardType[]>([])
  const [prevLength, setPrevLength] = useState(0)

  useEffect(() => {
    // Track new cards being added
    if (cards.length > prevLength) {
      setDisplayedCards(cards)
    }
    setPrevLength(cards.length)
  }, [cards, prevLength])

  // Reset when animationKey changes (new hand)
  useEffect(() => {
    setDisplayedCards(cards)
    setPrevLength(cards.length)
  }, [animationKey])

  const slots = [0, 1, 2, 3, 4]
  const sizes = {
    sm: 'w-8 h-11',
    md: 'w-12 h-16',
    lg: 'w-16 h-22',
  }

  // Calculate delays - new cards get animated, old cards don't
  const getDelay = (index: number) => {
    const isNewCard = index >= prevLength - (cards.length - displayedCards.length)
    if (!isNewCard && displayedCards.length === cards.length) return 0

    // Stagger new cards
    const newCardIndex = index - Math.max(0, prevLength - 1)
    return newCardIndex * 150
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
        Board
      </span>
      <div className="flex gap-1">
        {slots.map((i) => (
          <div key={i} className="relative">
            {displayedCards[i] ? (
              <AnimatedCard
                card={displayedCards[i]}
                size={size}
                delay={i >= prevLength ? (i - prevLength) * 150 : 0}
                fromPosition="top"
              />
            ) : (
              <div
                className={`
                  ${sizes[size]}
                  bg-gray-200 dark:bg-gray-700
                  border border-dashed border-gray-400 dark:border-gray-500
                  rounded-md
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
