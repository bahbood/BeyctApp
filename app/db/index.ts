// تنظیم اتصال به دیتابیس
// app/db/index.ts
import { config } from "dotenv";
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// بارگذاری متغیرهای محیطی
config();

// if (!process.env.DATABASE_URL) {
//   throw new Error('❌ app/db/index.ts : DATABASE_URL is not defined in .env file');
// }

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,              // حداکثر تعداد اتصالات همزمان
  idleTimeoutMillis: 30000,  // بستن اتصالات بیکار بعد از 30 ثانیه
});

export const db = drizzle({ client: pool, schema });