"use client"

import type { ReactNode } from "react"
import { motion } from "motion/react"

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}

/**
 * Fades/slides content in once as it scrolls into view. Global reduced-motion
 * handling comes from the <MotionConfig reducedMotion="user"> wrapper in
 * app/layout.tsx, so this component doesn't need its own check.
 */
export function Reveal({ children, className, delay = 0, y = 20 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

/** Wrap a list of <StaggerItem> children to have them cascade in on scroll. */
export function StaggerGroup({ children, className, staggerDelay = 0.08 }: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
      }}
    >
      {children}
    </motion.div>
  )
}
