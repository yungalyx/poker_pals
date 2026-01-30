// Advanced: Bankroll Management

export const advancedLessons = [
  {
    id: 'bankroll-basics',
    category: 'advanced',
    topic: 'bankroll',
    title: 'Bankroll 101',
    description: 'Protect your money, play the right stakes',
    order: 1,
    xpReward: 125,
    intro: {
      title: "Don't Go Broke",
      body: "Even winning players lose sometimes. Bankroll management ensures you survive the downswings and stay in the game.",
      keyPoints: [
        'Never risk more than you can afford to lose',
        'Have 20-30 buy-ins for your stake',
        'Move down when running bad, not up when running good',
      ],
    },
    puzzles: [
      {
        id: 'br-1',
        type: 'calculation',
        question: 'You have a $1,000 bankroll. What stakes should you play?',
        scenario: {
          bankroll: 1000,
          rule: '20 buy-in minimum',
        },
        options: [
          { id: 'a', label: '$1/$2 (buy-in $200)' },
          { id: 'b', label: '$0.50/$1 (buy-in $100)' },
          { id: 'c', label: '$0.25/$0.50 (buy-in $50)' },
        ],
        correctAnswer: 'c',
        explanation: 'With $1,000 and 20 buy-ins needed, max buy-in is $50. That means $0.25/$0.50. Playing higher risks going broke during a normal downswing.',
      },
      {
        id: 'br-2',
        type: 'scenario',
        question: "You're on a 10 buy-in downswing at $1/$2. Your bankroll dropped from $6,000 to $4,000. What should you do?",
        scenario: {
          originalBankroll: 6000,
          currentBankroll: 4000,
          stake: '$1/$2',
          buyIn: 200,
        },
        options: [
          { id: 'a', label: 'Keep playing $1/$2 to win it back' },
          { id: 'b', label: 'Move down to $0.50/$1' },
          { id: 'c', label: 'Take a shot at $2/$5 to recover faster' },
        ],
        correctAnswer: 'b',
        explanation: 'With $4,000, you only have 20 buy-ins for $1/$2 — the minimum. Moving down protects your bankroll and removes pressure. Never chase losses at higher stakes.',
      },
      {
        id: 'br-3',
        type: 'knowledge',
        question: 'Why do winning players still experience losing streaks?',
        options: [
          { id: 'a', label: "They're actually losing players" },
          { id: 'b', label: 'Variance — short-term luck dominates' },
          { id: 'c', label: 'The games got harder' },
        ],
        correctAnswer: 'b',
        explanation: 'Variance is brutal in poker. A player with 5bb/100 winrate can easily lose 20 buy-ins over 50,000 hands. Bankroll management handles the swings.',
      },
      {
        id: 'br-4',
        type: 'scenario',
        question: "You won $500 tonight at $0.50/$1. Your bankroll is now $2,500. Should you move up to $1/$2?",
        scenario: {
          bankroll: 2500,
          currentStake: '$0.50/$1',
          targetStake: '$1/$2',
          buyInNeeded: 200,
        },
        options: [
          { id: 'a', label: 'Yes, you\'re running hot!' },
          { id: 'b', label: 'No, need more buy-ins first' },
        ],
        correctAnswer: 'b',
        explanation: "You have 12.5 buy-ins for $1/$2 — way below the 20 minimum. One bad session and you're back where you started. Keep grinding until you have $4,000+.",
      },
      {
        id: 'br-5',
        type: 'calculation',
        question: 'Tournament player: You have $500. Buy-ins are $20. How many can you play with proper bankroll management (50 buy-ins for MTTs)?',
        scenario: {
          bankroll: 500,
          buyIn: 20,
          rule: '50 buy-in minimum for tournaments',
        },
        options: [
          { id: 'a', label: "25 tournaments — that's half your roll" },
          { id: 'b', label: '10 tournaments at $20' },
          { id: 'c', label: "None — you're not rolled for $20s" },
        ],
        correctAnswer: 'c',
        explanation: 'Tournaments need 50+ buy-ins due to high variance. $500 ÷ 50 = $10 max buy-in. You should play $10 or lower tournaments until your bankroll grows.',
      },
    ],
  },

  {
    id: 'variance-understanding',
    category: 'advanced',
    topic: 'bankroll',
    title: 'Understanding Variance',
    description: 'Why good decisions sometimes lose',
    order: 2,
    xpReward: 125,
    intro: {
      title: 'The Long Run vs Right Now',
      body: "In poker, you can do everything right and still lose. That's variance. Your job is to make +EV decisions and let the math work over thousands of hands.",
      keyPoints: [
        'Results ≠ Decision quality',
        'Focus on process, not outcomes',
        'Small edges compound over time',
      ],
    },
    puzzles: [
      {
        id: 'var-1',
        type: 'scenario',
        question: 'You get all-in preflop with AA vs KK. You lose. Did you play it wrong?',
        scenario: {
          heroCards: ['As', 'Ah'],
          villainCards: ['Ks', 'Kh'],
          result: 'Villain hit a King',
        },
        options: [
          { id: 'yes', label: 'Yes, should have folded' },
          { id: 'no', label: 'No, correct play — just unlucky' },
        ],
        correctAnswer: 'no',
        explanation: 'AA vs KK is 80/20. You\'ll win 4 out of 5 times. Losing once doesn\'t mean you played wrong. Keep getting your money in good.',
      },
      {
        id: 'var-2',
        type: 'knowledge',
        question: "You've lost 5 sessions in a row playing solid poker. What's the most likely cause?",
        options: [
          { id: 'a', label: 'You\'re actually a bad player' },
          { id: 'b', label: 'Normal variance — 5 sessions is tiny sample' },
          { id: 'c', label: 'The poker site is rigged' },
        ],
        correctAnswer: 'b',
        explanation: '5 sessions might be 5,000 hands — nowhere near enough to draw conclusions. Winning players regularly have 10+ buy-in downswings. Stay the course.',
      },
      {
        id: 'var-3',
        type: 'ev-check',
        question: 'You call a $100 all-in with a flush draw. Pot is $300. You have 35% equity. Is this profitable long-term?',
        scenario: {
          callAmount: 100,
          potSize: 300,
          equity: 0.35,
        },
        options: [
          { id: 'yes', label: 'Yes, +EV call' },
          { id: 'no', label: 'No, -EV call' },
        ],
        correctAnswer: 'yes',
        explanation: 'You risk $100 to win $300. You need 25% equity (100/400). You have 35%. Expected value: 0.35 × $400 - $100 = +$40 per call. Great spot!',
      },
      {
        id: 'var-4',
        type: 'mindset',
        question: "You just lost a big pot where you were 90% favorite. What's the right mindset?",
        options: [
          { id: 'a', label: '"I need to win that money back now"' },
          { id: 'b', label: '"That was a bad beat, I played it perfectly"' },
          { id: 'c', label: '"Maybe I should have played it differently"' },
        ],
        correctAnswer: 'b',
        explanation: 'Results don\'t change decision quality. You got your money in as a 90% favorite — that\'s the goal. The 10% will happen sometimes. Move on.',
      },
      {
        id: 'var-5',
        type: 'knowledge',
        question: 'What sample size do you need to know if you\'re a winning player?',
        options: [
          { id: 'a', label: '1,000 hands' },
          { id: 'b', label: '10,000 hands' },
          { id: 'c', label: '100,000+ hands' },
        ],
        correctAnswer: 'c',
        explanation: 'Variance is massive. You need 100,000+ hands to have statistical confidence in your winrate. Judge decisions, not short-term results.',
      },
    ],
  },
]
