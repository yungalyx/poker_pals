import type { Card } from '@/types'

// All cards in a standard deck
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']
const SUITS = ['s', 'h', 'd', 'c']

export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push(`${rank}${suit}`)
    }
  }
  return deck
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function dealCards(deck: Card[], count: number): { cards: Card[]; remaining: Card[] } {
  return {
    cards: deck.slice(0, count),
    remaining: deck.slice(count),
  }
}

// Hand evaluation
export type HandRank =
  | 'high-card'
  | 'pair'
  | 'two-pair'
  | 'three-of-a-kind'
  | 'straight'
  | 'flush'
  | 'full-house'
  | 'four-of-a-kind'
  | 'straight-flush'
  | 'royal-flush'

const HAND_RANK_VALUES: Record<HandRank, number> = {
  'high-card': 1,
  'pair': 2,
  'two-pair': 3,
  'three-of-a-kind': 4,
  'straight': 5,
  'flush': 6,
  'full-house': 7,
  'four-of-a-kind': 8,
  'straight-flush': 9,
  'royal-flush': 10,
}

function getRankValue(rank: string): number {
  return RANKS.indexOf(rank)
}

function parseCard(card: Card): { rank: string; suit: string } {
  return { rank: card[0], suit: card[1] }
}

export function evaluateHand(holeCards: Card[], board: Card[]): { rank: HandRank; strength: number; description: string } {
  const allCards = [...holeCards, ...board]
  const parsed = allCards.map(parseCard)

  // Count ranks and suits
  const rankCounts: Record<string, number> = {}
  const suitCounts: Record<string, string[]> = {}

  for (const card of parsed) {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1
    if (!suitCounts[card.suit]) suitCounts[card.suit] = []
    suitCounts[card.suit].push(card.rank)
  }

  // Check for flush
  let flushSuit: string | null = null
  for (const [suit, ranks] of Object.entries(suitCounts)) {
    if (ranks.length >= 5) {
      flushSuit = suit
      break
    }
  }

  // Check for straight
  const uniqueRanks = [...new Set(parsed.map((c) => c.rank))]
    .map(getRankValue)
    .sort((a, b) => b - a)

  // Add low ace for wheel straight
  if (uniqueRanks.includes(12)) uniqueRanks.push(-1) // Ace as low

  let straightHigh: number | null = null
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
      straightHigh = uniqueRanks[i]
      break
    }
  }

  // Check for straight flush
  if (flushSuit && straightHigh !== null) {
    const flushRanks = suitCounts[flushSuit].map(getRankValue).sort((a, b) => b - a)
    if (flushRanks.includes(12)) flushRanks.push(-1)

    for (let i = 0; i <= flushRanks.length - 5; i++) {
      if (flushRanks[i] - flushRanks[i + 4] === 4) {
        if (flushRanks[i] === 12) {
          return { rank: 'royal-flush', strength: 1200, description: 'Royal Flush' }
        }
        return { rank: 'straight-flush', strength: 1100 + flushRanks[i], description: 'Straight Flush' }
      }
    }
  }

  // Count pairs, trips, quads
  const counts = Object.values(rankCounts).sort((a, b) => b - a)
  const pairs = counts.filter((c) => c === 2).length
  const trips = counts.filter((c) => c === 3).length
  const quads = counts.filter((c) => c === 4).length

  // Get highest cards by count
  const sortedRanks = Object.entries(rankCounts)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1]
      return getRankValue(b[0]) - getRankValue(a[0])
    })
    .map(([rank]) => rank)

  if (quads > 0) {
    return { rank: 'four-of-a-kind', strength: 1000 + getRankValue(sortedRanks[0]), description: `Four ${sortedRanks[0]}s` }
  }

  if (trips > 0 && pairs > 0) {
    return { rank: 'full-house', strength: 800 + getRankValue(sortedRanks[0]) * 13 + getRankValue(sortedRanks[1]), description: `Full House, ${sortedRanks[0]}s full of ${sortedRanks[1]}s` }
  }

  if (flushSuit) {
    const flushHighCard = Math.max(...suitCounts[flushSuit].map(getRankValue))
    return { rank: 'flush', strength: 700 + flushHighCard, description: 'Flush' }
  }

  if (straightHigh !== null) {
    return { rank: 'straight', strength: 600 + straightHigh, description: 'Straight' }
  }

  if (trips > 0) {
    return { rank: 'three-of-a-kind', strength: 500 + getRankValue(sortedRanks[0]), description: `Three ${sortedRanks[0]}s` }
  }

  if (pairs >= 2) {
    return { rank: 'two-pair', strength: 300 + getRankValue(sortedRanks[0]) * 13 + getRankValue(sortedRanks[1]), description: `Two Pair, ${sortedRanks[0]}s and ${sortedRanks[1]}s` }
  }

  if (pairs === 1) {
    return { rank: 'pair', strength: 200 + getRankValue(sortedRanks[0]), description: `Pair of ${sortedRanks[0]}s` }
  }

  return { rank: 'high-card', strength: 100 + getRankValue(sortedRanks[0]), description: `${sortedRanks[0]} high` }
}

export function compareHands(
  hero: { holeCards: Card[]; board: Card[] },
  villain: { holeCards: Card[]; board: Card[] }
): 'hero' | 'villain' | 'tie' {
  const heroEval = evaluateHand(hero.holeCards, hero.board)
  const villainEval = evaluateHand(villain.holeCards, villain.board)

  if (heroEval.strength > villainEval.strength) return 'hero'
  if (villainEval.strength > heroEval.strength) return 'villain'
  return 'tie'
}

// Preflop hand strength (simplified)
export function getPreflopStrength(card1: Card, card2: Card): number {
  const r1 = parseCard(card1).rank
  const r2 = parseCard(card2).rank
  const suited = parseCard(card1).suit === parseCard(card2).suit
  const paired = r1 === r2

  const v1 = getRankValue(r1)
  const v2 = getRankValue(r2)
  const high = Math.max(v1, v2)
  const low = Math.min(v1, v2)

  // Pocket pairs
  if (paired) {
    return 80 + high * 1.5 // AA = 98, KK = 96.5, etc.
  }

  // Premium hands
  if (high === 12) {
    // Ace
    if (low >= 11) return suited ? 95 : 92 // AK
    if (low >= 10) return suited ? 88 : 82 // AQ, AJ
    if (low >= 8) return suited ? 75 : 65 // AT-A9
    return suited ? 60 : 45 // Lower aces
  }

  // Broadway
  if (high >= 10 && low >= 9) {
    return suited ? 70 + (high - 10) * 3 : 60 + (high - 10) * 3
  }

  // Suited connectors
  if (suited && Math.abs(v1 - v2) <= 2) {
    return 55 + high
  }

  // Other suited
  if (suited) {
    return 40 + high
  }

  // Connected
  if (Math.abs(v1 - v2) <= 2) {
    return 35 + high
  }

  // Junk
  return 20 + high
}

// Calculate pot odds as a percentage
export function calculatePotOdds(potSize: number, toCall: number): number {
  if (toCall === 0) return 0
  return Math.round((toCall / (potSize + toCall)) * 100)
}

// Estimate equity based on outs (simplified)
export function estimateEquity(outs: number, streetsRemaining: number): number {
  if (streetsRemaining === 2) {
    return Math.min(outs * 4, 100) // Rule of 4
  }
  return Math.min(outs * 2, 100) // Rule of 2
}
