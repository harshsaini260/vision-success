/* ─── SINGLE SOURCE OF TRUTH for institute info ───
   Change these once, the whole website updates. */

export const SITE = {
  name: 'Vision Success Coaching Institute',
  shortName: 'Vision Success',
  tagline: 'Where Officers Are Forged',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://visionsuccessuna.com',
  phoneDisplay: '+91 82192 54332',
  phoneTel: '+918219254332',
  whatsapp: '918219254332',
  email: 'info@visionsuccessuna.com',
  address: 'Near District Hospital, Main Bazaar, Una, Himachal Pradesh 174303',
  hours: 'Mon–Sat: 7:00 AM – 7:00 PM',
  social: {
    facebook: 'https://www.facebook.com/share/18UW6amdDh/',
    instagram: 'https://instagram.com/visionsuccessuna',
    youtube: 'https://youtube.com/@visionsuccessuna',
  },
}

export const wa = (text) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`

export const COURSE_OPTIONS = [
  'NDA Coaching',
  'JEE Mains',
  'JEE Advanced',
  'NEET Coaching',
  'Class 9 Foundation',
  'Class 10 Coaching',
  'Class 11 Coaching',
  'Class 12 Coaching',
  'Dropper Batch',
]
