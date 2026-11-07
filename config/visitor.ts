/**
 * Nhận diện khách mở LINK CHUNG mà không cần thêm cột vào Google Sheet.
 *  - Mã khách (visitorId): mã ngẫu nhiên lưu trên máy khách, vd "V-8F3K2A".
 *    Dùng để nối lượt mở ẩn danh với tên khách nhập sau đó (phong bì / RSVP).
 *  - Nguồn link (ref): gắn ?ref=nhom-lop / ?ref=facebook vào link chung để biết khách đến từ đâu.
 *  - Tên tự nhập: khách nhập tên ở phong bì, được nhớ cho lần mở sau.
 * Tất cả chỉ ghi vào các cột sẵn có của sheet "views" (viewer / note / message).
 */

const VISITOR_ID_KEY = "invitation_visitor_id";
const REF_KEY = "invitation_ref_source";
const SELF_NAME_KEY = "invitation_self_name";

const safeGet = (storage: "local" | "session", key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return (storage === "local" ? localStorage : sessionStorage).getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (storage: "local" | "session", key: string, value: string) => {
  if (typeof window === "undefined") return;
  try {
    (storage === "local" ? localStorage : sessionStorage).setItem(key, value);
  } catch {
    // ignore (private mode / blocked storage)
  }
};

/** Mã khách cố định trên mỗi máy/trình duyệt. */
export function getVisitorId(): string {
  const existing = safeGet("local", VISITOR_ID_KEY);
  if (existing) return existing;
  const id = `V-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  safeSet("local", VISITOR_ID_KEY, id);
  return id;
}

/** Nguồn link: ?ref=... hoặc ?src=... (giữ trong phiên để không mất khi reload). */
export function getRefSource(): string {
  if (typeof window === "undefined") return "";
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = (params.get("ref") || params.get("src") || "").trim().slice(0, 40);
    if (fromUrl) {
      safeSet("session", REF_KEY, fromUrl);
      return fromUrl;
    }
  } catch {
    // ignore
  }
  return safeGet("session", REF_KEY) || "";
}

export function getRememberedSelfName(): string {
  return safeGet("local", SELF_NAME_KEY) || "";
}

export function rememberSelfName(name: string) {
  const clean = name.trim().slice(0, 60);
  if (clean) safeSet("local", SELF_NAME_KEY, clean);
}

/** Chuỗi ghi chú ngắn: "Mã V-8F3K2A · Nguồn: nhom-lop" */
export function visitorNote(): string {
  const ref = getRefSource();
  return `Mã ${getVisitorId()}${ref ? ` · Nguồn: ${ref}` : ""}`;
}
