import { NextResponse } from "next/server";
import { graduationConfig } from "@/config/graduation";

export const dynamic = "force-dynamic";

// In-memory cache with short TTL (5 seconds) to avoid hammering Google Script while allowing rapid updates
let cachedAvatarUrl: string | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5000;

function extractPhotoUrl(item: Record<string, unknown>): string | null {
  const raw =
    item.cloudinaryImageLink ||
    item["Link Ảnh Cloudinary"] ||
    item["Link Ảnh"] ||
    item["LinkAnh"] ||
    item.photoUrl ||
    item.PhotoUrl ||
    item.url ||
    item.Url ||
    item.avatar ||
    item.Avatar ||
    item.link ||
    item.Link ||
    item.specialPhoto ||
    item.SpecialPhoto;

  if (raw && typeof raw === "string" && raw.trim().startsWith("http")) {
    return raw.trim();
  }
  return null;
}

function isRowActive(item: Record<string, unknown>): boolean {
  const activeVal = String(
    item.status ||
      item["Đang Sử Dụng"] ||
      item.DangSuDung ||
      item.isActive ||
      item.IsActive ||
      item.active ||
      item.Active ||
      item.trangThai ||
      item["Trạng Thái"] ||
      ""
  )
    .trim()
    .toLowerCase();

  return (
    activeVal === "true" ||
    activeVal === "1" ||
    activeVal === "yes" ||
    activeVal === "đang dùng" ||
    activeVal === "active"
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isRefresh = searchParams.get("refresh") === "1";
    const now = Date.now();

    // If cache is fresh and not a forced refresh, return cached avatar
    if (!isRefresh && cachedAvatarUrl && now - lastFetchTime < CACHE_TTL_MS) {
      return NextResponse.json(
        { avatarUrl: cachedAvatarUrl },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    if (graduationConfig.googleScriptUrl) {
      // 1. Kiểm tra sheet chuyên dụng: "avatars"
      try {
        const avatarRes = await fetch(
          `${graduationConfig.googleScriptUrl}?action=getAvatar&sheet=avatars&_t=${now}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
            next: { revalidate: 0 },
          }
        );

        if (avatarRes.ok) {
          let avatarRows: unknown;
          try {
            avatarRows = await avatarRes.json();
          } catch (parseErr) {
            console.warn("[Avatar Route] Failed to parse JSON from sheet avatars:", parseErr);
          }

          if (Array.isArray(avatarRows) && avatarRows.length > 0) {
            // Tìm dòng có đánh dấu đang sử dụng (status: "true" hoặc isActive: true)
            const activeRow = avatarRows.slice().reverse().find((item: Record<string, unknown>) => isRowActive(item));
            
            // Nếu có dòng active thì lấy dòng đó, nếu không thì lấy dòng mới nhất (dòng cuối cùng)
            const chosenRow = activeRow || avatarRows[avatarRows.length - 1];
            const url = extractPhotoUrl(chosenRow);

            if (url) {
              cachedAvatarUrl = url;
              lastFetchTime = now;
              return NextResponse.json(
                { avatarUrl: cachedAvatarUrl },
                {
                  headers: {
                    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                  },
                }
              );
            }
          } else if (avatarRows !== undefined) {
            console.warn("[Avatar Route] sheet 'avatars' returned non-array or empty data:", avatarRows);
          }
        } else {
          console.warn(`[Avatar Route] sheet 'avatars' responded with HTTP ${avatarRes.status}`);
        }
      } catch (err) {
        console.warn("[Avatar Route] Could not fetch from Sheet avatars:", err);
      }

      // 2. Dự phòng: Kiểm tra sheet guests với slug = "phuongnha"
      try {
        const res = await fetch(
          `${graduationConfig.googleScriptUrl}?action=getGuests&sheet=guests&_t=${now}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
            next: { revalidate: 0 },
          }
        );

        if (res.ok) {
          let rawList: unknown;
          try {
            rawList = await res.json();
          } catch (parseErr) {
            console.warn("[Avatar Route] Failed to parse JSON from sheet guests:", parseErr);
          }

          if (Array.isArray(rawList)) {
            const ownerRow = rawList.find((item: Record<string, unknown>) => {
              const rawSlug = item.slug || item.Slug || item.id || item.ID || item.ma || item.Ma;
              if (rawSlug) {
                const clean = String(rawSlug).trim().toLowerCase().replace(/[-_]/g, "");
                return clean === "phuongnha";
              }
              return false;
            });

            if (ownerRow) {
              const photo = extractPhotoUrl(ownerRow);
              if (photo) {
                cachedAvatarUrl = photo;
                lastFetchTime = now;
                return NextResponse.json(
                  { avatarUrl: cachedAvatarUrl },
                  {
                    headers: {
                      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                    },
                  }
                );
              }
            }
          } else if (rawList !== undefined) {
            console.warn("[Avatar Route] sheet 'guests' returned non-array data:", rawList);
          }
        } else {
          console.warn(`[Avatar Route] sheet 'guests' responded with HTTP ${res.status}`);
        }
      } catch (err) {
        console.warn("[Avatar Route] Could not fetch from Sheet guests:", err);
      }
    } else {
      console.warn("[Avatar Route] graduationConfig.googleScriptUrl is not configured");
    }

    console.warn("[Avatar Route] Falling back to default avatar");
    return NextResponse.json(
      { avatarUrl: cachedAvatarUrl || graduationConfig.avatarUrl },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "X-Data-Source": "fallback",
        },
      }
    );
  } catch (err) {
    console.error("[Avatar Route] GET error:", err);
    return NextResponse.json(
      { avatarUrl: graduationConfig.avatarUrl },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { avatarUrl, slug } = body;

    if (!avatarUrl || typeof avatarUrl !== "string") {
      return NextResponse.json({ success: false, error: "Đường dẫn ảnh không hợp lệ" }, { status: 400 });
    }

    const cleanSlug = String(slug || "").trim().toLowerCase().replace(/[-_]/g, "");
    if (cleanSlug !== "phuongnha") {
      return NextResponse.json({ success: false, error: "Bạn không có quyền đổi ảnh bìa này" }, { status: 403 });
    }

    const cleanUrl = avatarUrl.trim();

    if (!graduationConfig.googleScriptUrl) {
      console.error("[Avatar Route POST] graduationConfig.googleScriptUrl is not configured");
      return NextResponse.json({ success: false, error: "Chưa cấu hình Google Script URL" }, { status: 500 });
    }

    const timestampStr = new Date().toLocaleString("vi-VN");

    // 1. Ghi dòng mới vào sheet chuyên dụng "avatars"
    const payloadAvatar = {
      type: "AVATAR_UPLOAD",
      action: "AVATAR_UPLOAD",
      sheet: "avatars",
      uploadTime: timestampStr,
      cloudinaryImageLink: cleanUrl,
      uploader: "Phương Nhã",
      status: "true",
      note: "Ảnh đại diện bìa thiệp chính thức",
      // Backward-compatibility keys
      "Thời Gian": timestampStr,
      "Link Ảnh Cloudinary": cleanUrl,
      photoUrl: cleanUrl,
      url: cleanUrl,
      Tên: "Phương Nhã",
      name: "Phương Nhã",
      "Đang Sử Dụng": "true",
      isActive: "true",
      "Ghi Chú": "Ảnh đại diện bìa thiệp chính thức",
      caption: "Ảnh đại diện bìa thiệp chính thức",
      timestamp: timestampStr,
    };

    // 2. Gửi đồng thời tới cả 2 sheet để đồng bộ và đợi kết quả
    const results = await Promise.allSettled([
      fetch(graduationConfig.googleScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payloadAvatar),
      }),
      fetch(graduationConfig.googleScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          type: "AVATAR_UPDATE",
          action: "AVATAR_UPDATE",
          sheet: "guests",
          slug: "phuongnha",
          specialPhoto: cleanUrl,
          cloudinaryImageLink: cleanUrl,
          photoUrl: cleanUrl,
          timestamp: timestampStr,
        }),
      }),
    ]);

    const anySuccess = results.some(
      (r) => r.status === "fulfilled" && r.value.ok
    );

    if (!anySuccess) {
      console.error("[Avatar Route POST] All Google Sheet avatar updates failed:", results);
      return NextResponse.json(
        { success: false, error: "Không thể lưu ảnh đại diện vào Google Sheets" },
        { status: 502 }
      );
    }

    cachedAvatarUrl = cleanUrl;
    lastFetchTime = Date.now();

    return NextResponse.json({ success: true, avatarUrl: cleanUrl });
  } catch (err) {
    console.error("[Avatar Route] POST error:", err);
    return NextResponse.json({ success: false, error: "Lỗi hệ thống khi lưu ảnh đại diện" }, { status: 500 });
  }
}
