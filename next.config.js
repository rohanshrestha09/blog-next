/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'nlzkqxiojnawyalmkwhf.supabase.co',
      'lh3.googleusercontent.com',
    ],
  },
};

module.exports = nextConfig;
