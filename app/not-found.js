import Link from 'next/link'

export const metadata = { title: 'Page Not Found' }

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 pt-20"
      style={{ background: 'linear-gradient(180deg, var(--ink) 0%, var(--ink-2) 100%)' }}
    >
      <div className="text-center max-w-md">
        <div
          className="text-8xl font-semibold mb-4"
          style={{
            fontFamily: 'var(--font-ui)',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </div>
        <h1 className="text-2xl font-semibold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          Mission Coordinates Not Found
        </h1>
        <p className="text-gray-400 mb-8 text-sm">
          Oops! Yeh page nahi mila. Par aap yahan hain — toh kya hum help kar sakte hain?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/appointment" className="btn-gold px-7 py-3.5 rounded-xl text-sm">
            📅 Book Free Demo
          </Link>
          <Link href="/" className="btn-ghost px-7 py-3.5 rounded-xl text-sm">🏠 Back Home</Link>
          <Link href="/courses" className="btn-ghost px-7 py-3.5 rounded-xl text-sm">📚 See Courses</Link>
        </div>
      </div>
    </div>
  )
}
