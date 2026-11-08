/** Nhận diện thiết bị/app từ user-agent (dùng chung cho middleware và API) */

// Bot tạo ô xem trước link (Zalo, Messenger, Telegram...) tự mở link trước khi khách bấm
export const BOT_UA =
  /bot|crawler|spider|preview|facebookexternalhit|facebot|zalo-?link|telegram|whatsapp|slack|discord|skype|linkedin|embedly|vercel|headless|lighthouse|curl|wget|python|node-fetch|axios/i;

export function describeDevice(ua: string): string {
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

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    "Không rõ IP"
  );
}

export const vnNow = () => new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
