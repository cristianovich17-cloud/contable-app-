/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones de compilación
  swcMinify: true,
  compress: true,
  
  // Optimizaciones de imagen
  images: {
    minimumCacheTTL: 60,
    formats: ['image/webp'],
  },
  
  // Optimizaciones de performance
  experimental: {
    optimizePackageImports: ['@/'],
  },
  
  // Headers para cache
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
