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
    ]
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
