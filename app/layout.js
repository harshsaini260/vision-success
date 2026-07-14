import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import FloatingButtons from '@/components/FloatingButtons'
import { ThemeProvider } from '@/components/ThemeProvider'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import DemoPrompt from '@/components/DemoPrompt'
import ScrollProgress from '@/components/ScrollProgress'
import Analytics from '@/components/Analytics'
import { SITE } from '@/lib/site'

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'NDA, NEET, JEE, SAT & IELTS Coaching in Una HP | Vision Success',
    template: '%s | Vision Success Una',
  },
  description:
    'Vision Success Coaching Institute Una — NDA coaching (7+ officers trained), NEET & JEE prep, and Una\'s first study-abroad desk with SAT & IELTS training. Class 10–12 Maths, Physics, Chemistry, Biology by NIT Hamirpur faculty. Free demo class.',
  keywords:
    'NDA coaching Una, NEET coaching Una HP, JEE coaching Una, SAT coaching Una, SAT coaching Himachal Pradesh, IELTS coaching Una, IELTS Una HP, study abroad Una, coaching institute Una, physics coaching Una, chemistry coaching Una, biology coaching Una, maths coaching Una, CUET coaching Una, merchant navy coaching Una, tuition Una',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'NDA · NEET · JEE · SAT · IELTS — Vision Success Una',
    description:
      'NDA (7+ officers) · NEET · JEE · Class 10–12 · plus Una\'s first study-abroad desk: SAT & IELTS. NIT Hamirpur faculty. Free demo class.',
    url: SITE.url,
    siteName: SITE.name,
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary',
    title: 'NDA · NEET · JEE · SAT · IELTS — Vision Success Una',
    description:
      'NDA (7+ officers) · NEET · JEE · Class 10–12 · SAT & IELTS study-abroad desk. Free demo class.',
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
  logo: `${SITE.url}/icon.svg`,
  telephone: SITE.phoneTel,
  email: SITE.email,
  slogan: SITE.tagline,
  priceRange: '₹₹',
  description:
    'Best coaching institute in Una, Himachal Pradesh. NDA, JEE, NEET, CUET, Merchant Navy preparation plus Una\'s first study-abroad desk (SAT & IELTS). Expert Maths, Physics, Chemistry, Biology coaching for Class 10, 11, 12 by NIT Hamirpur alumnus.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Near Old Bus Stand, Near Sabji Mandi',
    addressLocality: 'Una',
    addressRegion: 'Himachal Pradesh',
    postalCode: '174303',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 31.4686,
    longitude: 76.2655,
  },
  areaServed: ['Una', 'Amb', 'Bangana', 'Haroli', 'Daulatpur', 'Mehatpur', 'Una district'],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '09:00',
    closes: '14:00',
  },
  founder: {
    '@type': 'Person',
    name: 'Founder, Vision Success Coaching Institute',
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'NIT Hamirpur' },
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Coaching Services',
    itemListElement: [
      'Mathematics Coaching Una',
      'Physics Coaching Una',
      'Chemistry Coaching Una',
      'Biology Coaching Una',
      'NDA Coaching Una',
      'JEE Coaching Una',
      'NEET Coaching Una',
      'SAT Coaching Una',
      'IELTS Coaching Una',
      'CUET Coaching Una',
      'Merchant Navy Coaching Una',
      'Class 10 Coaching Una',
      'Class 11 Coaching Una',
      'Class 12 Coaching Una',
    ].map((name) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name },
    })),
  },
  sameAs: [SITE.social.facebook, SITE.social.instagram, SITE.social.youtube],
}

/* GA4 measurement id — public by design, it ships in the browser bundle
   either way (same reasoning as the Firebase keys in lib/firebase.js).
   Hardcoded fallback so analytics always works; NEXT_PUBLIC_GA_ID in
   Vercel overrides it if ever set. Meta Pixel stays env-only. */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-K10JSW896P'
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

const gaScript = GA_ID
  ? `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:false});
document.addEventListener('click',function(e){var a=e.target.closest('a.whatsapp-cta,button.whatsapp-cta');if(a){gtag('event','whatsapp_click',{event_category:'conversion'});}var p=e.target.closest('a.phone-cta');if(p){gtag('event','phone_click',{event_category:'conversion'});}});`
  : ''

const pixelScript = PIXEL_ID
  ? `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`
  : ''

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
        {GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: gaScript }} />
          </>
        )}
        {PIXEL_ID && <script dangerouslySetInnerHTML={{ __html: pixelScript }} />}
      </head>
      <body>
        <ThemeProvider>
          <Analytics />
          <ScrollProgress />
          <Navigation />
          <main>{children}</main>
          <Footer />
          <FloatingButtons />
          <DemoPrompt />
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
