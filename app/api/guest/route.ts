import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { describeDevice, getClientIp, vnNow } from "@/lib/device";
import {
  DEVICE_COOKIE,
  MAX_DEVICES_PER_LINK,
  claimDevice,
  earliestDefaults,
  findGuest,
  listGuestsServer,
  newDeviceId,
  publicProfile,
} from "@/lib/guests-server";
import { sheetPost } from "@/lib/sheet";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LOCK_LOG_COOKIE = "inv_lock_logged";

function readCookie(request: Request, name: string): string {
  const raw = request.headers.get("cookie") || "";
  const hit = raw.split(/;\s*/).find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : "";
}

/**
 * Trả thông tin của ĐÚNG 1 khách theo mã link, chỉ khi thiết bị này được phép.
 * - Mỗi link tối đa MAX_DEVICES_PER_LINK thiết bị (nhận diện bằng cookie httpOnly).
 * - Thiết bị thứ 3 trở đi: chỉ nhận { locked: true } -> trang hiện thiệp chung,
 *   và ghi 1 dòng cảnh báo vào sheet "views".
 * - Admin đã đăng nhập: xem trước được mọi link mà không chiếm chỗ thiết bị.
 */
export async function POST(request: Request) {
  let slug = "";
  try {
    const body = await request.json();
    slug = typeof body?.slug === "string" ? body.slug.trim().slice(0, 80) : "";
  } catch {
    // ignore
  }

  let list;
  try {
    list = await listGuestsServer();
  } catch (err) {
    console.error("[api/guest] Không đọc được danh sách khách:", err);
    return NextResponse.json({ found: false, locked: false, defaults: {} }, { status: 502 });
  }

  const defaults = earliestDefaults(list);
  const noStore = { "Cache-Control": "no-store" };

  if (!slug) return NextResponse.json({ found: false, locked: false, defaults }, { headers: noStore });

  const guest = findGuest(list, slug);
  if (!guest) return NextResponse.json({ found: false, locked: false, defaults }, { headers: noStore });

  // Mã thiết bị: cookie httpOnly do server cấp (trình duyệt/app khác nhau = thiết bị khác nhau)
  let deviceId = readCookie(request, DEVICE_COOKIE);
  const isNewDevice = !/^D[A-Z0-9]{8,32}$/.test(deviceId);
  if (isNewDevice) deviceId = newDeviceId();

  const withDeviceCookie = (res: NextResponse) => {
    if (isNewDevice) {
      res.cookies.set(DEVICE_COOKIE, deviceId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 2 * 365 * 24 * 60 * 60,
      });
    }
    return res;
  };

  // Admin xem thử link: không chiếm chỗ thiết bị của khách
  if (isAdminRequest(request)) {
    return NextResponse.json(
      { found: true, locked: false, preview: true, guest: publicProfile(guest), defaults },
      { headers: noStore }
    );
  }

  const ua = request.headers.get("user-agent") || "";
  const result = await claimDevice(guest.slug || slug, deviceId, { userAgent: describeDevice(ua) });

  if (result === "locked") {
    const res = NextResponse.json({ found: true, locked: true, defaults }, { headers: noStore });

    // Ghi cảnh báo 1 lần / thiết bị / 12 giờ
    const logged = readCookie(request, LOCK_LOG_COOKIE).split(",");
    const key = (guest.slug || slug).toLowerCase();
    if (!logged.includes(key)) {
      const note = `⚠ Link của ${guest.name} bị mở trên thiết bị lạ (quá ${MAX_DEVICES_PER_LINK} thiết bị) · IP ${getClientIp(request.headers)} · ${describeDevice(ua)}`;
      sheetPost({
        type: "OPEN",
        action: "OPEN",
        sheet: "views",
        visitTime: vnNow(),
        viewer: guest.name,
        role: "⚠ Thiết bị lạ",
        note,
      }).catch(() => {});
      res.cookies.set(LOCK_LOG_COOKIE, [...logged.filter(Boolean), key].slice(-20).join(","), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 12 * 60 * 60,
      });
    }
    return withDeviceCookie(res);
  }

  // "allowed", hoặc "error" (Sheet lỗi / Apps Script chưa cập nhật) -> không chặn nhầm khách thật
  return withDeviceCookie(
    NextResponse.json({ found: true, locked: false, guest: publicProfile(guest), defaults }, { headers: noStore })
  );
}
