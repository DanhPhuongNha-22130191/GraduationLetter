import type { GuestPronounMode } from "@/context/guest-context";
import { graduationConfig, type GalleryItem } from "@/config/graduation";
import { parseSheetDate } from "@/config/date-utils";

/**
 * File này được gửi xuống trình duyệt.
 * KHÔNG để danh sách khách, lời nhắn riêng hay link Apps Script ở đây.
 * Dữ liệu khách chỉ lấy qua /api/guest (mỗi lần đúng 1 khách, có khoá theo thiết bị).
 */

export interface GuestProfile {
  slug?: string;
  name: string;
  mode: GuestPronounMode;
  customMessage?: string;
  customTime?: string;
  customDate?: string;
  canUpload?: boolean;
  specialPhoto?: string;
}

/**
 * Chuẩn hóa giá trị vai xưng (mode) được nhập từ Google Sheet sang GuestPronounMode
 */
export function normalizePronounMode(modeStr?: string): GuestPronounMode {
  if (!modeStr) return "friend";
  const m = modeStr.trim().toLowerCase();
  if (["elder", "con", "thay", "thầy", "co", "cô", "nguoi lon", "kinh moi", "kính mời"].includes(m)) return "elder";
  if (["senior", "em", "anh", "chi", "chị", "than ai", "thân ái"].includes(m)) return "senior";
  if (["junior", "moi", "mời", "hau boi", "dan em", "đàn em", "be", "bé"].includes(m)) return "junior";
  return "friend";
}

/**
 * Chuyển đổi chuỗi ngày giờ tùy chỉnh thành timestamp milliseconds để so sánh
 */
export function parseDateTimeToTimestamp(dateStr?: string, timeStr?: string): number | null {
  if (!dateStr && !timeStr) return null;

  const defaultTarget = new Date(graduationConfig.graduationDate);
  let year = defaultTarget.getFullYear();
  let month = defaultTarget.getMonth();
  let day = defaultTarget.getDate();
  let hours = defaultTarget.getHours();
  let minutes = defaultTarget.getMinutes();

  const parsed = parseSheetDate(dateStr);
  if (parsed) {
    day = parsed.d;
    month = parsed.m - 1;
    year = parsed.y;
  }

  if (timeStr && timeStr.trim()) {
    const trimmedTime = timeStr.trim();
    const timeMatch = trimmedTime.match(/(\d{1,2})[:h](\d{2})/i) || trimmedTime.match(/(\d{1,2})[:h]/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const isPM = /pm|chiều|chieu|tối|toi|afternoon|evening|រសៀល|យប់/i.test(trimmedTime);
      const isAM = /am|sáng|sang|morning|ព្រឹក/i.test(trimmedTime);
      if (isPM && h < 12) h += 12;
      else if (isAM && h === 12) h = 0;
      hours = h;
      minutes = m;
    }
  }

  return new Date(year, month, day, hours, minutes, 0).getTime();
}

/* ───────────── Lấy thông tin khách (1 khách / lần) ───────────── */

export interface MyGuestResponse {
  /** Có tham số ?u= nhưng không tìm thấy khách */
  found: boolean;
  /** Link đã được mở trên đủ số thiết bị cho phép -> chỉ hiện thiệp chung */
  locked: boolean;
  /** Admin đang xem thử link (không tính lượt mở, không chiếm chỗ thiết bị) */
  preview?: boolean;
  guest?: GuestProfile;
  defaults: { earliestDate?: string; earliestTime?: string };
}

/**
 * Hỏi server thông tin của CHÍNH khách đang mở link.
 * Không có slug -> chỉ nhận ngày/giờ mặc định.
 */
export async function fetchMyGuest(slug?: string): Promise<MyGuestResponse | null> {
  try {
    const res = await fetch("/api/guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: slug || "" }),
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!res.ok) return null;
    return (await res.json()) as MyGuestResponse;
  } catch {
    return null;
  }
}

// Dọn dữ liệu cũ: phiên bản trước lưu CẢ danh sách khách (kèm lời nhắn) vào trình duyệt
export function purgeLegacyGuestCache() {
  if (typeof window === "undefined") return;
  try {
    for (const k of ["cached_guest_registry", "cached_guest_registry_v2"]) {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    }
  } catch {
    // ignore
  }
}

/**
 * Tải ảnh kỷ niệm qua /api/photos (server đọc Sheet), có bộ nhớ đệm trên trình duyệt
 */
export async function fetchPhotosFromSheet(forceRefresh = false): Promise<GalleryItem[]> {
  const cacheKey = "cached_cloud_photos_v2";

  if (typeof window !== "undefined") {
    try {
      const apiUrl = `/api/photos${forceRefresh ? `?refresh=1&_t=${Date.now()}` : ""}`;
      const res = await fetch(apiUrl, { cache: forceRefresh ? "no-store" : "default" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
            localStorage.removeItem("cached_cloud_photos");
            sessionStorage.removeItem("cached_cloud_photos");
          } catch {
            // ignore
          }
          return data;
        }
      }
    } catch {
      // dùng cache bên dưới
    }

    try {
      const cached = localStorage.getItem(cacheKey) || sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
  }

  return [];
}
