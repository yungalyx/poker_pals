'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Action } from '@/types'
import type { AnalysisGameState, AnalysisResult, ActionEntry } from '@/types/analysis'
import { AnimatedHand, AnimatedBoard } from '@/components/poker'
import { evaluateHand } from '@/lib/poker'
import {
  createAnalysisSession,
  dealNewHand,
  processAction,
  generateAnalysis,
  getOptimalAction,
} from '@/lib/analysis'
import { AnalysisSummary } from './AnalysisSummary'
import { HandResultModal, ResultType } from './HandResultModal'

interface AnalysisModeProps {
  onExit: () => void
}

const TIMER_DURATION = 30 // seconds

export function AnalysisMode({ onExit }: AnalysisModeProps) {
  const [gameState, setGameState] = useState<AnalysisGameState>(() =>
    dealNewHand(createAnalysisSession(100, 1000, 20))
  )
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [showVillainCards, setShowVillainCards] = useState(false)
  const [buddyMode, setBuddyMode] = useState(true)
  const [timerMode, setTimerMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [lastFeedback, setLastFeedback] = useState<{
    type: 'correct' | 'warning' | 'error'
    message: string
    buttonType: 'fold' | 'check-call' | 'raise-0' | 'raise-1' | 'raise-2'
  } | null>(null)
  const [dealCount, setDealCount] = useState(0)

  const hand = gameState.currentHand
  const profit = gameState.currentStack - gameState.startingStack
  const animationKey = dealCount

  // Reset timer when hand changes or mode changes
  const resetTimer = useCallback(() => {
    setTimeLeft(TIMER_DURATION)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Auto-fold function
  const autoFold = useCallback(() => {
    if (gameState.mode === 'playing' && hand) {
      const newState = processAction(gameState, 'fold')
      setGameState(newState)
      if (buddyMode) {
        setLastFeedback({ type: 'error', message: 'Time ran out - auto-folded!', buttonType: 'fold' })
      }
      if (newState.mode === 'session-complete') {
        setAnalysis(generateAnalysis(newState))
      }
    }
  }, [gameState, hand, buddyMode])

  // Timer effect
  useEffect(() => {
    if (!timerMode || gameState.mode !== 'playing' || !hand) {
      resetTimer()
      return
    }

    // Start the timer
    setTimeLeft(TIMER_DURATION)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [timerMode, gameState.mode, hand?.handNumber, hand?.street, resetTimer])

  // Auto-fold when timer hits 0
  useEffect(() => {
    if (timerMode && timeLeft === 0 && gameState.mode === 'playing' && hand) {
      autoFold()
    }
  }, [timeLeft, timerMode, gameState.mode, hand, autoFold])

  const handleAction = (action: Action, betAmount?: number, buttonIndex?: number) => {
    // Reset timer on any action
    resetTimer()
    const newState = processAction(gameState, action, betAmount)

    // Determine which button was pressed
    let buttonType: 'fold' | 'check-call' | 'raise-0' | 'raise-1' | 'raise-2' = 'fold'
    if (action === 'fold') {
      buttonType = 'fold'
    } else if (action === 'call' || action === 'check') {
      buttonType = 'check-call'
    } else if (action === 'raise' || action === 'bet') {
      buttonType = `raise-${buttonIndex ?? 0}` as 'raise-0' | 'raise-1' | 'raise-2'
    }

    // Check if action is optimal before processing
    if (buddyMode && hand) {
      const optimal = getOptimalAction(hand)
      const isCorrect = action === optimal.action
      const canCheck = hand.toCall === 0

      // Folding when you can check is always wrong
      const isFoldingForFree = action === 'fold' && canCheck

      // Check if this is a marginal spot where multiple actions are acceptable
      const isMarginalSpot = optimal.isMarginal === true

      // Close plays: similar actions that aren't quite optimal but not terrible
      const isClose =
        !isFoldingForFree &&
        ((optimal.action === 'call' && action === 'raise') ||
          (optimal.action === 'raise' && action === 'call') ||
          (optimal.action === 'check' && action === 'bet') ||
          (optimal.action === 'check' && action === 'raise') || // Raising when you can check is fine
          (optimal.action === 'bet' && action === 'check') ||
          (isMarginalSpot && (action === 'call' || action === 'fold')))

      if (isFoldingForFree) {
        setLastFeedback({ type: 'error', message: "Don't fold when you can check for free!", buttonType })
      } else if (isCorrect) {
        // Specific messages for correct actions
        const correctMessage = action === 'fold' ? 'Good fold!' : 'Great play!'
        setLastFeedback({ type: 'correct', message: correctMessage, buttonType })
      } else if (isClose) {
        // Contextual messages for close plays
        let closeMessage = optimal.reasoning
        if (optimal.action === 'call' && (action === 'raise' || action === 'bet')) {
          closeMessage = 'A call would be safer here'
        } else if (optimal.action === 'raise' && action === 'call') {
          closeMessage = 'Consider raising for value'
        } else if (optimal.action === 'check' && (action === 'bet' || action === 'raise')) {
          closeMessage = 'Checking is also fine here'
        } else if ((optimal.action === 'bet' || optimal.action === 'raise') && action === 'check') {
          closeMessage = 'Could bet for value here'
        }
        setLastFeedback({ type: 'warning', message: closeMessage, buttonType })
      } else {
        setLastFeedback({ type: 'error', message: optimal.reasoning, buttonType })
      }

      // Only auto-clear feedback if hand continues (not on hand-complete screen)
      if (newState.mode === 'playing') {
        setTimeout(() => setLastFeedback(null), 2000)
      }
    }

    setGameState(newState)

    if (newState.mode === 'session-complete') {
      setAnalysis(generateAnalysis(newState))
    }
  }

  const handleNextHand = () => {
    setGameState(prevState => dealNewHand(prevState))
    setDealCount(prev => prev + 1)
    setShowVillainCards(false)
    setLastFeedback(null)
  }

  const handleNewSession = () => {
    setGameState(dealNewHand(createAnalysisSession(100, 1000, 20)))
    setDealCount(prev => prev + 1)
    setAnalysis(null)
    setShowVillainCards(false)
    setLastFeedback(null)
  }

  // Show analysis summary when session is complete
  if (analysis) {
    return <AnalysisSummary analysis={analysis} onNewSession={handleNewSession} onExit={onExit} />
  }

  // Compute result data for modal (check before null hand check)
  const isHandComplete = gameState.mode === 'hand-complete' && gameState.handHistory.length > 0
  const lastHand = isHandComplete ? gameState.handHistory[gameState.handHistory.length - 1] : null

  // No hand dealt yet and not showing results - show deal button
  if (!hand && !isHandComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={handleNextHand} className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white text-lg font-bold rounded-xl border-b-4 border-blue-700 active:border-b-0 active:mt-1 active:mb-[-4px] transition-all shadow-lg">
          Deal First Hand
        </button>
      </div>
    )
  }

  let modalResult: ResultType = 'loss'
  let modalAmount = 0
  let heroHandDescription = ''
  let villainHandDescription = ''

  if (lastHand) {
    const boardToShow = lastHand.fullBoard || lastHand.board
    const heroResult = evaluateHand(lastHand.heroCards, boardToShow)
    const villainResult = evaluateHand(lastHand.villainCards, boardToShow)
    heroHandDescription = heroResult.description
    villainHandDescription = villainResult.description

    // Determine result type
    const heroFolded = lastHand.actionHistory?.some(
      a => a.actor === 'hero' && a.action === 'folds'
    )

    // Check if user played the ENTIRE hand correctly (all decisions optimal)
    const handDecisions = gameState.decisions.filter(d => d.handNumber === lastHand.handNumber)
    const allDecisionsOptimal = handDecisions.length > 0 && handDecisions.every(d => d.wasOptimal)
    const lastDecisionCorrect = lastFeedback?.type === 'correct'

    // Result variants
    const isDisciplinedFold = heroFolded && lastDecisionCorrect
    const isBadBeat = lastHand.winner === 'villain' && !heroFolded && allDecisionsOptimal

    if (lastHand.winner === 'hero') {
      modalResult = 'win'
      modalAmount = lastHand.pot
    } else if (lastHand.winner === 'tie') {
      modalResult = 'split'
      modalAmount = Math.floor(lastHand.pot / 2)
    } else if (isDisciplinedFold) {
      modalResult = 'disciplined-fold'
      modalAmount = 0
    } else if (isBadBeat) {
      modalResult = 'bad-beat'
      modalAmount = lastHand.pot
    } else if (heroFolded) {
      modalResult = 'fold'
      modalAmount = lastHand.pot
    } else {
      modalResult = 'loss'
      modalAmount = lastHand.pot
    }
  }

  // For display, use current hand when playing, or last hand when showing results
  // When hand-complete, hand may be null, so we need lastHand for display
  const displayBoard = isHandComplete && lastHand
    ? (lastHand.fullBoard || lastHand.board)
    : hand?.board || []
  const displayPot = isHandComplete && lastHand ? lastHand.pot : hand?.pot || 0
  const displayHeroCards = (isHandComplete && lastHand ? lastHand.heroCards : hand?.heroCards) as [string, string] | undefined
  const displayVillainCards = (isHandComplete && lastHand ? lastHand.villainCards : hand?.villainCards) as [string, string] | undefined
  const displayStreet = isHandComplete && lastHand ? lastHand.street : hand?.street || 'preflop'
  const displayActionHistory = isHandComplete && lastHand?.actionHistory
    ? lastHand.actionHistory
    : hand?.actionHistory || []

  const canCheck = hand?.toCall === 0
  const villainRaised = hand?.lastAction?.includes('bets') || hand?.lastAction?.includes('raises')
  const raiseLabel = canCheck ? 'Bet' : villainRaised ? 'Re-raise' : 'Raise'
  const betSizes = hand ? [
    { label: '1/3 Pot', amount: Math.round(hand.pot * 0.33) },
    { label: '2/3 Pot', amount: Math.round(hand.pot * 0.66) },
    { label: 'Pot', amount: hand.pot },
  ] : []

  // Show villain cards when hand is complete
  const shouldShowVillainCards = showVillainCards || isHandComplete

  return (
    <div className="min-h-screen bg-background">
      <Header
        handsPlayed={gameState.handsPlayed}
        maxHands={gameState.maxHands}
        onExit={onExit}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Stack display - fixed bottom right */}
      <div className="fixed bottom-48 right-48 text-right z-10">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-white">${gameState.currentStack}</span>
          <span className={`text-xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {profit >= 0 ? '+' : ''}{profit}
          </span>
        </div>
        <span className="block text-sm text-white/60">your stack</span>
      </div>

      <main className="relative max-w-lg mx-auto px-4 py-6">
        {/* Pot indicator - positioned to the left */}
        <div className="absolute right-full mr-6 top-44 text-center hidden xl:block">
          <span className="text-5xl font-bold text-white">${displayPot}</span>
          <span className="block text-sm text-white/60">in pot</span>
        </div>

        {/* Action History - positioned to the right */}
        {displayActionHistory.length > 0 && (
          <div className="absolute left-full ml-6 top-44 w-56 hidden xl:block">
            <ActionFeed actions={displayActionHistory} />
          </div>
        )}

        {/* Table - ALWAYS rendered */}
        <div className="rounded-xl p-6 mb-6">
          {/* Villain */}
          <div className="flex justify-center mb-4">
            {shouldShowVillainCards && displayVillainCards ? (
              <AnimatedHand
                cards={displayVillainCards}
                label="Villain"
                animationKey={animationKey}
              />
            ) : (
              <div className="text-center">
                <div className="flex gap-1">
                  <div className="w-12 h-16 bg-blue-800 rounded-md border-2 border-blue-600" />
                  <div className="w-12 h-16 bg-blue-800 rounded-md border-2 border-blue-600" />
                </div>
                <span className="text-xs text-white/70 mt-1 block">Villain</span>
              </div>
            )}
          </div>

          {/* Board */}
          <div className="flex justify-center mb-4">
            <AnimatedBoard cards={displayBoard} animationKey={animationKey} />
          </div>

          {/* Hero */}
          <div className="flex justify-center">
            {displayHeroCards && (
              <AnimatedHand
                cards={displayHeroCards}
                label="You"
                highlight
                size="lg"
                animationKey={animationKey}
                startDelay={displayStreet === 'preflop' ? 0 : undefined}
              />
            )}
          </div>
        </div>

        {/* Villain action - only show when playing */}
        {gameState.mode === 'playing' && hand?.lastAction && (
          <p className="text-center text-lg mb-4 font-medium">{hand.lastAction}</p>
        )}

        {/* Action buttons - only show when playing */}
        {gameState.mode === 'playing' && (
          <div className="space-y-4">
            {/* Fold / Check / Call row */}
            <div className="flex gap-3">
              {/* Fold button */}
              <div className="flex-1 relative">
                <FeedbackCallout
                  show={buddyMode && lastFeedback?.buttonType === 'fold'}
                  feedback={lastFeedback}
                />
                <button
                  onClick={() => handleAction('fold')}
                  className="w-full py-4 bg-red-500 hover:bg-red-400 text-white text-lg font-bold rounded-xl border-b-4 border-red-700 active:border-b-0 active:mt-1 active:mb-[-4px] transition-all shadow-lg"
                >
                  Fold
                </button>
              </div>

              {/* Check/Call button */}
              <div className="flex-1 relative">
                <FeedbackCallout
                  show={buddyMode && lastFeedback?.buttonType === 'check-call'}
                  feedback={lastFeedback}
                />
                <button
                  onClick={() => handleAction(canCheck ? 'check' : 'call')}
                  className="w-full py-4 bg-green-500 hover:bg-green-400 text-white text-lg font-bold rounded-xl border-b-4 border-green-700 active:border-b-0 active:mt-1 active:mb-[-4px] transition-all shadow-lg"
                >
                  {canCheck ? 'Check' : `Call $${hand?.toCall || 0}`}
                </button>
              </div>
            </div>

            {/* Bet/Raise/Re-raise options */}
            <div className="flex gap-3">
              {betSizes.map((size, index) => (
                <div key={size.label} className="flex-1 relative">
                  <FeedbackCallout
                    show={buddyMode && lastFeedback?.buttonType === `raise-${index}`}
                    feedback={lastFeedback}
                  />
                  <button
                    onClick={() => handleAction(canCheck ? 'bet' : 'raise', size.amount, index)}
                    className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl border-b-4 border-blue-700 active:border-b-0 active:mt-1 active:mb-[-4px] transition-all shadow-lg"
                  >
                    <span className="text-base">{raiseLabel} ${size.amount}</span>
                    <span className="block text-xs opacity-80 mt-0.5">{size.label}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hand result - replaces action buttons when hand complete */}
        {isHandComplete && (
          <HandResultModal
            isOpen={true}
            result={modalResult}
            amount={modalAmount}
            heroHandDescription={heroHandDescription}
            villainHandDescription={villainHandDescription}
            handsPlayed={gameState.handsPlayed}
            maxHands={gameState.maxHands}
            onNextHand={handleNextHand}
          />
        )}

        {/* Debug toggle for villain cards - only show when playing */}
        {gameState.mode === 'playing' && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowVillainCards(!showVillainCards)}
              className="text-xs text-gray-400 hover:text-gray-300"
            >
              {showVillainCards ? 'Hide' : 'Show'} villain cards
            </button>
          </div>
        )}
      </main>

      {/* Timer display - fixed on the side */}
      {timerMode && gameState.mode === 'playing' && hand && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-20">
          <div
            className={`w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold shadow-lg border-4 ${
              timeLeft <= 10
                ? 'bg-red-100 dark:bg-red-900/50 border-red-500 text-red-600 dark:text-red-400'
                : timeLeft <= 20
                  ? 'bg-yellow-100 dark:bg-yellow-900/50 border-yellow-500 text-yellow-600 dark:text-yellow-400'
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            <span className="text-2xl">{timeLeft}</span>
            <span className="text-xs">sec</span>
          </div>
          {/* Progress ring */}
          <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className={`${
                timeLeft <= 10
                  ? 'text-red-500'
                  : timeLeft <= 20
                    ? 'text-yellow-500'
                    : 'text-green-500'
              }`}
              strokeDasharray={`${(timeLeft / TIMER_DURATION) * 226} 226`}
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-6">Settings</h3>

            <div className="space-y-4">
              {/* Buddy Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Buddy Mode</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Get feedback on your decisions
                  </div>
                </div>
                <button
                  onClick={() => setBuddyMode(!buddyMode)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    buddyMode ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      buddyMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Timer Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Timer Mode</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    30 seconds to decide or auto-fold
                  </div>
                </div>
                <button
                  onClick={() => setTimerMode(!timerMode)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    timerMode ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      timerMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Header({
  handsPlayed,
  maxHands,
  onExit,
  onOpenSettings,
}: {
  handsPlayed: number
  maxHands: number
  onExit: () => void
  onOpenSettings: () => void
}) {
  return (
    <header className="sticky top-0 bg-background/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 z-10">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onExit}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium text-sm transition-colors"
          >
            {'\u2190'} Exit
          </button>

          <span className="font-bold text-lg">Hand {handsPlayed + 1}/{maxHands}</span>

          <button
            onClick={onOpenSettings}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium text-sm transition-colors"
          >
            {'\u2699'} Settings
          </button>
        </div>
      </div>
    </header>
  )
}

function FeedbackCallout({
  show,
  feedback,
}: {
  show: boolean
  feedback: { type: 'correct' | 'warning' | 'error'; message: string } | null
}) {
  if (!show || !feedback) return null

  const bgColor =
    feedback.type === 'correct'
      ? 'bg-green-500'
      : feedback.type === 'warning'
        ? 'bg-yellow-500'
        : 'bg-red-500'

  const icon =
    feedback.type === 'correct'
      ? '\u2705'
      : feedback.type === 'warning'
        ? '\u26A0\uFE0F'
        : '\u274C'

  return (
    <div
      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 animate-bounce-in`}
    >
      <div
        className={`${bgColor} text-white px-4 py-2 rounded-xl shadow-lg whitespace-nowrap flex items-center gap-2`}
      >
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-semibold">{feedback.message}</span>
      </div>
      {/* Arrow pointing down */}
      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent ${
          feedback.type === 'correct'
            ? 'border-t-green-500'
            : feedback.type === 'warning'
              ? 'border-t-yellow-500'
              : 'border-t-red-500'
        }`}
      />
    </div>
  )
}

function ActionFeed({ actions }: { actions: ActionEntry[] }) {
  const streets = ['preflop', 'flop', 'turn', 'river', 'showdown'] as const
  const groupedActions: Record<string, ActionEntry[]> = {}

  for (const action of actions) {
    if (!groupedActions[action.street]) {
      groupedActions[action.street] = []
    }
    groupedActions[action.street].push(action)
  }

  const getActorColor = (actor: string) => {
    switch (actor) {
      case 'hero':
        return 'text-blue-400'
      case 'villain':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getActorLabel = (actor: string) => {
    switch (actor) {
      case 'hero':
        return 'You'
      case 'villain':
        return 'Villain'
      default:
        return actor
    }
  }

  return (
    <div>
      <h3 className="font-semibold text-sm mb-3 text-white/70">Action History</h3>
      <div className="space-y-3 max-h-80 overflow-y-auto text-sm">
        {streets.map((street) => {
          const streetActions = groupedActions[street]
          if (!streetActions || streetActions.length === 0) return null

          return (
            <div key={street}>
              <div className="text-xs font-medium text-white/50 uppercase tracking-wide mb-1">
                {street}
              </div>
              <div className="space-y-1">
                {streetActions.map((action, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className={`font-medium ${getActorColor(action.actor)}`}>
                      {getActorLabel(action.actor)}
                    </span>
                    <span className="text-white">{action.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
