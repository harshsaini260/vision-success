'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/* ─── useFilm — one film, fetched only once somebody looks at it ───
   The rules every film on this site already follows (BriefingRoom,
   ProofRail, ConceptRail, StudyAbroadFilm), in one place so the wanted
   posters, the quiz and the memory reel cannot drift from them:

     · nothing downloads until the frame is actually on screen
     · the lighter file for small frames and thrifty connections
     · a muted loop while visible, paused the moment it is not
     · reduced-motion visitors get the poster until they press play
     · one voice at a time — a film that turns its sound on tells every
       other film to hush (SOUND_EVENT)
     · play() is called inside the press, before any seek, so the browser
       counts it as the visitor's own gesture

   A film whose `files` change (a lesson with two cuts) swaps source in
   place; with keepTime it carries on from the same second, because both
   cuts of that lesson run to the same length. */

export const SOUND_EVENT = 'film:sound'

/* Silence every film on the page except `except`. `pause` stops the
   muted loops too — the theatre uses it so nothing plays behind it. */
export const hushAll = (except = null, pause = false) =>
  window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: { id: except, pause } }))

/* The theatre has closed: films still on screen pick up their muted loop
   again — nothing scrolled, so the observer would not tell them to. */
export const RESUME_EVENT = 'film:resume'
export const resumeAll = () => window.dispatchEvent(new CustomEvent(RESUME_EVENT))

export function pickSrc(el, files, hiAt = 700) {
  const dense = el.getBoundingClientRect().width * (window.devicePixelRatio || 1) > hiAt
  const c = navigator.connection || {}
  const thrifty = c.saveData || /^((slow-)?2g|3g)$/.test(c.effectiveType || '')
  return dense && !thrifty ? files.hi : files.lo
}

let seq = 0

export default function useFilm(files, { autoplay = true, threshold = 0.4, hiAt = 700, keepTime = false } = {}) {
  /* Callers build `files` fresh on every render; the effects key on the
     two URLs so a playing film is not re-observed four times a second. */
  const { hi, lo } = files
  const ref = useRef(null)
  const id = useRef(null)
  if (id.current === null) id.current = `film-${++seq}`
  const src = useRef('')            // what is on the element right now
  const userPaused = useRef(false)  // a visitor's pause outranks the observer
  const reduced = useRef(false)
  const visible = useRef(false)
  const [s, setS] = useState({ playing: false, sound: false, time: 0, duration: 0, progress: 0, ended: false, seen: false })

  const attach = useCallback(() => {
    const v = ref.current
    if (!v || src.current === hi || src.current === lo) return
    src.current = pickSrc(v, { hi, lo }, hiAt)
    v.src = src.current
    v.load()
  }, [hi, lo, hiAt])

  /* Seek once the file knows its own length — before that, setting
     currentTime is silently ignored. */
  const seek = useCallback((t) => {
    const v = ref.current
    if (!v) return
    const go = () => { try { v.currentTime = t } catch { /* not seekable yet */ } }
    if (v.readyState >= 1) go()
    else v.addEventListener('loadedmetadata', go, { once: true })
  }, [])

  /* A second cut: swap in place, keep playing if it was. */
  useEffect(() => {
    const v = ref.current
    if (!v || !src.current || src.current === hi || src.current === lo) return
    const t = v.currentTime
    const wasPlaying = !v.paused
    src.current = ''
    attach()
    if (keepTime && t > 0) seek(t)
    /* a cut that starts over starts the clock over too — anything timed
       to the film (the quiz's reveal) must not read the old cut's second */
    else setS((p) => ({ ...p, time: 0, progress: 0, ended: false }))
    if (wasPlaying) v.play().catch(() => {})
  }, [hi, lo, attach, keepTime, seek])

  useEffect(() => {
    const v = ref.current
    if (!v) return
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const io = new IntersectionObserver(
      ([e]) => {
        visible.current = e.isIntersecting
        if (e.isIntersecting) {
          setS((p) => (p.seen ? p : { ...p, seen: true }))
          if (!autoplay || reduced.current || userPaused.current) return
          attach()
          v.play().catch(() => {})
        } else if (!v.paused && v.muted) {
          v.pause()
        }
      },
      { threshold },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [attach, autoplay, threshold])

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const on = {
      play: () => setS((p) => ({ ...p, playing: true, ended: false })),
      pause: () => setS((p) => ({ ...p, playing: false })),
      ended: () => setS((p) => ({ ...p, playing: false, ended: true })),
      volumechange: () => setS((p) => ({ ...p, sound: !v.muted })),
      loadedmetadata: () => setS((p) => ({ ...p, duration: v.duration || 0 })),
      timeupdate: () =>
        setS((p) => ({
          ...p,
          time: v.currentTime,
          duration: v.duration || p.duration,
          progress: v.duration ? v.currentTime / v.duration : 0,
        })),
    }
    for (const k in on) v.addEventListener(k, on[k])
    return () => { for (const k in on) v.removeEventListener(k, on[k]) }
  }, [])

  /* One voice at a time. */
  useEffect(() => {
    const hush = (e) => {
      if (e.detail?.id === id.current) return
      const v = ref.current
      if (!v) return
      if (!v.muted) { v.muted = true; v.loop = true }
      if (e.detail?.pause && !v.paused) v.pause()
      else if (!visible.current && !v.paused) v.pause()
    }
    window.addEventListener(SOUND_EVENT, hush)
    return () => window.removeEventListener(SOUND_EVENT, hush)
  }, [])

  useEffect(() => {
    const resume = () => {
      const v = ref.current
      if (!v || !src.current || !visible.current || !autoplay || reduced.current || userPaused.current) return
      if (v.paused) v.play().catch(() => {})
    }
    window.addEventListener(RESUME_EVENT, resume)
    return () => window.removeEventListener(RESUME_EVENT, resume)
  }, [autoplay])

  const toggle = useCallback(() => {
    const v = ref.current
    if (!v) return
    attach()
    if (v.paused) { userPaused.current = false; v.play().catch(() => {}) }
    else { userPaused.current = true; v.pause() }
  }, [attach])

  /* Sound on, from a given second (the start, unless told otherwise —
     nobody should join a sentence halfway through). */
  const soundOn = useCallback((from = 0) => {
    const v = ref.current
    if (!v) return
    attach()
    v.muted = false
    v.loop = false
    userPaused.current = false
    hushAll(id.current)
    v.play().catch(() => {
      /* refused with sound — better a silent film than a dead one */
      v.muted = true
      v.play().catch(() => {})
    })
    if (from !== null) seek(from)
  }, [attach, seek])

  const listen = useCallback(() => {
    const v = ref.current
    if (!v) return
    if (v.muted || !src.current) soundOn(0)
    else { v.muted = true; v.loop = true; v.play().catch(() => {}) }
  }, [soundOn])

  return { ref, id: id.current, ...s, attach, toggle, listen, soundOn, seek }
}
