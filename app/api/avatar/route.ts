import { NextResponse } from "next/server";
import { graduationConfig } from "@/config/graduation";

export const dynamic = "force-dynamic";

// In-memory server cache for persistent fast response across requests
let cachedAvatarUrl: string | null = null;

export async function GET() {
  try {
    // If we have an in-memory cached URL, return it
    if (cachedAvatarUrl) {
      return NextResponse.json({ avatarUrl: cachedAvatarUrl });
    }

    if (graduationConfig.googleScriptUrl) {
      // 1. Kiểm tra sheet AnhKyNiem với Chủ Đề = "Ảnh đại diện"
      try {
        const photosRes = await fetch(`${graduationConfig.googleScriptUrl}?action=getPhotos&sheet=AnhKyNiem`, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
          next: { revalidate: 0 },
        });

        if (photosRes.ok) {
          const photosList = await photosRes.json();
          if (Array.isArray(photosList) && photosList.length > 0) {
            const avatarRows = photosList.filter((item: Record<string, unknown>) => {
              const cat = String(
                item.category || item.Category || item["Chủ Đề"] || item["Chủ đề"] || item.chuDe || ""
              ).trim();
              return cat === "Ảnh đại diện";
            });

            if (avatarRows.length > 0) {
              const lastAvatarRow = avatarRows[avatarRows.length - 1];
              const rawUrl =
                lastAvatarRow.photoUrl ||
                lastAvatarRow.PhotoUrl ||
                lastAvatarRow["Link Ảnh Cloudinary"] ||
                lastAvatarRow["Link Ảnh"] ||
                lastAvatarRow.url ||
                lastAvatarRow.photo ||
                lastAvatarRow.specialPhoto;
              if (rawUrl && typeof rawUrl === "string" && rawUrl.trim().startsWith("http")) {
                cachedAvatarUrl = rawUrl.trim();
                return NextResponse.json({ avatarUrl: cachedAvatarUrl });
              }
            }
          }
        }
      } catch (err) {
        console.warn("[Avatar Route] Could not fetch photos from Sheet AnhKyNiem:", err);
      }

      // 2. Dự phòng: Kiểm tra sheet KhachMoi với slug = "phuongnha"
      try {
        const res = await fetch(`${graduationConfig.googleScriptUrl}?action=getGuests&sheet=KhachMoi`, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
          next: { revalidate: 0 },
        });

        if (res.ok) {
          const rawList = await res.json();
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
              const photo =
                ownerRow.specialPhoto ||
                ownerRow.SpecialPhoto ||
                ownerRow.photoUrl ||
                ownerRow.PhotoUrl ||
                ownerRow.avatar ||
                ownerRow.Avatar ||
                ownerRow.photo ||
                ownerRow.Photo;
              if (photo && typeof photo === "string" && photo.trim().startsWith("http")) {
                cachedAvatarUrl = photo.trim();
                return NextResponse.json({ avatarUrl: cachedAvatarUrl });
              }
            }
          }
        }
      } catch (err) {
        console.warn("[Avatar Route] Could not fetch from Sheet KhachMoi:", err);
      }
    }

    return NextResponse.json({ avatarUrl: cachedAvatarUrl });
  } catch (err) {
    console.error("[Avatar Route] GET error:", err);
    return NextResponse.json({ avatarUrl: null });
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
    cachedAvatarUrl = cleanUrl;

    if (graduationConfig.googleScriptUrl) {
      // 1. Ghi dòng mới vào sheet AnhKyNiem với Chủ Đề = "Ảnh đại diện"
      const payloadAnhKyNiem = {
        type: "PHOTO_UPLOAD",
        action: "PHOTO_UPLOAD",
        sheet: "AnhKyNiem",
        name: "Phương Nhã",
        caption: "Ảnh đại diện bìa thiệp tốt nghiệp",
        category: "Ảnh đại diện",
        "Chủ Đề": "Ảnh đại diện",
        photoUrl: cleanUrl,
        sourceType: "file",
        timestamp: new Date().toLocaleString("vi-VN"),
        priority: 1,
        "Mức độ ưu tiên": 1,
        "Ưu tiên": 1,
        "Thứ tự": 1,
      };

      fetch(graduationConfig.googleScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payloadAnhKyNiem),
      }).catch((err) => {
        console.warn("[Avatar Route] Google Sheet AnhKyNiem sync error:", err);
      });

      // 2. Cập nhật dòng của phuongnha trong sheet KhachMoi
      fetch(graduationConfig.googleScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          type: "AVATAR_UPDATE",
          action: "AVATAR_UPDATE",
          sheet: "KhachMoi",
          slug: "phuongnha",
          specialPhoto: cleanUrl,
          photoUrl: cleanUrl,
          timestamp: new Date().toLocaleString("vi-VN"),
        }),
      }).catch((err) => {
        console.warn("[Avatar Route] Google Sheet KhachMoi sync error:", err);
      });
    }

    return NextResponse.json({ success: true, avatarUrl: cleanUrl });
  } catch (err) {
    console.error("[Avatar Route] POST error:", err);
    return NextResponse.json({ success: false, error: "Lỗi hệ thống" }, { status: 500 });
  }
}
