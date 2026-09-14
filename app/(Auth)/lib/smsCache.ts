// app/(Auth)/lib/smsCache.ts

interface SmsCacheEntry {
  code: string;
  expiresAt: number;
}

const smsCache = new Map<string, SmsCacheEntry>();

const TTL_MS = 5 * 60 * 1000;

export function setSmsCode(mobile: string, code: string): void {
  smsCache.set(mobile, {
    code,
    expiresAt: Date.now() + TTL_MS,
  });
}

export function verifySmsCode(mobile: string, code: string): boolean {
  const entry = smsCache.get(mobile);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    smsCache.delete(mobile);
    return false;
  }
  if (entry.code !== code) return false;
  smsCache.delete(mobile);
  return true;
}

export function generateSmsCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}
