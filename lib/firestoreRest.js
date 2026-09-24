/* ─── FIRESTORE OVER REST, FOR SERVER ROUTES ───
   The site has no service account and no firebase-admin, on purpose: the
   Firestore rules are the only security layer, and they are tested. So
   server routes talk to Firestore the same way a browser does —
     · anonymously, for documents the rules make public
     · with the signed-in admin's own ID token, for everything else,
   which means an admin-only route cannot do anything the admin could not
   do from the panel. If the token is not an admin's, Firestore itself
   says no, and the route passes that refusal straight back. */

const PROJECT = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vision-success-e05b4'
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBo2AbB75E2TWoqcJ0oGhY-fCuga6yCyEI'
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`

/* Firestore's typed JSON → plain values, for the handful of types we store. */
function unwrap(v) {
  if (!v || typeof v !== 'object') return null
  if ('stringValue' in v) return v.stringValue
  if ('integerValue' in v) return Number(v.integerValue)
  if ('doubleValue' in v) return v.doubleValue
  if ('booleanValue' in v) return v.booleanValue
  if ('timestampValue' in v) return v.timestampValue
  if ('nullValue' in v) return null
  if ('mapValue' in v) return fromFields(v.mapValue.fields || {})
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(unwrap)
  return null
}
export const fromFields = (fields = {}) =>
  Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, unwrap(v)]))

const headers = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

/* One document, or null if it does not exist. Throws {status} when the
   rules refuse, so a route can tell "empty" from "not allowed". */
export async function getDocRest(path, token) {
  const r = await fetch(`${BASE}/${path}?key=${API_KEY}`, { headers: headers(token), cache: 'no-store' })
  if (r.status === 404) return null
  if (!r.ok) throw Object.assign(new Error('firestore ' + r.status), { status: r.status })
  const j = await r.json()
  return { id: j.name.split('/').pop(), ...fromFields(j.fields) }
}

/* Every document in a collection, following page tokens. */
export async function listDocsRest(collection, token) {
  const out = []
  let pageToken = ''
  for (let guard = 0; guard < 20; guard++) {
    const url = `${BASE}/${collection}?key=${API_KEY}&pageSize=300${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`
    const r = await fetch(url, { headers: headers(token), cache: 'no-store' })
    if (!r.ok) throw Object.assign(new Error('firestore ' + r.status), { status: r.status })
    const j = await r.json()
    for (const d of j.documents || []) out.push({ id: d.name.split('/').pop(), ...fromFields(d.fields) })
    if (!j.nextPageToken) break
    pageToken = j.nextPageToken
  }
  return out
}

/* Stamp one timestamp field on many documents in a single commit. */
export async function stampRest(collection, ids, field, token) {
  if (!ids.length) return
  const now = new Date().toISOString()
  const writes = ids.map((id) => ({
    update: {
      name: `projects/${PROJECT}/databases/(default)/documents/${collection}/${id}`,
      fields: { [field]: { timestampValue: now } },
    },
    updateMask: { fieldPaths: [field] },
    currentDocument: { exists: true },
  }))
  const r = await fetch(`${BASE.replace(/\/documents$/, '')}/documents:commit?key=${API_KEY}`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ writes }),
  })
  if (!r.ok) throw Object.assign(new Error('firestore commit ' + r.status), { status: r.status })
}

/* The public workshop config, cached for a minute per server instance —
   the receipt email reads it on every registration. */
let cfgCache = { at: 0, data: {} }
export async function workshopConfig(path) {
  if (Date.now() - cfgCache.at < 60_000) return cfgCache.data
  try {
    const d = await getDocRest(path)
    cfgCache = { at: Date.now(), data: d || {} }
  } catch {
    cfgCache = { at: Date.now(), data: cfgCache.data || {} }
  }
  return cfgCache.data
}
