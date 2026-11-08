/**
 * Chuẩn hóa ngày từ Google Sheet một cách độc lập với múi giờ.
 *
 * Google Apps Script serialize ô kiểu Date thành ISO UTC (vd: ngày 04/12/2026 ở VN
 * -> "2026-12-03T17:00:00.000Z"). Nếu cắt chuỗi hoặc parse bằng múi giờ của máy
 * (server Vercel chạy UTC, khách ở nước ngoài...) sẽ bị lệch 1 ngày.
 * => Mọi chuỗi có giờ/múi giờ đều được quy về lịch Việt Nam (Asia/Ho_Chi_Minh).
 */

export const EVENT_TIME_ZONE = "Asia/Ho_Chi_Minh";
const DEFAULT_YEAR = 2026;

export interface DateParts {
  d: number;
  m: number; // 1-12
  y: number;
}

function partsInEventTz(date: Date): DateParts | null {
  if (isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const get = (t: string) => parseInt(parts.find((p) => p.type === t)?.value || "0", 10);
  return { d: get("day"), m: get("month"), y: get("year") };
}

function valid(p: DateParts | null): DateParts | null {
  if (!p) return null;
  const { d, m, y } = p;
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1) return null;
  const maxDay = new Date(y, m, 0).getDate();
  return d <= maxDay ? p : null;
}

export function parseSheetDate(raw?: unknown): DateParts | null {
  if (raw === undefined || raw === null) return null;
  if (raw instanceof Date) return valid(partsInEventTz(raw));
  const s = String(raw).trim();
  if (!s) return null;

  // ISO có giờ (vd "2026-12-03T17:00:00.000Z") -> quy đổi sang ngày ở VN
  if (/^\d{4}-\d{1,2}-\d{1,2}T/.test(s)) return valid(partsInEventTz(new Date(s)));

  // Bỏ phần giờ đi kèm kiểu "30/10/2026 00:00:00"
  const cleaned = s.replace(/\s+\d{1,2}:\d{2}(:\d{2})?$/, "").trim();

  let m: RegExpMatchArray | null;
  if ((m = cleaned.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/))) {
    return valid({ d: +m[1], m: +m[2], y: +m[3] });
  }
  if ((m = cleaned.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/))) {
    return valid({ y: +m[1], m: +m[2], d: +m[3] });
  }
  if ((m = cleaned.match(/^(\d{1,2})[/\-.](\d{1,2})$/))) {
    return valid({ d: +m[1], m: +m[2], y: DEFAULT_YEAR });
  }

  // Chuỗi Date JS (vd "Fri Dec 04 2026 00:00:00 GMT+0700") -> quy đổi sang ngày ở VN
  return valid(partsInEventTz(new Date(s)));
}

/** Trả về "DD/MM/YYYY" hoặc undefined nếu không hợp lệ */
export function normalizeSheetDate(raw?: unknown): string | undefined {
  const p = parseSheetDate(raw);
  if (!p) return undefined;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(p.d)}/${pad(p.m)}/${p.y}`;
}
