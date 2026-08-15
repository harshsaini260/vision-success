/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
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
