import type { Lesson } from '@/types'

interface LessonCardProps {
  lesson: Lesson
  completed: boolean
  locked: boolean
  onClick: () => void
}

export function LessonCard({ lesson, completed, locked, onClick }: LessonCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={`
        w-full p-4 text-left rounded-xl border-2 transition-all
        ${
          locked
            ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
            : completed
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
              : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center text-lg
            ${
              locked
                ? 'bg-gray-200 dark:bg-gray-700'
                : completed
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-100 dark:bg-blue-900/50'
            }
          `}
        >
          {locked ? '\u{1F512}' : completed ? '\u2713' : lesson.order}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-semibold">{lesson.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {lesson.description}
          </p>
        </div>

        {/* XP badge */}
        <div className="text-sm text-gray-400">+{lesson.xpReward} XP</div>
      </div>
    </button>
  )
}
