"use client"

import type { ReactNode } from "react"
import { MotionConfig } from "motion/react"

/** Makes every motion animation in the app respect the OS-level
 * prefers-reduced-motion setting automatically, in one place. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
