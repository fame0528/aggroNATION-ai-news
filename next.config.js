/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // Migrated from deprecated images.domains to remotePatterns for finer control
    remotePatterns: [
      // YouTube domains
      { protocol: 'https', hostname: 'www.youtube.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      
      // News and content sites
      { protocol: 'https', hostname: 'www.wired.com' },
      { protocol: 'https', hostname: 'media.wired.com' },
      { protocol: 'https', hostname: 'knowtechie.com' },
      { protocol: 'https', hostname: 'cdn.knowtechie.com' },
      
      // Dev.to and related domains
      { protocol: 'https', hostname: 'dev.to' },
      { protocol: 'https', hostname: 'media.dev.to' },
      { protocol: 'https', hostname: 'media2.dev.to' },
      { protocol: 'https', hostname: 'dev-to-uploads.s3.amazonaws.com' },
      
      // AI and tech sites
      { protocol: 'https', hostname: 'huggingface.co' },
      { protocol: 'https', hostname: 'cdn-thumbnails.huggingface.co' },
      { protocol: 'https', hostname: 'hackernoon.com' },
      { protocol: 'https', hostname: 'cdn.hackernoon.com' },
      { protocol: 'https', hostname: 'export.arxiv.org' },
      
      // Newsletter and blog sites
      { protocol: 'https', hostname: 'aimodels.substack.com' },
      { protocol: 'https', hostname: 'substackcdn.com' },
      { protocol: 'https', hostname: 'the-decoder.com' },
      { protocol: 'https', hostname: 'www.artificialintelligence-news.com' },
      
      // Common CDN and image hosting
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      
      // Twitter/X image domains
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: 'abs.twimg.com' },
      { protocol: 'https', hostname: 'video.twimg.com' },
      
      // GitHub avatar and content domains
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      
      // Additional AI/tech platform images
      { protocol: 'https', hostname: 'cdn.openai.com' },
      { protocol: 'https', hostname: 'www.anthropic.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' }
    ],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    EMAIL_SERVER: process.env.EMAIL_SERVER,
    EMAIL_FROM: process.env.EMAIL_FROM,
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  webpack: (config, { dev }) => {
    // Disable all caching in development
    if (dev) {
      config.cache = false;
      config.snapshot = { managedPaths: [] };
    }
    return config;
  },
};

module.exports = nextConfig;