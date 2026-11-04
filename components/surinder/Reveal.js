'use client'

import { useEffect, useRef, useState } from 'react'

/* ─── seen once, then stays seen ───
   The page reveals itself as you read it: a thing is hidden until it is
   near the screen, then eased in once and left alone. One observer per
   element, disconnected the moment it fires. Where IntersectionObserver
   does not exist, everything is simply shown. (surinder.css shows it all
   to reduced-motion visitors, and the page's <noscript> shows it to
   everyone else.) */
export function useSeen(threshold = 0.18, rootMargin = '0px 0px -6% 0px') {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    if (typeof IntersectionObserver === 'undefined') { setSeen(true); return }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } },
      { threshold, rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen, threshold, rootMargin])
  return [ref, seen]
}

export function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) {
  const [ref, seen] = useSeen()
  return (
    <Tag
      ref={ref}
      className={`sd-rv${seen ? ' is-in' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--d': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
