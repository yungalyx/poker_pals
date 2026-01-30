import type { UserProgress } from '@/types'

const STORAGE_KEY = 'poker_pals_progress'

const defaultProgress: UserProgress = {
  lessonProgress: {},
  totalXP: 0,
  streakDays: 0,
  lastActiveDate: '',
  completedLessons: [],
}

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') return defaultProgress

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultProgress
    return JSON.parse(stored)
  } catch {
    return defaultProgress
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    console.error('Failed to save progress')
  }
}

export function completeLesson(lessonId: string, score: number, xpEarned: number): UserProgress {
  const progress = getProgress()
  const today = new Date().toISOString().split('T')[0]

  // Update streak
  if (progress.lastActiveDate !== today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (progress.lastActiveDate === yesterdayStr) {
      progress.streakDays += 1
    } else if (progress.lastActiveDate !== today) {
      progress.streakDays = 1
    }
    progress.lastActiveDate = today
  }

  // Mark lesson complete if passing score
  if (score >= 60 && !progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId)
    progress.totalXP += xpEarned
  }

  // Store lesson progress
  progress.lessonProgress[lessonId] = {
    lessonId,
    completed: score >= 60,
    puzzleResults: [],
    startedAt: Date.now(),
    completedAt: Date.now(),
    score,
  }

  saveProgress(progress)
  return progress
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
