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
