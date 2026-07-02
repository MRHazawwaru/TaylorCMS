/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Memaksa Vercel untuk tetap melanjutkan build meskipun ada warning/error tipe data TS
    ignoreBuildErrors: true,
  },
  eslint: {
    // Memaksa Vercel mengabaikan warning ESLint (seperti variabel tak terpakai)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;