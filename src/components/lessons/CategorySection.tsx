import type { CategoryInfo, Lesson } from '@/types'
import { LessonCard } from './LessonCard'

const colorMap = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
}

interface CategorySectionProps {
  category: CategoryInfo
  completedLessons: string[]
  onSelectLesson: (lesson: Lesson) => void
}

export function CategorySection({
  category,
  completedLessons,
  onSelectLesson,
}: CategorySectionProps) {
  const completedCount = category.lessons.filter((l) =>
    completedLessons.includes(l.id)
  ).length

  return (
    <section className="mb-8">
      {/* Category header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-3 h-3 rounded-full ${colorMap[category.color]}`} />
        <div>
          <h2 className="text-xl font-bold text-white">{category.title}</h2>
          <p className="text-sm text-white/70">
            {category.description} &middot; {completedCount}/{category.lessons.length}{' '}
            completed
          </p>
        </div>
      </div>

      {/* Lessons */}
      <div className="space-y-3 pl-6 border-l-2 border-white/20 ml-1">
        {category.lessons.map((lesson, index) => {
          const isCompleted = completedLessons.includes(lesson.id)
          // Lock if previous lesson in same category not completed (except first)
          const previousLesson = category.lessons[index - 1]
          const isLocked =
            index > 0 && previousLesson && !completedLessons.includes(previousLesson.id)

          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              completed={isCompleted}
              locked={isLocked}
              onClick={() => onSelectLesson(lesson)}
            />
          )
        })}
      </div>
    </section>
  )
}
