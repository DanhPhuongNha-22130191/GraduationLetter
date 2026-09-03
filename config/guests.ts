import { GuestPronounMode } from "@/context/guest-context";
import { graduationConfig } from "@/config/graduation";

export interface GuestProfile {
  slug?: string;
  name: string;
  mode: GuestPronounMode;
  customMessage?: string;
  specialPhoto?: string;
}

/**
 * Danh sách khách mời mặc định (Trống, dữ liệu hoàn toàn nạp từ Google Sheet)
 */
export const defaultGuestRegistry: Record<string, GuestProfile> = {};

/**
 * Chuẩn hóa giá trị vai xưng (mode) được nhập từ Google Sheet sang GuestPronounMode
 */
export function normalizePronounMode(modeStr?: string): GuestPronounMode {
  if (!modeStr) return "friend";
  const m = modeStr.trim().toLowerCase();
  if (
    m === "elder" ||
    m === "con" ||
    m === "thay" ||
    m === "thầy" ||
    m === "co" ||
    m === "cô" ||
    m === "nguoi lon" ||
    m === "kinh moi" ||
    m === "kính mời"
  ) {
    return "elder";
  }
  if (
    m === "senior" ||
    m === "em" ||
    m === "anh" ||
    m === "chi" ||
    m === "chị" ||
    m === "than ai" ||
    m === "thân ái"
  ) {
    return "senior";
  }
  if (
    m === "junior" ||
    m === "moi" ||
    m === "mời" ||
    m === "hau boi" ||
    m === "dan em" ||
    m === "đàn em" ||
    m === "be" ||
    m === "bé"
  ) {
    return "junior";
  }
  return "friend";
}

/**
 * Tải danh sách khách mời từ Google Sheet (Sheet 3 / KhachMoi)
 */
export async function fetchGuestsFromSheet(): Promise<Record<string, GuestProfile>> {
  const cacheKey = "cached_guest_registry";

  // 1. Kiểm tra cache SessionStorage trước để tải trang siêu tốc
  if (typeof window !== "undefined") {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Fetch từ Google Apps Script
  try {
    if (graduationConfig.googleScriptUrl) {
      const res = await fetch(`${graduationConfig.googleScriptUrl}?action=getGuests&sheet=KhachMoi`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        const rawList = await res.json();
        if (Array.isArray(rawList) && rawList.length > 0) {
          const registry: Record<string, GuestProfile> = {};

          rawList.forEach((item: Record<string, unknown>) => {
            const rawSlug =
              item.slug ||
              item.Slug ||
              item.id ||
              item.ID ||
              item.ma ||
              item.Ma;
            const name =
              item.name ||
              item.Name ||
              item.ten ||
              item.Ten ||
              item.hoTen ||
              item.HoTen;

            if (rawSlug && name) {
              const slug = String(rawSlug).trim().toLowerCase().replace(/[-_]/g, "");
              const rawMode = (item.mode || item.Mode || item.vaiXung || item.VaiXung || item.danhXung || "") as string;
              const mode = normalizePronounMode(rawMode);
              const customMessage = (item.customMessage ||
                item.CustomMessage ||
                item.message ||
                item.Message ||
                item.loiChuc ||
                item.LoiChuc ||
                item.tamThu ||
                item.TamThu ||
                undefined) as string | undefined;
              const specialPhoto = (item.specialPhoto ||
                item.SpecialPhoto ||
                item.photo ||
                item.Photo ||
                undefined) as string | undefined;

              registry[slug] = {
                name: String(name).trim(),
                mode,
                customMessage: customMessage ? String(customMessage).trim() : undefined,
                specialPhoto: specialPhoto ? String(specialPhoto).trim() : undefined,
              };
            }
          });

          if (Object.keys(registry).length > 0) {
            if (typeof window !== "undefined") {
              try {
                sessionStorage.setItem(cacheKey, JSON.stringify(registry));
              } catch {
                // ignore
              }
            }
            return registry;
          }
        }
      }
    }
  } catch (err) {
    console.warn("Could not fetch guests from Google Sheet:", err);
  }

  return defaultGuestRegistry;
}

/**
 * Tra cứu thông tin khách mời qua slug (không phân biệt hoa thường, hỗ trợ dấu gạch ngang)
 */
export function findGuestBySlug(
  slug: string,
  customRegistry?: Record<string, GuestProfile>
): GuestProfile | null {
  if (!slug) return null;
  const normalized = slug.trim().toLowerCase().replace(/[-_]/g, "");
  const targetRegistry = customRegistry || defaultGuestRegistry;

  for (const [key, profile] of Object.entries(targetRegistry)) {
    if (key.toLowerCase().replace(/[-_]/g, "") === normalized) {
      return profile;
    }
  }
  return null;
}

