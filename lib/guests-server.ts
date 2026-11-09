/**
 * Xử lý khách mời phía SERVER. Danh sách khách (kèm lời nhắn riêng) không bao giờ gửi nguyên xuống trình duyệt:
 * trình duyệt chỉ nhận đúng 1 khách, và chỉ khi thiết bị đó được phép.
 */
import { normalizeSheetDate } from "@/config/date-utils";
import { normalizePronounMode, parseDateTimeToTimestamp, type GuestProfile } from "@/config/guests";
import { revalidateTag, unstable_cache } from "next/cache";
import { after } from "next/server";
import { sheetGetRows, sheetPost } from "@/lib/sheet";

export const MAX_DEVICES_PER_LINK = 2;

/*
 * Mỗi lần gọi Apps Script mất ~2-3 giây. Để khách mở thiệp thấy tên NGAY, danh sách khách và
 * danh sách thiết bị được lưu trong Data Cache của Next (dùng chung mọi instance trên Vercel).
 * Cache được làm mới ngay khi admin thêm khách / mở khoá, hoặc khi có thiết bị mới được ghi nhận.
 */
const GUESTS_TAG = "sheet-guests";
const DEVICES_TAG = "sheet-devices";
const GUESTS_REVALIDATE = 120; // sửa tay trong Sheet: tối đa 2 phút là web nhận
const DEVICES_REVALIDATE = 300;

const cachedGuestRows = unstable_cache(() => sheetGetRows("guests"), ["sheet-rows-guests"], {
  revalidate: GUESTS_REVALIDATE,
  tags: [GUESTS_TAG],
});
const cachedDeviceRows = unstable_cache(() => sheetGetRows("devices"), ["sheet-rows-devices"], {
  revalidate: DEVICES_REVALIDATE,
  tags: [DEVICES_TAG],
});

function safeRevalidate(tag: string) {
  try {
    revalidateTag(tag);
  } catch (err) {
    console.warn("[guests-server] revalidateTag failed:", tag, err);
  }
}

/** Gọi sau khi thêm/sửa khách để trang khách thấy ngay */
export const invalidateGuests = () => safeRevalidate(GUESTS_TAG);
export const DEVICE_COOKIE = "inv_dev";

const cleanKey = (s: string) => s.trim().toLowerCase().replace(/[-_]/g, "");
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v).trim());

function pick(item: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = str(item[k]);
    if (v) return v;
  }
  return "";
}

function parseGuestRow(item: Record<string, unknown>): GuestProfile | null {
  const slug = pick(item, "slug", "Slug", "id", "ID", "ma", "Ma");
  const name = pick(item, "guestName", "GuestName", "name", "Name", "ten", "Ten", "hoTen", "HoTen");
  if (!slug || !name) return null;

  const rawCanUpload = pick(item, "canUpload", "CanUpload", "quyenUpAnh", "QuyenUpAnh", "allowUpload", "upAnh", "upload").toLowerCase();
  const canUpload = !["false", "0", "khong", "không", "no", "cấm", "cam", "tat", "tắt"].includes(rawCanUpload);

  return {
    slug,
    name,
    mode: normalizePronounMode(pick(item, "role", "Role", "mode", "Mode", "vaiXung", "VaiXung", "danhXung")),
    customMessage: pick(item, "customMessage", "CustomMessage", "note", "Note", "message", "Message", "loiChuc", "LoiChuc", "tamThu", "TamThu") || undefined,
    customTime: pick(item, "customTime", "CustomTime", "thoiGian", "ThoiGian", "thoiGianMoi", "ThoiGianMoi", "time", "Time", "gio", "Gio") || undefined,
    customDate: normalizeSheetDate(pick(item, "customDate", "CustomDate", "ngay", "Ngay", "ngayMoi", "NgayMoi", "date", "Date")),
    canUpload,
    specialPhoto: pick(item, "specialPhoto", "SpecialPhoto", "cloudinaryImageLink", "photoUrl", "photo", "Photo") || undefined,
  };
}

let cache: { at: number; list: GuestProfile[] } | null = null;
const CACHE_MS = 15_000;

/**
 * Toàn bộ khách (chỉ dùng trên server).
 * `fresh` (trang admin): đọc thẳng Sheet và làm mới luôn cache dùng chung.
 */
export async function listGuestsServer(fresh = false): Promise<GuestProfile[]> {
  if (!fresh && cache && Date.now() - cache.at < CACHE_MS) return cache.list;
  try {
    const rows = fresh ? await sheetGetRows("guests") : await cachedGuestRows();
    if (fresh) invalidateGuests();
    const seen = new Set<string>();
    const list: GuestProfile[] = [];
    for (const r of rows) {
      const g = parseGuestRow(r);
      if (!g) continue;
      const k = cleanKey(g.slug || g.name);
      if (seen.has(k)) continue;
      seen.add(k);
      list.push(g);
    }
    cache = { at: Date.now(), list };
    return list;
  } catch (err) {
    if (cache) return cache.list; // Sheet lỗi tạm thời -> dùng dữ liệu cũ
    throw err;
  }
}

/** Tìm khách theo mã link (khớp slug; link cũ khớp thêm theo tên viết liền) */
export function findGuest(list: GuestProfile[], slug: string): GuestProfile | null {
  const k = cleanKey(slug);
  if (!k) return null;
  return (
    list.find((g) => cleanKey(g.slug || "") === k) ||
    list.find((g) => cleanKey(g.name).replace(/\s+/g, "") === k) ||
    null
  );
}

/** Ngày/giờ sớm nhất trong danh sách — dùng làm mặc định cho người xem không có link riêng */
export function earliestDefaults(list: GuestProfile[]): { earliestDate?: string; earliestTime?: string } {
  let min = Infinity;
  let out: { earliestDate?: string; earliestTime?: string } = {};
  for (const g of list) {
    if (!g.customDate && !g.customTime) continue;
    const ts = parseDateTimeToTimestamp(g.customDate, g.customTime);
    if (ts !== null && ts < min) {
      min = ts;
      out = { earliestDate: g.customDate, earliestTime: g.customTime };
    }
  }
  return out;
}

/** Thông tin an toàn để gửi xuống trình duyệt của CHÍNH khách đó */
export function publicProfile(g: GuestProfile) {
  return {
    slug: g.slug,
    name: g.name,
    mode: g.mode,
    customMessage: g.customMessage,
    customTime: g.customTime,
    customDate: g.customDate,
    canUpload: g.canUpload !== false,
  };
}

/* ───────────── Khoá link theo thiết bị ───────────── */

// Ghi nhớ thiết bị đã được duyệt để không phải hỏi Sheet mỗi lần (mỗi instance server)
const allowedCache = new Map<string, number>();
const ALLOWED_CACHE_MS = 10 * 60_000;

export type ClaimResult = "allowed" | "locked" | "error";

/**
 * Ghi nhận thiết bị cho link. Apps Script xử lý nguyên tử (có khoá):
 * thiết bị đã có -> cho phép; chưa đủ MAX -> thêm & cho phép; đủ rồi -> từ chối.
 */
export async function claimDevice(
  slug: string,
  deviceId: string,
  meta: { userAgent?: string } = {}
): Promise<ClaimResult> {
  const key = `${cleanKey(slug)}|${deviceId}`;
  const hit = allowedCache.get(key);
  if (hit && Date.now() - hit < ALLOWED_CACHE_MS) return "allowed";

  const r = await sheetPost({
    type: "CLAIM_DEVICE",
    action: "CLAIM_DEVICE",
    sheet: "devices",
    slug: cleanKey(slug),
    deviceId,
    userAgent: (meta.userAgent || "").slice(0, 200),
    max: MAX_DEVICES_PER_LINK,
    firstSeen: new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
  });

  const allowed = r.data?.allowed;
  if (allowed === true) {
    allowedCache.set(key, Date.now());
    return "allowed";
  }
  if (allowed === false) return "locked";
  // Apps Script chưa cập nhật (trả "ignored") hoặc lỗi mạng -> không chặn nhầm khách thật
  console.warn("[claimDevice] Unexpected response:", r.status, r.data);
  return "error";
}

/** Thiết bị đã ghi nhận theo slug, đọc từ cache dùng chung (null nếu không đọc được) */
async function cachedDeviceMap(): Promise<Map<string, Set<string>> | null> {
  try {
    const rows = await cachedDeviceRows();
    const map = new Map<string, Set<string>>();
    for (const r of rows) {
      const s = cleanKey(str(r.slug));
      const d = str(r.deviceId);
      if (!s || !d) continue;
      if (!map.has(s)) map.set(s, new Set());
      map.get(s)!.add(d);
    }
    return map;
  } catch {
    return null;
  }
}

/**
 * Như claimDevice nhưng KHÔNG bắt khách chờ Apps Script khi không cần:
 *  - Thiết bị đã có trong danh sách -> cho phép ngay.
 *  - Link còn chỗ trống -> cho phép ngay, ghi nhận vào Sheet chạy nền (sau khi đã trả kết quả).
 *  - Link đã đủ thiết bị -> hỏi Apps Script thật (có khoá) để quyết định chính xác.
 */
export async function claimDeviceFast(
  slug: string,
  deviceId: string,
  meta: { userAgent?: string } = {}
): Promise<ClaimResult> {
  const key = `${cleanKey(slug)}|${deviceId}`;
  const hit = allowedCache.get(key);
  if (hit && Date.now() - hit < ALLOWED_CACHE_MS) return "allowed";

  const map = await cachedDeviceMap();
  if (map) {
    const known = map.get(cleanKey(slug)) || new Set<string>();
    if (known.has(deviceId)) {
      allowedCache.set(key, Date.now());
      return "allowed";
    }
    if (known.size < MAX_DEVICES_PER_LINK) {
      allowedCache.set(key, Date.now());
      after(async () => {
        const r = await claimDevice(slug, deviceId, meta).catch(() => "error" as const);
        if (r === "allowed") safeRevalidate(DEVICES_TAG);
        else allowedCache.delete(key); // Apps Script từ chối -> lần sau sẽ hỏi lại
      });
      return "allowed";
    }
  }

  const r = await claimDevice(slug, deviceId, meta);
  if (r === "allowed") safeRevalidate(DEVICES_TAG);
  return r;
}

/** Mở khoá: xoá toàn bộ thiết bị đã ghi nhận của một link */
export async function resetDevices(slug: string): Promise<boolean> {
  for (const k of [...allowedCache.keys()]) if (k.startsWith(`${cleanKey(slug)}|`)) allowedCache.delete(k);
  const r = await sheetPost({ type: "RESET_DEVICES", action: "RESET_DEVICES", sheet: "devices", slug: cleanKey(slug) });
  safeRevalidate(DEVICES_TAG);
  return r.ok && r.data?.status === "success";
}

/** Số thiết bị đã ghi nhận theo từng slug (cho trang admin) */
export async function deviceCounts(): Promise<Record<string, number>> {
  try {
    const rows = await sheetGetRows("devices");
    const sets = new Map<string, Set<string>>();
    for (const r of rows) {
      const s = cleanKey(str(r.slug));
      const d = str(r.deviceId);
      if (!s || !d) continue;
      if (!sets.has(s)) sets.set(s, new Set());
      sets.get(s)!.add(d);
    }
    return Object.fromEntries([...sets.entries()].map(([k, v]) => [k, v.size]));
  } catch {
    return {};
  }
}

export function newDeviceId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return "D" + Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 16).toUpperCase();
}
