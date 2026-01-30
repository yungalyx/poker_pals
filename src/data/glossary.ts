// Poker terminology glossary for tooltips

export const glossary: Record<string, string> = {
  // Bluffing terms
  'bluff': 'Betting or raising with a weak hand to make your opponent fold a better hand.',
  'semi-bluff': 'Bluffing with a drawing hand that could improve to the best hand if called.',
  'blocker': 'A card in your hand that reduces the likelihood your opponent has a certain hand.',
  'calling station': 'A player who calls too often and rarely folds, even with weak hands.',
  'fold equity': 'The value gained from the chance your opponent will fold to your bet.',

  // Position terms
  'in position': 'Acting after your opponent, giving you an information advantage.',
  'out of position': 'Acting before your opponent, a disadvantage since you act without information.',
  'button': 'The best position at the table - you act last on every postflop street.',
  'blinds': 'Forced bets posted before cards are dealt (small blind and big blind).',
  'UTG': 'Under the Gun - first position to act preflop, the worst position.',

  // Hand/board terms
  'dry board': 'A board with few draws possible (e.g., K-7-2 rainbow).',
  'wet board': 'A board with many draws possible (e.g., J-T-9 with two hearts).',
  'rainbow': 'A board with all different suits, making flushes impossible.',
  'draw': 'A hand that needs to improve to win (e.g., 4 cards to a flush).',
  'outs': 'Cards remaining in the deck that will complete your draw.',
  'nuts': 'The best possible hand given the board.',
  'air': 'A hand with no pair and no draw - complete nothing.',

  // Betting terms
  'c-bet': 'Continuation bet - betting the flop after raising preflop.',
  'value bet': 'Betting with a strong hand to get called by worse hands.',
  'pot odds': 'The ratio of the current pot to the cost of calling a bet.',
  'equity': 'Your percentage chance of winning the hand.',
  '+EV': 'Positive expected value - a profitable play in the long run.',
  '-EV': 'Negative expected value - a losing play in the long run.',
  'overbet': 'A bet larger than the size of the pot.',

  // Player types
  'villain': 'Your opponent in a hand (standard poker term, not insulting).',
  'hero': 'You, the player making decisions.',

  // Actions
  'check-raise': 'Checking with the intention of raising after an opponent bets.',
  'three-bet': 'Re-raising a raise (the third bet in a sequence).',
  'barrel': 'A bet on a street, often used in sequence (double barrel = bet flop and turn).',

  // Bankroll
  'bankroll': 'The total amount of money you have set aside for poker.',
  'buy-in': 'The amount of money you bring to a table or tournament.',
  'downswing': 'A period of losing due to variance, even while playing well.',
  'variance': 'The natural ups and downs in poker results due to luck.',
  'risk of ruin': 'The probability of losing your entire bankroll.',
}

// Terms to look for (sorted by length descending to match longer phrases first)
export const glossaryTerms = Object.keys(glossary).sort((a, b) => b.length - a.length)
