import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  // Standalone repo: shared schemas live in lib/shared.ts; next resolves
  // all packages from this directory's own node_modules.
  turbopack: {
    root: path.join(__dirname, ".."),
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "@react-three/fiber", "@react-three/drei"],
  },
};

export default nextConfig;
