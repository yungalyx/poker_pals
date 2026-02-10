'use client'

import { forwardRef } from 'react'
import type { AnalysisResult } from '@/types/analysis'

interface ShareCardProps {
  analysis: AnalysisResult
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard({ analysis }, ref) {
    const { handsPlayed, profit, overallScore, playStyle, reachedTarget, playerArchetype, transparencyScore } = analysis
    const profile = {
      abbrev: playerArchetype.abbrev,
      name: playerArchetype.archetype,
      gradient: playerArchetype.gradient,
    }

    return (
      <div
        ref={ref}
        style={{
          width: 400,
          padding: 32,
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)',
          borderRadius: 24,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow effect */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(0,255,245,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, position: 'relative' }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              boxShadow: '0 8px 24px rgba(168,85,247,0.4)',
            }}
          >
            {'\u{1F0A1}'}
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Poker Pals</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Analysis Mode Results</div>
          </div>
        </div>

        {/* Result banner */}
        <div
          style={{
            background: reachedTarget
              ? 'linear-gradient(135deg, rgba(0,212,170,0.2) 0%, rgba(0,255,245,0.1) 100%)'
              : profit >= 0
                ? 'linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(251,191,36,0.1) 100%)'
                : 'linear-gradient(135deg, rgba(255,46,99,0.2) 0%, rgba(255,107,157,0.1) 100%)',
            borderRadius: 20,
            padding: 20,
            textAlign: 'center',
            marginBottom: 24,
            border: reachedTarget
              ? '1px solid rgba(0,255,245,0.2)'
              : profit >= 0
                ? '1px solid rgba(251,191,36,0.2)'
                : '1px solid rgba(255,107,157,0.2)',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>
            {reachedTarget ? '\u{1F3C6}' : profit >= 0 ? '\u{1F4B0}' : '\u{1F4C9}'}
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              background: profit >= 0
                ? 'linear-gradient(135deg, #00d4aa 0%, #00fff5 100%)'
                : 'linear-gradient(135deg, #ff2e63 0%, #ff6b9d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {profit >= 0 ? '+' : ''}${profit}
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginTop: 4 }}>
            in {handsPlayed} hands
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {/* Score */}
          <div
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 16,
              padding: 16,
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                background:
                  overallScore >= 80
                    ? 'linear-gradient(135deg, #00d4aa 0%, #00fff5 100%)'
                    : overallScore >= 60
                      ? 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)'
                      : 'linear-gradient(135deg, #ff2e63 0%, #ff6b9d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {overallScore}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
              Score
            </div>
          </div>

          {/* Profile */}
          <div
            style={{
              flex: 1,
              background: profile.gradient,
              borderRadius: 16,
              padding: 16,
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 800 }}>{profile.abbrev}</div>
            <div style={{ fontSize: 11, opacity: 0.9, fontWeight: 600 }}>{profile.name}</div>
          </div>
        </div>

        {/* Stats breakdown */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{playStyle.vpip}%</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>VPIP</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{playStyle.pfr}%</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>PFR</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{playStyle.aggression.toFixed(1)}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>AGG</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{transparencyScore.tScore}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>T-SCORE</div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
            fontWeight: 600,
          }}
        >
          pokerpals.com
        </div>
      </div>
    )
  }
)
