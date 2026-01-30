'use client'

import { forwardRef } from 'react'
import type { AnalysisResult } from '@/types/analysis'

interface ShareCardProps {
  analysis: AnalysisResult
}

// Determine player profile type
function getPlayerProfile(vpip: number, pfr: number, aggression: number) {
  const isLoose = vpip > 30
  const isTight = vpip < 22
  const isAggressive = pfr > 15 || aggression > 1.5
  const isPassive = pfr < 12 && aggression < 1.2

  if (isLoose && isAggressive) {
    return { abbrev: 'LAG', name: 'Loose Aggressive', color: '#ef4444' }
  } else if (isTight && isAggressive) {
    return { abbrev: 'TAG', name: 'Tight Aggressive', color: '#22c55e' }
  } else if (isLoose && isPassive) {
    return { abbrev: 'LP', name: 'Loose Passive', color: '#eab308' }
  } else if (isTight && isPassive) {
    return { abbrev: 'TP', name: 'Tight Passive', color: '#3b82f6' }
  } else {
    return { abbrev: 'BAL', name: 'Balanced', color: '#a855f7' }
  }
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard({ analysis }, ref) {
    const { handsPlayed, profit, overallScore, playStyle, reachedTarget } = analysis
    const profile = getPlayerProfile(playStyle.vpip, playStyle.pfr, playStyle.aggression)

    return (
      <div
        ref={ref}
        style={{
          width: 400,
          padding: 24,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 16,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: 'white',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            {'\u{1F0A1}'}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Poker Pals</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Analysis Mode Results</div>
          </div>
        </div>

        {/* Result banner */}
        <div
          style={{
            background: reachedTarget
              ? 'rgba(34, 197, 94, 0.2)'
              : profit >= 0
                ? 'rgba(234, 179, 8, 0.2)'
                : 'rgba(239, 68, 68, 0.2)',
            borderRadius: 12,
            padding: 16,
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 32 }}>
            {reachedTarget ? '\u{1F3C6}' : profit >= 0 ? '\u{1F4B0}' : '\u{1F4C9}'}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: profit >= 0 ? '#22c55e' : '#ef4444',
            }}
          >
            {profit >= 0 ? '+' : ''}${profit}
          </div>
          <div style={{ fontSize: 14, color: '#94a3b8' }}>in {handsPlayed} hands</div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {/* Score */}
          <div
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: 12,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color:
                  overallScore >= 80 ? '#22c55e' : overallScore >= 60 ? '#eab308' : '#ef4444',
              }}
            >
              {overallScore}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>
              Score
            </div>
          </div>

          {/* Profile */}
          <div
            style={{
              flex: 1,
              background: profile.color,
              borderRadius: 12,
              padding: 12,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700 }}>{profile.abbrev}</div>
            <div style={{ fontSize: 10, opacity: 0.9 }}>{profile.name}</div>
          </div>
        </div>

        {/* Stats breakdown */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{playStyle.vpip}%</div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>VPIP</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{playStyle.pfr}%</div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>PFR</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{playStyle.aggression.toFixed(1)}</div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>Aggression</div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: '#64748b',
          }}
        >
          pokerpals.com
        </div>
      </div>
    )
  }
)
