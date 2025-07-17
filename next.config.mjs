/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./styles', './components'],
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '30mb', // Increase from default 1mb to 30mb for media uploads
    },
  },
};

export default nextConfig;
