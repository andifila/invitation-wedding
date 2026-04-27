import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true, // required for static export
  },
  // basePath for GitHub Pages: /invitation-wedding
  basePath: process.env.NODE_ENV === "production" ? "/invitation-wedding" : "",
  assetPrefix:
    process.env.NODE_ENV === "production" ? "/invitation-wedding/" : "",
};

export default nextConfig;
