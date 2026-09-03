import { GuestPronounMode } from "@/context/guest-context";
import { graduationConfig } from "@/config/graduation";

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

  if (dateStr && dateStr.trim()) {
    const trimmed = dateStr.trim();
    const matchDMY = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    const matchYMD = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    const matchDM = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})$/);

    if (matchDMY) {
      day = parseInt(matchDMY[1], 10);
      month = parseInt(matchDMY[2], 10) - 1;
      year = parseInt(matchDMY[3], 10);
    } else if (matchYMD) {
      year = parseInt(matchYMD[1], 10);
      month = parseInt(matchYMD[2], 10) - 1;
      day = parseInt(matchYMD[3], 10);
    } else if (matchDM) {
      day = parseInt(matchDM[1], 10);
      month = parseInt(matchDM[2], 10) - 1;
    }
  }

  if (timeStr && timeStr.trim()) {
    const trimmedTime = timeStr.trim();
    const timeMatch = trimmedTime.match(/(\d{1,2})[:h](\d{2})/i) || trimmedTime.match(/(\d{1,2})[:h]/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const isPM = /pm|chiều|chieu|tối|toi|afternoon|evening|រសៀល|យប់/i.test(trimmedTime);
      const isAM = /am|sáng|sang|morning|ព្រឹក/i.test(trimmedTime);

      if (isPM && h < 12) {
        h += 12;
      } else if (isAM && h === 12) {
        h = 0;
      }
      hours = h;
      minutes = m;
    }
  }

  return new Date(year, month, day, hours, minutes, 0).getTime();
}

/**
 * Tìm ngày giờ tốt nghiệp sớm nhất trong toàn bộ danh sách Khách Mời từ Google Sheet
 */
export function getEarliestGraduationDateTime(
  registry?: Record<string, GuestProfile>
): { earliestDate?: string; earliestTime?: string } {
  let targetRegistry = registry;
  if (!targetRegistry && typeof window !== "undefined") {
    try {
      const cached =
        localStorage.getItem("cached_guest_registry") ||
        sessionStorage.getItem("cached_guest_registry");
      if (cached) {
        targetRegistry = JSON.parse(cached);
      }
    } catch {
      // ignore
    }
  }
  if (!targetRegistry) {
    targetRegistry = defaultGuestRegistry;
  }

  let minTimestamp = Infinity;
  let result: { earliestDate?: string; earliestTime?: string } = {};

  for (const profile of Object.values(targetRegistry)) {
    if (profile.customDate || profile.customTime) {
      const ts = parseDateTimeToTimestamp(profile.customDate, profile.customTime);
      if (ts !== null && ts < minTimestamp) {
        minTimestamp = ts;
        result = {
          earliestDate: profile.customDate,
          earliestTime: profile.customTime,
        };
      }
    }
  }

  return result;
}

/**
 * Tìm kiếm nhanh khách mời từ bộ nhớ đệm đồng bộ (LocalStorage / SessionStorage)
 */
export function getCachedGuestSync(slug: string): GuestProfile | null {
  if (typeof window === "undefined" || !slug) return null;
  const cleanSlug = slug.trim().toLowerCase().replace(/[-_]/g, "");
  try {
    const raw =
      localStorage.getItem("cached_guest_registry") ||
      sessionStorage.getItem("cached_guest_registry");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed[cleanSlug]) {
        return parsed[cleanSlug];
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Tải danh sách khách mời từ Google Sheet (Sheet 3 / KhachMoi)
 */
export async function fetchGuestsFromSheet(): Promise<Record<string, GuestProfile>> {
  const cacheKey = "cached_guest_registry";

  // 1. Kiểm tra cache LocalStorage / SessionStorage trước để tải trang siêu tốc 0ms
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(cacheKey) || sessionStorage.getItem(cacheKey);
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
              const customTime = (item.customTime ||
                item.CustomTime ||
                item.thoiGian ||
                item.ThoiGian ||
                item.thoiGianMoi ||
                item.ThoiGianMoi ||
                item.time ||
                item.Time ||
                item.gio ||
                item.Gio ||
                undefined) as string | undefined;
              const customDate = (item.customDate ||
                item.CustomDate ||
                item.ngay ||
                item.Ngay ||
                item.ngayMoi ||
                item.NgayMoi ||
                item.date ||
                item.Date ||
                undefined) as string | undefined;

              const rawCanUpload =
                item.canUpload !== undefined
                  ? item.canUpload
                  : item.CanUpload !== undefined
                  ? item.CanUpload
                  : item.quyenUpAnh !== undefined
                  ? item.quyenUpAnh
                  : item.QuyenUpAnh !== undefined
                  ? item.QuyenUpAnh
                  : item.allowUpload !== undefined
                  ? item.allowUpload
                  : item.upAnh !== undefined
                  ? item.upAnh
                  : item.upload;

              let canUpload = true;
              if (rawCanUpload !== undefined && rawCanUpload !== null && String(rawCanUpload).trim() !== "") {
                const s = String(rawCanUpload).trim().toLowerCase();
                if (s === "false" || s === "0" || s === "khong" || s === "không" || s === "no" || s === "cấm" || s === "cam" || s === "tat" || s === "tắt") {
                  canUpload = false;
                } else {
                  canUpload = true;
                }
              }

              const specialPhoto = (item.specialPhoto ||
                item.SpecialPhoto ||
                item.photo ||
                item.Photo ||
                undefined) as string | undefined;

              registry[slug] = {
                name: String(name).trim(),
                mode,
                customMessage: customMessage ? String(customMessage).trim() : undefined,
                customTime: customTime ? String(customTime).trim() : undefined,
                customDate: customDate ? String(customDate).trim() : undefined,
                canUpload,
                specialPhoto: specialPhoto ? String(specialPhoto).trim() : undefined,
              };
            }
          });

          if (Object.keys(registry).length > 0) {
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(cacheKey, JSON.stringify(registry));
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
  const cleanSlug = slug.trim().toLowerCase().replace(/[-_]/g, "");

  // 1. Kiểm tra trong registry truyền vào
  if (customRegistry && customRegistry[cleanSlug]) {
    return customRegistry[cleanSlug];
  }

  // 2. Kiểm tra trong cache đồng bộ (LocalStorage / SessionStorage)
  const cachedProfile = getCachedGuestSync(cleanSlug);
  if (cachedProfile) {
    return cachedProfile;
  }

  // 3. Kiểm tra trong registry mặc định
  if (defaultGuestRegistry[cleanSlug]) {
    return defaultGuestRegistry[cleanSlug];
  }

  return null;
}

/**
 * Tải toàn bộ ảnh kỷ niệm đã được mọi người đóng góp từ Google Sheet / Cloud
 * Tự động đồng bộ với Google Sheets và lưu bộ nhớ đệm
 */
export async function fetchPhotosFromSheet(forceRefresh = false): Promise<import("@/config/graduation").GalleryItem[]> {
  const cacheKey = "cached_cloud_photos_v2";

  // 1. Ưu tiên fetch từ /api/photos (server-side verification đã lọc sạch 404 và ảnh đã xóa)
  if (typeof window !== "undefined") {
    try {
      const apiUrl = `/api/photos${forceRefresh ? "?refresh=1" : ""}`;
      const res = await fetch(apiUrl, {
        cache: forceRefresh ? "no-store" : "default",
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
            // Dọn sạch key cache cũ v1
            localStorage.removeItem("cached_cloud_photos");
            sessionStorage.removeItem("cached_cloud_photos");
          } catch {
            // ignore
          }
          return data;
        }
      }
    } catch {
      // Fallback xuống Google Script trực tiếp nếu lỗi route nội bộ
    }
  }

  // 2. Fallback trực tiếp: Google Apps Script (Sheet AnhKyNiem)
  const seenUrls = new Set<string>();
  const freshPhotos: import("@/config/graduation").GalleryItem[] = [];
  let fetchSucceeded = false;

  try {
    if (graduationConfig.googleScriptUrl) {
      const res = await fetch(`${graduationConfig.googleScriptUrl}?action=getPhotos&sheet=AnhKyNiem`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        fetchSucceeded = true;
        const rawList = await res.json();
        if (Array.isArray(rawList)) {
          rawList.forEach((item: Record<string, unknown>, idx: number) => {
            const rawUrl =
              item.photoUrl ||
              item.PhotoUrl ||
              item["Link Ảnh Cloudinary"] ||
              item["Link Ảnh"] ||
              item["Link"] ||
              item["Ảnh"] ||
              item.photo ||
              item.Photo ||
              item.src ||
              item.Src ||
              item.url ||
              item.Url ||
              item.specialPhoto ||
              item.SpecialPhoto ||
              item.link ||
              item.Link;

            if (rawUrl && typeof rawUrl === "string") {
              const cleanUrl = rawUrl.trim();
              if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://") || cleanUrl.startsWith("/")) {
                if (!seenUrls.has(cleanUrl)) {
                  seenUrls.add(cleanUrl);
                  const rawCaption = String(item.caption || item.Caption || item["Lời Nhắn / Kỷ Niệm"] || item["Lời Nhắn"] || item["Kỷ Niệm"] || item.title || item.Title || item.loiChuc || "").trim();
                  const category = String(item.category || item.Category || item["Chủ Đề"] || item["Chủ đề"] || item.chuDe || item.ChuDe || "Kỷ Niệm").trim();
                  const title = rawCaption || category || "Ảnh kỷ niệm";

                  freshPhotos.push({
                    id: `cloud-${item.id || item.timestamp || item["Thời gian"] || idx}`,
                    title,
                    category: category || "Kỷ Niệm",
                    src: cleanUrl,
                    alt: rawCaption || `Ảnh kỷ niệm [${category}]`,
                  });
                }
              }
            }
          });
        }
      }
    }
  } catch (err) {
    console.warn("Could not fetch cloud photos:", err);
  }

  // 3. Quét thêm ảnh riêng từ danh sách khách mời (specialPhoto)
  try {
    const dynamicRegistry = await fetchGuestsFromSheet();
    Object.values(dynamicRegistry).forEach((guest, idx) => {
      if (guest.specialPhoto && typeof guest.specialPhoto === "string") {
        const cleanUrl = guest.specialPhoto.trim();
        if ((cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://") || cleanUrl.startsWith("/")) && !seenUrls.has(cleanUrl)) {
          seenUrls.add(cleanUrl);
          freshPhotos.push({
            id: `special-${guest.slug || idx}`,
            title: `Khoảnh khắc cùng ${guest.name}`,
            category: "Kỷ Niệm",
            src: cleanUrl,
            alt: `Ảnh kỷ niệm đóng góp bởi ${guest.name}`,
          });
        }
      }
    });
  } catch {
    // ignore
  }

  // 4. Cập nhật lại cache đồng bộ khi fetch thành công
  if (fetchSucceeded && typeof window !== "undefined") {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(freshPhotos));
      sessionStorage.setItem(cacheKey, JSON.stringify(freshPhotos));
    } catch {
      // ignore
    }
  }

  return freshPhotos;
}

