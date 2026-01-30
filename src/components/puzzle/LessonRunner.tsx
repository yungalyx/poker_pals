'use client'

import { useState } from 'react'
import type { Lesson } from '@/types'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LessonIntro } from './LessonIntro'
import { PuzzleCard } from './PuzzleCard'
import { PracticeHand } from './PracticeHand'
import { LessonSummary } from './LessonSummary'

type Phase = 'intro' | 'puzzle' | 'practice' | 'summary'

interface LessonRunnerProps {
  lesson: Lesson
  onComplete: (score: number) => void
  onExit: () => void
}

export function LessonRunner({ lesson, onComplete, onExit }: LessonRunnerProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentPuzzle, setCurrentPuzzle] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [practiceMistakes, setPracticeMistakes] = useState(0)
  const [showNext, setShowNext] = useState(false)

  const totalPuzzles = lesson.puzzles.length
  const hasPractice = !!lesson.practiceHand

  const handleStartLesson = () => {
    setPhase('puzzle')
  }

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setCorrectCount((c) => c + 1)
    }
    setShowNext(true)
  }

  const handleNext = () => {
    if (currentPuzzle < totalPuzzles - 1) {
      setCurrentPuzzle((c) => c + 1)
      setShowNext(false)
    } else if (hasPractice) {
      setPhase('practice')
    } else {
      setPhase('summary')
    }
  }

  const handlePracticeComplete = (mistakes: number) => {
    setPracticeMistakes(mistakes)
    setPhase('summary')
  }

  const handleComplete = () => {
    // Calculate score: puzzles count more, practice is bonus
    const puzzleScore = correctCount / totalPuzzles
    const practiceBonus = hasPractice && practiceMistakes === 0 ? 0.1 : 0
    const finalScore = Math.min(100, Math.round((puzzleScore + practiceBonus) * 100))
    onComplete(finalScore)
  }

  // Calculate total steps for progress (puzzles + practice)
  const totalSteps = totalPuzzles + (hasPractice ? 1 : 0)
  const currentStep = phase === 'practice' ? totalPuzzles + 1 : currentPuzzle + 1

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onExit}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {'\u2715'} Exit
            </button>
            <span className="font-medium">{lesson.title}</span>
            <span className="text-sm text-gray-500">+{lesson.xpReward} XP</span>
          </div>
          {(phase === 'puzzle' || phase === 'practice') && (
            <ProgressBar current={currentStep} total={totalSteps} />
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {phase === 'intro' && (
          <LessonIntro intro={lesson.intro} onStart={handleStartLesson} />
        )}

        {phase === 'puzzle' && (
          <div>
            <PuzzleCard
              key={lesson.puzzles[currentPuzzle].id}
              puzzle={lesson.puzzles[currentPuzzle]}
              onAnswer={handleAnswer}
            />

            {showNext && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {currentPuzzle < totalPuzzles - 1
                    ? 'Next'
                    : hasPractice
                      ? 'Practice Hand'
                      : 'See Results'}
                </button>
              </div>
            )}
          </div>
        )}

        {phase === 'practice' && lesson.practiceHand && (
          <div>
            <div className="text-center mb-6">
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                Practice Time
              </span>
            </div>
            <PracticeHand
              hand={lesson.practiceHand}
              onComplete={handlePracticeComplete}
            />
          </div>
        )}

        {phase === 'summary' && (
          <LessonSummary
            correctCount={correctCount}
            totalPuzzles={totalPuzzles}
            xpEarned={
              correctCount === totalPuzzles
                ? lesson.xpReward
                : Math.round(lesson.xpReward * (correctCount / totalPuzzles))
            }
            onComplete={handleComplete}
          />
        )}
      </main>
    </div>
  )
}
