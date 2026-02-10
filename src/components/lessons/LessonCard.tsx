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
      aria-label={`${lesson.title}${locked ? ' (Locked)' : completed ? ' (Completed)' : ''}`}
      aria-disabled={locked}
      className={`
        w-full min-h-[72px] p-4 text-left rounded-xl border-2 transition-colors
        ${
          locked
            ? 'border-white/20 opacity-50 cursor-not-allowed'
            : completed
              ? 'border-green-500 bg-green-900/20 hover:bg-green-900/30'
              : 'border-white/20 hover:border-blue-400'
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
                ? 'bg-white/10'
                : completed
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-900/50 text-white'
            }
          `}
        >
          {locked ? '\u{1F512}' : completed ? '\u2713' : lesson.order}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-semibold text-white">{lesson.title}</h3>
          <p className="text-sm text-white/70">
            {lesson.description}
          </p>
        </div>

        {/* XP badge */}
        <div className="text-sm text-white/60">+{lesson.xpReward} XP</div>
      </div>
    </button>
  )
}
