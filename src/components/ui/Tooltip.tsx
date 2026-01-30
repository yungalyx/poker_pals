'use client'

import { useState } from 'react'

interface TooltipProps {
  term: string
  definition: string
  children: React.ReactNode
}

export function Tooltip({ term, definition, children }: TooltipProps) {
  const [show, setShow] = useState(false)

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onTouchStart={() => setShow(!show)}
    >
      <span className="border-b border-dotted border-blue-400 cursor-help text-blue-600 dark:text-blue-400">
        {children}
      </span>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-lg z-50">
          <span className="font-semibold block mb-1 capitalize">{term}</span>
          <span className="text-gray-300 dark:text-gray-600">{definition}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900 dark:border-t-gray-100" />
        </span>
      )}
    </span>
  )
}
