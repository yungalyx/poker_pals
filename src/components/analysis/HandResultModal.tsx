'use client'

export type ResultType = 'win' | 'loss' | 'fold' | 'disciplined-fold' | 'bad-beat' | 'split'

interface HandResultProps {
  isOpen: boolean
  result: ResultType
  amount: number
  heroHandDescription: string
  villainHandDescription: string
  handsPlayed: number
  maxHands: number
  onNextHand: () => void
}

export function HandResultModal({
  isOpen,
  result,
  amount,
  heroHandDescription,
  villainHandDescription,
  handsPlayed,
  maxHands,
  onNextHand,
}: HandResultProps) {
  if (!isOpen) return null

  // Determine display properties based on result type
  const getResultDisplay = () => {
    switch (result) {
      case 'win':
        return {
          bgColor: 'bg-green-100 dark:bg-green-900/50',
          borderColor: 'border-green-500',
          textColor: 'text-green-600 dark:text-green-400',
          amountText: `+$${amount}`,
          label: 'You Win!',
          sublabel: null,
        }
      case 'split':
        return {
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-600 dark:text-yellow-400',
          amountText: `+$${amount}`,
          label: 'Split Pot',
          sublabel: null,
        }
      case 'disciplined-fold':
        return {
          bgColor: 'bg-blue-100 dark:bg-blue-900/50',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-600 dark:text-blue-400',
          amountText: 'Saved',
          label: 'Disciplined Fold',
          sublabel: 'You made the right call to fold. Well played!',
        }
      case 'bad-beat':
        return {
          bgColor: 'bg-purple-100 dark:bg-purple-900/50',
          borderColor: 'border-purple-500',
          textColor: 'text-purple-600 dark:text-purple-400',
          amountText: `-$${amount}`,
          label: 'Bad Beat',
          sublabel: 'You played it right, but variance happens. Keep it up!',
        }
      case 'fold':
        return {
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          borderColor: 'border-gray-400',
          textColor: 'text-gray-600 dark:text-gray-400',
          amountText: `-$${amount}`,
          label: 'You Folded',
          sublabel: null,
        }
      case 'loss':
      default:
        return {
          bgColor: 'bg-red-100 dark:bg-red-900/50',
          borderColor: 'border-red-500',
          textColor: 'text-red-600 dark:text-red-400',
          amountText: `-$${amount}`,
          label: 'Villain Wins',
          sublabel: null,
        }
    }
  }

  const display = getResultDisplay()

  return (
    <div className="space-y-4">
      {/* Result card */}
      <div
        className={`rounded-2xl border-2 ${display.borderColor} ${display.bgColor} overflow-hidden`}
      >
        {/* Result header */}
        <div className="text-center py-4 px-4">
          <div className={`text-4xl font-bold mb-1 ${display.textColor}`}>
            {display.amountText}
          </div>
          <div className={`text-lg font-semibold ${display.textColor}`}>
            {display.label}
          </div>
          {display.sublabel && (
            <p className={`text-sm mt-1 ${display.textColor} opacity-80`}>
              {display.sublabel}
            </p>
          )}
        </div>

        {/* Hand comparison */}
        <div className="bg-white/50 dark:bg-black/20 px-4 py-3">
          <div className="flex justify-between items-center text-sm">
            <div className="text-center flex-1">
              <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">
                Your Hand
              </div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">
                {heroHandDescription}
              </div>
            </div>
            <div className="text-gray-400 dark:text-gray-500 px-3 text-lg">
              vs
            </div>
            <div className="text-center flex-1">
              <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">
                Villain
              </div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">
                {villainHandDescription}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue button */}
      <button
        onClick={onNextHand}
        className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white text-lg font-bold rounded-xl border-b-4 border-blue-700 active:border-b-0 active:mt-1 active:mb-[-4px] transition-all shadow-lg"
      >
        Continue ({handsPlayed}/{maxHands})
      </button>
    </div>
  )
}
