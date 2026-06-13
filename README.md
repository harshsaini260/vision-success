# 🎖️ Vision Success Coaching Institute — Website

Next.js 15 website for Vision Success, Una HP — NDA, JEE, NEET & Foundation coaching.
Connected to Firebase project **vision-success-e05b4** (already wired in, with built-in
fallbacks so the site works even if `.env.local` goes missing on a host).

---

## 🚀 Run It Locally (2 minutes)

```bash
cd vision-success
npm install
npm run dev
```

Open **http://localhost:3000**

Production build check:

```bash
npm run build
npm start
```

---

## 🌐 Hosting — Read This Before Anything Else

This is a **Next.js app, not plain HTML** — you cannot just unzip it into a normal
"public_html" folder. Pick one of these:

### Option A — Vercel (FREE, recommended, ~10 minutes)
Vercel is made by the Next.js team. Free plan is enough for this site.

1. Create a free account at **vercel.com** (sign in with Google/GitHub)
2. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Vision Success website"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```
3. In Vercel: **Add New → Project → Import** your repo → **Deploy** (defaults are fine)
4. *(Optional but smart)* Project → Settings → Environment Variables → add everything
   from `.env.local`. The site works without this (keys have fallbacks), but env vars
   keep things tidy and let you change the legacy admin password without editing code.
5. Project → Settings → Domains → connect your domain
   (then update `NEXT_PUBLIC_SITE_URL` to match and redeploy)

### Option B — Your own VPS / server with Node.js 18+
```bash
npm install
npm run build
npm start          # serves on port 3000 — put nginx/caddy in front
```

### Option C — Shared "cPanel" style hosting
Only works if your host offers **"Setup Node.js App"** (many Indian hosts do).
Create a Node app pointing at this folder, run `npm install` and `npm run build`
in its terminal, set the start command to `npm start`. If your host has no Node
support, use Option A — it's free anyway.

---

## 🔥 Firebase Setup (one-time, ~5 minutes)

### 1. Publish the security rules
Firebase Console → **vision-success-e05b4** → Firestore Database → **Rules** →
paste the contents of **`firestore.rules`** (in this folder) → **Publish**.

These rules let students submit forms and read published content, while locking
all admin operations behind a login. No composite indexes are needed — the site's
queries were rewritten to work index-free.

### 2. Create your admin login (Firebase Auth)
1. Firebase Console → **Authentication** → **Get started**
2. **Sign-in method** tab → enable **Email/Password** → Save
3. **Users** tab → **Add user** → your email + a strong password

That email + password is now your **real** admin login at `/admin`.

> **Why not just the old password?** The old `NEXT_PUBLIC_ADMIN_PASSWORD` ships
> inside the public JavaScript bundle — anyone pressing F12 could read it, and it
> never actually protected the database. It still works as a "legacy" login, but
> only if you use the open rules variant (bottom of `firestore.rules`), which is
> not recommended.

---

## 🔐 Admin Panel — `/admin`

| Tab | What it does |
|---|---|
| **Appointments** | Free-counseling bookings → mark pending / contacted / completed / cancelled, call or WhatsApp in one tap |
| **Enrollments** | NEW — admission requests from `/enroll` → mark new / contacted / admitted / closed |
| **Materials** | Add/publish/unpublish/delete study materials (paste a Google Drive or YouTube link) |
| **Reviews** | Approve student reviews before they appear publicly |

Login with your **Firebase email + password** (from Admin Setup above).
Leave email empty to use the legacy site password instead (open-rules mode only).

---

## 🗂️ Pages

| Page | URL |
|---|---|
| Home (with FAQ) | `/` |
| Courses | `/courses` |
| **Enroll (NEW admission form)** | `/enroll` |
| Book Free Counseling | `/appointment` |
| Study Materials | `/materials` |
| Reviews | `/reviews` |
| Admin Panel | `/admin` |

Pre-select a course in links you share:
`/enroll?course=NDA` · `/appointment?course=NEET` — great for WhatsApp status.

---

## 🖼️ Add Your Real Photos

Drop photos into `public/images/` with these exact names (SVG placeholders show
until you do): `award1.jpg`, `nda-mug.jpg`, `group.jpg`, `award2.jpg`,
`birthday.jpg`, `banner.jpg`.
Tip: compress them first at squoosh.app (target < 200 KB each) — keeps the site fast.

## ✏️ Change Phone / Address / Social Links

Edit **`lib/site.js`** — one file updates the entire website.

---

## 🔧 What Was Fixed & Added (June 2026 overhaul)

**Database connection (the "blank / Coming Soon" bug)**
- All public queries used `where()+orderBy()` together → Firestore demands a
  composite index for that → the query silently failed → pages showed "Coming
  Soon" forever. Rewritten as index-free queries with client-side sorting.
- Admin queries were blocked by the recommended security rules; the panel now
  signs in with Firebase Auth so rules allow it.
- Firebase keys hardcoded as fallbacks in `lib/firebase.js` — a missing
  `.env.local` on the host can no longer white-screen the entire site.
- Forms that fail to save show a one-tap **"Send on WhatsApp"** rescue button
  with all details pre-filled — a lead is never lost.

**Performance (the "laggy" bug)**
- Animated background cut from 80+25 always-on DOM nodes to 28/16 on desktop,
  14/10 on phones, zero for reduced-motion users.
- `box-shadow` / `text-shadow` per-frame animations replaced with
  compositor-friendly opacity animation (the gold pulse looks the same).
- `backdrop-filter: blur` removed from cards — the single biggest GPU cost on
  budget phones.
- Duplicate render-blocking Google-Fonts `@import` removed (fonts loaded twice).
- Gallery images lazy-load; broken-image retry loop fixed.

**New features**
- **`/enroll`** — full admission form (student + parent + course + mode) writing
  to a new `enrollments` collection, with spam honeypot.
- **Admin → Enrollments tab**, WhatsApp quick-action on every lead, logout button.
- **Firebase Auth admin login** (email/password) with clear error guidance.
- **FAQ section** on the home page (native `<details>`, zero JS).
- Error pages, styled 404, loading screens — blank white screens are impossible now.
- Favicon, `sitemap.xml`, `robots.txt`, per-page SEO titles & descriptions,
  richer LocalBusiness structured data, theme no longer flashes gold on load.
- Theme switcher now recolors the *whole* site (hardcoded gold converted to CSS
  variables everywhere).

**Known limitation (honest note)**
The legacy admin password is visible to anyone who reads the site's JavaScript —
that's why the Firebase Auth login + locked rules above are strongly recommended.
