'use client'

import { useEffect, useState } from 'react'
import type { Card as CardType } from '@/types'
import { AnimatedCard } from './AnimatedCard'

interface AnimatedHandProps {
  cards: [CardType, CardType]
  label?: string
  size?: 'sm' | 'md' | 'lg'
  highlight?: boolean
  animationKey?: string | number
  startDelay?: number
}

export function AnimatedHand({
  cards,
  label,
  size = 'md',
  highlight = false,
  animationKey,
  startDelay = 0,
}: AnimatedHandProps) {
  const [shouldAnimate, setShouldAnimate] = useState(true)

  useEffect(() => {
    setShouldAnimate(true)
  }, [animationKey])

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
        <AnimatedCard
          card={cards[0]}
          size={size}
          delay={shouldAnimate ? startDelay : 0}
          fromPosition="left"
        />
        <AnimatedCard
          card={cards[1]}
          size={size}
          delay={shouldAnimate ? startDelay + 150 : 0}
          fromPosition="right"
        />
      </div>
    </div>
  )
}
