import { NextResponse } from "next/server";
import { graduationConfig } from "@/config/graduation";

export const dynamic = "force-dynamic";

let cachedGuests: unknown[] | null = null;
let lastFetchTime = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isRefresh = searchParams.get("refresh") === "1";
  const now = Date.now();

  // Trả về từ bộ nhớ đệm server siêu tốc (chỉ 5ms) nếu vừa fetch cách đây dưới 3 giây
  if (!isRefresh && cachedGuests && now - lastFetchTime < 3000) {
    return NextResponse.json(cachedGuests, {
      headers: {
        "Cache-Control": "public, s-maxage=3, stale-while-revalidate=5",
      },
    });
  }

  if (!graduationConfig.googleScriptUrl) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `${graduationConfig.googleScriptUrl}?action=getGuests&sheet=KhachMoi${isRefresh ? `&_t=${now}` : ""}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: isRefresh ? "no-store" : "default",
        next: isRefresh ? { revalidate: 0 } : { revalidate: 3 },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        cachedGuests = data;
        lastFetchTime = now;
        return NextResponse.json(data, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });
      }
    }
  } catch (err) {
    console.warn("[Guests Route] Error fetching from Google Sheet:", err);
  }

  return NextResponse.json(cachedGuests || []);
}
