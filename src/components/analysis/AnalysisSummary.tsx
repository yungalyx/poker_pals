'use client'

import type { AnalysisResult } from '@/types/analysis'

interface AnalysisSummaryProps {
  analysis: AnalysisResult
  onNewSession: () => void
  onExit: () => void
}

export function AnalysisSummary({ analysis, onNewSession, onExit }: AnalysisSummaryProps) {
  const {
    handsPlayed,
    profit,
    targetProfit,
    reachedTarget,
    overallScore,
    scoreBreakdown,
    playStyle,
    strengths,
    weaknesses,
    recommendations,
  } = analysis

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center">Session Analysis</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Result banner */}
        <div
          className={`text-center p-6 rounded-xl ${
            reachedTarget
              ? 'bg-green-100 dark:bg-green-900/30'
              : profit >= 0
                ? 'bg-yellow-100 dark:bg-yellow-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
          }`}
        >
          <div className="text-4xl mb-2">
            {reachedTarget ? '\u{1F3C6}' : profit >= 0 ? '\u{1F4B0}' : '\u{1F4C9}'}
          </div>
          <h2 className="text-2xl font-bold">
            {reachedTarget
              ? 'Target Reached!'
              : profit >= 0
                ? 'Profitable Session'
                : 'Learning Opportunity'}
          </h2>
          <p className="text-lg mt-2">
            <span className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
              {profit >= 0 ? '+' : ''}${profit}
            </span>
            <span className="text-gray-500"> in {handsPlayed} hands</span>
          </p>
        </div>

        {/* Overall score */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center">
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold ${
                overallScore >= 80
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : overallScore >= 60
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {overallScore}
            </div>
            <span className="mt-2 text-gray-500">Decision Score</span>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Score Breakdown</h3>
          <div className="space-y-4">
            <ScoreBar
              label="Preflop Decisions"
              score={scoreBreakdown.preflopDecisions.score}
              total={scoreBreakdown.preflopDecisions.total}
              tooltip="Measures how well you played before the flop. Raising premium hands, folding weak hands, and defending appropriately from the blinds all count toward this score."
            />
            <ScoreBar
              label="Postflop Betting"
              score={scoreBreakdown.postflopBetting.score}
              total={scoreBreakdown.postflopBetting.total}
              tooltip="Tracks your betting decisions on flop, turn, and river. Betting for value with strong hands, checking with medium hands for pot control, and making appropriate bluffs are all evaluated."
            />
            <ScoreBar
              label="Folding Discipline"
              score={scoreBreakdown.foldingDiscipline.score}
              total={scoreBreakdown.foldingDiscipline.total}
              tooltip="Measures whether you folded at the right times. Folding weak hands to aggression is good, but folding hands that have correct pot odds to call is a mistake."
            />
            <ScoreBar
              label="Value Extraction"
              score={scoreBreakdown.valueExtraction.score}
              total={scoreBreakdown.valueExtraction.total}
              tooltip="Evaluates how well you extracted value with strong hands. Betting and raising with made hands to build the pot counts toward this score."
            />
            <ScoreBar
              label="Pot Odds Accuracy"
              score={scoreBreakdown.potOddsAccuracy.score}
              total={scoreBreakdown.potOddsAccuracy.total}
              tooltip="Tracks whether your calls were mathematically correct. Calling when pot odds justify it (pot odds > required equity) earns points, while calling without odds loses points."
            />
          </div>
        </div>

        {/* Player Profile */}
        <PlayerProfile vpip={playStyle.vpip} pfr={playStyle.pfr} aggression={playStyle.aggression} />

        {/* Play style */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Your Play Style</h3>

          {/* Style spectrum bars */}
          <div className="space-y-4 mb-6">
            <StyleSpectrum
              label="Hand Selection"
              value={playStyle.vpip}
              min={0}
              max={60}
              leftLabel="Tight"
              centerLabel="Balanced"
              rightLabel="Loose"
              idealMin={25}
              idealMax={35}
              tooltip="Based on VPIP - how many hands you choose to play. Tight players fold more, loose players play more hands."
            />
            <StyleSpectrum
              label="Aggression"
              value={playStyle.aggression * 20} // Scale 0-5 to 0-100
              min={0}
              max={100}
              leftLabel="Passive"
              centerLabel="Balanced"
              rightLabel="Aggressive"
              idealMin={40}
              idealMax={60}
              tooltip="Based on bet/raise vs call ratio. Passive players call more, aggressive players bet and raise more."
            />
            <StyleSpectrum
              label="Preflop Raising"
              value={playStyle.pfr}
              min={0}
              max={50}
              leftLabel="Passive"
              centerLabel="Balanced"
              rightLabel="Aggressive"
              idealMin={18}
              idealMax={25}
              tooltip="How often you raise before the flop. Higher PFR means you enter pots with aggression rather than just calling."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatBox
              label="VPIP"
              value={`${playStyle.vpip}%`}
              description="Voluntarily Put $ In Pot"
              ideal="25-35%"
              tooltip="The percentage of hands where you voluntarily put money in the pot (not counting forced blinds). High VPIP means you play many hands (loose), low means you're selective (tight)."
            />
            <StatBox
              label="PFR"
              value={`${playStyle.pfr}%`}
              description="Preflop Raise %"
              ideal="18-25%"
              tooltip="The percentage of hands where you raised preflop. A healthy PFR close to your VPIP means you're entering pots aggressively rather than just calling."
            />
            <StatBox
              label="Aggression"
              value={playStyle.aggression.toFixed(1)}
              description="(Bets+Raises) / Calls"
              ideal="2-3"
              tooltip="The ratio of aggressive actions (bets and raises) to passive actions (calls). Higher aggression puts pressure on opponents. Below 1 means you call more than you bet/raise."
            />
            <StatBox
              label="Style"
              value={
                playStyle.vpip > 40
                  ? 'Loose'
                  : playStyle.vpip < 20
                    ? 'Tight'
                    : 'Balanced'
              }
              description="Overall tendency"
              ideal="Balanced"
              tooltip="Your overall playing style based on VPIP. Loose players play many hands, tight players are selective. Balanced is typically optimal for most situations."
            />
          </div>
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-green-500">{'\u2713'}</span> Strengths
            </h3>
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="text-green-800 dark:text-green-300">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-red-500">{'\u26A0'}</span> Areas to Improve
            </h3>
            <ul className="space-y-2">
              {weaknesses.map((w, i) => (
                <li key={i} className="text-red-800 dark:text-red-300">
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-blue-500">{'\u{1F4A1}'}</span> Recommendations
            </h3>
            <ul className="space-y-2">
              {recommendations.map((r, i) => (
                <li key={i} className="text-blue-800 dark:text-blue-300">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onNewSession}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
          >
            Play Again
          </button>
          <button
            onClick={onExit}
            className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold rounded-lg"
          >
            Back to Lessons
          </button>
        </div>
      </main>
    </div>
  )
}

function ScoreBar({
  label,
  score,
  total,
  tooltip,
}: {
  label: string
  score: number
  total: number
  tooltip: string
}) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0

  return (
    <div className="group relative">
      <div className="flex justify-between text-sm mb-1">
        <span className="flex items-center gap-1 cursor-help">
          {label}
          <span className="text-gray-400 text-xs">{'\u24D8'}</span>
        </span>
        <span>
          {score}/{total} ({percentage}%)
        </span>
      </div>
      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
        <div
          className={`h-full ${
            percentage >= 80
              ? 'bg-green-500'
              : percentage >= 60
                ? 'bg-yellow-500'
                : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* Tooltip */}
      <div className="absolute left-0 right-0 bottom-full mb-2 hidden group-hover:block z-10">
        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
          {tooltip}
          <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    </div>
  )
}

function StatBox({
  label,
  value,
  description,
  ideal,
  tooltip,
}: {
  label: string
  value: string
  description: string
  ideal: string
  tooltip?: string
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 group relative">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium flex items-center gap-1">
        {label}
        {tooltip && <span className="text-gray-400 text-xs cursor-help">{'\u24D8'}</span>}
      </div>
      <div className="text-xs text-gray-500 mt-1">{description}</div>
      <div className="text-xs text-blue-500 mt-1">Ideal: {ideal}</div>
      {/* Tooltip */}
      {tooltip && (
        <div className="absolute left-0 right-0 bottom-full mb-2 hidden group-hover:block z-10">
          <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
            {tooltip}
            <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  )
}

function PlayerProfile({
  vpip,
  pfr,
  aggression,
}: {
  vpip: number
  pfr: number
  aggression: number
}) {
  // Determine player type based on VPIP and aggression
  const isLoose = vpip > 30
  const isTight = vpip < 22
  const isAggressive = pfr > 15 || aggression > 1.5
  const isPassive = pfr < 12 && aggression < 1.2

  let playerType: string
  let typeAbbrev: string
  let typeColor: string
  let typeDescription: string
  let typeAdvice: string

  if (isLoose && isAggressive) {
    playerType = 'Loose Aggressive'
    typeAbbrev = 'LAG'
    typeColor = 'bg-red-500'
    typeDescription = 'You play many hands and play them aggressively with lots of bets and raises.'
    typeAdvice = 'LAG is a powerful but high-variance style. Make sure your aggression is selective and you have good hand reading skills.'
  } else if (isTight && isAggressive) {
    playerType = 'Tight Aggressive'
    typeAbbrev = 'TAG'
    typeColor = 'bg-green-500'
    typeDescription = 'You select strong hands and play them aggressively. This is considered the most profitable style.'
    typeAdvice = 'TAG is the gold standard for winning poker. Keep it up, but occasionally mix in some bluffs to stay unpredictable.'
  } else if (isLoose && isPassive) {
    playerType = 'Loose Passive'
    typeAbbrev = 'LP'
    typeColor = 'bg-yellow-500'
    typeDescription = 'You play many hands but mostly call rather than bet or raise. Often called a "calling station".'
    typeAdvice = 'This style tends to lose money long-term. Try to be more selective with hands and raise more when you do play.'
  } else if (isTight && isPassive) {
    playerType = 'Tight Passive'
    typeAbbrev = 'TP'
    typeColor = 'bg-blue-500'
    typeDescription = 'You play few hands and rarely raise. Sometimes called a "rock" or "nit".'
    typeAdvice = 'While patient, this style misses value. When you have strong hands, bet and raise more to build the pot.'
  } else {
    // Balanced/Neutral
    playerType = 'Balanced'
    typeAbbrev = 'BAL'
    typeColor = 'bg-purple-500'
    typeDescription = 'Your play style falls between the extremes, making you harder to read.'
    typeAdvice = 'A balanced style is good, but make sure you\'re adjusting to your opponents rather than playing the same way against everyone.'
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
      <h3 className="font-semibold mb-4">Player Profile</h3>

      <div className="flex items-center gap-4 mb-4">
        {/* Type badge */}
        <div className={`${typeColor} text-white rounded-xl px-6 py-4 text-center min-w-[120px]`}>
          <div className="text-3xl font-bold">{typeAbbrev}</div>
          <div className="text-xs opacity-90 mt-1">{playerType}</div>
        </div>

        {/* Description */}
        <div className="flex-1">
          <p className="text-sm text-gray-700 dark:text-gray-300">{typeDescription}</p>
        </div>
      </div>

      {/* Quadrant visualization */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg p-4 mb-4">
        <div className="aspect-square max-w-[200px] mx-auto relative">
          {/* Grid */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-tl-lg flex items-center justify-center text-xs text-blue-600 dark:text-blue-400 font-medium p-1">
              Tight Passive
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 rounded-tr-lg flex items-center justify-center text-xs text-green-600 dark:text-green-400 font-medium p-1">
              Tight Aggressive (TAG)
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-bl-lg flex items-center justify-center text-xs text-yellow-600 dark:text-yellow-400 font-medium p-1">
              Loose Passive
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 rounded-br-lg flex items-center justify-center text-xs text-red-600 dark:text-red-400 font-medium p-1">
              Loose Aggressive (LAG)
            </div>
          </div>

          {/* Position marker */}
          <div
            className="absolute w-4 h-4 bg-gray-900 dark:bg-white rounded-full border-2 border-white dark:border-gray-900 shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              // X: left = passive, right = aggressive (scale 0-4 aggression to 0-100%)
              left: `${Math.min(Math.max((aggression / 4) * 100, 5), 95)}%`,
              // Y: top = tight (low VPIP), bottom = loose (high VPIP)
              top: `${Math.min(Math.max((vpip / 70) * 100, 5), 95)}%`,
            }}
          />

          {/* Axis labels */}
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-500 whitespace-nowrap">
            VPIP {'\u2192'}
          </div>
          <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-xs text-gray-500">
            Aggression {'\u2192'}
          </div>
        </div>
      </div>

      {/* Advice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-blue-500">{'\u{1F4A1}'}</span>
          <p className="text-sm text-blue-800 dark:text-blue-300">{typeAdvice}</p>
        </div>
      </div>
    </div>
  )
}

function StyleSpectrum({
  label,
  value,
  min,
  max,
  leftLabel,
  centerLabel,
  rightLabel,
  idealMin,
  idealMax,
  tooltip,
}: {
  label: string
  value: number
  min: number
  max: number
  leftLabel: string
  centerLabel: string
  rightLabel: string
  idealMin: number
  idealMax: number
  tooltip: string
}) {
  // Calculate position as percentage (0-100)
  const position = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100)

  // Calculate ideal zone position
  const idealStart = ((idealMin - min) / (max - min)) * 100
  const idealEnd = ((idealMax - min) / (max - min)) * 100

  // Determine if in ideal range
  const isInIdealRange = value >= idealMin && value <= idealMax

  return (
    <div className="group relative">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium flex items-center gap-1">
          {label}
          <span className="text-gray-400 text-xs cursor-help">{'\u24D8'}</span>
        </span>
        <span
          className={`text-xs font-medium ${
            isInIdealRange ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
          }`}
        >
          {isInIdealRange ? 'In range' : 'Out of range'}
        </span>
      </div>

      {/* Spectrum bar */}
      <div className="relative h-6 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 via-green-400 to-red-400">
        {/* Ideal zone highlight */}
        <div
          className="absolute top-0 bottom-0 bg-white/30 border-x-2 border-white/50"
          style={{
            left: `${idealStart}%`,
            width: `${idealEnd - idealStart}%`,
          }}
        />

        {/* Position marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-gray-900 dark:bg-white shadow-lg transition-all duration-300"
          style={{ left: `calc(${position}% - 2px)` }}
        >
          {/* Marker arrow */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-white" />
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500">{leftLabel}</span>
        <span className="text-xs text-gray-500">{centerLabel}</span>
        <span className="text-xs text-gray-500">{rightLabel}</span>
      </div>

      {/* Tooltip */}
      <div className="absolute left-0 right-0 bottom-full mb-2 hidden group-hover:block z-10">
        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
          {tooltip}
          <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    </div>
  )
}
