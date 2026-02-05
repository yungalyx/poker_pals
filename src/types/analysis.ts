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
}
