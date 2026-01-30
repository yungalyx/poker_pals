import type { LessonIntro as LessonIntroType } from '@/types'

interface LessonIntroProps {
  intro: LessonIntroType
  onStart: () => void
}

export function LessonIntro({ intro, onStart }: LessonIntroProps) {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4">{intro.title}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{intro.body}</p>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-8 text-left">
        <h3 className="font-semibold mb-3">Key Points</h3>
        <ul className="space-y-2">
          {intro.keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">{'\u2713'}</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onStart}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
      >
        Start Lesson
      </button>
    </div>
  )
}
