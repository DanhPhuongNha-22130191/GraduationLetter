import { NextResponse } from "next/server";
import type { GuestProfile } from "@/config/guests";
import { isAdminRequest } from "@/lib/admin-auth";
import { deviceCounts, listGuestsServer } from "@/lib/guests-server";
import { sheetGetRows } from "@/lib/sheet";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Row = Record<string, unknown>;

const readSheet = (action: string, sheet: string): Promise<Row[]> => sheetGetRows(sheet, { action });

const str = (v: unknown) => (v === undefined || v === null ? "" : String(v).trim());
const pick = (r: Row, ...keys: string[]) => {
  for (const k of keys) if (str(r[k])) return str(r[k]);
  return "";
};

const cleanKey = (s: string) => s.trim().toLowerCase().replace(/[-_]/g, "");

/** Dữ liệu thô cho dashboard: lượt xem, RSVP, danh sách khách — tổng hợp ở phía trình duyệt */
export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ success: false, error: "Chưa đăng nhập" }, { status: 401 });
  }

  const [viewsRes, rsvpRes, guestsRes, devicesRes] = await Promise.allSettled([
    readSheet("getViews", "views"),
    readSheet("getRsvps", "confirms"),
    listGuestsServer(true),
    deviceCounts(),
  ]);
  const devices = devicesRes.status === "fulfilled" ? devicesRes.value : {};

  const errors: string[] = [];
  if (viewsRes.status === "rejected") errors.push("Không đọc được sheet lượt xem");
  if (rsvpRes.status === "rejected") errors.push("Không đọc được sheet RSVP");
  if (guestsRes.status === "rejected") errors.push("Không đọc được danh sách khách");

  const views = (viewsRes.status === "fulfilled" ? viewsRes.value : []).map((r) => ({
    time: pick(r, "visitTime", "timestamp", "Thời Gian"),
    viewer: pick(r, "viewer", "name", "Tên"),
    role: pick(r, "role", "mode"),
    note: pick(r, "note", "message", "Ghi Chú"),
  }));

  const rsvps = (rsvpRes.status === "fulfilled" ? rsvpRes.value : []).map((r) => ({
    time: pick(r, "confirmTime", "timestamp"),
    name: pick(r, "fullName", "name"),
    status: pick(r, "attendStatus", "attending"),
    quantity: parseInt(pick(r, "quantity", "guests") || "0", 10) || 0,
    message: pick(r, "message"),
  }));

  const seen = new Set<string>();
  const guests: (GuestProfile & { devices: number })[] = [];
  if (guestsRes.status === "fulfilled") {
    for (const p of guestsRes.value) {
      const key = cleanKey(p.slug || p.name);
      if (seen.has(key)) continue;
      seen.add(key);
      guests.push({ slug: p.slug, name: p.name, mode: p.mode, devices: devices[cleanKey(p.slug || "")] || 0 });
    }
  }

  return NextResponse.json(
    { success: true, views, rsvps, guests, errors, fetchedAt: Date.now() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
