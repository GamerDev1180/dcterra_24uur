"use client"

import { useEffect, useRef, useState } from "react"
import { animate, useInView } from "motion/react"

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  formatter?: (value: number) => string
}

/** Counts up to `value` once it scrolls into view. Purely numeric -- for
 * admin-entered display strings with symbols (e.g. "€2.500+"), use Reveal
 * instead rather than trying to parse arbitrary text into a number. */
export function AnimatedCounter({ value, duration = 1, className, formatter }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    })
    return () => controls.stop()
  }, [isInView, value, duration])

  return (
    <span ref={ref} className={className}>
      {formatter ? formatter(display) : display.toLocaleString()}
    </span>
  )
}
