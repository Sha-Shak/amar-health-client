import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost", port: "4000" },
      // Bulk-imported doctor/hospital photos (§7.5's sasthyaSebaImport.ts).
      { protocol: "https", hostname: "img.sasthyaseba.com" },
    ],
  },
};

export default nextConfig;
