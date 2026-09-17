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
    console.warn("[Guests Route] graduationConfig.googleScriptUrl is not configured");
    return NextResponse.json(cachedGuests || []);
  }

  try {
    const res = await fetch(
      `${graduationConfig.googleScriptUrl}?action=getGuests&sheet=guests${isRefresh ? `&_t=${now}` : ""}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: isRefresh ? "no-store" : "default",
        next: isRefresh ? { revalidate: 0 } : { revalidate: 3 },
      }
    );

    if (res.ok) {
      let data: unknown;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.warn("[Guests Route] Failed to parse JSON response from Google Script:", parseErr);
      }

      if (Array.isArray(data)) {
        cachedGuests = data;
        lastFetchTime = now;
        return NextResponse.json(data, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });
      } else {
        console.warn("[Guests Route] Google Script returned non-array payload:", data);
      }
    } else {
      console.warn(`[Guests Route] Upstream Google Script responded with HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn("[Guests Route] Network error fetching from Google Sheet:", err);
  }

  if (cachedGuests) {
    console.warn("[Guests Route] Returning stale cached guests as fallback");
    return NextResponse.json(cachedGuests, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Data-Source": "stale-cache",
      },
    });
  }

  console.warn("[Guests Route] No cached guests available, returning empty list");
  return NextResponse.json([]);
}
