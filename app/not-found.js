import Link from 'next/link'

export const metadata = { title: 'Page Not Found' }

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 pt-20"
      style={{ background: 'linear-gradient(180deg, #04090F 0%, #07111F 100%)' }}
    >
      <div className="text-center max-w-md">
        <div
          className="text-8xl font-black mb-4"
          style={{
            fontFamily: 'Orbitron, monospace',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </div>
        <h1 className="text-2xl font-black text-white mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          Mission Coordinates Not Found
        </h1>
        <p className="text-gray-400 mb-8 text-sm">
          This page doesn&apos;t exist. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-gold px-7 py-3.5 rounded-xl text-sm">🏠 Back Home</Link>
          <Link href="/appointment" className="btn-ghost px-7 py-3.5 rounded-xl text-sm">📞 Free Counseling</Link>
        </div>
      </div>
    </div>
  )
}
