/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  /* The films are the heaviest thing this site serves and they never
     change once published — a new cut gets a new filename. Without this
     they are revalidated on every visit; with it a returning phone pays
     for them exactly once. */
  async headers() {
    return [
      {
        source: '/video/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      /* The expense tracker is the institute's private ledger: never indexed,
         and its page and service worker always checked for a newer build. */
      {
        source: '/expense-tracker/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/expense-tracker',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'no-cache' }],
      },
      {
        source: '/expense-tracker/:file(index\\.html|sw\\.js|manifest\\.webmanifest)',
        headers: [{ key: 'Cache-Control', value: 'no-cache' }],
      },
    ]
  },
  /* /expense-tracker is a single-page app copied into public/expense-tracker
     (built in the twenty-hearths repo, tools/vs-host.mjs). Its files are
     served as they are; every other path under it is a screen of the app,
     so it gets the app's index.html. afterFiles: after public/, before the
     [slug] route, which would otherwise claim /expense-tracker. */
  async rewrites() {
    return {
      afterFiles: [
        { source: '/expense-tracker', destination: '/expense-tracker/index.html' },
        { source: '/expense-tracker/:path((?!.*\\.).*)', destination: '/expense-tracker/index.html' },
      ],
    }
  },
  /* The online NDA course was withdrawn in August 2026. The URL was
     indexed, so it redirects permanently to the classroom NDA page
     rather than 404-ing anyone arriving from search. */
  async redirects() {
    return [
      { source: '/online-nda-course', destination: '/courses/nda', permanent: true },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },
}

export default nextConfig
