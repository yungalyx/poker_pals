import type { Card } from '@/types'
import type {
  HandState,
  Decision,
  PlayStyle,
  TransparencyDataPoint,
  TransparencyScore,
  PlayerArchetypeInfo,
} from '@/types/analysis'
import { evaluateHand, getPreflopStrength } from './poker'

// ============================================
// ARCHETYPE MAP — All 9 player archetypes
// ============================================

const ARCHETYPE_MAP: Record<string, PlayerArchetypeInfo> = {
  'loose-aggressive-transparent': {
    archetype: 'The Showboat',
    abbrev: 'LAG-T',
    color: 'bg-red-400',
    gradient: 'linear-gradient(135deg, #f87171 0%, #fb923c 100%)',
    description: 'Plays many hands aggressively and honestly. Bets big with big hands, checks weak ones. Easy to read once you spot the pattern.',
    advice: 'Your aggression is good, but your betting tells the whole story. Mix in occasional bluffs with your big bets to keep opponents guessing.',
    dimensions: { tightLoose: 'loose', aggressivePassive: 'aggressive', deceptiveTransparent: 'transparent' },
  },
  'loose-aggressive-deceptive': {
    archetype: 'The Wildcard',
    abbrev: 'LAG-D',
    color: 'bg-red-600',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #9f1239 100%)',
    description: 'The most dangerous archetype. Plays many hands, bets aggressively, and you never know if they have it or not. Maximum chaos.',
    advice: 'You are hard to play against but high-variance. Make sure your bluffs have a plan and your value bets are sized to get called.',
    dimensions: { tightLoose: 'loose', aggressivePassive: 'aggressive', deceptiveTransparent: 'deceptive' },
  },
  'tight-aggressive-transparent': {
    archetype: 'The Glass Cannon',
    abbrev: 'TAG-T',
    color: 'bg-green-400',
    gradient: 'linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)',
    description: 'Selective and aggressive, but big bets always mean big hands. Opponents can fold to your raises unless they have the goods.',
    advice: 'Your hand selection is strong, but opponents will learn to fold against your bets. Add some well-timed bluffs to keep them honest.',
    dimensions: { tightLoose: 'tight', aggressivePassive: 'aggressive', deceptiveTransparent: 'transparent' },
  },
  'tight-aggressive-deceptive': {
    archetype: 'The Assassin',
    abbrev: 'TAG-D',
    color: 'bg-green-600',
    gradient: 'linear-gradient(135deg, #16a34a 0%, #065f46 100%)',
    description: 'The feared tournament shark. Picks spots carefully, then strikes with force — whether or not they have it.',
    advice: 'This is the gold standard of poker styles. Keep your opponents off-balance and continue to mix your betting patterns.',
    dimensions: { tightLoose: 'tight', aggressivePassive: 'aggressive', deceptiveTransparent: 'deceptive' },
  },
  'loose-passive-transparent': {
    archetype: 'The Open Book',
    abbrev: 'LP-T',
    color: 'bg-yellow-400',
    gradient: 'linear-gradient(135deg, #facc15 0%, #fb923c 100%)',
    description: 'Calls too much and bets only when connected. The most exploitable type — opponents can value bet relentlessly.',
    advice: 'Tighten your hand selection and bet more with your strong hands. Playing passively and transparently makes you an easy target.',
    dimensions: { tightLoose: 'loose', aggressivePassive: 'passive', deceptiveTransparent: 'transparent' },
  },
  'loose-passive-deceptive': {
    archetype: 'The Sandtrapper',
    abbrev: 'LP-D',
    color: 'bg-yellow-600',
    gradient: 'linear-gradient(135deg, #ca8a04 0%, #b45309 100%)',
    description: 'Appears passive but sets traps with slow-plays and surprise check-raises. Do not underestimate the quiet ones.',
    advice: 'Your deception is a weapon, but playing too many hands costs chips. Be more selective with your starting hands.',
    dimensions: { tightLoose: 'loose', aggressivePassive: 'passive', deceptiveTransparent: 'deceptive' },
  },
  'tight-passive-transparent': {
    archetype: 'The Statue',
    abbrev: 'TP-T',
    color: 'bg-blue-400',
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)',
    description: 'Plays few hands, rarely bets, and when they do it is exactly what it looks like. Predictable and straightforward.',
    advice: 'You are too easy to play against. When you have strong hands, bet and raise more to build the pot and extract value.',
    dimensions: { tightLoose: 'tight', aggressivePassive: 'passive', deceptiveTransparent: 'transparent' },
  },
  'tight-passive-deceptive': {
    archetype: 'The Spider',
    abbrev: 'TP-D',
    color: 'bg-blue-600',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)',
    description: 'Waits patiently, playing few hands, but weaves deception with unpredictable bet sizing. Slow-plays monsters and surprise-bluffs.',
    advice: 'Your patience and deception are a great combo. Try to raise more preflop with your strong hands to build bigger pots.',
    dimensions: { tightLoose: 'tight', aggressivePassive: 'passive', deceptiveTransparent: 'deceptive' },
  },
  'balanced': {
    archetype: 'The Enigma',
    abbrev: 'BAL',
    color: 'bg-purple-500',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
    description: 'Falls between all extremes. No clear pattern to exploit — the hardest opponent to play against.',
    advice: 'A balanced style is great. Keep adjusting to your opponents rather than playing the same way against everyone.',
    dimensions: { tightLoose: 'balanced', aggressivePassive: 'balanced', deceptiveTransparent: 'balanced' },
  },
}

// ============================================
// DATA COLLECTION
// ============================================

export function collectTransparencyDataPoint(
  hand: HandState,
  decisions: Decision[]
): TransparencyDataPoint {
  const heroFolded = hand.actionHistory.some(
    (a) => a.actor === 'hero' && a.action === 'folds'
  )
  const wentToShowdown = !heroFolded && hand.street === 'showdown'

  // Pillar A: Normalized hand strength on final board
  const strength = evaluateHand(hand.heroCards, hand.fullBoard).strength
  const normalizedHandStrength = Math.max(0, Math.min(1, (strength - 100) / 1100))

  // Investment ratio
  const investmentRatio =
    hand.pot > 0 ? Math.max(0, Math.min(1, hand.heroInvested / hand.pot)) : 0

  // Pillar B: Collect big bets
  const bigBets = collectBigBets(hand)

  // Pillar C: Collect scare card events
  const scareCardEvents = collectScareCardEvents(hand)

  return {
    handNumber: hand.handNumber,
    normalizedHandStrength,
    investmentRatio,
    wentToShowdown,
    bigBets,
    scareCardEvents,
  }
}

function collectBigBets(
  hand: HandState
): TransparencyDataPoint['bigBets'] {
  const bigBets: TransparencyDataPoint['bigBets'] = []
  let runningPot = 0

  for (const entry of hand.actionHistory) {
    if (entry.actor === 'hero' && entry.amount && entry.amount > 0) {
      const potBeforeBet = runningPot
      // Is this a big bet? (>70% of pot at time of bet)
      if (potBeforeBet > 0) {
        const betSizeRatio = entry.amount / potBeforeBet
        if (betSizeRatio > 0.7) {
          // Calculate hero's hand strength at this street
          const boardAtStreet = getBoardAtStreet(hand, entry.street)
          let handStrengthAtBet: number

          if (entry.street === 'preflop') {
            // Preflop: use preflop strength normalized to 0-1
            const preflopStr = getPreflopStrength(hand.heroCards[0], hand.heroCards[1])
            handStrengthAtBet = Math.max(0, Math.min(1, preflopStr / 100))
          } else {
            const eval_ = evaluateHand(hand.heroCards, boardAtStreet)
            handStrengthAtBet = Math.max(0, Math.min(1, (eval_.strength - 100) / 1100))
          }

          bigBets.push({
            street: entry.street,
            betSizeRatio,
            handStrengthAtBet,
          })
        }
      }
    }

    // Track running pot (all amounts from all actors)
    if (entry.amount && entry.amount > 0) {
      runningPot += entry.amount
    }
  }

  return bigBets
}

function getBoardAtStreet(hand: HandState, street: string): Card[] {
  switch (street) {
    case 'flop':
      return hand.fullBoard.slice(0, 3)
    case 'turn':
      return hand.fullBoard.slice(0, 4)
    case 'river':
    case 'showdown':
      return hand.fullBoard.slice(0, 5)
    default:
      return []
  }
}

function collectScareCardEvents(
  hand: HandState
): TransparencyDataPoint['scareCardEvents'] {
  const events: TransparencyDataPoint['scareCardEvents'] = []

  // Check turn card (index 3) against flop (indices 0-2)
  if (hand.fullBoard.length >= 4) {
    const flop = hand.fullBoard.slice(0, 3)
    const turnCard = hand.fullBoard[3]
    const turnScares = detectScareCards(flop, turnCard, hand.heroCards)
    for (const scare of turnScares) {
      const heroBetAfterScare = hand.actionHistory.some(
        (a) => a.actor === 'hero' && a.street === 'turn' && a.amount && a.amount > 0
      )
      events.push({
        street: 'turn',
        scareType: scare.type,
        heroBetAfterScare,
        heroHadTheHand: scare.heroHasIt,
      })
    }
  }

  // Check river card (index 4) against flop+turn (indices 0-3)
  if (hand.fullBoard.length >= 5) {
    const flopTurn = hand.fullBoard.slice(0, 4)
    const riverCard = hand.fullBoard[4]
    const riverScares = detectScareCards(flopTurn, riverCard, hand.heroCards)
    for (const scare of riverScares) {
      const heroBetAfterScare = hand.actionHistory.some(
        (a) => a.actor === 'hero' && a.street === 'river' && a.amount && a.amount > 0
      )
      events.push({
        street: 'river',
        scareType: scare.type,
        heroBetAfterScare,
        heroHadTheHand: scare.heroHasIt,
      })
    }
  }

  return events
}

interface ScareCardResult {
  type: 'flush-completing' | 'straight-completing'
  heroHasIt: boolean
}

function detectScareCards(
  previousBoard: Card[],
  newCard: Card,
  heroCards: [Card, Card]
): ScareCardResult[] {
  const results: ScareCardResult[] = []
  const newSuit = newCard.slice(-1)
  const newRankVal = getRankValue(newCard.slice(0, -1))

  // Check flush scare: does the new card create a 3rd+ suited card?
  const boardSuits = previousBoard.map((c) => c.slice(-1))
  const suitCount = boardSuits.filter((s) => s === newSuit).length
  if (suitCount >= 2) {
    // 3rd+ card of this suit on board — flush scare
    const allCards = [...heroCards, ...previousBoard, newCard]
    const heroHasFlush = checkHasFlush(heroCards, [...previousBoard, newCard])
    results.push({
      type: 'flush-completing',
      heroHasIt: heroHasFlush,
    })
  }

  // Check straight scare: does the new card complete a possible straight?
  const boardRanks = previousBoard.map((c) => getRankValue(c.slice(0, -1)))
  const allRanks = [...new Set([...boardRanks, newRankVal])].sort((a, b) => a - b)
  // Add ace-low
  if (allRanks.includes(12)) allRanks.unshift(-1)

  // Check for 3+ consecutive ranks including the new card
  for (let i = 0; i <= allRanks.length - 3; i++) {
    if (
      allRanks[i + 2] - allRanks[i] === 2 &&
      (allRanks[i] === newRankVal || allRanks[i + 1] === newRankVal || allRanks[i + 2] === newRankVal ||
       (newRankVal === 12 && allRanks[i] === -1)) // ace-low case
    ) {
      const heroHasStraight = checkHasStraight(heroCards, [...previousBoard, newCard])
      results.push({
        type: 'straight-completing',
        heroHasIt: heroHasStraight,
      })
      break // Only count once
    }
  }

  return results
}

function checkHasFlush(heroCards: [Card, Card], board: Card[]): boolean {
  const allCards = [...heroCards, ...board]
  const suitCounts: Record<string, number> = {}
  for (const c of allCards) {
    const suit = c.slice(-1)
    suitCounts[suit] = (suitCounts[suit] || 0) + 1
  }
  // Hero contributes to the flush (at least one hero card in the flush suit)
  for (const [suit, count] of Object.entries(suitCounts)) {
    if (count >= 5) {
      const heroHasSuit = heroCards.some((c) => c.slice(-1) === suit)
      if (heroHasSuit) return true
    }
  }
  return false
}

function checkHasStraight(heroCards: [Card, Card], board: Card[]): boolean {
  const eval_ = evaluateHand(heroCards, board)
  return eval_.strength >= 600 && eval_.strength < 700
}

function getRankValue(rank: string): number {
  const values: Record<string, number> = {
    '2': 0, '3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '8': 6,
    '9': 7, 'T': 8, 'J': 9, 'Q': 10, 'K': 11, 'A': 12,
  }
  return values[rank] ?? 0
}

// ============================================
// PILLAR CALCULATIONS
// ============================================

function pearsonCorrelation(xs: number[], ys: number[]): number {
  const n = xs.length
  if (n < 3) return 0

  const sumX = xs.reduce((a, b) => a + b, 0)
  const sumY = ys.reduce((a, b) => a + b, 0)
  const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0)
  const sumX2 = xs.reduce((sum, x) => sum + x * x, 0)
  const sumY2 = ys.reduce((sum, y) => sum + y * y, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2))

  if (denominator === 0) return 0
  return numerator / denominator
}

function calculateLinearityScore(data: TransparencyDataPoint[]): number {
  const showdownHands = data.filter((d) => d.wentToShowdown)
  if (showdownHands.length < 3) return 50 // Neutral when insufficient data

  const strengths = showdownHands.map((d) => d.normalizedHandStrength)
  const investments = showdownHands.map((d) => d.investmentRatio)

  const r = pearsonCorrelation(strengths, investments)
  return Math.round(Math.max(0, Math.min(100, (r + 1) * 50)))
}

function calculatePolarizationScore(data: TransparencyDataPoint[]): number {
  const allBigBets = data.flatMap((d) => d.bigBets)
  if (allBigBets.length === 0) return 50 // Neutral

  const totalBigBets = allBigBets.length
  const strongBets = allBigBets.filter((b) => b.handStrengthAtBet >= 0.6).length
  const weakBets = allBigBets.filter((b) => b.handStrengthAtBet <= 0.2).length
  const strongRatio = strongBets / totalBigBets
  const weakRatio = weakBets / totalBigBets

  if (weakRatio === 0) {
    // Only value bets — transparent
    return Math.round(70 + strongRatio * 30)
  }
  if (strongRatio === 0) {
    // Pure bluffs — deceptive
    return Math.round(20 * (1 - weakRatio))
  }
  // Has both strong and weak = polarized = deceptive
  const polarizationDegree = Math.min(strongRatio, weakRatio) * 2
  return Math.round(50 - polarizationDegree * 40)
}

function calculateBoardTextureScore(data: TransparencyDataPoint[]): number {
  const allEvents = data.flatMap((d) => d.scareCardEvents)
  const bettingEvents = allEvents.filter((e) => e.heroBetAfterScare)
  if (bettingEvents.length === 0) return 50 // Neutral

  const truthful = bettingEvents.filter((e) => e.heroHadTheHand).length
  return Math.round((truthful / bettingEvents.length) * 100)
}

// ============================================
// COMPOSITE T-SCORE
// ============================================

export function calculateTransparencyScore(
  data: TransparencyDataPoint[]
): TransparencyScore {
  const linearity = calculateLinearityScore(data)
  const polarization = calculatePolarizationScore(data)
  const boardTexture = calculateBoardTextureScore(data)

  const tScore = Math.round(
    linearity * 0.6 + polarization * 0.3 + boardTexture * 0.1
  )

  const showdownCount = data.filter((d) => d.wentToShowdown).length
  const confidence: TransparencyScore['confidence'] =
    showdownCount >= 13 ? 'high' : showdownCount >= 5 ? 'medium' : 'low'

  return {
    linearityScore: linearity,
    polarizationScore: polarization,
    boardTextureScore: boardTexture,
    tScore,
    dataPoints: data.length,
    confidence,
  }
}

// ============================================
// PLAYER CLASSIFICATION
// ============================================

export function classifyPlayer(
  playStyle: PlayStyle,
  tScore: number
): PlayerArchetypeInfo {
  const isLoose = playStyle.vpip > 30
  const isTight = playStyle.vpip < 22
  const isAggressive = playStyle.pfr > 15 || playStyle.aggression > 1.5
  const isPassive = playStyle.pfr < 12 && playStyle.aggression < 1.2
  const isTransparent = tScore >= 60
  const isDeceptive = tScore < 40

  const ltBalanced = !isLoose && !isTight
  const apBalanced = !isAggressive && !isPassive
  const dtBalanced = !isTransparent && !isDeceptive

  // If all three dimensions are balanced, return The Enigma
  if (ltBalanced && apBalanced && dtBalanced) {
    return ARCHETYPE_MAP['balanced']
  }

  // Build key from dominant dimensions (fall back to closest extreme for balanced dims)
  const lt = isLoose ? 'loose' : isTight ? 'tight' : (playStyle.vpip >= 26 ? 'loose' : 'tight')
  const ap = isAggressive ? 'aggressive' : isPassive ? 'passive' : (playStyle.aggression >= 1.35 ? 'aggressive' : 'passive')
  const dt = isTransparent ? 'transparent' : isDeceptive ? 'deceptive' : (tScore >= 50 ? 'transparent' : 'deceptive')

  const key = `${lt}-${ap}-${dt}`
  return ARCHETYPE_MAP[key] || ARCHETYPE_MAP['balanced']
}
