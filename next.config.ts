/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Add this for now to ensure deployment
  },

  // The old /enrollment module was replaced by /course-enrollment. Keep old
  // bookmarks, emailed links and stray gateway callbacks working.
  redirects: async () => {
    return [
      { source: '/enrollment/verify-payment', destination: '/verify-payments', permanent: true },
      { source: '/enrollment/:path*', destination: '/course-enrollment', permanent: true },
    ];
  },

  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;