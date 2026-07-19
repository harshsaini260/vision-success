'use client'

import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

/* Gold progress bar under the nav — with Pola walking along it.
   The little bear rides the tip of the bar as you explore, bobbing
   as she goes. Pure transform animation, zero layout cost. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 })
  const bearX = useTransform(scaleX, (v) => `calc(${v * 100}vw - ${18 * v}px)`)

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left"
        style={{
          scaleX,
          background: 'linear-gradient(90deg, var(--accent-dark), var(--accent), var(--accent-light))',
          boxShadow: '0 0 8px rgba(var(--accent-rgb),0.5)',
        }}
        aria-hidden
      />
      {/* Pola rides the bar tip */}
      <motion.div
        className="fixed top-[2px] left-0 z-[61] pointer-events-none select-none scroll-bear"
        style={{ x: bearX, fontSize: 15, lineHeight: 1 }}
        aria-hidden
      >
        🐻‍❄️
      </motion.div>
    </>
  )
}
