import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "4000" },
      // The deployed backend — avatar photos and vault document thumbnails
      // are served from here (apps/api's resolveFileUrl), same as localhost:4000
      // is for local dev.
      { protocol: "https", hostname: "amar-health.onrender.com" },
      // Bulk-imported doctor/hospital photos (§7.5's sasthyaSebaImport.ts).
      { protocol: "https", hostname: "img.sasthyaseba.com" },
      // Google-account avatars — a Google-signup user's avatarUrl points
      // here directly (never proxied through our own backend).
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
