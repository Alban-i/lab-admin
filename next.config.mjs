/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./styles', './components'],
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
};

export default nextConfig;
