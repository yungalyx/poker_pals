'use client'

import type { Option } from '@/types'

type AnswerResult = 'correct' | 'warning' | 'incorrect' | null

interface OptionButtonProps {
  option: Option
  selected: boolean
  disabled: boolean
  result?: AnswerResult
  correctAnswer?: string
  onClick: () => void
}

export function OptionButton({
  option,
  selected,
  disabled,
  result,
  correctAnswer,
  onClick,
}: OptionButtonProps) {
  const isThisCorrect = option.id === correctAnswer
  const showResult = disabled && selected

  let stateClasses = 'border-gray-300 dark:border-gray-600 hover:border-blue-400'

  if (selected && !disabled) {
    stateClasses = 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
  }

  if (showResult && result) {
    if (result === 'correct') {
      stateClasses = 'border-green-500 bg-green-50 dark:bg-green-900/30'
    } else if (result === 'warning') {
      stateClasses = 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30'
    } else {
      stateClasses = 'border-red-500 bg-red-50 dark:bg-red-900/30'
    }
  }

  // Show the correct answer if user got it wrong or warning
  if (disabled && !selected && isThisCorrect && result !== 'correct') {
    stateClasses = 'border-green-500 bg-green-50 dark:bg-green-900/30 opacity-70'
  }

  const getIcon = () => {
    if (!showResult || !result) return ''
    if (result === 'correct') return '\u2713'
    if (result === 'warning') return '!'
    return '\u2717'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-4 text-left
        border-2 rounded-lg
        transition-all duration-150
        ${stateClasses}
        ${disabled ? 'cursor-default' : 'cursor-pointer'}
      `}
    >
      <div className="flex items-center gap-3">
        <span
          className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold
            ${selected ? 'border-current bg-current' : 'border-gray-400'}
          `}
        >
          {selected && (
            <span className="text-white dark:text-gray-900">
              {getIcon()}
            </span>
          )}
        </span>
        <span className="font-medium">{option.label}</span>
      </div>
    </button>
  )
}
