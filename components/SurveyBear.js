'use client'

/* ─── SURVEY POLA — an expressive host ───
   Pola reacts to the survey: smiles by default, cheers on progress,
   and politely COVERS HER EYES on sensitive questions (name, number,
   money, disappointments) so the student never feels watched.
   Pure SVG + framer transitions; reduced-motion safe. */

import { motion, AnimatePresence } from 'framer-motion'

const CREAM = '#F0EAD6'
const MUZZLE = '#FBF7EA'
const INK = '#0A1628'

export default function SurveyBear({ expression = 'happy', size = 132 }) {
  const shy = expression === 'shy'
  const cheer = expression === 'cheer'

  return (
    <div className="relative inline-block survey-bear" style={{ width: size, height: size }}>
      {/* sparkles on cheer */}
      <AnimatePresence>
        {cheer && (
          <>
            {[['-6%', '6%', 0], ['86%', '2%', 0.1], ['92%', '70%', 0.2], ['-4%', '64%', 0.3]].map(([l, t, d], i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 1, 0], scale: [0.4, 1.1, 0.6], y: -6 }}
                transition={{ duration: 1, delay: d, repeat: Infinity, repeatDelay: 0.4 }}
                className="absolute text-sm"
                style={{ left: l, top: t }}
                aria-hidden
              >
                ✨
              </motion.span>
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.svg
        viewBox="0 0 140 140"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        animate={cheer ? { rotate: [0, -4, 4, 0], y: [0, -6, 0] } : { rotate: 0, y: [0, -3, 0] }}
        transition={cheer ? { duration: 0.6, repeat: Infinity } : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* shadow */}
        <ellipse cx="70" cy="131" rx="40" ry="6" fill="rgba(212,175,55,0.12)" />

        {/* ears */}
        <circle cx="42" cy="34" r="12" fill={CREAM} />
        <circle cx="98" cy="34" r="12" fill={CREAM} />
        <circle cx="42" cy="34" r="5" fill={INK} opacity="0.12" />
        <circle cx="98" cy="34" r="5" fill={INK} opacity="0.12" />

        {/* head */}
        <circle cx="70" cy="62" r="36" fill={CREAM} />

        {/* blush (stronger when shy) */}
        <ellipse cx="49" cy="70" rx="6" ry="3.4" fill="#E05C42" opacity={shy ? 0.5 : 0.3} />
        <ellipse cx="91" cy="70" rx="6" ry="3.4" fill="#E05C42" opacity={shy ? 0.5 : 0.3} />

        {/* eyes: open / cheer(^^) / shy(closed) */}
        <AnimatePresence mode="wait">
          {cheer ? (
            <motion.g key="cheer-eyes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <path d="M52 56 Q57 50 62 56" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M78 56 Q83 50 88 56" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
            </motion.g>
          ) : shy ? (
            <motion.g key="shy-eyes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <path d="M52 58 Q57 62 62 58" stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />
              <path d="M78 58 Q83 62 88 58" stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />
            </motion.g>
          ) : (
            <motion.g key="open-eyes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <circle cx="57" cy="56" r="4" fill={INK} />
              <circle cx="83" cy="56" r="4" fill={INK} />
              <circle cx="58.4" cy="54.6" r="1.3" fill="#FFFDF5" />
              <circle cx="84.4" cy="54.6" r="1.3" fill="#FFFDF5" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* muzzle + nose + mouth */}
        <ellipse cx="70" cy="72" rx="14" ry="10" fill={MUZZLE} />
        <ellipse cx="70" cy="66" rx="4.4" ry="3.2" fill={INK} />
        {cheer ? (
          <path d="M62 74 Q70 84 78 74" stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="rgba(224,92,66,0.25)" />
        ) : (
          <path d="M70 69 Q70 76 76 77" stroke={INK} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        )}

        {/* gold scarf */}
        <path d="M44 92 Q70 106 96 91" stroke="#D4AF37" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M90 96 Q94 106 91 116" stroke="#D4AF37" strokeWidth="6" strokeLinecap="round" fill="none" />

        {/* paws — raised to cover eyes when shy */}
        <motion.g
          animate={shy ? { y: -34, x: -6 } : { y: 0, x: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        >
          <ellipse cx="52" cy="104" rx="11" ry="8" fill={CREAM} />
          <ellipse cx="52" cy="105" rx="6" ry="3.6" fill="#E9E2CF" />
        </motion.g>
        <motion.g
          animate={shy ? { y: -34, x: 6 } : { y: 0, x: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        >
          <ellipse cx="88" cy="104" rx="11" ry="8" fill={CREAM} />
          <ellipse cx="88" cy="105" rx="6" ry="3.6" fill="#E9E2CF" />
        </motion.g>
      </motion.svg>
    </div>
  )
}
