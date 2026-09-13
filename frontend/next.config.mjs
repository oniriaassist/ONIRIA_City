import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const configuredInternalApiBaseUrl = process.env.INTERNAL_API_BASE_URL?.trim();
if (process.env.NODE_ENV === "production" && !configuredInternalApiBaseUrl) {
  throw new Error(
    "INTERNAL_API_BASE_URL is required for production builds (for example https://your-api.vercel.app)."
  );
}

const internalApiBaseUrl = (
  configuredInternalApiBaseUrl || "http://127.0.0.1:7000"
).replace(/\/$/, "");
const projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  devIndicators: false,
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    root: projectRoot,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${internalApiBaseUrl}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
