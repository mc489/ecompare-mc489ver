/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ This is the correct, modern setting
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium-min"],

  // ❌ REMOVED: "experimental" block (caused the warning)

  webpack: (config) => {
    config.externals.push("vertx", "bufferutil", "utf-8-validate");
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;