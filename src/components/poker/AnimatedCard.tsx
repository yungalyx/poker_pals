'use client'

import { useState, useEffect } from 'react'
import type { Card as CardType } from '@/types'
import { Card } from './Card'

interface AnimatedCardProps {
  card: CardType
  delay?: number // Delay in ms before animation starts
  size?: 'sm' | 'md' | 'lg'
  fromPosition?: 'top' | 'left' | 'right'
}

export function AnimatedCard({
  card,
  delay = 0,
  size = 'md',
  fromPosition = 'top'
}: AnimatedCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isFlipped, setIsFlipped] = useState(true)

  useEffect(() => {
    // Start animation after delay
    const showTimer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    // Flip card to reveal after sliding in
    const flipTimer = setTimeout(() => {
      setIsFlipped(false)
    }, delay + 300)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(flipTimer)
    }
  }, [delay])

  const getInitialTransform = () => {
    switch (fromPosition) {
      case 'top': return 'translateY(-100px)'
      case 'left': return 'translateX(-100px)'
      case 'right': return 'translateX(100px)'
      default: return 'translateY(-100px)'
    }
  }

  return (
    <div
      className="relative transition-all duration-300 ease-out"
      style={{
        transform: isVisible ? 'translateY(0) translateX(0)' : getInitialTransform(),
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div
        className="transition-transform duration-300"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front - actual card */}
        <div style={{ backfaceVisibility: 'hidden' }}>
          <Card card={card} size={size} />
        </div>

        {/* Back - card back (shown when flipped) */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <CardBack size={size} />
        </div>
      </div>
    </div>
  )
}

function CardBack({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-8 h-11',
    md: 'w-12 h-16',
    lg: 'w-16 h-22',
  }

  return (
    <div
      className={`
        ${sizes[size]}
        bg-blue-800
        border-2 border-blue-600
        rounded-md
        flex items-center justify-center
        shadow-sm
      `}
    >
      <div className="w-3/4 h-3/4 border border-blue-500 rounded-sm bg-blue-700" />
    </div>
  )
}
