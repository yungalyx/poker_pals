# The Transparency Index: An Implementation Guide

This guide refines the traditional, often surface-level poker binaries into a sophisticated Transparency Index. While the industry standards—Tight/Loose and Aggressive/Passive—tell you *how much* a player bets, they fail to reveal the *integrity* of those bets.

By implementing the following logic, a poker engine can move beyond "what" a player is doing and begin to calculate "why," allowing for a much higher level of exploitative play.

## The Core Logic

The Transparency Index measures the correlation between **perceived strength** (betting) and **actual strength** (cards). In a perfectly transparent player, the two values move in lockstep. In a deceptive player, the engine will find significant "noise" or intentional divergence between the two.

## Phase 1: Data Collection (The Observation)

The engine only records data when a hand reaches **Showdown** (cards are revealed). For every showdown, the engine stores two values:

- **Actual Strength ($S$):** A numerical rank of the player's hand (0.0 to 1.0) relative to all possible hands on that board.
- **Perceived Strength ($P$):** A numerical value derived from the player's betting actions (total money put in relative to the pot size).

## Phase 2: The Three-Pillar Calculation

To create a reliable score, the engine must track three distinct variables:

### Variable A: The Linearity Check (The "Money" Pillar)

- **Logic:** Does the investment match the hand?
- **The Math:** Calculate the Correlation Coefficient between the final hand strength and the percentage of the pot the player contributed.
- **Insight:** If the player puts in 80% of the pot with "The Nuts" and 10% with "Middle Pair" consistently, their Linearity Score is high.

### Variable B: The Polarization Gap (The "Bluff" Pillar)

- **Logic:** Does the player ever use big bets for weak hands?
- **The Math:** Look at all bets above a certain threshold (e.g., >70% of the pot). Identify the "Strength Gap."
- **Insight:** If the player's big bets are only in the 0.9–1.0 strength range, they are **Transparent**. If their big bets are in the 0.9–1.0 range AND the 0.0–0.2 range, they are **Deceptive** (Balanced).

### Variable C: Timing & Board Texture (The "Story" Pillar)

- **Logic:** Does the player "tell the truth" when the board changes?
- **The Math:** Track the player's aggression on "Scare Cards" (e.g., a third heart hits the board).
- **Insight:** If a player only bets when a scare card hits their actual hand, they are **Transparent**. If they bet the scare card regardless of their hand to represent a flush, they are **Deceptive**.

## Phase 3: The Scoring System (The "T-Score")

The engine aggregates these into a single **T-Score (0–100)**:

- **Weighting:** Linearity (60%), Polarization (30%), Board Texture (10%).
- **Decay Rate:** Use a "Weighted Moving Average" so that recent hands carry more weight than hands from three hours ago.

## Phase 4: Strategy Trigger (The "Exploit")

| T-Score | Classification    | The Engine's "Move"                                                                                                           |
| ------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 85+     | The Glass House    | **Max Exploit:** If they bet, fold anything that isn't the nuts. If they check, bet 100% of your range.                       |
| 40–60   | The Solid Pro      | **Equilibrium:** Stop trying to read them. Play "perfect" poker based on your own cards and the math.                         |
| <20     | The Illusionist    | **Anti-Leveling:** This player is actively trying to trick you. Do not fold to their big bets as often as the "math" suggests. |

## Summary

By transitioning from traditional binaries to a Transparency Index, your engine stops viewing "Aggression" as a monolith. Instead, it identifies whether that aggression is an honest reflection of hand strength or a deceptive tool used to manipulate the pot. A player with a high T-Score—no matter how aggressive they appear—is effectively playing with their cards face-up.
