import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #07111F 0%, #04090F 100%)',
        borderTop: '1px solid rgba(var(--accent-rgb),0.1)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* BRAND */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-light))' }}
              >
                <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                  <path d="M20 4L36 32H4Z" fill="#0A1628" opacity="0.9" />
                  <circle cx="20" cy="28" r="4" fill="#0A1628" />
                </svg>
              </div>
              <div>
                <div
                  className="text-xl font-black"
                  style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  VISION SUCCESS
                </div>
                <div className="text-xs text-gray-500">Coaching Institute, Una HP</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-5">
              Una's leading NDA, JEE & Foundation coaching institute. We don't just teach — we
              build officers, engineers, and doctors. One student at a time.
            </p>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>Near District Hospital, Main Bazaar, Una HP 174303</span>
              </div>
              <a href="tel:+918219254332" className="flex items-center gap-2 hover:text-gold-400 transition-colors">
                <span>📞</span>
                <span>+91 82192 54332</span>
              </a>
              <a href="mailto:info@visionsuccessuna.com" className="flex items-center gap-2 hover:text-gold-400 transition-colors">
                <span>✉️</span>
                <span>info@visionsuccessuna.com</span>
              </a>
              <div className="flex items-center gap-2">
                <span>🕐</span>
                <span>Mon–Sat: 7:00 AM – 7:00 PM</span>
              </div>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4
              className="text-sm font-bold uppercase tracking-widest text-gold-400 mb-5"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Home' },
                { href: '/courses', label: 'Courses' },
                { href: '/enroll', label: 'Enroll Now' },
                { href: '/materials', label: 'Materials' },
                { href: '/reviews', label: 'Reviews' },
                { href: '/appointment', label: 'Book Counseling' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-gold-400 transition-colors flex items-center gap-2 group"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    <span
                      className="text-gold-500/30 group-hover:text-gold-500 transition-colors"
                    >
                      →
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SOCIAL & COURSES */}
          <div>
            <h4
              className="text-sm font-bold uppercase tracking-widest text-gold-400 mb-5"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              Follow Us
            </h4>
            <div className="flex gap-3 mb-8">
              {[
                {
                  href: 'https://www.facebook.com/share/18UW6amdDh/',
                  icon: 'f',
                  label: 'Facebook',
                  color: '#1877F2',
                },
                {
                  href: 'https://instagram.com/visionsuccessuna',
                  icon: '📷',
                  label: 'Instagram',
                  color: '#E1306C',
                },
                {
                  href: 'https://youtube.com/@visionsuccessuna',
                  icon: '▶',
                  label: 'YouTube',
                  color: '#FF0000',
                },
                {
                  href: 'https://wa.me/918219254332',
                  icon: '💬',
                  label: 'WhatsApp',
                  color: '#25D366',
                },
              ].map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all hover:-translate-y-1"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: s.color,
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(var(--accent-rgb),0.06)', border: '1px solid rgba(var(--accent-rgb),0.15)' }}
            >
              <p className="text-xs text-gray-400 mb-3">Get updates on WhatsApp</p>
              <a
                href="https://wa.me/918219254332?text=Hi! Please add me to Vision Success updates"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-gold-400 hover:underline flex items-center gap-1"
              >
                Join WhatsApp Group →
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600"
          style={{ borderTop: '1px solid rgba(var(--accent-rgb),0.08)' }}
        >
          <p>© {new Date().getFullYear()} Vision Success Coaching Institute, Una HP. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span>Built with</span>
              <span className="text-red-500">❤️</span>
              <span>for Una&apos;s future officers</span>
            </div>
            <span aria-hidden="true">·</span>
            <Link href="/admin" className="hover:text-gold-400 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
