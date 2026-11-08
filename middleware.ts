import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { BOT_UA, describeDevice, getClientIp, vnNow } from "@/lib/device";
import { getScriptUrl, sheetPostInit } from "@/lib/sheet";

/**
 * Ghi log phía server mỗi khi có người bấm link thiệp (trước cả khi trang tải xong).
 * Chỉ ghi IP + thiết bị vào cột note của sheet "views" — không ghi tên khách.
 */

// Không ghi lại khi cùng 1 trình duyệt F5 liên tục
const DEDUPE_COOKIE = "inv_click_logged";
const DEDUPE_SECONDS = 30 * 60;

export function middleware(req: NextRequest, event: NextFetchEvent) {
  const res = NextResponse.next();
  const scriptUrl = getScriptUrl();

  if (req.method !== "GET" || !scriptUrl) return res;

  // Bỏ qua prefetch / request nội bộ của Next.js (RSC), chỉ tính lượt mở trang thật
  const h = req.headers;
  if (
    h.get("next-router-prefetch") ||
    h.get("purpose") === "prefetch" ||
    h.get("sec-purpose")?.includes("prefetch") ||
    h.get("rsc") ||
    req.nextUrl.searchParams.has("_rsc")
  ) {
    return res;
  }

  const ua = h.get("user-agent") || "";
  if (!ua || BOT_UA.test(ua)) return res;
  if (req.cookies.get(DEDUPE_COOKIE)) return res;

  const time = vnNow();
  const note = `Bấm link (server) · IP ${getClientIp(h)} · ${describeDevice(ua)}`;

  // Gửi ngầm, không làm chậm việc tải trang
  event.waitUntil(
    fetch(scriptUrl, {
      ...sheetPostInit({
        type: "OPEN",
        action: "OPEN",
        sheet: "views",
        visitTime: time,
        viewer: "Lượt bấm link",
        role: "-",
        note,
      }),
      redirect: "manual",
    }).catch(() => {})
  );

  res.cookies.set(DEDUPE_COOKIE, "1", {
    maxAge: DEDUPE_SECONDS,
    httpOnly: true,
    sameSite: "lax",
    secure: req.nextUrl.protocol === "https:",
    path: "/",
  });
  return res;
}

// Chỉ chạy trên trang chính (link mời), bỏ qua /api, ảnh, file tĩnh
export const config = { matcher: "/" };
