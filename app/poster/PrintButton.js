'use client'

/* Screen-only control. Disappears on paper via .no-print. */
export default function PrintButton() {
  return (
    <div className="no-print poster-toolbar">
      <button onClick={() => window.print()} className="btn-gold px-7 py-3 rounded-full">
        Print / Save as PDF
      </button>
      <p className="poster-hint">
        A4 · portrait · print at 100% (no “fit to page”). Black ink is fine — the code still scans.
      </p>
    </div>
  )
}
