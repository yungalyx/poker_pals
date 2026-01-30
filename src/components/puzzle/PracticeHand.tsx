'use client'

import { useState } from 'react'
import type { PracticeHand as PracticeHandType, Action, Street } from '@/types'
import { Hand, Board } from '@/components/poker'

interface PracticeHandProps {
  hand: PracticeHandType
  onComplete: (mistakes: number) => void
}

export function PracticeHand({ hand, onComplete }: PracticeHandProps) {
  const [currentDecision, setCurrentDecision] = useState(0)
  const [pot, setPot] = useState(hand.startingPot)
  const [mistakes, setMistakes] = useState(0)
  const [selectedAction, setSelectedAction] = useState<Action | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [folded, setFolded] = useState(false)
  const [finished, setFinished] = useState(false)

  const decision = hand.decisions[currentDecision]
  const isCorrect = selectedAction === decision?.optimalAction

  // Determine which cards to show based on current street
  const getVisibleBoard = (): string[] => {
    if (!decision) return [...hand.board.flop, hand.board.turn, hand.board.river]

    switch (decision.street) {
      case 'preflop':
        return []
      case 'flop':
        return [...hand.board.flop]
      case 'turn':
        return [...hand.board.flop, hand.board.turn]
      case 'river':
      case 'showdown':
        return [...hand.board.flop, hand.board.turn, hand.board.river]
      default:
        return []
    }
  }

  const handleAction = (action: Action) => {
    if (showFeedback || folded || finished) return
    setSelectedAction(action)
    setShowFeedback(true)

    if (action !== decision.optimalAction) {
      setMistakes((m) => m + 1)
    }

    if (action === 'fold') {
      setFolded(true)
    } else if (action === 'call' || action === 'check') {
      setPot((p) => p + decision.toCall)
    }
  }

  const handleNext = () => {
    if (folded) {
      setFinished(true)
      onComplete(mistakes)
      return
    }

    if (currentDecision < hand.decisions.length - 1) {
      setCurrentDecision((c) => c + 1)
      setSelectedAction(null)
      setShowFeedback(false)
    } else {
      setFinished(true)
      onComplete(mistakes)
    }
  }

  if (finished) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">{mistakes === 0 ? '🎯' : '📚'}</div>
        <h2 className="text-2xl font-bold mb-2">
          {mistakes === 0 ? 'Perfect!' : 'Hand Complete'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {mistakes === 0
            ? 'You made all the right decisions!'
            : `You made ${mistakes} mistake${mistakes > 1 ? 's' : ''}. Review the concepts and try again!`}
        </p>
      </div>
    )
  }

  const canCheck = decision.toCall === 0
  const streetLabels: Record<Street, string> = {
    preflop: 'Pre-flop',
    flop: 'Flop',
    turn: 'Turn',
    river: 'River',
    showdown: 'Showdown',
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">{hand.title}</h2>
        <p className="text-sm text-gray-500">{hand.description}</p>
      </div>

      {/* Table */}
      <div className="bg-green-800 dark:bg-green-900 rounded-xl p-6 mb-6">
        {/* Street indicator */}
        <div className="text-center mb-4">
          <span className="bg-black/30 text-white px-3 py-1 rounded-full text-sm">
            {streetLabels[decision.street]}
          </span>
        </div>

        {/* Villain */}
        <div className="flex justify-center mb-4">
          <Hand
            cards={hand.villainCards}
            label="Villain"
            size="md"
          />
          {!hand.showVillainCards && (
            <div className="absolute">
              {/* Card backs would go here - for now villain cards are visible */}
            </div>
          )}
        </div>

        {/* Board */}
        <div className="flex justify-center mb-4">
          <Board cards={getVisibleBoard()} />
        </div>

        {/* Pot */}
        <div className="text-center mb-4">
          <span className="bg-yellow-600 text-white px-4 py-2 rounded-full font-bold">
            Pot: ${pot}
          </span>
        </div>

        {/* Hero */}
        <div className="flex justify-center">
          <Hand cards={hand.heroCards} label="You" highlight size="lg" />
        </div>
      </div>

      {/* Decision area */}
      {!showFeedback ? (
        <div>
          {/* Villain action */}
          {decision.villainAction && (
            <p className="text-center mb-4 text-lg">
              {decision.villainAction}
            </p>
          )}

          {/* Hint for beginners */}
          {hand.difficulty === 'beginner' && decision.hint && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 {decision.hint}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleAction('fold')}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
            >
              Fold
            </button>

            <button
              onClick={() => handleAction(canCheck ? 'check' : 'call')}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
            >
              {canCheck ? 'Check' : `Call $${decision.toCall}`}
            </button>

            {hand.allowRaise ? (
              <button
                onClick={() => handleAction('raise')}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                Raise
              </button>
            ) : (
              <button
                disabled
                className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
                title="Raise disabled in beginner mode"
              >
                Raise
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Feedback */}
          <div
            className={`p-4 rounded-lg mb-4 ${
              isCorrect
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{isCorrect ? '✓' : '✗'}</span>
              <span className="font-semibold">
                {isCorrect ? 'Good decision!' : `Better to ${decision.optimalAction}`}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {decision.explanation}
            </p>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {folded || currentDecision === hand.decisions.length - 1
              ? 'See Results'
              : 'Next Street'}
          </button>
        </div>
      )}
    </div>
  )
}
