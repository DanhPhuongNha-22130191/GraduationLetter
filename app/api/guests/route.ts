import { NextResponse } from "next/server";

/**
 * ĐÃ NGỪNG: route này từng trả CẢ danh sách khách kèm lời nhắn riêng cho bất kỳ ai.
 * Trình duyệt giờ dùng /api/guest (1 khách / lần, có khoá theo thiết bị).
 * Giữ lại route trả rỗng để bản cũ còn trong cache trình duyệt không bị lỗi.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
}
