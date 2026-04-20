import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mark these packages as server-only externals — works with both Turbopack and webpack
  serverExternalPackages: [
    "puppeteer",
    "puppeteer-core",
    "@sparticuz/chromium-min",
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3",
    "pg",
  ],
};

export default nextConfig;
