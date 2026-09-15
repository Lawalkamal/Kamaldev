/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      // Add other external image hosts if needed
      {
        protocol: "https",
        hostname: "**.cloudinary.com", // Wildcard for all subdomains
      },
    ],
  },
};

module.exports = nextConfig;
