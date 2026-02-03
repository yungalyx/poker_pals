'use client'

import { useState, useEffect } from 'react'
import type { Card as CardType } from '@/types'
import { Card } from './Card'

interface AnimatedCardProps {
  card: CardType
  delay?: number
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
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    // Reset animation state when card changes
    setIsVisible(false)
    setIsFlipped(true)
    // Random rotation between -5 and 5 degrees
    setRotation((Math.random() - 0.5) * 10)

    const showTimer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    const flipTimer = setTimeout(() => {
      setIsFlipped(false)
    }, delay + 300)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(flipTimer)
    }
  }, [delay, card])

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
        transform: isVisible
          ? `translateY(0) translateX(0) rotate(${rotation}deg)`
          : getInitialTransform(),
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
        <div style={{ backfaceVisibility: 'hidden', overflow: 'visible' }}>
          <Card card={card} size={size} />
        </div>

        {/* Back - card back (shown when flipped) */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            overflow: 'visible',
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
    sm: 'w-10 h-14',
    md: 'w-14 h-20',
    lg: 'w-20 h-28',
  }

  return (
    <div className="relative">
      {/* Dotted outline shadow offset behind */}
      <div
        className={`
          ${sizes[size]}
          absolute top-1 left-1
          border-2 border-dashed border-white/50
          rounded-lg
        `}
      />
      {/* Card back */}
      <div
        className={`
          ${sizes[size]}
          relative
          bg-violet-500
          border-2 border-violet-300
          rounded-lg
          flex items-center justify-center
        `}
      >
        <div className="w-3/4 h-3/4 border-2 border-dashed border-white/30 rounded" />
      </div>
    </div>
  )
}
