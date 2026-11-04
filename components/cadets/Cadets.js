'use client'

import { CHAPTER } from '@/lib/cadets'
import CadetsStage from './CadetsStage'

/* /surinder · Chapter III — The Cadets. The stage, in its chapter dress
   (the kicker reads "Chapter III · The Cadets"). */
export default function Cadets() {
  return <CadetsStage copy={CHAPTER} chapter />
}
