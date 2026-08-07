/** @type {import('next').NextConfig} */
const internalApiBaseUrl = (
  process.env.INTERNAL_API_BASE_URL || "http://backend:7000"
).replace(/\/$/, "");

const nextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${internalApiBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
