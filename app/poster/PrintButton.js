'use client'

/* Screen-only control. Disappears on paper via .no-print. */
export default function PrintButton() {
  return (
    <div className="no-print poster-toolbar">
      <div className="flex flex-wrap gap-3 justify-center">
        {/* The ready-made file: vector QR, embedded fonts, exact A4.
            Hand this to a print shop or send it on WhatsApp. */}
        <a
          href="/qr/Vision-Success-Scan-Me-Poster.pdf"
          download
          className="btn-gold px-7 py-3 rounded-full inline-flex items-center"
        >
          Download the PDF
        </a>
        <button onClick={() => window.print()} className="btn-ghost px-7 py-3 rounded-full">
          Print this page
        </button>
      </div>
      <p className="poster-hint">
        A4 · portrait · print at 100% (no “fit to page”). Plain black ink is fine —
        the code was tested and still scans.
      </p>
    </div>
  )
}
