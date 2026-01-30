import type { CategoryInfo, Lesson } from '@/types'
import { basicsLessons } from './basics'
import { intermediateLessons } from './intermediate'
import { advancedLessons } from './advanced'

export const allLessons = {
  basics: basicsLessons as Lesson[],
  intermediate: intermediateLessons as Lesson[],
  advanced: advancedLessons as Lesson[],
}

export const categories: CategoryInfo[] = [
  {
    id: 'basics',
    title: 'Basics',
    description: 'Hand strength, pot odds, bet sizing',
    color: 'green',
    lessons: basicsLessons as Lesson[],
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'Bluffing and positioning',
    color: 'blue',
    lessons: intermediateLessons as Lesson[],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Bankroll management and variance',
    color: 'purple',
    lessons: advancedLessons as Lesson[],
  },
]

export { basicsLessons, intermediateLessons, advancedLessons }
