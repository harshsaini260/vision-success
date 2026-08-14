import CollegeSurvey from './CollegeSurvey'

export const metadata = {
  title: { absolute: 'Career Clarity Survey | Vision Success, Una' },
  description:
    'Five questions about what students in Himachal are never told in time. Under a minute, and you get a certificate of acknowledgement by email.',
  robots: { index: false, follow: false },   // a kiosk page, not a landing page
}

export default function CollegePage() {
  return <CollegeSurvey />
}
