// Intermediate: Bluffing, Positioning

export const intermediateLessons = [
  {
    id: 'bluffing-basics',
    category: 'intermediate',
    topic: 'bluffing',
    title: 'When to Bluff',
    description: 'Learn profitable bluffing spots',
    order: 1,
    xpReward: 100,
    intro: {
      title: 'The Art of the Bluff',
      body: "Bluffing isn't about being tricky — it's about math. A good bluff works when your opponent folds often enough to make it profitable.",
      keyPoints: [
        'Bluff when the story makes sense',
        'Bluff less against players who call too much',
        'Good bluffs have backup plans (draws)',
      ],
    },
    puzzles: [
      {
        id: 'bl-1',
        type: 'action',
        question: 'You missed your flush draw on the river. Villain checks. The board is A-K-7-4-2 with three hearts. Should you bluff?',
        scenario: {
          heroCards: ['Qh', 'Jh'],
          board: ['Ah', 'Kh', '7c', '4d', '2s'],
          potSize: 120,
          position: 'IP',
          situation: 'You bet flop and turn representing the flush. River missed. Villain checked to you.',
        },
        options: [
          { id: 'bluff', label: 'Bet (Bluff)' },
          { id: 'check', label: 'Check behind' },
        ],
        correctAnswer: 'bluff',
        explanation: "Your story makes sense — you've been betting like you have a flush. The river didn't complete any draws, and villain showed weakness by checking. Fire that third barrel.",
      },
      {
        id: 'bl-2',
        type: 'action',
        question: 'Flop is Q-7-2 rainbow. You have 6-5 offsuit (complete air). Villain checks. Should you c-bet bluff?',
        scenario: {
          heroCards: ['6d', '5c'],
          board: ['Qh', '7s', '2c'],
          potSize: 60,
          position: 'IP',
          situation: 'You raised preflop from the button, BB called. Dry flop.',
        },
        options: [
          { id: 'bet', label: 'Bet 1/3 pot' },
          { id: 'check', label: 'Check behind' },
        ],
        correctAnswer: 'bet',
        warningAnswers: ['check'],
        explanation: "On dry boards, you can c-bet small with most hands. Villain will often fold. But if they call, they likely have a Queen or a pocket pair — be ready to give up on the turn if they show continued interest.",
        warningExplanation: "Checking is fine — you have no equity and can give up cheaply. C-betting is slightly better since villain folds a lot, but checking avoids building a pot you can't win.",
      },
      {
        id: 'bl-3',
        type: 'action',
        question: 'You have a gutshot straight draw. Should you semi-bluff the turn?',
        scenario: {
          heroCards: ['Jc', 'Tc'],
          board: ['Ks', '8d', '4h', '7c'],
          potSize: 100,
          position: 'IP',
          situation: 'You need a 9 for the straight. Villain check-called flop, now checks turn.',
        },
        options: [
          { id: 'bet', label: 'Bet (Semi-bluff)' },
          { id: 'check', label: 'Check behind' },
        ],
        correctAnswer: 'bet',
        explanation: "Semi-bluffs are great because you win two ways: villain folds now, or you hit your draw. You have 4 outs (~8%) plus fold equity. Bet!",
      },
      {
        id: 'bl-4',
        type: 'action',
        question: 'Villain is a calling station who never folds. You have air on the river. Bluff?',
        scenario: {
          heroCards: ['9h', '8h'],
          board: ['Kd', 'Qs', '4c', '2h', '6d'],
          potSize: 150,
          position: 'IP',
          situation: 'Villain has called every street. Known to be very loose and curious.',
        },
        options: [
          { id: 'bluff', label: 'Bet big (Bluff)' },
          { id: 'check', label: 'Give up' },
        ],
        correctAnswer: 'check',
        explanation: "Never bluff a calling station. They don't fold. Save your chips and find a better spot.",
      },
      {
        id: 'bl-5',
        type: 'spot-the-bluff',
        question: 'Which is a BETTER bluffing hand on this board?',
        scenario: {
          board: ['Kh', 'Qh', '7d', '3s', '2h'],
          situation: 'River. You want to represent a flush.',
        },
        options: [
          { id: 'a', label: 'Ah-5c (blocker to nut flush)' },
          { id: 'b', label: '9c-8c (no blockers)' },
        ],
        correctAnswer: 'a',
        explanation: 'Ah blocks the nut flush — if you have the Ah, villain is less likely to have it. This makes your bluff more believable and reduces the chance you get called by the nuts.',
      },
    ],
  },

  {
    id: 'position-power',
    category: 'intermediate',
    topic: 'positioning',
    title: 'Position is Power',
    description: 'Why acting last is a huge advantage',
    order: 2,
    xpReward: 100,
    intro: {
      title: 'Last to Act, First to Win',
      body: 'Position means acting after your opponent. You get to see what they do before you decide. This information is incredibly valuable.',
      keyPoints: [
        'In Position (IP): You act last — big advantage',
        'Out of Position (OOP): You act first — disadvantage',
        'Play tighter OOP, wider IP',
      ],
    },
    puzzles: [
      {
        id: 'pos-1',
        type: 'position-id',
        question: 'You are on the Button. Villain is in the Big Blind. Who has position postflop?',
        scenario: {
          heroPosition: 'BTN',
          villainPosition: 'BB',
        },
        options: [
          { id: 'hero', label: 'You (Button)' },
          { id: 'villain', label: 'Villain (Big Blind)' },
        ],
        correctAnswer: 'hero',
        explanation: 'The Button always acts last postflop. BB acts first. You have position and will see villain\'s action before deciding.',
      },
      {
        id: 'pos-2',
        type: 'action',
        question: 'You have K-J offsuit in the Small Blind. Button raises. What do you do?',
        scenario: {
          heroCards: ['Kd', 'Jc'],
          heroPosition: 'SB',
          villainPosition: 'BTN',
          situation: 'Button raises 2.5x. You are in SB with KJo.',
        },
        options: [
          { id: 'call', label: 'Call' },
          { id: 'fold', label: 'Fold' },
          { id: 'raise', label: '3-bet' },
        ],
        correctAnswer: 'fold',
        warningAnswers: ['raise'],
        explanation: "KJo plays poorly out of position. You'll be first to act on every street against a player with a strong range. Fold and wait for a better spot.",
        warningExplanation: "3-betting is aggressive and can work, but it's risky. If called, you're out of position with a mediocre hand. If villain 4-bets, you have to fold. Folding is safer here, but 3-betting as a bluff isn't terrible if you're balanced.",
      },
      {
        id: 'pos-3',
        type: 'action',
        question: 'Same hand (K-J offsuit), but now YOU are on the Button and SB raises. What do you do?',
        scenario: {
          heroCards: ['Kd', 'Jc'],
          heroPosition: 'BTN',
          villainPosition: 'SB',
          situation: 'SB raises 3x. You are on the Button with KJo.',
        },
        options: [
          { id: 'call', label: 'Call' },
          { id: 'fold', label: 'Fold' },
          { id: 'raise', label: '3-bet' },
        ],
        correctAnswer: 'call',
        explanation: "Now you have position! KJo is profitable to call here. You'll act last on every street, making the hand much easier to play.",
      },
      {
        id: 'pos-4',
        type: 'knowledge',
        question: 'Why is position valuable?',
        options: [
          { id: 'a', label: 'You get better cards' },
          { id: 'b', label: 'You see opponent act first, gaining information' },
          { id: 'c', label: 'You pay less to see flops' },
        ],
        correctAnswer: 'b',
        explanation: "Information is power. When you see villain check, you know they're weak. When they bet, you can decide to continue or fold. Acting last is a massive edge.",
      },
      {
        id: 'pos-5',
        type: 'action',
        question: 'You are UTG (first to act) with Q-9 offsuit. 9 players at the table. What do you do?',
        scenario: {
          heroCards: ['Qd', '9c'],
          heroPosition: 'UTG',
          situation: '9-handed table. You are first to act preflop.',
        },
        options: [
          { id: 'raise', label: 'Raise' },
          { id: 'fold', label: 'Fold' },
        ],
        correctAnswer: 'fold',
        explanation: "Q9o is too weak for UTG. With 8 players left to act, you need a strong range — hands like big pairs, AK, AQ. Q9o has some straight potential but plays poorly out of position and is often dominated by better Queens. Fold and wait for a better spot.",
      },
    ],
  },

]
