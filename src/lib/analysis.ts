import type { Card, Action } from '@/types'
import type {
  HandState,
  Decision,
  AnalysisGameState,
  AnalysisResult,
  ScoreBreakdown,
  PlayStyle,
  ActionEntry,
} from '@/types/analysis'
import {
  createDeck,
  shuffleDeck,
  dealCards,
  compareHands,
  evaluateHand,
  getPreflopStrength,
  calculatePotOdds,
} from './poker'

// Initialize a new analysis session
export function createAnalysisSession(
  targetProfit: number = 100,
  startingStack: number = 1000,
  maxHands: number = 20
): AnalysisGameState {
  return {
    mode: 'playing',
    targetProfit,
    startingStack,
    currentStack: startingStack,
    handsPlayed: 0,
    maxHands,
    currentHand: null,
    decisions: [],
    handHistory: [],
  }
}

// Validate that all cards in a deal are unique
function validateDeal(heroCards: Card[], villainCards: Card[], board: Card[]): boolean {
  const allCards = [...heroCards, ...villainCards, ...board]
  const uniqueCards = new Set(allCards)
  if (uniqueCards.size !== allCards.length) {
    console.error('CRITICAL: Duplicate cards detected!', {
      heroCards,
      villainCards,
      board,
      duplicates: allCards.filter((card, index) => allCards.indexOf(card) !== index)
    })
    return false
  }
  return true
}

// Deal a new hand
export function dealNewHand(state: AnalysisGameState): AnalysisGameState {
  const deck = shuffleDeck(createDeck())

  const { cards: heroCards, remaining: deck1 } = dealCards(deck, 2)
  const { cards: villainCards, remaining: deck2 } = dealCards(deck1, 2)
  const { cards: board } = dealCards(deck2, 5)

  // Validate no duplicate cards
  if (!validateDeal(heroCards, villainCards, board)) {
    // If validation fails, try dealing again with a fresh deck
    console.warn('Re-dealing due to duplicate cards')
    return dealNewHand(state)
  }

  const heroPosition = state.handsPlayed % 2 === 0 ? 'BTN' : 'BB'
  const blinds = heroPosition === 'BB' ? 10 : 5

  // Initialize action history with blinds
  const initialActions: ActionEntry[] = []
  if (heroPosition === 'BTN') {
    // Hero is button (SB), villain is BB
    initialActions.push({ street: 'preflop', actor: 'hero', action: 'posts SB $5', amount: 5 })
    initialActions.push({ street: 'preflop', actor: 'villain', action: 'posts BB $10', amount: 10 })
  } else {
    // Hero is BB, villain is button (SB)
    initialActions.push({ street: 'preflop', actor: 'villain', action: 'posts SB $5', amount: 5 })
    initialActions.push({ street: 'preflop', actor: 'hero', action: 'posts BB $10', amount: 10 })
  }

  const newHand: HandState = {
    handNumber: state.handsPlayed + 1,
    heroCards: heroCards as [Card, Card],
    villainCards: villainCards as [Card, Card],
    board: [],
    fullBoard: board as Card[],
    street: 'preflop',
    pot: 15, // SB + BB
    heroStack: state.currentStack - blinds,
    villainStack: 1000 - (15 - blinds),
    heroPosition,
    toCall: heroPosition === 'BTN' ? 5 : 0, // BTN needs to call BB or raise
    lastAction: null,
    isHandComplete: false,
    winner: null,
    actionHistory: initialActions,
    heroInvested: blinds, // Track how much hero has put in (starts with blind)
  }

  return {
    ...state,
    mode: 'playing',
    currentHand: newHand,
    currentStack: state.currentStack - blinds, // Deduct blinds immediately when posted
  }
}

// ============================================
// WEIGHTED HAND STRENGTH SYSTEM
// ============================================

interface HandContext {
  // Raw strength
  rawStrength: number
  preflopStrength: number

  // Board texture
  fourFlushBoard: boolean
  threeFlushBoard: boolean
  pairedBoard: boolean
  connectedBoard: boolean

  // Hand categories
  hasFlush: boolean
  hasNutFlush: boolean
  hasStraight: boolean
  hasSet: boolean
  hasTwoPair: boolean
  hasOverpair: boolean
  hasTopPair: boolean
  hasPair: boolean

  // Situation
  facingBet: boolean
  potOdds: number
  isPreflop: boolean
  hasPosition: boolean
}

interface StrengthModifier {
  name: string
  condition: (ctx: HandContext) => boolean
  modifier: number
  description: string
}

// Modifiers that adjust effective hand strength
const STRENGTH_MODIFIERS: StrengthModifier[] = [
  // Board texture dangers
  {
    name: 'vulnerable-flush',
    condition: (ctx) => ctx.fourFlushBoard && ctx.hasFlush && !ctx.hasNutFlush,
    modifier: -250,
    description: 'Vulnerable flush on 4-flush board',
  },
  {
    name: 'flush-draw-board',
    condition: (ctx) => ctx.threeFlushBoard && !ctx.hasFlush,
    modifier: -50,
    description: 'Flush draw possible',
  },
  {
    name: 'paired-board-with-trips',
    condition: (ctx) => ctx.pairedBoard && !ctx.hasSet,
    modifier: -30,
    description: 'Paired board — opponent could have trips',
  },

  // Position advantage
  {
    name: 'has-position',
    condition: (ctx) => ctx.hasPosition && !ctx.isPreflop,
    modifier: +30,
    description: 'Position advantage',
  },

  // Facing aggression
  {
    name: 'facing-big-bet',
    condition: (ctx) => ctx.facingBet && ctx.potOdds > 25,
    modifier: -50,
    description: 'Facing significant aggression',
  },

  // Nut advantage
  {
    name: 'nut-flush',
    condition: (ctx) => ctx.hasNutFlush,
    modifier: +100,
    description: 'Nut flush — maximum strength',
  },
  {
    name: 'has-set',
    condition: (ctx) => ctx.hasSet,
    modifier: +50,
    description: 'Set — very strong',
  },
]

// Build context from hand state
function buildHandContext(hand: HandState): HandContext {
  const heroEval = evaluateHand(hand.heroCards, hand.board)
  const preflopStrength = getPreflopStrength(hand.heroCards[0], hand.heroCards[1])
  const potOdds = calculatePotOdds(hand.pot, hand.toCall)

  // Analyze board texture
  const boardSuits = hand.board.map(c => c.slice(-1))
  const suitCounts = countOccurrences(boardSuits)
  const maxSuitCount = Math.max(...Object.values(suitCounts), 0)

  const boardRanks = hand.board.map(c => getRankValue(c.slice(0, -1)))
  const sortedRanks = [...boardRanks].sort((a, b) => a - b)
  const isConnected = sortedRanks.length >= 3 &&
    (sortedRanks[2] - sortedRanks[0] <= 4)

  const rankCounts = countOccurrences(boardRanks.map(String))
  const maxRankCount = Math.max(...Object.values(rankCounts), 0)

  // Determine hand categories
  const hasFlush = heroEval.strength >= 500 && heroEval.strength < 600
  const hasStraight = heroEval.strength >= 400 && heroEval.strength < 500
  const hasSet = heroEval.strength >= 350 && heroEval.strength < 400
  const hasTwoPair = heroEval.strength >= 300 && heroEval.strength < 350
  const hasPair = heroEval.strength >= 200 && heroEval.strength < 300

  return {
    rawStrength: heroEval.strength,
    preflopStrength,
    fourFlushBoard: maxSuitCount >= 4,
    threeFlushBoard: maxSuitCount === 3,
    pairedBoard: maxRankCount >= 2,
    connectedBoard: isConnected,
    hasFlush,
    hasNutFlush: hasFlush && checkNutFlush(hand.heroCards, hand.board),
    hasStraight,
    hasSet,
    hasTwoPair,
    hasOverpair: hasPair && isOverpair(hand.heroCards, hand.board),
    hasTopPair: hasPair && isTopPair(hand.heroCards, hand.board),
    hasPair,
    facingBet: hand.toCall > 0,
    potOdds,
    isPreflop: hand.street === 'preflop',
    hasPosition: hand.heroPosition === 'BTN',
  }
}

// Calculate effective strength with modifiers
function getEffectiveStrength(ctx: HandContext): { score: number; appliedModifiers: string[] } {
  let score = ctx.rawStrength
  const appliedModifiers: string[] = []

  for (const mod of STRENGTH_MODIFIERS) {
    if (mod.condition(ctx)) {
      score += mod.modifier
      appliedModifiers.push(mod.description)
    }
  }

  return { score, appliedModifiers }
}

// Main decision function using weighted strength
export function getOptimalAction(hand: HandState): { action: Action; reasoning: string; isMarginal?: boolean } {
  const ctx = buildHandContext(hand)

  // Preflop logic (uses preflop strength directly)
  if (ctx.isPreflop) {
    return getPreflopAction(hand, ctx)
  }

  // Postflop: calculate effective strength
  const { score, appliedModifiers } = getEffectiveStrength(ctx)
  const canCheck = hand.toCall === 0

  // Determine if this is a marginal/close spot
  const isMarginal = appliedModifiers.some(m =>
    m.includes('Vulnerable') || m.includes('aggression')
  )

  // Check for dangerous boards where betting without the nuts is risky
  const isDangerousBoard = ctx.fourFlushBoard || (ctx.threeFlushBoard && ctx.pairedBoard)
  const hasNuts = ctx.hasNutFlush || (ctx.hasFlush && !ctx.fourFlushBoard)

  // Simple threshold-based decisions
  if (canCheck) {
    // On dangerous boards, don't bet without strong holdings
    if (isDangerousBoard && !hasNuts && !ctx.hasSet) {
      return {
        action: 'check',
        reasoning: '4-flush on board — check without the flush',
        isMarginal: true
      }
    }
    if (score >= 350) {
      return { action: 'bet', reasoning: 'Strong hand — bet for value' }
    } else if (score >= 200) {
      return { action: 'check', reasoning: 'Medium hand — pot control' }
    } else {
      return { action: 'check', reasoning: 'Weak hand — check back' }
    }
  } else {
    // Facing a bet
    if (score >= 450) {
      return { action: 'raise', reasoning: 'Very strong — raise for value' }
    } else if (score >= 300) {
      return { action: 'call', reasoning: 'Strong enough to call' }
    } else if (score >= 200 && ctx.potOdds <= 25) {
      return { action: 'call', reasoning: 'Decent hand with good pot odds' }
    } else if (ctx.potOdds <= 15 && score >= 100) {
      return { action: 'call', reasoning: 'Pot odds too good to fold' }
    } else if (isMarginal && score >= 150) {
      // Close spot - give more lenient feedback
      return {
        action: 'fold',
        reasoning: `Marginal spot (${appliedModifiers[0]}) — folding is fine`,
        isMarginal: true,
      }
    } else {
      return { action: 'fold', reasoning: 'Not enough equity to continue' }
    }
  }
}

// Preflop decision logic
function getPreflopAction(hand: HandState, ctx: HandContext): { action: Action; reasoning: string; isMarginal?: boolean } {
  const { preflopStrength, potOdds, hasPosition } = ctx

  if (hasPosition) {
    // Button: raise with top hands, fold weak
    if (preflopStrength >= 70) {
      return { action: 'raise', reasoning: 'Premium hand — raise for value' }
    } else if (preflopStrength >= 45) {
      return { action: 'raise', reasoning: 'Playable hand in position — open raise' }
    } else {
      return { action: 'fold', reasoning: 'Weak hand — fold preflop' }
    }
  } else {
    // Big blind
    if (hand.toCall === 0) {
      // No one raised - we can check for free or raise for value
      if (preflopStrength >= 75) {
        return { action: 'raise', reasoning: 'Strong hand — raise for value' }
      } else {
        return { action: 'check', reasoning: 'See the flop for free', isMarginal: true }
      }
    }
    if (preflopStrength >= 80) {
      return { action: 'raise', reasoning: 'Premium hand — 3-bet for value' }
    } else if (preflopStrength >= 50 || potOdds <= 20) {
      return { action: 'call', reasoning: 'Decent hand — defend your blind' }
    } else {
      return { action: 'fold', reasoning: 'Weak hand, bad pot odds — fold' }
    }
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function countOccurrences<T extends string | number>(arr: T[]): Record<string, number> {
  return arr.reduce((acc, val) => {
    const key = String(val)
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

function getRankValue(rank: string): number {
  const values: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  }
  return values[rank] || 0
}

function checkNutFlush(heroCards: [Card, Card], board: Card[]): boolean {
  const allCards = [...heroCards, ...board]
  const suits = allCards.map(c => c.slice(-1))
  const suitCounts = countOccurrences(suits)

  const flushSuit = Object.entries(suitCounts).find(([_, count]) => count >= 5)?.[0]
  if (!flushSuit) return false

  const heroFlushCards = heroCards.filter(c => c.slice(-1) === flushSuit)
  if (heroFlushCards.length === 0) return false

  // Has Ace of flush suit
  if (heroFlushCards.some(c => c.startsWith('A'))) return true

  // Ace on board, hero has King
  const boardFlushCards = board.filter(c => c.slice(-1) === flushSuit)
  if (boardFlushCards.some(c => c.startsWith('A'))) {
    return heroFlushCards.some(c => c.startsWith('K'))
  }

  return false
}

function isOverpair(heroCards: [Card, Card], board: Card[]): boolean {
  const heroRanks = heroCards.map(c => getRankValue(c.slice(0, -1)))
  const boardRanks = board.map(c => getRankValue(c.slice(0, -1)))
  const maxBoardRank = Math.max(...boardRanks)

  // Pocket pair higher than all board cards
  return heroRanks[0] === heroRanks[1] && heroRanks[0] > maxBoardRank
}

function isTopPair(heroCards: [Card, Card], board: Card[]): boolean {
  const heroRanks = heroCards.map(c => getRankValue(c.slice(0, -1)))
  const boardRanks = board.map(c => getRankValue(c.slice(0, -1)))
  const maxBoardRank = Math.max(...boardRanks)

  // One of hero's cards matches the highest board card
  return heroRanks.includes(maxBoardRank)
}

// Process player action
export function processAction(
  state: AnalysisGameState,
  action: Action,
  betAmount?: number
): AnalysisGameState {
  if (!state.currentHand) return state

  const hand = state.currentHand
  const optimal = getOptimalAction(hand)
  const wasOptimal = action === optimal.action

  // Calculate EV impact (simplified)
  let evImpact = 0
  if (!wasOptimal) {
    if (optimal.action === 'fold' && action !== 'fold') {
      evImpact = -hand.toCall // Called when should fold
    } else if (optimal.action === 'raise' && action === 'fold') {
      evImpact = -hand.pot * 0.3 // Folded a value hand
    } else if (optimal.action === 'call' && action === 'fold') {
      evImpact = -hand.pot * 0.2 // Folded with odds
    }
  }

  const decision: Decision = {
    handNumber: hand.handNumber,
    street: hand.street,
    situation: `Pot: $${hand.pot}, To Call: $${hand.toCall}`,
    action,
    betAmount,
    wasOptimal,
    optimalAction: optimal.action,
    reasoning: optimal.reasoning,
    evImpact,
  }

  // Deep copy the hand to prevent any mutation issues with card arrays
  let newHand = {
    ...hand,
    heroCards: [...hand.heroCards] as [Card, Card],
    villainCards: [...hand.villainCards] as [Card, Card],
    board: [...hand.board],
    fullBoard: [...hand.fullBoard],
    actionHistory: [...hand.actionHistory],
    heroInvested: hand.heroInvested,
  }
  let newStack = state.currentStack

  // Process the action
  if (action === 'fold') {
    newHand.actionHistory.push({
      street: hand.street,
      actor: 'hero',
      action: 'folds',
    })
    newHand.isHandComplete = true
    newHand.winner = 'villain'
    // Hero loses what they've put in
  } else if (action === 'call' || action === 'check') {
    // Check if calling an all-in
    const isCallingAllIn = hand.toCall >= hand.heroStack || hand.toCall >= hand.villainStack

    if (action === 'check') {
      newHand.actionHistory.push({
        street: hand.street,
        actor: 'hero',
        action: 'checks',
      })
    } else {
      const callText = isCallingAllIn ? `calls all-in $${hand.toCall}` : `calls $${hand.toCall}`
      newHand.actionHistory.push({
        street: hand.street,
        actor: 'hero',
        action: callText,
        amount: hand.toCall,
      })
    }
    newStack -= hand.toCall
    newHand.pot += hand.toCall
    newHand.heroStack -= hand.toCall
    newHand.heroInvested += hand.toCall // Track hero's investment
    newHand.toCall = 0

    // If calling an all-in, go straight to showdown
    if (isCallingAllIn && action === 'call') {
      newHand.board = newHand.fullBoard
      newHand.street = 'showdown'
      newHand.isHandComplete = true
    } else {
      // Progress to next street or showdown
      newHand = progressStreet(newHand)
    }
  } else if (action === 'raise' || action === 'bet') {
    const raiseAmount = betAmount || Math.round(hand.pot * 0.66)
    const effectiveStack = Math.min(hand.heroStack, hand.villainStack)
    const isAllIn = raiseAmount >= effectiveStack

    if (action === 'bet') {
      const actionText = isAllIn ? `goes all-in $${raiseAmount}` : `bets $${raiseAmount}`
      newHand.actionHistory.push({
        street: hand.street,
        actor: 'hero',
        action: actionText,
        amount: raiseAmount,
      })
    } else {
      const actionText = isAllIn ? `goes all-in $${hand.toCall + raiseAmount}` : `raises to $${hand.toCall + raiseAmount}`
      newHand.actionHistory.push({
        street: hand.street,
        actor: 'hero',
        action: actionText,
        amount: hand.toCall + raiseAmount,
      })
    }

    newStack -= hand.toCall + raiseAmount
    newHand.pot += hand.toCall + raiseAmount
    newHand.heroStack -= hand.toCall + raiseAmount
    newHand.heroInvested += hand.toCall + raiseAmount // Track hero's investment

    // Villain response based on hand strength
    const villainResponse = getVillainResponse(newHand, raiseAmount)

    if (villainResponse === 'call' || villainResponse === 'raise') {
      const callText = isAllIn ? `calls all-in $${raiseAmount}` : `calls $${raiseAmount}`
      newHand.actionHistory.push({
        street: hand.street,
        actor: 'villain',
        action: callText,
        amount: raiseAmount,
      })
      newHand.pot += raiseAmount
      newHand.villainStack -= raiseAmount

      // If someone is all-in, go straight to showdown
      if (isAllIn || newHand.heroStack <= 0 || newHand.villainStack <= 0) {
        newHand.board = newHand.fullBoard
        newHand.street = 'showdown'
        newHand.isHandComplete = true
      } else {
        newHand = progressStreet(newHand)
      }
    } else {
      // Villain folds
      newHand.actionHistory.push({
        street: hand.street,
        actor: 'villain',
        action: 'folds',
      })
      newHand.isHandComplete = true
      newHand.winner = 'hero'
      newStack += newHand.pot
    }
  }

  // If we reached showdown
  if (newHand.isHandComplete && newHand.winner === null) {
    // Use fullBoard for final comparison
    newHand.board = newHand.fullBoard
    newHand.winner = compareHands(
      { holeCards: newHand.heroCards, board: newHand.fullBoard },
      { holeCards: newHand.villainCards, board: newHand.fullBoard }
    )
    if (newHand.winner === 'hero' || newHand.winner === 'tie') {
      const winAmount = newHand.winner === 'hero' ? newHand.pot : newHand.pot / 2
      newStack += winAmount
    }
  }

  const newDecisions = [...state.decisions, decision]
  const newHistory = newHand.isHandComplete
    ? [...state.handHistory, newHand]
    : state.handHistory

  // Check if session is complete (only when all hands played or player is broke)
  const sessionComplete =
    newHand.isHandComplete &&
    (state.handsPlayed + 1 >= state.maxHands || newStack <= 0)

  return {
    ...state,
    currentHand: newHand.isHandComplete ? null : newHand,
    currentStack: newStack,
    handsPlayed: newHand.isHandComplete ? state.handsPlayed + 1 : state.handsPlayed,
    decisions: newDecisions,
    handHistory: newHistory,
    mode: sessionComplete ? 'session-complete' : newHand.isHandComplete ? 'hand-complete' : 'playing',
  }
}

// Evaluate villain's response to hero aggression
function getVillainResponse(hand: HandState, raiseAmount: number): 'call' | 'raise' | 'fold' {
  const potOdds = (raiseAmount / (hand.pot + raiseAmount)) * 100

  if (hand.street === 'preflop') {
    // Preflop: use preflop hand strength
    const villainStrength = getPreflopStrength(hand.villainCards[0], hand.villainCards[1])
    const isVillainInPosition = hand.heroPosition === 'BB' // Villain is BTN when hero is BB
    const facingLargeRaise = raiseAmount > hand.pot * 0.75

    // Premium hands always continue aggressively
    if (villainStrength >= 80) return 'raise'

    // Strong hands call or raise
    if (villainStrength >= 65) {
      return Math.random() > 0.7 ? 'raise' : 'call'
    }

    // Playable hands - call more often, especially in position
    if (villainStrength >= 50) return 'call'

    // Medium hands - defend sometimes, more often in position
    if (villainStrength >= 40) {
      const defendChance = isVillainInPosition ? 0.6 : 0.4
      if (Math.random() < defendChance) return 'call'
      // Fold to very large raises with medium hands
      if (facingLargeRaise) return 'fold'
      return 'call'
    }

    // Weaker hands - occasionally defend to avoid being exploited
    if (villainStrength >= 30) {
      const defendChance = isVillainInPosition ? 0.35 : 0.2
      if (!facingLargeRaise && Math.random() < defendChance) return 'call'
      return 'fold'
    }

    // Junk hands fold, but occasionally bluff-raise with very weak hands
    if (Math.random() < 0.05) return 'raise' // 5% bluff raise
    return 'fold'
  }

  // Postflop: evaluate actual hand against board
  const villainEval = evaluateHand(hand.villainCards, hand.board)
  const heroEval = evaluateHand(hand.heroCards, hand.board)

  // CRITICAL: Never fold when villain has the stronger hand
  if (villainEval.strength >= heroEval.strength) {
    // Villain is ahead - always continue
    if (villainEval.strength >= 400) return 'raise' // Strong hand, raise back
    return 'call'
  }

  // Villain is behind but may still call based on hand strength and pot odds
  const villainHasStrong = villainEval.strength >= 300 // Two pair or better
  const villainHasMade = villainEval.strength >= 200 // Pair or better
  const villainHasDraw = villainEval.strength >= 100 // High card with potential

  // Strong hands still call/raise even if slightly behind
  if (villainHasStrong) {
    return 'call'
  }

  // Made hands call with decent pot odds
  if (villainHasMade && potOdds <= 30) {
    return 'call'
  }

  // Drawing hands need better pot odds
  if (villainHasDraw && potOdds <= 20) {
    return 'call'
  }

  // Otherwise fold
  return 'fold'
}

function progressStreet(hand: HandState): HandState {
  // Deep copy to prevent mutation issues
  const newHand = {
    ...hand,
    heroCards: [...hand.heroCards] as [Card, Card],
    villainCards: [...hand.villainCards] as [Card, Card],
    board: [...hand.board],
    fullBoard: [...hand.fullBoard],
    actionHistory: [...hand.actionHistory],
    heroInvested: hand.heroInvested,
  }

  switch (hand.street) {
    case 'preflop':
      newHand.street = 'flop'
      // Reveal first 3 cards from fullBoard
      newHand.board = hand.fullBoard.slice(0, 3)
      // Record dealer action
      newHand.actionHistory.push({
        street: 'flop',
        actor: 'dealer',
        action: 'deals flop',
        cards: newHand.board,
      })
      // Villain action based on hand strength
      applyVillainBettingAction(newHand)
      break
    case 'flop':
      newHand.street = 'turn'
      // Reveal 4th card (turn)
      newHand.board = hand.fullBoard.slice(0, 4)
      // Record dealer action
      newHand.actionHistory.push({
        street: 'turn',
        actor: 'dealer',
        action: 'deals turn',
        cards: [hand.fullBoard[3]],
      })
      applyVillainBettingAction(newHand)
      break
    case 'turn':
      newHand.street = 'river'
      // Reveal 5th card (river)
      newHand.board = hand.fullBoard.slice(0, 5)
      // Record dealer action
      newHand.actionHistory.push({
        street: 'river',
        actor: 'dealer',
        action: 'deals river',
        cards: [hand.fullBoard[4]],
      })
      applyVillainBettingAction(newHand)
      break
    case 'river':
      newHand.street = 'showdown'
      newHand.board = hand.fullBoard // Show all 5 cards
      newHand.isHandComplete = true
      break
  }

  return newHand
}

// Villain betting action based on hand strength
function applyVillainBettingAction(hand: HandState): void {
  const villainEval = evaluateHand(hand.villainCards, hand.board)
  const heroEval = evaluateHand(hand.heroCards, hand.board)

  const villainIsAhead = villainEval.strength >= heroEval.strength
  const villainHasMonster = villainEval.strength >= 500 // Flush or better
  const villainHasStrong = villainEval.strength >= 300 // Two pair or better
  const villainHasMade = villainEval.strength >= 200 // Pair or better

  // Effective stack for all-in sizing
  const effectiveStack = Math.min(hand.heroStack, hand.villainStack)

  // Bet sizing based on street
  const betSizePct = hand.street === 'flop' ? 0.5 : hand.street === 'turn' ? 0.66 : 0.75

  // Decide whether to bet and how much
  let shouldBet = false
  let shouldAllIn = false

  if (villainHasMonster && villainIsAhead) {
    // Monster hand: go all-in sometimes for max value
    shouldBet = true
    shouldAllIn = Math.random() > 0.5 && hand.street !== 'flop' // More likely on turn/river
  } else if (villainHasStrong) {
    // Strong hand: bet for value most of the time
    shouldBet = Math.random() > 0.2
    // Occasionally all-in on river with strong hands
    if (hand.street === 'river' && Math.random() > 0.7) {
      shouldAllIn = true
    }
  } else if (villainHasMade && villainIsAhead) {
    // Made hand and ahead: bet for value sometimes
    shouldBet = Math.random() > 0.4
  } else if (!villainHasMade && Math.random() > 0.75) {
    // No made hand: occasional bluff (25% of the time)
    shouldBet = true
    // Rare all-in bluff on river
    if (hand.street === 'river' && Math.random() > 0.9) {
      shouldAllIn = true
    }
  }

  if (shouldBet) {
    const betAmount = shouldAllIn ? effectiveStack : Math.round(hand.pot * betSizePct)
    hand.toCall = Math.min(betAmount, effectiveStack) // Can't bet more than effective stack
    const actionText = shouldAllIn ? `goes all-in $${hand.toCall}` : `bets $${hand.toCall}`
    hand.lastAction = `Villain ${actionText}`
    hand.actionHistory.push({
      street: hand.street,
      actor: 'villain',
      action: actionText,
      amount: hand.toCall,
    })
    // Add villain's bet to the pot and deduct from villain's stack
    hand.pot += hand.toCall
    hand.villainStack -= hand.toCall
  } else {
    hand.toCall = 0
    hand.lastAction = 'Villain checks'
    hand.actionHistory.push({
      street: hand.street,
      actor: 'villain',
      action: 'checks',
    })
  }
}

// Generate analysis report
export function generateAnalysis(state: AnalysisGameState): AnalysisResult {
  const decisions = state.decisions
  const profit = state.currentStack - state.startingStack

  // Calculate scores
  const preflopDecisions = decisions.filter((d) => d.street === 'preflop')
  const postflopDecisions = decisions.filter((d) => d.street !== 'preflop')
  const foldDecisions = decisions.filter((d) => d.action === 'fold')
  const valueDecisions = decisions.filter((d) => d.action === 'bet' || d.action === 'raise')

  const scoreBreakdown: ScoreBreakdown = {
    preflopDecisions: {
      score: preflopDecisions.filter((d) => d.wasOptimal).length,
      total: preflopDecisions.length,
      details: preflopDecisions.filter((d) => !d.wasOptimal).map((d) => `Hand ${d.handNumber}: ${d.reasoning}`),
    },
    postflopBetting: {
      score: postflopDecisions.filter((d) => d.wasOptimal).length,
      total: postflopDecisions.length,
      details: postflopDecisions.filter((d) => !d.wasOptimal).map((d) => `Hand ${d.handNumber}: ${d.reasoning}`),
    },
    foldingDiscipline: {
      score: foldDecisions.filter((d) => d.wasOptimal).length,
      total: foldDecisions.length,
      details: foldDecisions.filter((d) => !d.wasOptimal).map((d) => `Hand ${d.handNumber}: ${d.reasoning}`),
    },
    valueExtraction: {
      score: valueDecisions.filter((d) => d.wasOptimal).length,
      total: Math.max(valueDecisions.length, 1),
      details: [],
    },
    bluffEfficiency: {
      score: 0,
      total: 0,
      details: [],
    },
    potOddsAccuracy: {
      score: decisions.filter((d) => d.wasOptimal && d.action === 'call').length,
      total: decisions.filter((d) => d.action === 'call').length || 1,
      details: [],
    },
  }

  // Calculate overall score
  const totalCorrect = decisions.filter((d) => d.wasOptimal).length
  const overallScore = decisions.length > 0 ? Math.round((totalCorrect / decisions.length) * 100) : 0

  // Calculate play style
  const playStyle: PlayStyle = {
    vpip: Math.round((decisions.filter((d) => d.street === 'preflop' && d.action !== 'fold').length / Math.max(preflopDecisions.length, 1)) * 100),
    pfr: Math.round((decisions.filter((d) => d.street === 'preflop' && d.action === 'raise').length / Math.max(preflopDecisions.length, 1)) * 100),
    aggression: valueDecisions.length / Math.max(decisions.filter((d) => d.action === 'call').length, 1),
    foldToBluff: 0,
    bluffFrequency: 0,
    valueFrequency: 0,
  }

  // Generate strengths and weaknesses
  const strengths: string[] = []
  const weaknesses: string[] = []
  const recommendations: string[] = []

  if (scoreBreakdown.preflopDecisions.score / Math.max(scoreBreakdown.preflopDecisions.total, 1) >= 0.8) {
    strengths.push('Strong preflop decision-making')
  } else {
    weaknesses.push('Preflop decisions need work')
    recommendations.push('Review starting hand selection and position-based ranges')
  }

  if (overallScore >= 70) {
    strengths.push('Good overall decision quality')
  } else {
    weaknesses.push('Many suboptimal decisions')
    recommendations.push('Focus on pot odds calculation before calling')
  }

  if (playStyle.vpip > 60) {
    weaknesses.push('Playing too many hands (loose)')
    recommendations.push('Tighten up your preflop range')
  } else if (playStyle.vpip < 25) {
    weaknesses.push('Playing too few hands (tight)')
    recommendations.push('Look for more opportunities to play in position')
  } else {
    strengths.push('Balanced hand selection')
  }

  // Get the last hand from history
  const lastHand = state.handHistory.length > 0
    ? state.handHistory[state.handHistory.length - 1]
    : null

  return {
    handsPlayed: state.handsPlayed,
    profit,
    targetProfit: state.targetProfit,
    reachedTarget: profit >= state.targetProfit,
    decisions,
    scoreBreakdown,
    overallScore,
    playStyle,
    strengths,
    weaknesses,
    recommendations,
    lastHand,
  }
}
