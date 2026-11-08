import { createHmac, randomBytes, timingSafeEqual } from "crypto";

/**
 * Xác thực trang quản lý bằng mật khẩu trong biến môi trường (Vercel → Settings → Environment Variables):
 *   ADMIN_PASSWORD  (bắt buộc)  mật khẩu đăng nhập
 *   ADMIN_SECRET    (khuyên dùng) chuỗi ngẫu nhiên dài để ký cookie; thiếu thì dùng ADMIN_PASSWORD
 * Cookie phiên: "<hết hạn>.<chữ ký HMAC>" — httpOnly, không đọc được từ JavaScript.
 */

export const ADMIN_COOKIE = "inv_admin";
export const ADMIN_SESSION_SECONDS = 7 * 24 * 60 * 60;

function getSecret(): string | null {
  const s = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  return s && s.length > 0 ? s : null;
}

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(`admin:${value}`).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // So sánh qua HMAC để độ dài 2 chuỗi luôn bằng nhau (chống timing attack)
  const k = randomBytes(16).toString("hex");
  return safeEqual(sign(input, k), sign(expected, k));
}

export function createSessionToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const exp = String(Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS);
  return `${exp}.${sign(exp, secret)}`;
}

export function verifySessionToken(token?: string | null): boolean {
  const secret = getSecret();
  if (!secret || !token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (parseInt(exp, 10) < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(sig, sign(exp, secret));
}

/** Đọc cookie phiên từ request và kiểm tra hợp lệ */
export function isAdminRequest(request: Request): boolean {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.split(/;\s*/).find((c) => c.startsWith(`${ADMIN_COOKIE}=`));
  return verifySessionToken(match ? decodeURIComponent(match.slice(ADMIN_COOKIE.length + 1)) : null);
}

/** Mã link ngẫu nhiên, chữ thường + số (tương thích cách chuẩn hóa slug hiện tại) */
export function generateGuestCode(length = 8): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789"; // bỏ ký tự dễ nhầm: l, o, 0, 1
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}
