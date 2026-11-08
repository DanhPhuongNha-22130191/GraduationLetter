import { NextResponse } from "next/server";
import type { GuestProfile } from "@/config/guests";
import { normalizeSheetDate } from "@/config/date-utils";
import { generateGuestCode, isAdminRequest } from "@/lib/admin-auth";
import { MAX_DEVICES_PER_LINK, deviceCounts, listGuestsServer, resetDevices } from "@/lib/guests-server";
import { getScriptUrl, isSheetConfigured, sheetPostInit } from "@/lib/sheet";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MODES = ["friend", "elder", "senior", "junior"] as const;
type Mode = (typeof MODES)[number];

const unauthorized = () =>
  NextResponse.json({ success: false, error: "Chưa đăng nhập" }, { status: 401 });

const cleanKey = (s: string) => s.trim().toLowerCase().replace(/[-_]/g, "");

/** Danh sách khách mới nhất từ Sheet */
const listGuests = (): Promise<GuestProfile[]> => listGuestsServer(true);

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const [guests, devices] = await Promise.all([listGuests(), deviceCounts()]);
    const withDevices = guests.map((g) => ({ ...g, devices: devices[cleanKey(g.slug || "")] || 0 }));
    return NextResponse.json(
      { success: true, guests: withDevices, maxDevices: MAX_DEVICES_PER_LINK },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[Admin guests GET]", err);
    return NextResponse.json({ success: false, error: "Không tải được danh sách khách" }, { status: 502 });
  }
}

/** Mở khoá link: xoá các thiết bị đã ghi nhận để khách mở lại được (vd khách đổi điện thoại) */
export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();
  let slug = "";
  try {
    const body = await request.json();
    slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  } catch {
    // ignore
  }
  if (!slug) return NextResponse.json({ success: false, error: "Thiếu mã khách" }, { status: 400 });
  const ok = await resetDevices(slug);
  return NextResponse.json(
    ok ? { success: true } : { success: false, error: "Không mở khoá được — kiểm tra Apps Script đã có RESET_DEVICES" },
    { status: ok ? 200 : 502 }
  );
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();
  if (!isSheetConfigured()) {
    return NextResponse.json({ success: false, error: "Chưa cấu hình GOOGLE_SCRIPT_URL trên Vercel" }, { status: 500 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // ignore
  }

  const name = String(body.name ?? "").trim().slice(0, 80);
  const mode: Mode = MODES.includes(body.mode as Mode) ? (body.mode as Mode) : "friend";
  const customMessage = String(body.customMessage ?? "").trim().slice(0, 1500);
  const customTime = String(body.customTime ?? "").trim().slice(0, 60);
  const customDate = normalizeSheetDate(body.customDate) ?? "";
  const canUpload = body.canUpload !== false;

  if (!name) {
    return NextResponse.json({ success: false, error: "Vui lòng nhập tên khách" }, { status: 400 });
  }

  // Sinh mã ngẫu nhiên, không trùng với slug/tên đã có
  let existing: GuestProfile[] = [];
  try {
    existing = await listGuests();
  } catch {
    // vẫn tạo được, chỉ không kiểm tra trùng
  }
  const taken = new Set(existing.flatMap((g) => [cleanKey(g.slug || ""), cleanKey(g.name)]));
  let code = generateGuestCode();
  while (taken.has(code)) code = generateGuestCode();

  const timestamp = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  const payload = {
    type: "ADD_GUEST",
    action: "ADD_GUEST",
    sheet: "guests",
    slug: code,
    name,
    mode,
    customMessage,
    customTime,
    customDate,
    canUpload: canUpload ? "true" : "false",
    timestamp,
  };

  try {
    const res = await fetch(getScriptUrl(), sheetPostInit(payload));
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Google Script trả về lỗi HTTP ${res.status}` },
        { status: 502 }
      );
    }
    let out: { status?: string; message?: string; error?: string } = {};
    try {
      out = await res.json();
    } catch {
      // Không đọc được JSON -> vẫn kiểm tra lại bằng cách đọc Sheet bên dưới
    }
    if (out.status === "ignored") {
      return NextResponse.json(
        { success: false, error: "Apps Script chưa có xử lý ADD_GUEST — hãy dán docs/apps-script.gs và Deploy bản mới" },
        { status: 502 }
      );
    }
    if (out.status === "error" || out.error) {
      return NextResponse.json(
        { success: false, error: out.message || out.error || "Apps Script báo lỗi" },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("[Admin guests POST]", err);
    return NextResponse.json({ success: false, error: "Không kết nối được Google Sheet" }, { status: 502 });
  }

  // Kiểm tra lại: dòng mới đã thực sự xuất hiện trong Sheet chưa
  let verified = false;
  for (let i = 0; i < 3 && !verified; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 1500));
    try {
      const guests = await listGuests();
      verified = guests.some((g) => cleanKey(g.slug || "") === code);
    } catch {
      // thử lại
    }
  }

  return NextResponse.json({ success: true, code, verified });
}
