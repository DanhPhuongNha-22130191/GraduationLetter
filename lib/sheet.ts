/**
 * Kết nối Google Apps Script — CHỈ dùng phía server (API routes / middleware).
 * Không import file này từ component "use client": URL và khoá sẽ lộ ra trình duyệt.
 *
 * Biến môi trường (Vercel → Settings → Environment Variables):
 *   GOOGLE_SCRIPT_URL  (bắt buộc)  link .../exec của Apps Script
 *   SHEET_API_KEY      (khuyên dùng) khoá bí mật; Apps Script từ chối mọi request không kèm khoá này
 */

// Dự phòng khi chưa đặt biến GOOGLE_SCRIPT_URL trên Vercel.
// File này chỉ chạy trên server nên link KHÔNG bị gửi xuống trình duyệt.
// Bảo vệ thật sự đến từ API_KEY (Script Properties) — có khoá thì biết link cũng không đọc được.
const FALLBACK_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxiHdEt8xuomf5GZOUMhaEUVkfogpBkxRwDa8ER8PEB2uPbrpP1BGTOLtiENuOlG3meZQ/exec";

export function getScriptUrl(): string {
  return (process.env.GOOGLE_SCRIPT_URL || FALLBACK_SCRIPT_URL).trim();
}

export function isSheetConfigured(): boolean {
  return Boolean(getScriptUrl());
}

function apiKey(): string {
  return (process.env.SHEET_API_KEY || "").trim();
}

/** URL đọc dữ liệu (GET) đã kèm khoá */
export function sheetGetUrl(params: Record<string, string>): string {
  const qs = new URLSearchParams(params);
  const key = apiKey();
  if (key) qs.set("key", key);
  return `${getScriptUrl()}?${qs.toString()}`;
}

/** Đọc toàn bộ dòng của một tab */
export async function sheetGetRows(sheet: string, opts: { fresh?: boolean; action?: string } = {}) {
  if (!isSheetConfigured()) throw new Error("GOOGLE_SCRIPT_URL chưa được cấu hình");
  const params: Record<string, string> = { action: opts.action || `get_${sheet}`, sheet };
  if (opts.fresh !== false) params._t = String(Date.now());
  const res = await fetch(sheetGetUrl(params), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google Script HTTP ${res.status} (${sheet})`);
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`Google Script trả về dữ liệu không hợp lệ (${sheet}): ${JSON.stringify(data).slice(0, 120)}`);
  }
  return data as Record<string, unknown>[];
}

/** Body JSON cho POST tới Apps Script (đã kèm khoá) */
export function sheetBody(payload: Record<string, unknown>): string {
  const key = apiKey();
  return JSON.stringify(key ? { ...payload, apiKey: key } : payload);
}

/** RequestInit cho POST tới Apps Script (đã kèm khoá trong body) */
export function sheetPostInit(payload: Record<string, unknown>): RequestInit {
  const key = apiKey();
  return {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(key ? { ...payload, apiKey: key } : payload),
    cache: "no-store",
  };
}

/** Gửi POST và đọc JSON trả về (nếu đọc được) */
export async function sheetPost(payload: Record<string, unknown>): Promise<{ ok: boolean; status: number; data: Record<string, unknown> | null }> {
  if (!isSheetConfigured()) return { ok: false, status: 0, data: null };
  const res = await fetch(getScriptUrl(), sheetPostInit(payload));
  let data: Record<string, unknown> | null = null;
  try {
    data = await res.json();
  } catch {
    // Apps Script đôi khi trả HTML khi lỗi
  }
  return { ok: res.ok && !(data && (data.error || data.status === "error")), status: res.status, data };
}
