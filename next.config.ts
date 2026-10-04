import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // cacheComponents: true,
  experimental: {
    // حداکثر ۳ تصویر ۳۰۰ کیلوبایتی برای هر محصول + سربار multipart
    // پیش‌فرض Next.js یک مگابایت است که برای ارسال همزمان ۳ تصویر کافی نیست
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;