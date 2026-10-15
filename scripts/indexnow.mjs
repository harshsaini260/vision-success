/* ─── IndexNow — tell Bing (and through it ChatGPT search and Copilot),
   Yandex, Seznam and Naver that the site has changed ───
   Reads the live sitemap and submits every URL in one request. Run after a
   deploy that changes content:   node scripts/indexnow.mjs
   The key below must match the file public/<key>.txt, which proves to the
   search engines that this site owns the submission. */

const HOST = 'visionsuccessuna.com'
const KEY = 'cc4f8e5dc6ef4ae051c879842e7e07fe'

const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text()
const urlList = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]).filter((u) => u.includes(HOST))
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
})
console.log(`IndexNow: ${urlList.length} URLs → HTTP ${res.status}`)
