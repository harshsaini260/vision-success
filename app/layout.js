import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navigation from '@/components/Navigation'
import IndependenceBand from '@/components/IndependenceBand'
import Footer from '@/components/Footer'
import FloatingButtons from '@/components/FloatingButtons'
import { ThemeProvider } from '@/components/ThemeProvider'
import DemoPrompt from '@/components/DemoPrompt'
import ScrollProgress from '@/components/ScrollProgress'
import Analytics from '@/components/Analytics'
import StickyActionBar from '@/components/StickyActionBar'
import PortalHost from '@/components/workshop/PortalHost'
import { SITE, OG_IMAGE } from '@/lib/site'
import { DEVANAGARI_TEXT } from '@/lib/defence'

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Vision Success, Una — NDA, Merchant Navy, JEE, NEET & SAT Coaching',
    template: '%s | Vision Success',
  },
  description:
    'Coaching in Una, HP: NDA (7+ officers trained), Merchant Navy (IMU-CET), JEE, NEET, SAT & IELTS, Class 9–12. NIT Hamirpur faculty, published fees, free demo class.',
  keywords:
    'NDA coaching Una, NEET coaching Una HP, JEE coaching Una, SAT coaching Una, SAT coaching Himachal Pradesh, IELTS coaching Una, IELTS Una HP, study abroad Una, study abroad consultant Himachal, coaching institute Una, best coaching institute Una, coaching centre near me Una, physics coaching Una, chemistry coaching Una, biology coaching Una, maths coaching Una, CUET coaching Una, merchant navy coaching Una, tuition Una, coaching Amb, coaching Mehatpur, coaching Gagret, entrance exam coaching Himachal, SAT classes near Chandigarh, digital SAT prep India',
  alternates: { canonical: '/' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Vision Success, Una — NDA · Merchant Navy · JEE · NEET · SAT · IELTS',
    description:
      'NDA (7+ officers) · Merchant Navy (IMU-CET) · NEET · JEE · Class 9–12 · plus Una\'s study-abroad desk: SAT & IELTS. NIT Hamirpur faculty. Published fees. Free demo class.',
    url: SITE.url,
    siteName: SITE.name,
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vision Success, Una — NDA · Merchant Navy · JEE · NEET · SAT · IELTS',
    description:
      'NDA (7+ officers) · Merchant Navy · NEET · JEE · Class 9–12 · SAT & IELTS. Published fees. Free demo class.',
  },
  robots: { index: true, follow: true },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B1119',
}

/* Applies the saved theme color BEFORE first paint — kills the
   gold "flash" users saw before their chosen theme kicked in. */
const themeInitScript = `
(function(){try{
  var t=localStorage.getItem('vs-theme')||'gold';
  var m={gold:['#C8A951','200, 169, 81'],saffron:['#C4712A','196, 113, 42'],royal:['#6E4E96','110, 78, 150'],emerald:['#3E7D63','62, 125, 99'],sky:['#3D6E96','61, 110, 150'],crimson:['#9B2F3A','155, 47, 58']};
  var v=m[t]||m.gold,r=document.documentElement;
  r.style.setProperty('--accent',v[0]);
  r.style.setProperty('--accent-rgb',v[1]);
  r.setAttribute('data-theme',t);
}catch(e){}})();
`

/* ─── WHO WE ARE, FOR MACHINES ───
   One connected graph instead of a lone LocalBusiness: the institute
   (#organization), the website (#website) and how they relate. Search
   engines and AI assistants build an "entity" for a business from
   exactly this — the names it goes by, where it is, what it teaches, how
   to reach it — and an entity they are sure of is one they will name in
   an answer. Every value restates lib/site.js or what the pages publish;
   /about and /llms.txt say the same things in prose. */
const ORG_ID = `${SITE.url}/#organization`
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['EducationalOrganization', 'LocalBusiness'],
      '@id': ORG_ID,
      name: SITE.name,
      alternateName: ['Vision Success', 'Vision Success Una', 'Vision Success Coaching Institute Una', 'Vision Success Coaching Centre Una'],
      url: SITE.url,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/icon.svg` },
      image: `${SITE.url}/opengraph-image.png`,
      telephone: SITE.phoneTel,
      email: SITE.email,
      slogan: SITE.tagline,
      priceRange: '₹₹',
      currenciesAccepted: 'INR',
      description:
        'Coaching institute in Una, Himachal Pradesh, India: NDA (Army, Navy, Air Force) with SSB interview training, ' +
        'the Merchant Navy (IMU-CET), JEE, NEET, CUET, SAT and IELTS for study abroad, Class 9–12 Maths, Physics, ' +
        'Chemistry and Biology (CBSE and HP Board), and HP government jobs. NIT Hamirpur faculty; every fee is published.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Near Old Bus Stand, Near Sabji Mandi',
        addressLocality: 'Una',
        addressRegion: 'Himachal Pradesh',
        postalCode: '174303',
        addressCountry: 'IN',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 31.4686, longitude: 76.2655 },
      hasMap: 'https://www.google.com/maps/search/?api=1&query=Vision+Success+Coaching+Institute+Una+Himachal+Pradesh',
      areaServed: [
        ...['Una', 'Amb', 'Bangana', 'Haroli', 'Daulatpur', 'Mehatpur'].map((name) => ({ '@type': 'City', name })),
        { '@type': 'AdministrativeArea', name: 'Una district, Himachal Pradesh' },
      ],
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '14:00',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'admissions',
        telephone: SITE.phoneTel,
        email: SITE.email,
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi'],
      },
      knowsAbout: [
        'NDA exam preparation', 'SSB interview', 'Indian Air Force', 'Indian Navy', 'Indian Army',
        'Merchant Navy', 'IMU-CET', 'Nautical Science', 'Marine Engineering',
        'JEE Main', 'JEE Advanced', 'NEET UG', 'CUET', 'SAT', 'IELTS', 'Study abroad',
        'CBSE Class 10', 'CBSE Class 12', 'HP Board', 'HP TET',
        'Mathematics', 'Physics', 'Chemistry', 'Biology',
      ],
      founder: {
        '@type': 'Person',
        name: 'Founder, Vision Success Coaching Institute',
        alumniOf: { '@type': 'CollegeOrUniversity', name: 'NIT Hamirpur' },
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Coaching Services',
        itemListElement: [
          'NDA Coaching Una',
          'Merchant Navy (IMU-CET) Coaching Una',
          'JEE Coaching Una',
          'NEET Coaching Una',
          'SAT Coaching Una',
          'IELTS Coaching Una',
          'CUET Coaching Una',
          'Mathematics Coaching Una',
          'Physics Coaching Una',
          'Chemistry Coaching Una',
          'Biology Coaching Una',
          'Class 10 Coaching Una',
          'Class 11 Coaching Una',
          'Class 12 Coaching Una',
        ].map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
      },
      sameAs: [SITE.social.facebook, SITE.social.instagram, SITE.social.youtube],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.shortName,
      alternateName: SITE.name,
      inLanguage: 'en-IN',
      publisher: { '@id': ORG_ID },
    },
  ],
}

/* GA4 measurement id — public by design, it ships in the browser bundle
   either way (same reasoning as the Firebase keys in lib/firebase.js).
   Hardcoded fallback so analytics always works; NEXT_PUBLIC_GA_ID in
   Vercel overrides it if ever set. Meta Pixel stays env-only. */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-CY90NP87FT'
/* The old property (owned by harshsaini0502@gmail.com). Analytics now lives
   with visionsuccessuna@gmail.com, the same account as the Google Business
   Profile, in the property linked to the Firebase project (G-CY90NP87FT).
   The old one keeps receiving data for a while so its history is not cut
   off mid-month; set this to '' to stop it. */
const GA_LEGACY_ID = 'G-K10JSW896P'
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

const gaScript = GA_ID
  ? `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:false});${GA_LEGACY_ID ? `gtag('config','${GA_LEGACY_ID}',{send_page_view:false});` : ''}
document.addEventListener('click',function(e){var a=e.target.closest('a.whatsapp-cta,button.whatsapp-cta');if(a){gtag('event','whatsapp_click',{event_category:'conversion'});}var p=e.target.closest('a.phone-cta');if(p){gtag('event','phone_click',{event_category:'conversion'});}});`
  : ''

const pixelScript = PIXEL_ID
  ? `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`
  : ''

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700;800&family=Caveat:wght@600;700&family=Cinzel:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* The services' mottos in Devanagari: only the glyphs those few
            words use (lib/defence.js → DEVANAGARI_TEXT), a few kilobytes. */}
        <link
          href={`https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Sanskrit&display=swap&text=${encodeURIComponent(DEVANAGARI_TEXT)}`}
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
          <main>
            <IndependenceBand />
            {children}
          </main>
          <Footer />
          <FloatingButtons />
          <StickyActionBar />
          {/* The workshop's payment portal. Holds no payment code until someone
              asks to register; outside <main> so none of main's global form
              rules reach into it. */}
          <PortalHost />
          <DemoPrompt />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'var(--ink-3)',
                color: 'var(--bone)',
                border: '1px solid rgba(212,175,55,0.3)',
                fontFamily: 'Inter, sans-serif',
              },
              success: { iconTheme: { primary: '#D4AF37', secondary: 'var(--ink-3)' } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
