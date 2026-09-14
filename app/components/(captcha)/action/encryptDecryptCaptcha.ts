import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// const SECRET_KEY_HEX = process.env.NEXT_PUBLIC_CAPTCHA_SECRET_KEY as string; // انتظار می‌رود یک رشته 64 کاراکتری هگزادسیمال باشد
const SECRET_KEY_HEX = process.env.CAPTCHA_SECRET_KEY as string; // انتظار می‌رود یک رشته 64 کاراکتری هگزادسیمال باشد

//const SECRET_KEY_HEX ="2db3fa605f461b0e1ab77624579d283391425019ee6caa424bf475cc8a463524"

// تبدیل رشته هگزادسیمال کلید به بافر 32 بایتی
const SECRET_KEY_BUFFER = Buffer.from(SECRET_KEY_HEX.toString(), 'hex');

// بررسی طول کلید پس از تبدیل به بافر
if (SECRET_KEY_BUFFER.length !== 32) {
  throw new Error('CAPTCHA_SECRET_KEY must be a 32-byte string (64 hex characters) after conversion to buffer.');
}

const IV_LENGTH = 16; // AES معمولا از IV با طول 16 بایت (128 بیت) استفاده می‌کند

/**
 * رشته متنی را رمزنگاری می‌کند.
 * @param {string} text - متنی که قرار است رمزنگاری شود.
 * @returns {string} - رشته رمزنگاری شده (IV + متن رمز شده) به صورت هگزادسیمال، جدا شده با ':'.
 */
export function encryptCaptcha(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY_BUFFER, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * رشته رمزنگاری شده را رمزگشایی می‌کند.
 * @param {string} text - رشته رمزنگاری شده (IV + متن رمز شده) که باید رمزگشایی شود.
 * @returns {string | null} - متن رمزگشایی شده در صورت موفقیت، در غیر این صورت null.
 */
export function decryptCaptcha(text: string): string | null {
  try {
    const textParts = text.split(':');
    if (textParts.length !== 2) {
      console.error("Invalid encrypted text format. Expected 'IV:encryptedText'.");
      return null;
    }

    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = textParts[1];

    if (iv.length !== IV_LENGTH) {
      console.error("Invalid IV length. Expected 16 bytes.");
      return null;
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY_BUFFER, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error("Error decrypting captcha:", error);
    return null;
  }
}