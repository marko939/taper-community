/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Pre-existing lint warnings in email templates — run `npx next lint` separately
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async redirects() {
    return [
      // Common URL patterns crawlers/users may try
      { source: '/sign-in', destination: '/auth/signin', permanent: true },
      { source: '/sign-up', destination: '/auth/signup', permanent: true },
      { source: '/signin', destination: '/auth/signin', permanent: true },
      { source: '/signup', destination: '/auth/signup', permanent: true },
      { source: '/login', destination: '/auth/signin', permanent: true },
      { source: '/register', destination: '/auth/signup', permanent: true },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias['canvas'] = false;
    }
    return config;
  },
};

export default nextConfig;
