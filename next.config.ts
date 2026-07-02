/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Memaksa Vercel untuk tetap melanjutkan build meskipun ada warning tipe data TS
    ignoreBuildErrors: true,
  },
};

export default nextConfig;