import { handleUpload } from '@vercel/blob/client'
import { NextResponse } from 'next/server'

/* ─── /api/upload — admin-only video/poster uploads to Vercel Blob ───
   Files go browser → Blob directly (so big videos never pass through
   this function and can't hit the serverless body limit). This route
   only issues the signed token, and it does so ONLY after verifying
   the caller is genuinely signed in as the owner.

   Verification without the Admin SDK: we hand the Firebase ID token
   to Google's identitytoolkit lookup endpoint and check the email it
   returns. A forged token fails there, so this cannot be bypassed by
   editing the client bundle. */

const OWNER_EMAIL = 'harshsaini0502@gmail.com'
const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBo2AbB75E2TWoqcJ0oGhY-fCuga6yCyEI'

async function isOwner(idToken) {
  if (!idToken) return false
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    )
    if (!res.ok) return false
    const data = await res.json()
    const user = data?.users?.[0]
    return !!user && user.email === OWNER_EMAIL && user.emailVerified !== false
  } catch {
    return false
  }
}

const ALLOWED = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v',
  'image/jpeg',
  'image/png',
  'image/webp',
]

export async function POST(request) {
  const body = await request.json()

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        /* clientPayload carries the admin's Firebase ID token */
        let token = null
        try {
          token = JSON.parse(clientPayload || '{}').idToken
        } catch {
          token = clientPayload
        }
        if (!(await isOwner(token))) {
          throw new Error('Not authorised — sign in as the site owner to upload.')
        }
        return {
          allowedContentTypes: ALLOWED,
          addRandomSuffix: true,
          maximumSizeInBytes: 500 * 1024 * 1024, // 500 MB per file
          tokenPayload: JSON.stringify({ pathname }),
        }
      },
      onUploadCompleted: async () => {
        /* Nothing to do server-side: the admin panel writes the
           Firestore record once the client upload resolves. */
      },
    })
    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
