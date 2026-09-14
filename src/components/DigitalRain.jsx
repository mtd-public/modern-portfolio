import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'

const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const COLUMN_POSITIONS = [8, 22, 36, 50, 64, 78, 92]

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]
}

function buildColumns() {
  return COLUMN_POSITIONS.map((left, i) => ({
    left,
    duration: 2.6 + (i % 3) * 0.6,
    delay: -(i * 0.4),
    chars: Array.from({ length: 9 + (i % 3) }, () => randomChar()),
  }))
}

export default function DigitalRain() {
  const shouldReduceMotion = useReducedMotion()
  const columns = useMemo(buildColumns, [])

  if (shouldReduceMotion) return null

  return (
    <div className="laptop3d-rain" aria-hidden="true">
      {columns.map((column, i) => (
        <div
          key={i}
          className="rain-column"
          style={{
            left: `${column.left}%`,
            animationDuration: `${column.duration}s`,
            animationDelay: `${column.delay}s`,
          }}
        >
          {column.chars.map((char, j) => (
            <span key={j} style={{ opacity: 0.15 + (j / column.chars.length) * 0.85 }}>
              {char}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
