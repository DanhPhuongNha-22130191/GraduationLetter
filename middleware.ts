import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { graduationConfig } from "@/config/graduation";

/**
 * Ghi log phía server mỗi khi có người bấm link thiệp (trước cả khi trang tải xong).
 * Chỉ ghi IP + thiết bị vào cột note của sheet "views" — không ghi tên khách.
 */

// Bot tạo ô xem trước link (Zalo, Messenger, Telegram...) tự mở link trước khi khách bấm -> bỏ qua
const BOT_UA =
  /bot|crawler|spider|preview|facebookexternalhit|facebot|zalo-?link|telegram|whatsapp|slack|discord|skype|linkedin|embedly|vercel|headless|lighthouse|curl|wget|python|node-fetch|axios/i;

// Không ghi lại khi cùng 1 trình duyệt F5 liên tục
const DEDUPE_COOKIE = "inv_click_logged";
const DEDUPE_SECONDS = 30 * 60;

function describeDevice(ua: string): string {
  let os = "Không rõ HĐH";
  let model = "";

  if (/iPhone/i.test(ua)) os = "iPhone";
  else if (/iPad/i.test(ua)) os = "iPad";
  else if (/Android/i.test(ua)) {
    os = `Android ${ua.match(/Android\s([\d.]+)/i)?.[1] ?? ""}`.trim();
    // vd "Linux; Android 14; SM-S918B Build/..." -> "SM-S918B"
    model = ua.match(/Android[\d.\s]*;\s*(?:[a-z]{2}[-_][a-z]{2};\s*)?([^;)]+?)(?:\sBuild|\)|;)/i)?.[1]?.trim() ?? "";
    if (/^(K|wv|Mobile|Linux)$/i.test(model)) model = "";
  } else if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/CrOS/i.test(ua)) os = "ChromeOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  if (/iPhone|iPad/i.test(ua)) {
    const v = ua.match(/OS (\d+[_\d]*)/i)?.[1]?.replace(/_/g, ".");
    if (v) os += ` iOS ${v}`;
  }

  let app = "Trình duyệt khác";
  if (/Zalo/i.test(ua)) app = "Zalo";
  else if (/FBAN\/Messenger|MessengerForiOS|FB_IAB\/MESSENGER|FB_IAB\/Orca|Orca-Android/i.test(ua)) app = "Messenger";
  else if (/FBAN|FBAV|FB_IAB/i.test(ua)) app = "Facebook";
  else if (/Instagram/i.test(ua)) app = "Instagram";
  else if (/TikTok|musical_ly|BytedanceWebview/i.test(ua)) app = "TikTok";
  else if (/Line\//i.test(ua)) app = "LINE";
  else if (/CocCoc|coc_coc/i.test(ua)) app = "Cốc Cốc";
  else if (/Edg\//i.test(ua)) app = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) app = "Opera";
  else if (/SamsungBrowser/i.test(ua)) app = "Samsung Internet";
  else if (/CriOS|Chrome\//i.test(ua)) app = "Chrome";
  else if (/FxiOS|Firefox\//i.test(ua)) app = "Firefox";
  else if (/Safari\//i.test(ua)) app = "Safari";

  return [os, model, app].filter(Boolean).join(" · ");
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "Không rõ IP"
  );
}

export function middleware(req: NextRequest, event: NextFetchEvent) {
  const res = NextResponse.next();

  if (req.method !== "GET" || !graduationConfig.googleScriptUrl) return res;

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

  const ip = getClientIp(req);
  const device = describeDevice(ua);
  const time = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  const note = `Bấm link (server) · IP ${ip} · ${device}`;

  const payload = {
    type: "OPEN",
    action: "OPEN",
    sheet: "views",
    visitTime: time,
    viewer: "Lượt bấm link",
    role: "-",
    note,
    // Backward-compatibility keys (giống log phía trình duyệt)
    name: "Lượt bấm link",
    phone: "-",
    attending: "ĐÃ BẤM LINK 🔗",
    guests: 0,
    mode: "-",
    message: note,
    timestamp: time,
  };

  // Gửi ngầm, không làm chậm việc tải trang
  event.waitUntil(
    fetch(graduationConfig.googleScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
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
