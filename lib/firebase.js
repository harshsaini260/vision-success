import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

/* ─── REAL PROJECT KEYS (vision-success-e05b4) ───
   Hardcoded as fallbacks so the site NEVER white-screens when
   .env.local is missing on the host. NEXT_PUBLIC Firebase keys are
   public by design — they ship in the browser bundle either way.
   Real security lives in Firestore Rules (see firestore.rules). */
const FALLBACK = {
  apiKey: 'AIzaSyBo2AbB75E2TWoqcJ0oGhY-fCuga6yCyEI',
  authDomain: 'vision-success-e05b4.firebaseapp.com',
  projectId: 'vision-success-e05b4',
  storageBucket: 'vision-success-e05b4.firebasestorage.app',
  messagingSenderId: '689667380328',
  appId: '1:689667380328:web:968bed97f1ed76b89057dd',
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
