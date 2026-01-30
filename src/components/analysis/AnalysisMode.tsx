'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Action } from '@/types'
import type { AnalysisGameState, AnalysisResult, ActionEntry } from '@/types/analysis'
import { Hand, Board, AnimatedHand, AnimatedBoard } from '@/components/poker'
import { evaluateHand } from '@/lib/poker'
import {
  createAnalysisSession,
  dealNewHand,
  processAction,
  generateAnalysis,
  getOptimalAction,
} from '@/lib/analysis'
import { AnalysisSummary } from './AnalysisSummary'

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

  const hand = gameState.currentHand
  const profit = gameState.currentStack - gameState.startingStack
  const animationKey = gameState.handsPlayed

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
    setGameState(dealNewHand(gameState))
    setShowVillainCards(false)
    setLastFeedback(null)
  }

  const handleNewSession = () => {
    setGameState(dealNewHand(createAnalysisSession(100, 1000, 20)))
    setAnalysis(null)
    setShowVillainCards(false)
    setLastFeedback(null)
  }

  // Show analysis summary when session is complete
  if (analysis) {
    return <AnalysisSummary analysis={analysis} onNewSession={handleNewSession} onExit={onExit} />
  }

  // Show hand result
  if (gameState.mode === 'hand-complete' && gameState.handHistory.length > 0) {
    const lastHand = gameState.handHistory[gameState.handHistory.length - 1]
    const boardToShow = lastHand.fullBoard || lastHand.board
    const heroResult = evaluateHand(lastHand.heroCards, boardToShow)
    const villainResult = evaluateHand(lastHand.villainCards, boardToShow)

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

    // Determine display properties
    let resultBgColor = ''
    let resultTextColor = ''
    let resultAmount = ''
    let resultLabel = ''

    if (lastHand.winner === 'hero') {
      resultBgColor = 'bg-green-100 dark:bg-green-900/30'
      resultTextColor = 'text-green-600 dark:text-green-400'
      resultAmount = `+$${lastHand.pot}`
      resultLabel = 'You Win!'
    } else if (lastHand.winner === 'tie') {
      resultBgColor = 'bg-yellow-100 dark:bg-yellow-900/30'
      resultTextColor = 'text-yellow-600 dark:text-yellow-400'
      resultAmount = `+$${Math.floor(lastHand.pot / 2)}`
      resultLabel = 'Split Pot'
    } else if (isDisciplinedFold) {
      resultBgColor = 'bg-blue-100 dark:bg-blue-900/30'
      resultTextColor = 'text-blue-600 dark:text-blue-400'
      resultAmount = 'Saved'
      resultLabel = 'Disciplined Fold'
    } else if (isBadBeat) {
      resultBgColor = 'bg-purple-100 dark:bg-purple-900/30'
      resultTextColor = 'text-purple-600 dark:text-purple-400'
      resultAmount = `-$${lastHand.pot}`
      resultLabel = 'Bad Beat'
    } else {
      resultBgColor = 'bg-red-100 dark:bg-red-900/30'
      resultTextColor = 'text-red-600 dark:text-red-400'
      resultAmount = `-$${lastHand.pot}`
      resultLabel = 'Villain Wins'
    }

    return (
      <div className="min-h-screen bg-background">
        <Header
          handsPlayed={gameState.handsPlayed}
          maxHands={gameState.maxHands}
          stack={gameState.currentStack}
          profit={profit}
          targetProfit={gameState.targetProfit}
          onExit={onExit}
          onOpenSettings={() => setShowSettings(true)}
        />

        <main className="max-w-3xl mx-auto px-4 py-8">
          {/* Prominent profit/loss display */}
          <div className={`text-center py-6 px-4 rounded-xl mb-6 ${resultBgColor}`}>
            <div className={`text-4xl font-bold mb-1 ${resultTextColor}`}>
              {resultAmount}
            </div>
            <div className={`text-lg font-medium ${resultTextColor}`}>
              {resultLabel}
            </div>
            {isDisciplinedFold && (
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">
                You made the right call to fold. Well played!
              </p>
            )}
            {isBadBeat && (
              <p className="text-sm text-purple-600 dark:text-purple-300 mt-2">
                You played it right, but variance happens. Keep it up!
              </p>
            )}
          </div>

          <div className="bg-green-800 dark:bg-green-900 rounded-xl p-6 mb-6">
            <div className="flex justify-center mb-4">
              <Board cards={boardToShow} />
            </div>
            <div className="flex justify-center gap-12">
              <div className="text-center">
                <Hand cards={lastHand.villainCards} label="Villain" />
                <p className="text-white text-sm mt-2">{villainResult.description}</p>
              </div>
              <div className="text-center">
                <Hand cards={lastHand.heroCards} label="You" highlight />
                <p className="text-white text-sm mt-2">{heroResult.description}</p>
              </div>
            </div>
          </div>

          {/* Action Feed for completed hand */}
          {lastHand.actionHistory && lastHand.actionHistory.length > 0 && (
            <ActionFeed actions={lastHand.actionHistory} />
          )}

          <button
            onClick={handleNextHand}
            className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white text-lg font-bold rounded-xl border-b-4 border-blue-700 active:border-b-0 active:mt-1 active:mb-[-4px] transition-all shadow-lg mt-4"
          >
            Next Hand ({gameState.handsPlayed}/{gameState.maxHands})
          </button>
        </main>
      </div>
    )
  }

  // Playing a hand
  if (!hand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={handleNextHand} className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white text-lg font-bold rounded-xl border-b-4 border-blue-700 active:border-b-0 active:mt-1 active:mb-[-4px] transition-all shadow-lg">
          Deal First Hand
        </button>
      </div>
    )
  }

  const canCheck = hand.toCall === 0
  const villainRaised = hand.lastAction?.includes('bets') || hand.lastAction?.includes('raises')
  const raiseLabel = canCheck ? 'Bet' : villainRaised ? 'Re-raise' : 'Raise'
  const betSizes = [
    { label: '1/3 Pot', amount: Math.round(hand.pot * 0.33) },
    { label: '2/3 Pot', amount: Math.round(hand.pot * 0.66) },
    { label: 'Pot', amount: hand.pot },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header
        handsPlayed={gameState.handsPlayed}
        maxHands={gameState.maxHands}
        stack={gameState.currentStack}
        profit={profit}
        targetProfit={gameState.targetProfit}
        onExit={onExit}
        onOpenSettings={() => setShowSettings(true)}
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Street indicator */}
        <div className="text-center mb-4">
          <span className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
            {hand.street}
          </span>
          <span className="ml-2 text-sm text-gray-500">
            {hand.heroPosition === 'BTN' ? 'You are Button' : 'You are Big Blind'}
          </span>
        </div>

        {/* Two column layout: Board + Actions | Action History */}
        <div className="flex gap-6">
          {/* Left column: Board and Actions */}
          <div className="flex-1">
            {/* Table */}
            <div className="bg-green-800 dark:bg-green-900 rounded-xl p-6 mb-6">
              {/* Villain */}
              <div className="flex justify-center mb-4">
                {showVillainCards ? (
                  <AnimatedHand cards={hand.villainCards} label="Villain" animationKey={animationKey} />
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
                <AnimatedBoard cards={hand.board} animationKey={animationKey} />
              </div>

              {/* Pot */}
              <div className="text-center mb-4">
                <span className="inline-block bg-gradient-to-b from-yellow-400 to-yellow-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg border-b-4 border-yellow-700">
                  Pot: ${hand.pot}
                </span>
              </div>

              {/* Hero */}
              <div className="flex justify-center">
                <AnimatedHand
                  cards={hand.heroCards}
                  label="You"
                  highlight
                  size="lg"
                  animationKey={animationKey}
                  startDelay={hand.street === 'preflop' ? 0 : undefined}
                />
              </div>
            </div>

            {/* Villain action */}
            {hand.lastAction && (
              <p className="text-center text-lg mb-4 font-medium">{hand.lastAction}</p>
            )}

            {/* Action buttons */}
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
                    {canCheck ? 'Check' : `Call $${hand.toCall}`}
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
          </div>

          {/* Right column: Action History */}
          <div className="w-72 flex-shrink-0">
            {hand.actionHistory.length > 0 && <ActionFeed actions={hand.actionHistory} />}
          </div>
        </div>

        {/* Debug toggle for villain cards */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setShowVillainCards(!showVillainCards)}
            className="text-xs text-gray-400 hover:text-gray-300"
          >
            {showVillainCards ? 'Hide' : 'Show'} villain cards
          </button>
        </div>
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
  stack,
  profit,
  targetProfit,
  onExit,
  onOpenSettings,
}: {
  handsPlayed: number
  maxHands: number
  stack: number
  profit: number
  targetProfit: number
  onExit: () => void
  onOpenSettings: () => void
}) {
  return (
    <header className="sticky top-0 bg-background/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3">
        {/* Row 1: Exit, Title, Settings */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onExit}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium text-sm transition-colors"
          >
            {'\u2190'} Exit
          </button>

          <span className="font-bold text-lg">Analysis Mode</span>

          <button
            onClick={onOpenSettings}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium text-sm transition-colors"
          >
            {'\u2699'} Settings
          </button>
        </div>

        {/* Row 2: Stack bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span>
                Stack: <span className="font-bold">${stack}</span>
                <span className="text-gray-500 ml-2">Hand {handsPlayed + 1}/{maxHands}</span>
              </span>
              <span className={profit >= 0 ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                {profit >= 0 ? '+' : ''}${profit} / ${targetProfit} target
              </span>
            </div>
            {/* Progress bar to target */}
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner border border-gray-400 dark:border-gray-600">
              <div
                className={`h-full transition-all rounded-full ${profit >= 0 ? 'bg-gradient-to-b from-green-400 to-green-600' : 'bg-gradient-to-b from-red-400 to-red-600'}`}
                style={{ width: `${Math.min(Math.max((profit / targetProfit) * 100, 0), 100)}%` }}
              />
            </div>
          </div>
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
  // Group actions by street
  const streets = ['preflop', 'flop', 'turn', 'river', 'showdown'] as const
  const groupedActions: Record<string, ActionEntry[]> = {}

  for (const action of actions) {
    if (!groupedActions[action.street]) {
      groupedActions[action.street] = []
    }
    groupedActions[action.street].push(action)
  }

  // Cards are strings like "As" (Ace of spades), "Kh" (King of hearts)
  const formatCard = (card: string) => {
    if (!card || typeof card !== 'string') return '??'
    const suitSymbols: Record<string, string> = {
      s: '\u2660',
      h: '\u2665',
      d: '\u2666',
      c: '\u2663',
    }
    const rank = card.slice(0, -1) // Everything except last char
    const suit = card.slice(-1) // Last char
    return `${rank}${suitSymbols[suit] || suit}`
  }

  const getActorColor = (actor: string) => {
    switch (actor) {
      case 'hero':
        return 'text-blue-600 dark:text-blue-400'
      case 'villain':
        return 'text-red-600 dark:text-red-400'
      case 'dealer':
        return 'text-gray-500 dark:text-gray-400'
      default:
        return ''
    }
  }

  const getActorLabel = (actor: string) => {
    switch (actor) {
      case 'hero':
        return 'You'
      case 'villain':
        return 'Villain'
      case 'dealer':
        return 'Dealer'
      default:
        return actor
    }
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 sticky top-24">
      <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-300">Action History</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {streets.map((street) => {
          const streetActions = groupedActions[street]
          if (!streetActions || streetActions.length === 0) return null

          return (
            <div key={street}>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                {street}
              </div>
              <div className="space-y-1">
                {streetActions.map((action, idx) => (
                  <div key={idx} className="text-sm flex items-center gap-2">
                    <span className={`font-medium ${getActorColor(action.actor)}`}>
                      {getActorLabel(action.actor)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {action.action}
                      {action.cards && action.cards.length > 0 && (
                        <span className="ml-1 font-mono">
                          [{action.cards.map(formatCard).join(' ')}]
                        </span>
                      )}
                    </span>
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
