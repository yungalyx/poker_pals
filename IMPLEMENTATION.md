# Poker Pals - Implementation Plan

## Vision
A Duolingo-style poker learning app that teaches GTO (Game Theory Optimal) poker through interactive puzzles and challenges.

---

## Learning Categories

### 1. Basics
- **Card Strength** - Understanding hand rankings, relative hand strength
- **Outs & Equity** - Counting outs, Rule of 2 and 4
- **Pot Odds** - Calculating odds, making +EV decisions
- **Bet Sizing** - Fundamental sizing (1/3, 2/3, full pot)
- **Preflop Decisions** - Starting hands, raises, all-ins, preflop chart

### 2. Intermediate
- **Bluffing** - When to bluff, blockers, calling stations
- **Positioning** - Button advantage, acting last, position-based play

### 3. Advanced
- **Bankroll Management** - Risk of ruin, stake selection
- **Understanding Variance** - Process over results, sample size

---

## Puzzle/Lesson Format

Each lesson presents a poker scenario and tests the user's decision-making:

### Puzzle Types

| Type | Description | Metrics |
|------|-------------|---------|
| **Bet Sizing** | Given a scenario, choose the correct bet size | Accuracy, reasoning |
| **Fold/Call/Raise** | Action decision puzzles | Decision quality |
| **Spot the Mistake** | Identify errors in a played hand | Pattern recognition |
| **Pot Odds Quiz** | Calculate if a call is profitable | Math accuracy |
| **Range Construction** | Build appropriate ranges for positions | GTO alignment |

### Lesson Structure
```
Lesson
├── Intro (concept explanation)
├── Examples (worked scenarios)
├── Puzzles (3-5 interactive challenges)
└── Summary (key takeaways)
```

---

## Data Models

### Lesson
```typescript
interface Lesson {
  id: string
  category: 'basics' | 'intermediate' | 'advanced'
  topic: string
  title: string
  order: number
  puzzles: Puzzle[]
}
```

### Puzzle
```typescript
interface Puzzle {
  id: string
  type: 'bet-sizing' | 'action' | 'pot-odds' | 'spot-mistake' | 'range'
  scenario: PokerScenario
  question: string
  options: Option[]
  correctAnswer: string
  explanation: string
}
```

### Poker Scenario
```typescript
interface PokerScenario {
  heroPosition: Position
  heroCards: [Card, Card]
  board: Card[]  // 0-5 cards (preflop to river)
  potSize: number
  stackSize: number
  villainAction?: string
  previousAction?: string[]
}
```

### User Progress
```typescript
interface UserProgress {
  odompletedLessons: string[]
  puzzleResults: {
    puzzleId: string
    correct: boolean
    attempts: number
  }[]
  streakDays: number
  totalXP: number
}
```

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **State**: React Context (local progress) → migrate to DB later
- **Storage**: localStorage for MVP → Postgres later
- **Animations**: Framer Motion (Duolingo-style feedback)

---

## Core Components

```
src/
├── app/
│   ├── page.tsx                 # Home / category selection
│   ├── learn/
│   │   └── [category]/
│   │       ├── page.tsx         # Lesson list for category
│   │       └── [lessonId]/
│   │           └── page.tsx     # Puzzle view
│   └── progress/
│       └── page.tsx             # Stats & achievements
├── components/
│   ├── poker/
│   │   ├── Card.tsx             # Playing card display
│   │   ├── Hand.tsx             # Two-card hand
│   │   ├── Board.tsx            # Community cards
│   │   └── Table.tsx            # Full table visualization
│   ├── puzzles/
│   │   ├── BetSizingPuzzle.tsx
│   │   ├── ActionPuzzle.tsx
│   │   ├── PotOddsPuzzle.tsx
│   │   └── PuzzleResult.tsx     # Correct/wrong feedback
│   ├── ui/
│   │   ├── ProgressBar.tsx
│   │   ├── XPCounter.tsx
│   │   └── StreakBadge.tsx
│   └── lessons/
│       ├── LessonCard.tsx
│       └── CategorySection.tsx
├── lib/
│   ├── poker/
│   │   ├── hands.ts             # Hand evaluation
│   │   ├── odds.ts              # Pot odds calculations
│   │   └── ranges.ts            # Position ranges
│   └── progress.ts              # Progress management
├── data/
│   └── lessons/
│       ├── basics.ts
│       ├── intermediate.ts
│       └── advanced.ts
└── types/
    └── index.ts
```

---

## Gamification Elements

- **XP System** - Earn points for correct answers
- **Streaks** - Daily practice tracking
- **Hearts/Lives** - Limited mistakes per session (optional)
- **Progress Bars** - Visual completion tracking
- **Celebrations** - Animations on correct answers
- **Difficulty Scaling** - Harder puzzles unlock over time

---

---

## Analysis Mode

A simulation mode where users play real poker hands with dynamically dealt cards.

### Features
- **Dynamic cards** - Each hand is randomly dealt from a shuffled deck
- **Goal-based** - Try to reach a profit target (default: $100)
- **Full hand play** - Preflop through showdown with fold/check/call/raise/bet
- **Villain AI** - Simplified opponent that bets and calls based on hand strength

### Scoring Categories
- **Preflop Decisions** - Correct opening and defending ranges
- **Postflop Betting** - Value bets and correct sizing
- **Folding Discipline** - Not chasing with bad pot odds
- **Value Extraction** - Maximizing profit with strong hands
- **Pot Odds Accuracy** - Calling when odds are good, folding when not

### Play Style Analysis
- **VPIP** - Voluntarily Put $ In Pot (ideal: 25-35%)
- **PFR** - Preflop Raise % (ideal: 18-25%)
- **Aggression** - Bets+Raises / Calls (ideal: 2-3)
- **Style** - Loose/Tight/Balanced assessment

### Post-Session Report
- Overall decision score (0-100)
- Score breakdown by category
- Identified strengths
- Areas for improvement
- Personalized recommendations

---

## MVP Scope (Phase 1)

### Include
- [ ] Home screen with 3 category cards
- [ ] 2-3 lessons per category (hardcoded data)
- [ ] Basic puzzle types: bet-sizing + action decisions
- [ ] Card/board visualization components
- [ ] Correct/incorrect feedback with explanations
- [ ] Local progress storage
- [ ] Simple XP tracking

### Exclude (Later)
- Auth / user accounts
- Database persistence
- Multiplayer / challenges
- Advanced analytics
- Mobile app

---

## Design Decisions

1. **GTO Calibration** - Use simplified heuristics (not solver outputs). Teach principles with clear rules like "bet 2/3 pot with top pair on wet boards" rather than complex mixed strategies. Accurate enough to build good fundamentals.

2. **Feedback Depth** - Very simple EV math. Show basic calculations like "Pot is $100, you need to call $25, so you need >20% equity to call" without deep solver analysis.

3. **Art Style** - Minimal and simplistic card design. Clean, modern look.

4. **Sound Effects** - Not yet. Add later if needed.

---

## Next Steps

1. Set up base UI components (Card, Hand, Board)
2. Create puzzle component framework
3. Build first lesson: "Hand Rankings" (basics)
4. Implement local progress tracking
5. Add gamification (XP, progress bars)
