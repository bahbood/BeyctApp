// drizzle.config.ts
import {config} from "dotenv"
import { defineConfig } from 'drizzle-kit';

config(); // بارگذاری متغیرهای محیطی

export default defineConfig({
  schema: './app/db/schema/index.ts',  // مسیر فایل‌های schema شماapp/db/schema/index.ts
  out: './app/db/migrations',          // محل ذخیره migration‌ها
  dialect: 'postgresql',               // نوع دیتابیس: 'postgresql', 'mysql', 'sqlite'
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,    // نمایش جزئیات بیشتر در خروجی
  strict: true,     // بررسی دقیق‌تر migration‌ها
});