import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer", "@sparticuz/chromium-min", "puppeteer-core"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle native modules
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push("puppeteer", "better-sqlite3", "@sparticuz/chromium-min");
      }
    }
    return config;
  },
};

export default nextConfig;
