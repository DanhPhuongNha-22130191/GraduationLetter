import { NextResponse } from "next/server";
import { sheetPost } from "@/lib/sheet";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const clip = (v: unknown, n: number) => (v === undefined || v === null ? "" : String(v).trim().slice(0, n));

/** Ghi xác nhận tham dự (thay cho việc trình duyệt gọi thẳng Google Sheet) */
export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const fullName = clip(body.fullName, 100);
  if (!fullName) return NextResponse.json({ success: false, error: "Thiếu họ tên" }, { status: 400 });

  const qty = Math.max(0, Math.min(20, parseInt(String(body.quantity ?? "0"), 10) || 0));

  const r = await sheetPost({
    type: "RSVP",
    action: "RSVP",
    sheet: "confirms",
    confirmTime: clip(body.confirmTime, 40),
    fullName,
    phone: clip(body.phone, 30),
    attendStatus: clip(body.attendStatus, 20),
    quantity: qty,
    message: clip(body.message, 1000),
  });
  return NextResponse.json({ success: r.ok }, { status: r.ok ? 200 : 502 });
}
