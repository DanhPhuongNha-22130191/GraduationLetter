import { NextResponse } from "next/server";
import { graduationConfig } from "@/config/graduation";
import { fetchGuestsFromSheet, type GuestProfile } from "@/config/guests";
import { normalizeSheetDate } from "@/config/date-utils";
import { generateGuestCode, isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MODES = ["friend", "elder", "senior", "junior"] as const;
type Mode = (typeof MODES)[number];

const unauthorized = () =>
  NextResponse.json({ success: false, error: "Chưa đăng nhập" }, { status: 401 });

const cleanKey = (s: string) => s.trim().toLowerCase().replace(/[-_]/g, "");

/** Danh sách khách (mỗi khách 1 dòng, bỏ các khóa phụ tra theo tên) */
async function listGuests(): Promise<GuestProfile[]> {
  const registry = await fetchGuestsFromSheet(true);
  const seen = new Set<string>();
  const list: GuestProfile[] = [];
  for (const p of Object.values(registry)) {
    const key = cleanKey(p.slug || p.name);
    if (seen.has(key)) continue;
    seen.add(key);
    list.push(p);
  }
  return list;
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const guests = await listGuests();
    return NextResponse.json({ success: true, guests }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[Admin guests GET]", err);
    return NextResponse.json({ success: false, error: "Không tải được danh sách khách" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();
  if (!graduationConfig.googleScriptUrl) {
    return NextResponse.json({ success: false, error: "Chưa cấu hình Google Script URL" }, { status: 500 });
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
    const res = await fetch(graduationConfig.googleScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
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
