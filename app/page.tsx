'use client'

import { useState, useEffect } from 'react'
import type { Lesson, UserProgress } from '@/types'
import { categories } from '@/data/lessons'
import { CategorySection } from '@/components/lessons'
import { LessonRunner } from '@/components/puzzle'
import { AnalysisMode } from '@/components/analysis'
import { getProgress, completeLesson } from '@/lib/progress'

type Mode = 'home' | 'lesson' | 'analysis'

export default function Home() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [mode, setMode] = useState<Mode>('home')
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

  useEffect(() => {
    setProgress(getProgress())
  }, [])

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setMode('lesson')
  }

  const handleCompleteLesson = (score: number) => {
    if (!selectedLesson) return

    const xpEarned =
      score >= 60
        ? Math.round(selectedLesson.xpReward * (score / 100))
        : 0

    const newProgress = completeLesson(selectedLesson.id, score, xpEarned)
    setProgress(newProgress)
    setSelectedLesson(null)
    setMode('home')
  }

  const handleExitLesson = () => {
    setSelectedLesson(null)
    setMode('home')
  }

  const handleStartAnalysis = () => {
    setMode('analysis')
  }

  const handleExitAnalysis = () => {
    setMode('home')
  }

  // Show lesson runner
  if (mode === 'lesson' && selectedLesson) {
    return (
      <LessonRunner
        lesson={selectedLesson}
        onComplete={handleCompleteLesson}
        onExit={handleExitLesson}
      />
    )
  }

  // Show analysis mode
  if (mode === 'analysis') {
    return <AnalysisMode onExit={handleExitAnalysis} />
  }

  // Loading state
  if (!progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/20">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Poker Pals</h1>
              <p className="text-white/80">
                Learn GTO poker the fun way
              </p>
            </div>
            <div className="flex items-center gap-4">
              {progress.streakDays > 0 && (
                <div className="text-center">
                  <div className="text-2xl">{'\u{1F525}'}</div>
                  <div className="text-xs text-white/60">{progress.streakDays} day</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-xl font-bold text-white">{progress.totalXP}</div>
                <div className="text-xs text-white/60">XP</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Analysis Mode Card */}
        <div className="mb-8">
          <button
            onClick={handleStartAnalysis}
            aria-label="Start Analysis Mode - Play real hands with dynamic cards"
            className="w-full p-6 min-h-[80px] bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white text-left hover:from-purple-700 hover:to-blue-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl" aria-hidden="true">{'\u{1F3AE}'}</div>
              <div>
                <h2 className="text-xl font-bold">Analysis Mode</h2>
                <p className="text-white/80 text-sm">
                  Play real hands with dynamic cards and get detailed performance analysis
                </p>
              </div>
              <div className="ml-auto text-2xl" aria-hidden="true">{'\u2192'}</div>
            </div>
          </button>
        </div>

        {/* Lessons */}
        <h2 className="text-lg font-semibold mb-4 text-white">Lessons</h2>
        {categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            completedLessons={progress.completedLessons}
            onSelectLesson={handleSelectLesson}
          />
        ))}
      </main>
    </div>
  )
}
