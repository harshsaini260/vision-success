import Link from 'next/link'
import { SITE, wa } from '@/lib/site'
import TarunCard from '@/components/TarunCard'
import Logo from '@/components/Logo'
import Icon from '@/components/Icon'

/* Apple HIG: every tappable thing is at least 44 × 44 points. The
   links used to be 20 points tall in a single column; they now sit two
   to a row, 44 points tall — compliant, and the column is shorter than
   it was. Contact rows and social marks use one symbol set instead of
   emoji, so they follow the theme and pass the contrast check. */
const ROW = 'min-h-[44px] flex items-center gap-2.5 hover:text-gold-400 transition-colors'

export default function Footer() {
  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, var(--ink-2) 0%, var(--ink) 100%)',
        borderTop: '1px solid rgba(var(--accent-rgb),0.1)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* BRAND */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div style={{ filter: 'drop-shadow(0 0 6px rgba(var(--accent-rgb),0.4))' }}>
                <Logo size={52} id="foot" />
              </div>
              <div>
                <div
                  className="text-xl font-semibold"
                  style={{
                    fontFamily: 'var(--font-display)',
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
              Una's leading coaching institute. We don't just teach — we build officers,
              engineers, and doctors. One student at a time.
            </p>
            <div className="flex flex-col text-[15px] text-gray-400">
              <div className="min-h-[44px] flex items-center gap-2.5">
                <Icon name="pin" size={18} className="text-gold-400 shrink-0" />
                <span>{SITE.address}</span>
              </div>
              <a href={`tel:${SITE.phoneTel}`} className={`phone-cta ${ROW}`}>
                <Icon name="phone" size={18} className="text-gold-400 shrink-0" />
                <span>{SITE.phoneDisplay}</span>
              </a>
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`whatsapp-cta ${ROW}`}
              >
                <Icon name="whatsapp" size={18} className="text-gold-400 shrink-0" />
                <span>WhatsApp {SITE.contactName}</span>
              </a>
              <a href={`mailto:${SITE.email}`} className={ROW}>
                <Icon name="mail" size={18} className="text-gold-400 shrink-0" />
                <span>{SITE.email}</span>
              </a>
              <div className="min-h-[44px] flex items-center gap-2.5">
                <Icon name="clock" size={18} className="text-gold-400 shrink-0" />
                <span>{SITE.hours}</span>
              </div>
            </div>
            {/* NAP + subjects text — local SEO signal (brief C6) */}
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm mt-5">
              We offer coaching for: Mathematics · Physics · Chemistry · Biology · Class 10 ·
              Class 11 · Class 12 · JEE · NEET · NDA · CUET · Merchant Navy — in Una, Amb,
              Bangana, Haroli, Himachal Pradesh.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4
              className="text-sm font-bold uppercase tracking-widest text-gold-400 mb-5"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              Quick Links
            </h4>
            <ul className="grid grid-cols-2 gap-x-4">
              {[
                { href: '/', label: 'Home' },
                /* The two a visitor most often wants and could not previously
                   reach from a course page: what it costs, and the two-minute
                   questionnaire that asks for nothing. */
                { href: '/fees', label: 'Fees' },
                { href: '/workshop', label: 'Job-Ready Workshop' },
                { href: '/start', label: 'Free Study Plan' },
                { href: '/courses', label: 'Courses' },
                { href: '/coaching-in-una', label: 'Coaching in Una' },
                /* The study-abroad desk had no footer row at all, and
                   /ielts-coaching-una had no link from any rendered
                   surface on the site — the sitemap published it to
                   Google and a visitor could not reach it. */
                { href: '/sat', label: 'SAT Coaching' },
                { href: '/ielts-coaching-una', label: 'IELTS Coaching' },
                { href: '/nda-coaching-una', label: 'NDA Coaching' },
                { href: '/jee-coaching-una', label: 'JEE Coaching' },
                { href: '/neet-coaching-una', label: 'NEET Coaching' },
                { href: '/maths-coaching-una', label: 'Maths Coaching' },
                { href: '/physics-coaching-una', label: 'Physics Coaching' },
                { href: '/chemistry-coaching-una', label: 'Chemistry Coaching' },
                { href: '/biology-coaching-una', label: 'Biology Coaching' },
                { href: '/enroll', label: 'Enroll Now' },
                { href: '/materials', label: 'Materials' },
                { href: '/reviews', label: 'Reviews' },
                { href: '/appointment', label: 'Book Counseling' },
                { href: '/schools', label: 'For Schools' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="min-h-[44px] text-[15px] text-gray-400 hover:text-gold-400 transition-colors flex items-center"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
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
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              Follow Us
            </h4>
            <div className="flex gap-3 mb-8">
              {[
                {
                  href: 'https://www.facebook.com/share/18UW6amdDh/',
                  icon: 'facebook',
                  label: 'Facebook',
                  color: '#1877F2',
                },
                {
                  href: 'https://instagram.com/visionsuccessuna',
                  icon: 'instagram',
                  label: 'Instagram',
                  color: '#E1306C',
                },
                {
                  href: 'https://youtube.com/@visionsuccessuna',
                  icon: 'youtube',
                  label: 'YouTube',
                  color: '#FF0000',
                },
                {
                  href: `https://wa.me/${SITE.whatsapp}`,
                  icon: 'whatsapp',
                  label: 'WhatsApp',
                  color: '#25D366',
                },
              ].map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.label} — Vision Success`}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    color: 'var(--bone)',
                  }}
                >
                  <Icon name={s.icon} size={20} />
                </a>
              ))}
            </div>

            <TarunCard />
            <a
              href={wa(`Namaste ${SITE.contactName}! Please add me to Vision Success updates.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 min-h-[44px] text-[15px] font-semibold text-gold-400 hover:underline flex items-center gap-1.5 whatsapp-cta"
            >
              Get updates on WhatsApp <Icon name="arrowRight" size={16} />
            </a>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-gray-500"
          style={{ borderTop: '1px solid rgba(var(--accent-rgb),0.08)' }}
        >
          <p>© {new Date().getFullYear()} Vision Success Coaching Institute, Una, Himachal Pradesh. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <span className="text-red-500">❤️</span>
            <span>for Una&apos;s future officers</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
