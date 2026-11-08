import { NextResponse } from "next/server";
import { sheetPost } from "@/lib/sheet";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const clip = (v: unknown, n: number) => (v === undefined || v === null ? "" : String(v).trim().slice(0, n));

/** Ghi lượt mở thiệp (thay cho việc trình duyệt gọi thẳng Google Sheet) */
export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const viewer = clip(body.viewer, 100);
  if (!viewer) return NextResponse.json({ success: false }, { status: 400 });

  const r = await sheetPost({
    type: "OPEN",
    action: "OPEN",
    sheet: "views",
    visitTime: clip(body.visitTime, 40),
    viewer,
    role: clip(body.role, 40),
    note: clip(body.note, 300),
  });
  return NextResponse.json({ success: r.ok });
}
