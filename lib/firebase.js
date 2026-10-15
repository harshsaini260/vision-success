import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

/* ─── REAL PROJECT KEYS (visionsucccessw) ───
   Moved on 15 October 2026 from vision-success-e05b4 (owned by
   harshsaini0502@gmail.com) to visionsucccessw, owned by
   visionsuccessuna@gmail.com — the same Google account as the Business
   Profile and Analytics. Every document (262) and every login (57, with
   their passwords) was copied across; the admin email is unchanged.
   Hardcoded as fallbacks so the site NEVER white-screens when
   .env.local is missing on the host. NEXT_PUBLIC Firebase keys are
   public by design — they ship in the browser bundle either way.
   Real security lives in Firestore Rules (see firestore.rules). */
const FALLBACK = {
  apiKey: 'AIzaSyDs5Mtwm_kYW4_Yq-pWpDndvMZDaHBRF2o',
  authDomain: 'visionsucccessw.firebaseapp.com',
  projectId: 'visionsucccessw',
  storageBucket: 'visionsucccessw.firebasestorage.app',
  messagingSenderId: '366882459608',
  appId: '1:366882459608:web:fabc1d9663dd068e5cecad',
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || FALLBACK.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || FALLBACK.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || FALLBACK.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || FALLBACK.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || FALLBACK.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || FALLBACK.appId,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)
export default app
