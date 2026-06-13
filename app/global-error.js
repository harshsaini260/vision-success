'use client'

/* Last line of defence — catches crashes in the root layout itself. */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#04090F', color: '#F0EAD6', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
          <div>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>⚠️</div>
            <h1 style={{ fontSize: '28px', margin: '0 0 12px' }}>Something went wrong</h1>
            <p style={{ color: '#9aa3ad', margin: '0 0 24px' }}>Please refresh the page or call us at +91 82192 54332.</p>
            <button
              onClick={() => reset()}
              style={{ background: '#D4AF37', color: '#0A1628', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}
            >
              ↻ Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
