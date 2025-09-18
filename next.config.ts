// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        // allow both /object/public/... and /object/sign/...
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;