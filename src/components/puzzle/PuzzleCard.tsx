'use client'

import { useState } from 'react'
import type { Puzzle, HandComparisonScenario, HeroScenario } from '@/types'
import { Hand, Board } from '@/components/poker'
import { GlossaryText } from '@/components/ui'
import { OptionButton } from './OptionButton'

type AnswerResult = 'correct' | 'warning' | 'incorrect' | null

interface PuzzleCardProps {
  puzzle: Puzzle
  onAnswer: (correct: boolean) => void
}

export function PuzzleCard({ puzzle, onAnswer }: PuzzleCardProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)

  const handleSelect = (optionId: string) => {
    if (answered) return
    setSelected(optionId)
  }

  const getResult = (): AnswerResult => {
    if (!selected) return null
    if (selected === puzzle.correctAnswer) return 'correct'
    if (puzzle.warningAnswers?.includes(selected)) return 'warning'
    return 'incorrect'
  }

  const handleSubmit = () => {
    if (!selected || answered) return
    setAnswered(true)
    const result = getResult()
    // Warning counts as correct for scoring (not penalized)
    onAnswer(result === 'correct' || result === 'warning')
  }

  const result = answered ? getResult() : null

  const getResultStyles = () => {
    if (result === 'correct') return 'bg-green-100 dark:bg-green-900/30'
    if (result === 'warning') return 'bg-yellow-100 dark:bg-yellow-900/30'
    return 'bg-red-100 dark:bg-red-900/30'
  }

  const getResultIcon = () => {
    if (result === 'correct') return '\u2713'
    if (result === 'warning') return '\u26A0'
    return '\u2717'
  }

  const getResultTitle = () => {
    if (result === 'correct') return 'Correct!'
    if (result === 'warning') return 'Acceptable, but...'
    return 'Not quite'
  }

  const getExplanation = () => {
    if (result === 'warning' && puzzle.warningExplanation) {
      return puzzle.warningExplanation
    }
    return puzzle.explanation
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Scenario visualization */}
      <div className="mb-6">
        <ScenarioDisplay puzzle={puzzle} />
      </div>

      {/* Question */}
      <h2 className="text-xl font-semibold mb-4">
        <GlossaryText text={puzzle.question} />
      </h2>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {puzzle.options.map((option) => {
          let optionResult: AnswerResult = null
          if (answered && selected === option.id) {
            optionResult = result
          }

          return (
            <OptionButton
              key={option.id}
              option={option}
              selected={selected === option.id}
              disabled={answered}
              result={optionResult}
              correctAnswer={puzzle.correctAnswer}
              onClick={() => handleSelect(option.id)}
            />
          )
        })}
      </div>

      {/* Submit / Result */}
      {!answered ? (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className={`
            w-full py-3 px-6 rounded-lg font-semibold
            transition-colors duration-150
            ${
              selected
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Check Answer
        </button>
      ) : (
        <div className={`p-4 rounded-lg ${getResultStyles()}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getResultIcon()}</span>
            <span className="font-semibold text-lg">{getResultTitle()}</span>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            <GlossaryText text={getExplanation()} />
          </p>
        </div>
      )}
    </div>
  )
}

function ScenarioDisplay({ puzzle }: { puzzle: Puzzle }) {
  const { scenario, type } = puzzle

  if (!scenario) return null

  // Hand comparison (which hand wins)
  if (type === 'comparison' && 'handA' in scenario) {
    const s = scenario as HandComparisonScenario
    return (
      <div className="rounded-xl p-6">
        <div className="flex justify-center mb-4">
          <Board cards={s.board} />
        </div>
        <div className="flex justify-center gap-12">
          <Hand cards={s.handA.cards as [string, string]} label={s.handA.label} />
          <Hand cards={s.handB.cards as [string, string]} label={s.handB.label} />
        </div>
      </div>
    )
  }

  // Hero scenario (your cards + board)
  if ('heroCards' in scenario && 'board' in scenario) {
    const s = scenario as HeroScenario
    return (
      <div className="rounded-xl p-6">
        {s.board && s.board.length > 0 && (
          <div className="flex justify-center mb-4">
            <Board cards={s.board} />
          </div>
        )}
        <div className="flex justify-center">
          <Hand cards={s.heroCards} label="Your Hand" highlight />
        </div>
        {(s.potSize || s.villainBet) && (
          <div className="flex justify-center gap-6 mt-4 text-white">
            {s.potSize && (
              <div className="text-center">
                <div className="text-xs opacity-70">Pot</div>
                <div className="font-bold">${s.potSize}</div>
              </div>
            )}
            {s.villainBet && (
              <div className="text-center">
                <div className="text-xs opacity-70">Villain Bet</div>
                <div className="font-bold">${s.villainBet}</div>
              </div>
            )}
          </div>
        )}
        {s.situation && (
          <p className="text-center text-white/80 text-sm mt-3">
            <GlossaryText text={s.situation} />
          </p>
        )}
      </div>
    )
  }

  // Fallback for text-only scenarios
  if ('situation' in scenario && typeof scenario.situation === 'string') {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
        <p className="text-gray-700 dark:text-gray-300">
          <GlossaryText text={scenario.situation} />
        </p>
      </div>
    )
  }

  return null
}
