interface LessonSummaryProps {
  correctCount: number
  totalPuzzles: number
  xpEarned: number
  onComplete: () => void
}

export function LessonSummary({
  correctCount,
  totalPuzzles,
  xpEarned,
  onComplete,
}: LessonSummaryProps) {
  const percentage = Math.round((correctCount / totalPuzzles) * 100)
  const isPassing = percentage >= 60

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div
        className={`
          text-6xl mb-4
          ${isPassing ? 'animate-bounce' : ''}
        `}
      >
        {isPassing ? '\u{1F389}' : '\u{1F4AA}'}
      </div>

      <h1 className="text-2xl font-bold mb-2">
        {isPassing ? 'Lesson Complete!' : 'Keep Practicing!'}
      </h1>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {isPassing
          ? "Great work! You've mastered this concept."
          : "You're getting there. Review and try again."}
      </p>

      {/* Score circle */}
      <div className="flex justify-center mb-6">
        <div
          className={`
            w-32 h-32 rounded-full flex flex-col items-center justify-center
            ${isPassing ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}
          `}
        >
          <span className="text-4xl font-bold">{percentage}%</span>
          <span className="text-sm text-gray-500">
            {correctCount}/{totalPuzzles} correct
          </span>
        </div>
      </div>

      {/* XP earned */}
      {isPassing && (
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 mb-6">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            +{xpEarned} XP
          </span>
        </div>
      )}

      <button
        onClick={onComplete}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
      >
        {isPassing ? 'Continue' : 'Try Again'}
      </button>
    </div>
  )
}
