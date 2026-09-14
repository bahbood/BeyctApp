// app/components/(captchCMP)/action/createCaptchaImageAction.ts
'use server';

import sharp from 'sharp';
import { randomUUID } from 'crypto';

// کش ساده سراسری (در محیط production از Redis استفاده کنید)
const captchaStore = new Map<string, { text: string; expiresAt: number }>();

// تعریف نوع برای globalThis
declare global {
  var _captchaCleanupInterval: NodeJS.Timeout | undefined;
}

// تابع پاکسازی خودکار (هر 5 دقیقه یکبار اجرا می‌شود)
if (!globalThis._captchaCleanupInterval) {
  globalThis._captchaCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [id, data] of captchaStore.entries()) {
      if (data.expiresAt < now) {
        captchaStore.delete(id);
      }
    }
  }, 5 * 60 * 1000);
  
  globalThis._captchaCleanupInterval.unref?.();
}

export async function createCaptchaImageAction(length: number = 5) {
  // ایجاد یک بافر خالی برای شروع
  let svgString = `
    <svg width="210" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="210" height="40" fill="#f0f0f0"/>
  `;
  
  // تولید نقاط رنگی تصادفی
  const numDots = 30 + Math.floor(Math.random() * 30);
  
  for (let i = 0; i < numDots; i++) {
    const x = Math.random() * 230;
    const y = Math.random() * 40;
    const radius = 1.2 + Math.random() * 4;
    const hue = Math.random() * 360;
    const opacity = 0.2 + Math.random() * 0.3;
    const w = 26 + Math.random() * 2;
    const h = 50 + Math.random() * 6;
    
    svgString += `
      <circle cx="${x}" cy="${y}" r="${radius}" 
              fill="hsl(${hue}, 70%, 55%)" 
              opacity="${opacity}"/>
    `;

    //  svgString += `
    //   <rect x="${x}" y="${y}" width="${w}" height="${h}"
    //           fill="hsl(${hue}, 70%, 55%)" 
    //           opacity="${opacity}"/>
    // `;
  }

  // تولید 12 حرف تصادفی برای پس زمینه
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let backgroundText = '';
  for (let i = 0; i < 10; i++) {
    backgroundText += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // اضافه کردن حروف پس زمینه
  for (let i = 0; i < backgroundText.length; i++) {
    const hue = Math.random() * 360;
    const x = 3 + i * 20;
    const y = 35 + (Math.random() - 0.5) * 10;
    const rotate = (Math.random() - 0.5) * 30;
    const fontSize = 38 + Math.random() * 4;
    
    svgString += `
      <text x="${x}" y="${y}" font-size="${fontSize}" font-family="Arial" 
            fill="hsl(${hue}, 60%, 70%)" 
            opacity="0.35"
            transform="rotate(${rotate}, ${x}, ${y})">
        ${backgroundText[i]}
      </text>
    `;
  }
  
  // تولید متن اصلی کپچا
  let text = '';
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // اضافه کردن حروف اصلی کپچا
  for (let i = 0; i < text.length; i++) {
    const hue = Math.random() * 360;
    const x = 15 + i * 40;
    const y = 30 + (Math.random() - 0.5) * 4;
    const rotate = (Math.random() - 0.5) * 28;
    const fontSize = 26 + Math.random() * 4;
    
    svgString += `
      <text x="${x}" y="${y}" font-size="${fontSize}" font-family="Arial" 
            fill="hsl(${hue}, 75%, 40%)" 
            font-weight="bold"
            opacity="0.9"
            transform="rotate(${rotate}, ${x}, ${y})">
        ${text[i]}
      </text>
    `;
  }
  
  svgString += `</svg>`;
  
  // تبدیل SVG به PNG
  const buffer = await sharp(Buffer.from(svgString))
    .png()
    .toBuffer();
  
  const image = `data:image/png;base64,${buffer.toString('base64')}`;
  
  // تولید ID یکتا و ذخیره در کش با زمان انقضای ۲ دقیقه
  const captchaId = randomUUID();
  const expiresAt = Date.now() + 2 * 60 * 1000; // ۲ دقیقه
  
  captchaStore.set(captchaId, {
    text: text,
    expiresAt: expiresAt
  });
  
  // برگرداندن فقط captchaId و image
  return {
    captchaId: captchaId,
    image: image
  };
}

// تابع کمکی برای اعتبارسنجی کپچا (در اکشن لاگین استفاده می‌شود)
// export async function verifyCaptcha(captchaId: string, userInput: string): Promise<boolean> {
//   const captchaData = captchaStore.get(captchaId);
  
//   // اگر کپچا وجود نداشت یا منقضی شده بود
//   if (!captchaData || captchaData.expiresAt < Date.now()) {
//     if (captchaData) captchaStore.delete(captchaId);
//     return false;
//   }
  
//   // بررسی برابری (حساس به حروف بزرگ و کوچک)
//   const isValid = captchaData.text.toLowerCase() === userInput.toLowerCase();
  
//   // یکبار مصرف - حذف از کش بعد از استفاده
//   captchaStore.delete(captchaId);
  
//   return isValid;
// }


export async function verifyCaptcha(
  captchaId: string,
  userInput: string
): Promise<boolean> {

  const captchaData = captchaStore.get(captchaId);

  if (!captchaData || captchaData.expiresAt < Date.now()) {
    if (captchaData) {
      captchaStore.delete(captchaId);
    }
    return false;
  }

  const isValid =
    captchaData.text.toLowerCase() === userInput.toLowerCase();

  // فقط در صورت موفق بودن حذف شود
  if (isValid) {
    captchaStore.delete(captchaId);
  }

  return isValid;
}