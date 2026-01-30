'use client'

import type { ReactNode } from 'react'
import { glossary, glossaryTerms } from '@/data/glossary'
import { Tooltip } from './Tooltip'

interface GlossaryTextProps {
  text: string
}

export function GlossaryText({ text }: GlossaryTextProps) {
  // Find all glossary terms in the text and wrap them with tooltips
  const parts: ReactNode[] = []
  let remaining = text
  let keyIndex = 0

  while (remaining.length > 0) {
    // Find the earliest matching term
    let earliestMatch: { term: string; index: number } | null = null

    for (const term of glossaryTerms) {
      // Case-insensitive search
      const index = remaining.toLowerCase().indexOf(term.toLowerCase())
      if (index !== -1) {
        if (!earliestMatch || index < earliestMatch.index) {
          earliestMatch = { term, index }
        }
      }
    }

    if (earliestMatch) {
      // Add text before the match
      if (earliestMatch.index > 0) {
        parts.push(remaining.slice(0, earliestMatch.index))
      }

      // Get the actual text from the string (preserving original case)
      const matchedText = remaining.slice(
        earliestMatch.index,
        earliestMatch.index + earliestMatch.term.length
      )

      // Add the tooltip-wrapped term
      parts.push(
        <Tooltip
          key={`term-${keyIndex++}`}
          term={earliestMatch.term}
          definition={glossary[earliestMatch.term]}
        >
          {matchedText}
        </Tooltip>
      )

      // Continue with the rest of the string
      remaining = remaining.slice(earliestMatch.index + earliestMatch.term.length)
    } else {
      // No more matches, add the rest of the text
      parts.push(remaining)
      break
    }
  }

  return <>{parts}</>
}
