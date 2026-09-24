/* ─── SINGLE SOURCE OF TRUTH for institute info ───
   Change these once, the whole website updates. */

export const SITE = {
  name: 'Vision Success Coaching Institute',
  shortName: 'Vision Success',
  tagline: 'Where Officers Are Forged',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://visionsuccessuna.com',
  phoneDisplay: '+91 62833 27481',
  phoneTel: '+916283327481',
  whatsapp: '916283327481',
  /* The person who answers that number — calls and WhatsApp. The site
     uses his name where a human answer is what people are after. */
  contactName: 'Tarun',
  email: 'info@visionsuccessuna.com',
  address: 'Near Old Bus Stand, Near Sabji Mandi, Una, Himachal Pradesh 174303',
  hours: 'Mon–Sat: 9:00 AM – 2:00 PM',
  social: {
    facebook: 'https://www.facebook.com/share/18UW6amdDh/',
    instagram: 'https://instagram.com/visionsuccessuna',
    youtube: 'https://youtube.com/@visionsuccessuna',
  },
}

export const wa = (text) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`

/* The single highest-converting link on the site — used by the header
   button, hero CTA, popup, and lead form. */
export const DEMO_WA = wa('Namaste! Free Demo Class book karna hai 🙏')

export const COURSE_OPTIONS = [
  'NDA Coaching',
  'SAT (Study Abroad)',
  'IELTS (English for Abroad)',
  'JEE Mains',
  'JEE Advanced',
  'NEET Coaching',
  'HP TET (Teaching)',
  'Govt Jobs (HPSSC / Sarkari)',
  'CUET Coaching',
  'Merchant Navy (IMU CET)',
  'Maths Tuition',
  'Physics Tuition',
  'Chemistry Tuition',
  'Biology Tuition',
  'Class 9 Foundation',
  'Class 10 Coaching',
  'Class 11 Coaching',
  'Class 12 Coaching',
  'Dropper Batch',
]
