import type { Card, Position, Action } from './index'

// Deck and dealing
export interface Deck {
  cards: Card[]
  dealt: Card[]
}

// Action history entry
export interface ActionEntry {
  street: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'
  actor: 'hero' | 'villain' | 'dealer'
  action: string // e.g., "raises $50", "calls $20", "checks", "folds"
  amount?: number
  cards?: Card[] // For dealer actions (showing board cards)
}

// Game state for a single hand
export interface HandState {
  handNumber: number
  heroCards: [Card, Card]
  villainCards: [Card, Card]
  board: Card[] // Visible board cards
  fullBoard: Card[] // All 5 board cards (for revealing)
  street: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'
  pot: number
  heroStack: number
  villainStack: number
  heroPosition: 'BTN' | 'BB' // Simplified heads-up
  toCall: number
  lastAction: string | null
  isHandComplete: boolean
  winner: 'hero' | 'villain' | 'tie' | null
  actionHistory: ActionEntry[] // Track all actions in the hand
  heroInvested: number // Total amount hero has put into the pot this hand
}

// Player decision tracking
export interface Decision {
  handNumber: number
  street: string
  situation: string
  action: Action
  betAmount?: number
  wasOptimal: boolean
  optimalAction: Action
  reasoning: string
  evImpact: number // + or - expected value
}

// Play style metrics
export interface PlayStyle {
  vpip: number // Voluntarily put money in pot %
  pfr: number // Preflop raise %
  aggression: number // Bets+Raises / Calls
  foldToBluff: number // % folded when villain bluffs
  bluffFrequency: number // % of bets that are bluffs
  valueFrequency: number // % of bets that are value
}

// Scoring categories
export interface ScoreBreakdown {
  preflopDecisions: { score: number; total: number; details: string[] }
  postflopBetting: { score: number; total: number; details: string[] }
  foldingDiscipline: { score: number; total: number; details: string[] }
  valueExtraction: { score: number; total: number; details: string[] }
  bluffEfficiency: { score: number; total: number; details: string[] }
  potOddsAccuracy: { score: number; total: number; details: string[] }
}

// Transparency Index: per-hand data point collected at hand completion
export interface TransparencyDataPoint {
  handNumber: number
  // Pillar A: Linearity data
  normalizedHandStrength: number // (evaluateHand().strength - 100) / 1100, clamped 0-1
  investmentRatio: number // heroInvested / pot, clamped 0-1
  wentToShowdown: boolean // true if hand reached showdown (not a fold)
  // Pillar B: Polarization data
  bigBets: {
    street: string
    betSizeRatio: number // betAmount / potAtTimeOfBet
    handStrengthAtBet: number // normalized strength at time of bet (0-1)
  }[]
  // Pillar C: Board texture data
  scareCardEvents: {
    street: 'turn' | 'river'
    scareType: 'flush-completing' | 'straight-completing'
    heroBetAfterScare: boolean
    heroHadTheHand: boolean
  }[]
}

// Transparency score breakdown
export interface TransparencyScore {
  linearityScore: number // 0-100, Pillar A
  polarizationScore: number // 0-100, Pillar B
  boardTextureScore: number // 0-100, Pillar C
  tScore: number // 0-100, weighted composite
  dataPoints: number
  confidence: 'low' | 'medium' | 'high'
}

// Player archetype names
export type PlayerArchetype =
  | 'The Showboat'
  | 'The Wildcard'
  | 'The Glass Cannon'
  | 'The Assassin'
  | 'The Open Book'
  | 'The Sandtrapper'
  | 'The Statue'
  | 'The Spider'
  | 'The Enigma'

// Player archetype display metadata
export interface PlayerArchetypeInfo {
  archetype: PlayerArchetype
  abbrev: string
  color: string // Tailwind bg class
  gradient: string // CSS gradient for ShareCard
  description: string
  advice: string
  dimensions: {
    tightLoose: 'tight' | 'loose' | 'balanced'
    aggressivePassive: 'aggressive' | 'passive' | 'balanced'
    deceptiveTransparent: 'deceptive' | 'transparent' | 'balanced'
  }
}

// Full analysis result
export interface AnalysisResult {
  handsPlayed: number
  profit: number
  targetProfit: number
  reachedTarget: boolean
  decisions: Decision[]
  scoreBreakdown: ScoreBreakdown
  overallScore: number // 0-100
  playStyle: PlayStyle
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  lastHand: HandState | null // The final hand of the session
  transparencyScore: TransparencyScore
  playerArchetype: PlayerArchetypeInfo
}

// Analysis mode game state
export interface AnalysisGameState {
  mode: 'playing' | 'hand-complete' | 'session-complete'
  targetProfit: number
  startingStack: number
  currentStack: number
  handsPlayed: number
  maxHands: number
  currentHand: HandState | null
  decisions: Decision[]
  handHistory: HandState[]
  transparencyData: TransparencyDataPoint[]
}
