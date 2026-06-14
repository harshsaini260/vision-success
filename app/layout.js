import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import FloatingButtons from '@/components/FloatingButtons'
import { ThemeProvider } from '@/components/ThemeProvider'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { SITE } from '@/lib/site'

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Vision Success Coaching Institute | Best NDA, JEE, NEET Coaching in Una HP',
    template: '%s | Vision Success Una',
  },
  description:
    'Best NDA, JEE, NEET & Foundation coaching in Una, Himachal Pradesh. 500+ NDA selections, small batches, expert faculty, fees per ability. Book a free counseling session today.',
  keywords:
    'NDA coaching Una, JEE coaching Una HP, NEET coaching Himachal Pradesh, best coaching institute Una, SSB interview coaching, foundation coaching Una',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Vision Success Coaching Institute — Una, HP',
    description: 'Where Officers Are Forged. 500+ NDA Selections from Una, Himachal Pradesh.',
    url: SITE.url,
    siteName: SITE.name,
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary',
    title: 'Vision Success Coaching Institute — Una, HP',
    description: 'Best NDA, JEE, NEET & Foundation coaching in Una, Himachal Pradesh.',
  },
  robots: { index: true, follow: true },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#07111F',
}

/* Applies the saved theme color BEFORE first paint — kills the
   gold "flash" users saw before their chosen theme kicked in. */
const themeInitScript = `
(function(){try{
  var t=localStorage.getItem('vs-theme')||'gold';
  var m={gold:['#D4AF37','212, 175, 55'],saffron:['#FF7A00','255, 122, 0'],royal:['#9333EA','147, 51, 234'],emerald:['#10B981','16, 185, 129'],sky:['#0EA5E9','14, 165, 233'],crimson:['#DC2626','220, 38, 38']};
  var v=m[t]||m.gold,r=document.documentElement;
  r.style.setProperty('--accent',v[0]);
  r.style.setProperty('--accent-rgb',v[1]);
  r.setAttribute('data-theme',t);
}catch(e){}})();
`

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'EducationalOrganization'],
  name: SITE.name,
  url: SITE.url,
  telephone: SITE.phoneTel,
  email: SITE.email,
  slogan: SITE.tagline,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Near Old Bus Stand, Near Sabji Mandi, Una, Himachal Pradesh 174303.',
    addressLocality: 'Una',
    addressRegion: 'Himachal Pradesh',
    postalCode: '174303',
    addressCountry: 'IN',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '09:00',
    closes: '14:00',
  },
  sameAs: [SITE.social.facebook, SITE.social.instagram, SITE.social.youtube],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider>
          <Navigation />
          <main>{children}</main>
          <Footer />
          <FloatingButtons />
          <ThemeSwitcher />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#0A1628',
                color: '#F0EAD6',
                border: '1px solid rgba(212,175,55,0.3)',
                fontFamily: 'Inter, sans-serif',
              },
              success: { iconTheme: { primary: '#D4AF37', secondary: '#0A1628' } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
