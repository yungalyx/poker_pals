'use client'

import { useRef, useState, useEffect } from 'react'
import { toJpeg } from 'html-to-image'
import type { AnalysisResult, ActionEntry } from '@/types/analysis'
import { ShareCard } from './ShareCard'
import { Hand, Board } from '@/components/poker'
import { evaluateHand } from '@/lib/poker'

// Hook for animated counting
function useCountUp(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      // Easing function for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return count
}

// Animated score circle with SVG ring
function ScoreCircle({ score }: { score: number }) {
  const animatedScore = useCountUp(score, 1200)
  const circumference = 2 * Math.PI * 45 // radius = 45
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  const getScoreColor = (s: number) => {
    if (s >= 80) return { bg: 'from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-900/20', text: 'text-green-600 dark:text-green-400', stroke: '#22c55e' }
    if (s >= 60) return { bg: 'from-yellow-100 to-yellow-50 dark:from-yellow-900/40 dark:to-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', stroke: '#eab308' }
    return { bg: 'from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-900/20', text: 'text-red-600 dark:text-red-400', stroke: '#ef4444' }
  }

  const colors = getScoreColor(score)

  return (
    <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${colors.bg} shadow-lg`}>
      {/* SVG ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={colors.stroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
        />
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-4xl font-bold ${colors.text}`}>
          {animatedScore}
        </span>
      </div>
    </div>
  )
}

interface AnalysisSummaryProps {
  analysis: AnalysisResult
  onNewSession: () => void
  onExit: () => void
}

export function AnalysisSummary({ analysis, onNewSession, onExit }: AnalysisSummaryProps) {
  const {
    handsPlayed,
    profit,
    reachedTarget,
    overallScore,
    scoreBreakdown,
    playStyle,
    strengths,
    weaknesses,
    recommendations,
    lastHand,
  } = analysis

  const shareCardRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleShare = async () => {
    if (!shareCardRef.current) return

    setIsGenerating(true)

    try {
      const dataUrl = await toJpeg(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2, // Higher quality
        quality: 0.95,
      })

      setPreviewUrl(dataUrl)
      setShowShareModal(true)
    } catch (err) {
      console.error('Image generation failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveImage = () => {
    if (!previewUrl) return

    const link = document.createElement('a')
    link.download = 'poker-pals-results.jpg'
    link.href = previewUrl
    link.click()
    setShowShareModal(false)
  }

  const handleCloseModal = () => {
    setShowShareModal(false)
    setPreviewUrl(null)
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center text-white">Session Analysis</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8 relative">
        {/* Result banner */}
        <div
          className={`text-center p-8 rounded-2xl shadow-lg opacity-0 animate-fade-in-up ${
            reachedTarget
              ? 'bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-900/20 border border-green-200 dark:border-green-800'
              : profit >= 0
                ? 'bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/40 dark:to-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                : 'bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          <div className="text-5xl mb-4 animate-bounce">
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
            <span className={`font-semibold ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {profit >= 0 ? '+' : ''}${profit}
            </span>
            <span className="text-gray-500 dark:text-gray-400"> in {handsPlayed} hands</span>
          </p>
        </div>

        {/* Last Hand Summary */}
        {lastHand && (
          <div className="opacity-0 animate-fade-in-up animation-delay-100">
            <LastHandSummary hand={lastHand} decisions={analysis.decisions} />
          </div>
        )}

        {/* Overall score */}
        <div className="text-center opacity-0 animate-fade-in-up animation-delay-200">
          <div className="inline-flex flex-col items-center">
            <ScoreCircle score={overallScore} />
            <span className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Decision Score</span>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 opacity-0 animate-fade-in-up animation-delay-300 card-hover">
          <h3 className="font-semibold mb-4 text-lg">Score Breakdown</h3>
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
        <div className="opacity-0 animate-fade-in-up animation-delay-400">
          <PlayerProfile analysis={analysis} />
        </div>

        {/* Play style */}
        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 opacity-0 animate-fade-in-up animation-delay-500 card-hover">
          <h3 className="font-semibold mb-4 text-lg">Your Play Style</h3>

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
            <StyleSpectrum
              label="Transparency"
              value={analysis.transparencyScore.tScore}
              min={0}
              max={100}
              leftLabel="Deceptive"
              centerLabel="Balanced"
              rightLabel="Transparent"
              idealMin={35}
              idealMax={65}
              tooltip="Measures how closely your bet sizing correlates with hand strength. Transparent players bet big with strong hands and small with weak hands. Deceptive players disguise their hand strength."
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
              label="T-Score"
              value={`${analysis.transparencyScore.tScore}`}
              description="Transparency Index"
              ideal="40-60"
              tooltip="Measures how closely your bet sizing correlates with hand strength. High = transparent (predictable). Low = deceptive (hard to read). A balanced T-Score around 40-60 is ideal."
            />
            <StatBox
              label="Archetype"
              value={analysis.playerArchetype.abbrev}
              description={analysis.playerArchetype.archetype}
              ideal="The Enigma"
              tooltip={analysis.playerArchetype.description}
            />
          </div>
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/30 dark:to-green-900/10 rounded-2xl p-6 border border-green-200 dark:border-green-800 shadow-sm opacity-0 animate-fade-in-up animation-delay-600 card-hover">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
              <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">{'\u2713'}</span>
              Strengths
            </h3>
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="text-green-800 dark:text-green-300 flex items-start gap-2">
                  <span className="text-green-400 mt-1">{'\u2022'}</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/30 dark:to-red-900/10 rounded-2xl p-6 border border-red-200 dark:border-red-800 shadow-sm opacity-0 animate-fade-in-up animation-delay-600 card-hover">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
              <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-sm">{'\u26A0'}</span>
              Areas to Improve
            </h3>
            <ul className="space-y-2">
              {weaknesses.map((w, i) => (
                <li key={i} className="text-red-800 dark:text-red-300 flex items-start gap-2">
                  <span className="text-red-400 mt-1">{'\u2022'}</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm opacity-0 animate-fade-in-up animation-delay-700 card-hover">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">{'\u{1F4A1}'}</span>
              Recommendations
            </h3>
            <ul className="space-y-2">
              {recommendations.map((r, i) => (
                <li key={i} className="text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <span className="text-blue-400 mt-1">{'\u2022'}</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 opacity-0 animate-fade-in-up animation-delay-700">
          <button
            onClick={onNewSession}
            className="flex-1 py-4 btn-gradient-cyan text-gray-900 font-bold rounded-2xl transition-colors duration-200 btn-press hover:scale-[1.02]"
          >
            Play Again
          </button>
          <button
            onClick={handleShare}
            disabled={isGenerating}
            className="flex-1 py-4 btn-gradient-purple disabled:opacity-50 disabled:shadow-none text-white font-bold rounded-2xl transition-colors duration-200 flex items-center justify-center gap-2 btn-press hover:scale-[1.02]"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">{'\u23F3'}</span>
                Generating...
              </>
            ) : (
              <>
                {'\u{1F4F7}'} Share Results
              </>
            )}
          </button>
          <button
            onClick={onExit}
            className="flex-1 py-4 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 font-bold rounded-2xl shadow-sm hover:shadow-md transition-colors duration-200 btn-press"
          >
            Back to Lessons
          </button>
        </div>

        {/* Hidden share card for image generation */}
        <div className="absolute left-[-9999px] top-0" aria-hidden="true">
          <ShareCard ref={shareCardRef} analysis={analysis} />
        </div>
      </main>

      {/* Share Preview Modal */}
      {showShareModal && previewUrl && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-backdrop"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-center mb-4">Share Your Results</h3>

            {/* Image preview */}
            <div className="mb-6">
              <img
                src={previewUrl}
                alt="Share card preview"
                className="w-full rounded-2xl shadow-lg"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-4 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 font-bold rounded-2xl transition-colors duration-200 btn-press"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveImage}
                className="flex-1 py-4 btn-gradient-purple text-white font-bold rounded-2xl transition-colors duration-200 flex items-center justify-center gap-2 btn-press hover:scale-[1.02]"
              >
                {'\u2B07'} Save Image
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="group relative">
      <div className="flex justify-between text-sm mb-2">
        <span className="flex items-center gap-2 cursor-help font-medium">
          {label}
          <span className="text-gray-400 dark:text-gray-500 text-xs opacity-60 group-hover:opacity-100 transition-opacity">{'\u24D8'}</span>
        </span>
        <span className="text-gray-600 dark:text-gray-400">
          {score}/{total} <span className="font-semibold">({percentage}%)</span>
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-colors duration-1000 ease-out ${
            percentage >= 80
              ? 'bg-gradient-to-r from-green-500 to-green-400'
              : percentage >= 60
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                : 'bg-gradient-to-r from-red-500 to-red-400'
          }`}
          style={{ width: isVisible ? `${percentage}%` : '0%' }}
        />
      </div>
      {/* Tooltip */}
      <div className="absolute left-0 right-0 bottom-full mb-2 hidden group-hover:block z-10 pointer-events-none">
        <div className="bg-gray-900 text-white text-xs rounded-lg p-4 shadow-xl max-w-xs">
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
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 group relative shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-800">
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
        {label}
        {tooltip && <span className="text-gray-400 text-xs cursor-help opacity-60 group-hover:opacity-100 transition-opacity">{'\u24D8'}</span>}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</div>
      <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">Ideal: {ideal}</div>
      {/* Tooltip */}
      {tooltip && (
        <div className="absolute left-0 right-0 bottom-full mb-2 hidden group-hover:block z-10 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg p-4 shadow-xl max-w-xs">
            {tooltip}
            <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  )
}

function PlayerProfile({
  analysis,
}: {
  analysis: AnalysisResult
}) {
  const { playStyle, transparencyScore, playerArchetype } = analysis
  const { vpip, aggression } = playStyle

  return (
    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 card-hover">
      <h3 className="font-semibold mb-4 text-lg">Player Profile</h3>

      <div className="flex items-center gap-4 mb-4">
        {/* Archetype badge */}
        <div className={`${playerArchetype.color} text-white rounded-2xl px-6 py-4 text-center min-w-[120px] shadow-lg`}>
          <div className="text-3xl font-bold">{playerArchetype.abbrev}</div>
          <div className="text-xs opacity-90 mt-1">{playerArchetype.archetype}</div>
        </div>

        {/* Description */}
        <div className="flex-1">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{playerArchetype.description}</p>
        </div>
      </div>

      {/* Three-dimension breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <DimensionBadge
          label="Selection"
          value={playerArchetype.dimensions.tightLoose}
          colors={{
            tight: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
            loose: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
            balanced: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
          }}
        />
        <DimensionBadge
          label="Aggression"
          value={playerArchetype.dimensions.aggressivePassive}
          colors={{
            aggressive: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
            passive: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
            balanced: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
          }}
        />
        <DimensionBadge
          label="Transparency"
          value={playerArchetype.dimensions.deceptiveTransparent}
          colors={{
            transparent: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
            deceptive: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
            balanced: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
          }}
        />
      </div>

      {/* Quadrant visualization */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="aspect-square max-w-[200px] mx-auto relative">
          {/* Grid */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-tl-lg flex items-center justify-center text-xs text-blue-600 dark:text-blue-400 font-medium p-1">
              Tight Passive
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 rounded-tr-lg flex items-center justify-center text-xs text-green-600 dark:text-green-400 font-medium p-1">
              Tight Aggressive
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-bl-lg flex items-center justify-center text-xs text-yellow-600 dark:text-yellow-400 font-medium p-1">
              Loose Passive
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 rounded-br-lg flex items-center justify-center text-xs text-red-600 dark:text-red-400 font-medium p-1">
              Loose Aggressive
            </div>
          </div>

          {/* Position marker with animation */}
          <div
            className="absolute w-4 h-4 bg-gray-900 dark:bg-white rounded-full border-2 border-white dark:border-gray-900 shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10 transition-colors duration-1000 ease-out"
            style={{
              left: `${Math.min(Math.max((aggression / 4) * 100, 5), 95)}%`,
              top: `${Math.min(Math.max((vpip / 70) * 100, 5), 95)}%`,
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gray-900 dark:bg-white animate-ping opacity-20" />
          </div>

          {/* Axis labels */}
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap font-medium">
            VPIP {'\u2192'}
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 font-medium">
            Aggression {'\u2192'}
          </div>
        </div>
      </div>

      {/* T-Score gauge */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Transparency Index</span>
          <span className="text-sm font-bold">{transparencyScore.tScore}/100</span>
        </div>
        <div className="relative h-6 rounded-full overflow-hidden bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400 shadow-inner">
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-gray-900 dark:bg-white shadow-lg rounded-full transition-all duration-700 ease-out"
            style={{ left: `calc(${Math.min(Math.max(transparencyScore.tScore, 2), 98)}% - 3px)` }}
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[8px] border-transparent border-b-gray-900 dark:border-b-white" />
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Deceptive</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Transparent</span>
        </div>
        {transparencyScore.confidence === 'low' && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center italic">
            Play more hands for a more accurate transparency reading
          </p>
        )}
      </div>

      {/* Advice */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-900/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <span className="text-blue-500 text-lg">{'\u{1F4A1}'}</span>
          <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">{playerArchetype.advice}</p>
        </div>
      </div>
    </div>
  )
}

function DimensionBadge({
  label,
  value,
  colors,
}: {
  label: string
  value: string
  colors: Record<string, string>
}) {
  return (
    <div className={`rounded-xl p-3 text-center ${colors[value] || colors['balanced']}`}>
      <div className="text-xs font-medium opacity-70">{label}</div>
      <div className="text-sm font-bold capitalize">{value}</div>
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
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium flex items-center gap-2">
          {label}
          <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help opacity-60 group-hover:opacity-100 transition-opacity">{'\u24D8'}</span>
        </span>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            isInIdealRange
              ? 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40'
              : 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/40'
          }`}
        >
          {isInIdealRange ? '\u2713 In range' : 'Out of range'}
        </span>
      </div>

      {/* Spectrum bar */}
      <div className="relative h-8 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 via-green-400 to-red-400 shadow-inner">
        {/* Ideal zone highlight */}
        <div
          className="absolute top-0 bottom-0 bg-white/40 border-x-2 border-white/60"
          style={{
            left: `${idealStart}%`,
            width: `${idealEnd - idealStart}%`,
          }}
        />

        {/* Position marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-gray-900 dark:bg-white shadow-lg transition-colors duration-700 ease-out"
          style={{ left: `calc(${position}% - 2px)` }}
        >
          {/* Marker arrow */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[8px] border-transparent border-b-gray-900 dark:border-b-white" />
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{leftLabel}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{centerLabel}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{rightLabel}</span>
      </div>

      {/* Tooltip */}
      <div className="absolute left-0 right-0 bottom-full mb-2 hidden group-hover:block z-10 pointer-events-none">
        <div className="bg-gray-900 text-white text-xs rounded-lg p-4 shadow-xl max-w-xs">
          {tooltip}
          <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    </div>
  )
}

function LastHandSummary({
  hand,
  decisions,
}: {
  hand: NonNullable<AnalysisResult['lastHand']>
  decisions: AnalysisResult['decisions']
}) {
  const boardToShow = hand.fullBoard || hand.board
  const heroResult = evaluateHand(hand.heroCards, boardToShow)
  const villainResult = evaluateHand(hand.villainCards, boardToShow)

  // Debug validation: check for duplicate cards
  const allCards = [...hand.heroCards, ...hand.villainCards, ...boardToShow]
  const uniqueCards = new Set(allCards)
  if (uniqueCards.size !== allCards.length) {
    console.error('DISPLAY ERROR: Duplicate cards detected!', {
      heroCards: hand.heroCards,
      villainCards: hand.villainCards,
      board: boardToShow,
      heroEval: heroResult.description,
      villainEval: villainResult.description,
    })
  }

  // Get decisions for this hand
  const handDecisions = decisions.filter(d => d.handNumber === hand.handNumber)

  // Determine result type
  const heroFolded = hand.actionHistory?.some(
    a => a.actor === 'hero' && a.action === 'folds'
  )
  const villainFolded = hand.actionHistory?.some(
    a => a.actor === 'villain' && a.action === 'folds'
  )

  // Calculate pot won/lost
  let resultAmount = ''
  let resultColor = ''
  let resultLabel = ''

  if (hand.winner === 'hero') {
    resultAmount = `+$${hand.pot}`
    resultColor = 'text-green-600 dark:text-green-400'
    resultLabel = villainFolded ? 'Villain Folded' : 'You Won'
  } else if (hand.winner === 'tie') {
    resultAmount = `+$${Math.floor(hand.pot / 2)}`
    resultColor = 'text-yellow-600 dark:text-yellow-400'
    resultLabel = 'Split Pot'
  } else {
    resultAmount = heroFolded ? 'Folded' : `-$${hand.pot}`
    resultColor = heroFolded ? 'text-gray-500' : 'text-red-600 dark:text-red-400'
    resultLabel = heroFolded ? 'You Folded' : 'Villain Won'
  }

  // Group actions by street for display
  const streets = ['preflop', 'flop', 'turn', 'river', 'showdown'] as const
  const groupedActions: Record<string, ActionEntry[]> = {}
  for (const action of hand.actionHistory || []) {
    if (!groupedActions[action.street]) {
      groupedActions[action.street] = []
    }
    groupedActions[action.street].push(action)
  }

  const formatCard = (card: string) => {
    if (!card || typeof card !== 'string') return '??'
    const suitSymbols: Record<string, string> = {
      s: '\u2660',
      h: '\u2665',
      d: '\u2666',
      c: '\u2663',
    }
    const rank = card.slice(0, -1)
    const suit = card.slice(-1)
    return `${rank}${suitSymbols[suit] || suit}`
  }

  const getActorColor = (actor: string) => {
    switch (actor) {
      case 'hero': return 'text-blue-600 dark:text-blue-400'
      case 'villain': return 'text-red-600 dark:text-red-400'
      case 'dealer': return 'text-gray-500 dark:text-gray-400'
      default: return ''
    }
  }

  const getActorLabel = (actor: string) => {
    switch (actor) {
      case 'hero': return 'You'
      case 'villain': return 'Villain'
      case 'dealer': return 'Dealer'
      default: return actor
    }
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 card-hover">
      <div className="bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4">
        <h3 className="font-semibold text-lg">Final Hand #{hand.handNumber}</h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Result header */}
        <div className="flex items-center justify-between">
          <div>
            <span className={`text-2xl font-bold ${resultColor}`}>{resultAmount}</span>
            <span className="ml-2 text-gray-500 dark:text-gray-400">{resultLabel}</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-4 py-1 rounded-full">
            {hand.heroPosition === 'BTN' ? 'You were Button' : 'You were Big Blind'}
          </span>
        </div>

        {/* Cards display */}
        <div className="flex justify-center mb-6">
          <Board cards={boardToShow} />
        </div>

        {/* Hands */}
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <Hand cards={hand.villainCards} label="Villain" />
            {!heroFolded && !villainFolded && (
              <p className="text-sm mt-4 font-medium">{villainResult.description}</p>
            )}
          </div>
          <div className="text-center">
            <Hand cards={hand.heroCards} label="You" highlight />
            {!heroFolded && !villainFolded && (
              <p className="text-sm mt-4 font-medium">{heroResult.description}</p>
            )}
          </div>
        </div>

        {/* Action History */}
        <div>
          <h4 className="font-semibold text-sm mb-4 text-gray-700 dark:text-gray-300">
            Hand History
          </h4>
          <div className="space-y-4 bg-white dark:bg-gray-900 rounded-2xl p-4 max-h-64 overflow-y-auto border border-gray-100 dark:border-gray-800 shadow-sm">
            {streets.map((street) => {
              const streetActions = groupedActions[street]
              if (!streetActions || streetActions.length === 0) return null

              return (
                <div key={street}>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    {street}
                  </div>
                  <div className="space-y-1">
                    {streetActions.map((action, idx) => (
                      <div key={idx} className="text-sm flex items-center gap-2">
                        <span className={`font-medium ${getActorColor(action.actor)}`}>
                          {getActorLabel(action.actor)}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {action.action}
                          {action.cards && action.cards.length > 0 && (
                            <span className="ml-1 font-mono">
                              [{action.cards.map(formatCard).join(' ')}]
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Decision Analysis */}
        {handDecisions.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-700 dark:text-gray-300">
              Your Decisions
            </h4>
            <div className="space-y-2">
              {handDecisions.map((decision, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl transition-colors duration-200 ${
                    decision.wasOptimal
                      ? 'bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/30 dark:to-green-900/10 border border-green-200 dark:border-green-800'
                      : 'bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/30 dark:to-red-900/10 border border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">
                      {decision.street}: {decision.action}
                      {decision.betAmount ? ` $${decision.betAmount}` : ''}
                    </span>
                    <span className={`flex items-center gap-2 font-medium ${decision.wasOptimal ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs text-white ${decision.wasOptimal ? 'bg-green-500' : 'bg-red-500'}`}>
                        {decision.wasOptimal ? '\u2713' : '\u2717'}
                      </span>
                      {decision.wasOptimal ? 'Optimal' : 'Suboptimal'}
                    </span>
                  </div>
                  {!decision.wasOptimal && (
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Better:</span> {decision.optimalAction} \u2014 {decision.reasoning}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
