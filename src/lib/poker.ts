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

export const HAND_RANK_VALUES: Record<HandRank, number> = {
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

const RANK_NAMES: Record<string, string> = {
  '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
  '8': '8', '9': '9', 'T': '10', 'J': 'Jack', 'Q': 'Queen', 'K': 'King', 'A': 'Ace',
}

function parseCard(card: Card): { rank: string; suit: string } {
  return { rank: card[0], suit: card[1] }
}

// Find the highest kicker card from hole cards that actually plays in the best 5-card hand.
// Returns a display name like "Ace kicker" or null if hole cards don't contribute.
export function getKickerDescription(holeCards: Card[], board: Card[]): string | null {
  if (board.length < 3) return null

  const boardEval = evaluateHand(board.slice(0, 2), board.slice(2)) // Dummy: evaluate board-only as best we can
  const fullEval = evaluateHand(holeCards, board)

  // If the hand rank improved beyond the board alone, the win isn't via kicker
  // We want to detect: same hand rank, but one player's hole card serves as a kicker
  // Simple approach: find which hole card ranks appear in the top kicker slots

  const boardParsed = board.map(parseCard)
  const boardRankValues = boardParsed.map(c => getRankValue(c.rank)).sort((a, b) => b - a)

  const holeParsed = holeCards.map(parseCard)
  const holeRankValues = holeParsed.map(c => getRankValue(c.rank)).sort((a, b) => b - a)

  // For hands decided by kickers, find the highest hole card that beats all board cards
  // not already used by the primary hand
  const rank = fullEval.rank

  // For straights, flushes, full houses — kickers don't apply
  if (['straight', 'flush', 'straight-flush', 'royal-flush', 'full-house'].includes(rank)) {
    return null
  }

  // Find highest hole card value
  const bestHoleCard = Math.max(...holeRankValues)
  const bestHoleRank = holeParsed.find(c => getRankValue(c.rank) === bestHoleCard)?.rank

  if (!bestHoleRank) return null

  // Check if this hole card is higher than board's non-primary cards
  // (i.e., it's actually serving as a kicker in the 5-card hand)
  const boardHighest = boardRankValues[0]

  // For high card or when our best card is above the board's best unmatched card
  if (bestHoleCard > boardHighest || rank === 'high-card') {
    return `${RANK_NAMES[bestHoleRank]} kicker`
  }

  return null
}

// Encode hand rank + up to 5 tiebreaker values into a single comparable number.
// Uses base 15 so each rank value (0-12) fits in one "digit".
function encodeStrength(handBase: number, ...values: number[]): number {
  let strength = handBase * Math.pow(15, 5)
  for (let i = 0; i < values.length && i < 5; i++) {
    strength += values[i] * Math.pow(15, 4 - i)
  }
  return strength
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
  if (flushSuit) {
    const flushRanks = suitCounts[flushSuit].map(getRankValue).sort((a, b) => b - a)
    if (flushRanks.includes(12)) flushRanks.push(-1)

    for (let i = 0; i <= flushRanks.length - 5; i++) {
      if (flushRanks[i] - flushRanks[i + 4] === 4) {
        if (flushRanks[i] === 12) {
          return { rank: 'royal-flush', strength: encodeStrength(10), description: 'Royal Flush' }
        }
        return { rank: 'straight-flush', strength: encodeStrength(9, flushRanks[i]), description: 'Straight Flush' }
      }
    }
  }

  // Count pairs, trips, quads
  const counts = Object.values(rankCounts).sort((a, b) => b - a)
  const pairs = counts.filter((c) => c === 2).length
  const trips = counts.filter((c) => c === 3).length
  const quads = counts.filter((c) => c === 4).length

  // Get highest cards by count, then by rank
  const sortedRanks = Object.entries(rankCounts)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1]
      return getRankValue(b[0]) - getRankValue(a[0])
    })
    .map(([rank]) => rank)

  // Helper: get the top N kickers (ranks not in the excluded set), sorted descending
  const getKickers = (excludeRanks: string[], count: number): number[] => {
    const all = parsed
      .map((c) => c.rank)
      .filter((r) => !excludeRanks.includes(r))
      .map(getRankValue)
      .sort((a, b) => b - a)
    // Deduplicate isn't needed — we want all cards, pick top N unique values
    // Actually we want top N individual card values for kicker comparison
    return all.slice(0, count)
  }

  if (quads > 0) {
    const quadsRank = sortedRanks[0]
    const kickers = getKickers([quadsRank], 1)
    return { rank: 'four-of-a-kind', strength: encodeStrength(8, getRankValue(quadsRank), ...kickers), description: `Four ${quadsRank}s` }
  }

  if ((trips > 0 && pairs > 0) || trips >= 2) {
    // With 7 cards, two sets of trips is possible (e.g. KKK-QQQ-A).
    // sortedRanks is ordered by count desc then rank desc, so [0] = best trips, [1] = best pair/second trips.
    const tripsRank = sortedRanks[0]
    const pairRank = sortedRanks[1]
    return { rank: 'full-house', strength: encodeStrength(7, getRankValue(tripsRank), getRankValue(pairRank)), description: `Full House, ${tripsRank}s full of ${pairRank}s` }
  }

  if (flushSuit) {
    const flushCards = suitCounts[flushSuit].map(getRankValue).sort((a, b) => b - a).slice(0, 5)
    return { rank: 'flush', strength: encodeStrength(6, ...flushCards), description: 'Flush' }
  }

  if (straightHigh !== null) {
    return { rank: 'straight', strength: encodeStrength(5, straightHigh), description: 'Straight' }
  }

  if (trips > 0) {
    const tripsRank = sortedRanks[0]
    const kickers = getKickers([tripsRank], 2)
    return { rank: 'three-of-a-kind', strength: encodeStrength(4, getRankValue(tripsRank), ...kickers), description: `Three ${tripsRank}s` }
  }

  if (pairs >= 2) {
    // With 7 cards there can be 3 pairs — pick the top 2
    const pairRanks = Object.entries(rankCounts)
      .filter(([, count]) => count >= 2)
      .map(([rank]) => getRankValue(rank))
      .sort((a, b) => b - a)
    const highPair = pairRanks[0]
    const lowPair = pairRanks[1]
    const excludeRanks = [RANKS[highPair], RANKS[lowPair]]
    const kickers = getKickers(excludeRanks, 1)
    return { rank: 'two-pair', strength: encodeStrength(3, highPair, lowPair, ...kickers), description: `Two Pair, ${RANKS[highPair]}s and ${RANKS[lowPair]}s` }
  }

  if (pairs === 1) {
    const pairRank = sortedRanks[0]
    const kickers = getKickers([pairRank], 3)
    return { rank: 'pair', strength: encodeStrength(2, getRankValue(pairRank), ...kickers), description: `Pair of ${pairRank}s` }
  }

  // High card — top 5 cards
  const top5 = parsed.map((c) => getRankValue(c.rank)).sort((a, b) => b - a).slice(0, 5)
  return { rank: 'high-card', strength: encodeStrength(1, ...top5), description: `${RANKS[top5[0]]} high` }
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

export interface OutsResult {
  total: number
  draws: { name: string; outs: number }[]
}

// Calculate outs for improving hand
export function calculateOuts(holeCards: [string, string], board: string[]): OutsResult {
  if (board.length === 0 || board.length === 5) return { total: 0, draws: [] }

  const allCards = [...holeCards, ...board]
  const parsed = allCards.map(parseCard)
  const deadCards = new Set(allCards)

  const currentEval = evaluateHand(holeCards, board)
  const draws: { name: string; outs: number }[] = []
  const outCards = new Set<string>()

  // --- Flush draw detection ---
  const suitCounts: Record<string, string[]> = {}
  for (const c of parsed) {
    if (!suitCounts[c.suit]) suitCounts[c.suit] = []
    suitCounts[c.suit].push(c.rank)
  }

  for (const [suit, ranks] of Object.entries(suitCounts)) {
    // Only count if at least one hole card contributes to this suit
    const holeInSuit = holeCards.filter(c => parseCard(c).suit === suit).length
    if (holeInSuit === 0) continue

    if (ranks.length === 4 && currentEval.rank !== 'flush') {
      // 4 to a flush = 9 outs
      let flushOuts = 0
      for (const r of RANKS) {
        const card = `${r}${suit}`
        if (!deadCards.has(card)) {
          outCards.add(card)
          flushOuts++
        }
      }
      draws.push({ name: 'Flush draw', outs: flushOuts })
    }
  }

  // --- Straight draw detection ---
  if (currentEval.rank !== 'straight' && currentEval.rank !== 'straight-flush' && currentEval.rank !== 'royal-flush') {
    const uniqueRankValues = [...new Set(parsed.map(c => getRankValue(c.rank)))]
    // Add ace-low (value -1) if we have an ace
    if (uniqueRankValues.includes(12)) uniqueRankValues.push(-1)
    uniqueRankValues.sort((a, b) => a - b)

    // Check every possible 5-card straight window
    let bestStraightDraw = 0
    let straightDrawName = ''

    for (let bottom = -1; bottom <= 8; bottom++) {
      const window = [bottom, bottom + 1, bottom + 2, bottom + 3, bottom + 4]
      const have = window.filter(v => uniqueRankValues.includes(v)).length
      const missing = window.filter(v => !uniqueRankValues.includes(v))

      if (have === 4 && missing.length === 1) {
        // Check that at least one hole card is in this window
        const holeRankValues = holeCards.map(c => {
          const v = getRankValue(parseCard(c).rank)
          return v === 12 ? [12, -1] : [v]
        }).flat()
        const holeInWindow = window.some(v => holeRankValues.includes(v))
        if (!holeInWindow) continue

        const missingValue = missing[0]
        const missingRank = missingValue === -1 ? 'A' : RANKS[missingValue]
        // Count how many cards can fill this
        let count = 0
        for (const suit of SUITS) {
          const card = `${missingRank}${suit}`
          if (!deadCards.has(card) && !outCards.has(card)) {
            count++
          }
        }

        // Determine if open-ended (missing card is at the ends) or gutshot (middle)
        const isOpenEnd = missingValue === bottom || missingValue === bottom + 4
        if (isOpenEnd && count > bestStraightDraw) {
          bestStraightDraw = count
          straightDrawName = 'Open-ended straight draw'
        } else if (!isOpenEnd && count > bestStraightDraw) {
          bestStraightDraw = count
          straightDrawName = 'Gutshot straight draw'
        }
      }
    }

    // Also detect double-gutshot / open-ended by counting total unique straight outs
    const straightOutCards = new Set<string>()
    for (let bottom = -1; bottom <= 8; bottom++) {
      const window = [bottom, bottom + 1, bottom + 2, bottom + 3, bottom + 4]
      const have = window.filter(v => uniqueRankValues.includes(v)).length
      const missing = window.filter(v => !uniqueRankValues.includes(v))

      if (have === 4 && missing.length === 1) {
        const holeRankValues = holeCards.map(c => {
          const v = getRankValue(parseCard(c).rank)
          return v === 12 ? [12, -1] : [v]
        }).flat()
        if (!window.some(v => holeRankValues.includes(v))) continue

        const missingValue = missing[0]
        const missingRank = missingValue === -1 ? 'A' : RANKS[missingValue]
        for (const suit of SUITS) {
          const card = `${missingRank}${suit}`
          if (!deadCards.has(card)) {
            straightOutCards.add(card)
          }
        }
      }
    }

    if (straightOutCards.size > 0) {
      // Separate straight outs that aren't already counted as flush outs
      const newStraightOuts = [...straightOutCards].filter(c => !outCards.has(c))
      const totalStraightOuts = straightOutCards.size

      if (totalStraightOuts >= 8) {
        straightDrawName = 'Open-ended straight draw'
      } else if (totalStraightOuts > 4) {
        straightDrawName = 'Double gutshot'
      }

      if (newStraightOuts.length > 0) {
        draws.push({ name: straightDrawName || 'Gutshot straight draw', outs: newStraightOuts.length })
        for (const c of newStraightOuts) outCards.add(c)
      }
    }
  }

  // --- Overcard outs (only if we have less than a pair) ---
  if (currentEval.rank === 'high-card' && board.length >= 3) {
    const boardRankValues = board.map(c => getRankValue(parseCard(c).rank))
    const highestBoard = Math.max(...boardRankValues)

    let overcardOuts = 0
    for (const hc of holeCards) {
      const hcValue = getRankValue(parseCard(hc).rank)
      if (hcValue > highestBoard) {
        // Each overcard has 3 outs (3 remaining of that rank)
        for (const suit of SUITS) {
          const card = `${parseCard(hc).rank}${suit}`
          if (!deadCards.has(card) && !outCards.has(card)) {
            outCards.add(card)
            overcardOuts++
          }
        }
      }
    }
    if (overcardOuts > 0) {
      draws.push({ name: 'Overcards', outs: overcardOuts })
    }
  }

  return { total: outCards.size, draws }
}
