'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

/* Thin gold progress bar under the nav — tells the visitor how far
   they've explored. Pure transform animation, zero layout cost. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, var(--accent-dark), var(--accent), var(--accent-light))',
        boxShadow: '0 0 8px rgba(var(--accent-rgb),0.5)',
      }}
      aria-hidden
    />
  )
}
