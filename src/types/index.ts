// Card representation: rank + suit (e.g., "As" = Ace of spades)
// Ranks: 2-9, T, J, Q, K, A
// Suits: s (spades), h (hearts), d (diamonds), c (clubs)
export type Card = string

export type Position = 'UTG' | 'UTG+1' | 'MP' | 'MP+1' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB'

export type Category = 'basics' | 'intermediate' | 'advanced'

// Puzzle types
export type PuzzleType =
  | 'comparison'      // which hand wins
  | 'identification'  // what hand do you have
  | 'pot-odds'        // calculate pot odds
  | 'action'          // call/fold/raise/bet
  | 'bet-sizing'      // choose bet size
  | 'scenario'        // situational decision
  | 'knowledge'       // concept check
  | 'spot-the-bluff'  // identify better bluff
  | 'position-id'     // who has position
  | 'calculation'     // bankroll math
  | 'ev-check'        // is this +EV
  | 'mindset'         // mental game

export interface Option {
  id: string
  label: string
}

// Scenario variations for different puzzle types
export interface HandComparisonScenario {
  handA: { cards: [Card, Card]; label: string }
  handB: { cards: [Card, Card]; label: string }
  board: Card[]
}

export interface HeroScenario {
  heroCards: [Card, Card]
  board: Card[]
  potSize?: number
  villainBet?: number
  position?: Position
  situation?: string
}

export interface PositionScenario {
  heroPosition: Position
  villainPosition: Position
  situation?: string
}

export interface BankrollScenario {
  bankroll?: number
  currentBankroll?: number
  originalBankroll?: number
  stake?: string
  buyIn?: number
  rule?: string
  currentStake?: string
  targetStake?: string
  buyInNeeded?: number
}

export interface EVScenario {
  callAmount: number
  potSize: number
  equity: number
}

export interface BluffScenario {
  board: Card[]
  situation: string
}

export interface VarianceScenario {
  heroCards?: [Card, Card]
  villainCards?: [Card, Card]
  result?: string
}

export type PuzzleScenario =
  | HandComparisonScenario
  | HeroScenario
  | PositionScenario
  | BankrollScenario
  | EVScenario
  | BluffScenario
  | VarianceScenario

export interface Puzzle {
  id: string
  type: PuzzleType
  question: string
  scenario?: PuzzleScenario
  options: Option[]
  correctAnswer: string
  warningAnswers?: string[] // Not wrong, but not optimal - shows caution
  explanation: string
  warningExplanation?: string // Shown for warning answers
}

export interface LessonIntro {
  title: string
  body: string
  keyPoints: string[]
}

export interface Lesson {
  id: string
  category: Category
  topic: string
  title: string
  description: string
  order: number
  xpReward: number
  intro: LessonIntro
  puzzles: Puzzle[]
  practiceHand?: PracticeHand
}

export interface CategoryInfo {
  id: Category
  title: string
  description: string
  color: 'green' | 'blue' | 'purple'
  lessons: Lesson[]
}

// User progress tracking
export interface PuzzleResult {
  puzzleId: string
  lessonId: string
  correct: boolean
  attempts: number
  answeredAt: number // timestamp
}

export interface LessonProgress {
  lessonId: string
  completed: boolean
  puzzleResults: PuzzleResult[]
  startedAt: number
  completedAt?: number
  score: number // percentage correct
}

export interface UserProgress {
  lessonProgress: Record<string, LessonProgress>
  totalXP: number
  streakDays: number
  lastActiveDate: string // YYYY-MM-DD
  completedLessons: string[]
}

// UI state
export interface PuzzleState {
  currentIndex: number
  selectedAnswer: string | null
  isAnswered: boolean
  isCorrect: boolean | null
  showExplanation: boolean
}

export interface LessonState {
  phase: 'intro' | 'puzzle' | 'practice' | 'summary'
  puzzleStates: PuzzleState[]
  correctCount: number
  totalPuzzles: number
}

// Practice hand (play a full hand)
export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'
export type Action = 'check' | 'call' | 'fold' | 'raise' | 'bet'

export interface DecisionPoint {
  street: Street
  pot: number
  toCall: number // 0 if can check
  villainAction?: string // "Villain bets $20"
  optimalAction: Action
  explanation: string
  hint?: string // shown before decision in beginner mode
}

export interface PracticeHand {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  showVillainCards: boolean
  allowRaise: boolean
  heroCards: [Card, Card]
  villainCards: [Card, Card]
  board: {
    flop: [Card, Card, Card]
    turn: Card
    river: Card
  }
  startingPot: number
  decisions: DecisionPoint[]
}
