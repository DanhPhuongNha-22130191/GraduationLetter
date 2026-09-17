import { NextResponse } from "next/server";
import { graduationConfig, GalleryItem } from "@/config/graduation";

export const dynamic = "force-dynamic";

let cachedPhotos: GalleryItem[] | null = null;
let lastPhotosFetchTime = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isRefresh = searchParams.get("refresh") === "1";

  if (!graduationConfig.googleScriptUrl) {
    console.warn("[Photos Route] graduationConfig.googleScriptUrl is not configured");
    return NextResponse.json(cachedPhotos || []);
  }

  try {
    const res = await fetch(
      `${graduationConfig.googleScriptUrl}?action=getPhotos&sheet=photos${isRefresh ? `&_t=${Date.now()}` : ""}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: isRefresh ? "no-store" : "default",
        next: isRefresh ? { revalidate: 0 } : { revalidate: 15 },
      }
    );

    if (!res.ok) {
      console.warn(`[Photos Route] Upstream Google Script responded with HTTP ${res.status}`);
      if (cachedPhotos && cachedPhotos.length > 0) {
        console.warn("[Photos Route] Returning stale cached photos as fallback");
        return NextResponse.json(cachedPhotos, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "X-Data-Source": "stale-cache",
          },
        });
      }
      return NextResponse.json([]);
    }

    let rawList: unknown;
    try {
      rawList = await res.json();
    } catch (parseErr) {
      console.warn("[Photos Route] Failed to parse JSON from Google Script:", parseErr);
      if (cachedPhotos && cachedPhotos.length > 0) {
        return NextResponse.json(cachedPhotos, {
          headers: { "X-Data-Source": "stale-cache" },
        });
      }
      return NextResponse.json([]);
    }

    if (!Array.isArray(rawList)) {
      console.warn("[Photos Route] Google Script returned non-array payload:", rawList);
      if (cachedPhotos && cachedPhotos.length > 0) {
        return NextResponse.json(cachedPhotos, {
          headers: { "X-Data-Source": "stale-cache" },
        });
      }
      return NextResponse.json([]);
    }

    const seenUrls = new Set<string>();
    const candidates: Array<{
      item: Record<string, unknown>;
      cleanUrl: string;
      rawCaption: string;
      category: string;
      priority?: number;
      idx: number;
    }> = [];

    for (let idx = 0; idx < rawList.length; idx++) {
      const item = rawList[idx];
      const rawUrl =
        item.cloudinaryImageLink ||
        item.photoUrl ||
        item.PhotoUrl ||
        item["Link Ảnh Cloudinary"] ||
        item["Link Ảnh"] ||
        item["Link"] ||
        item["Ảnh"] ||
        item.photo ||
        item.Photo ||
        item.src ||
        item.Src ||
        item.url ||
        item.Url ||
        item.specialPhoto ||
        item.SpecialPhoto ||
        item.link ||
        item.Link;

      if (rawUrl && typeof rawUrl === "string") {
        const cleanUrl = rawUrl.trim();
        if (
          (cleanUrl.startsWith("http://") ||
            cleanUrl.startsWith("https://") ||
            cleanUrl.startsWith("/")) &&
          !seenUrls.has(cleanUrl)
        ) {
          seenUrls.add(cleanUrl);
          const rawCaption = String(
            item.label ||
              item.Label ||
              item.caption ||
              item.Caption ||
              item["Lời Nhắn / Kỷ Niệm"] ||
              item["Lời Nhắn"] ||
              item["Kỷ Niệm"] ||
              item.title ||
              item.Title ||
              item.loiChuc ||
              ""
          ).trim();
          const category = String(
            item.topic ||
              item.Topic ||
              item.category ||
              item.Category ||
              item["Chủ Đề"] ||
              item["Chủ đề"] ||
              item.chuDe ||
              item.ChuDe ||
              "Kỷ Niệm"
          ).trim();

          // Bỏ qua ảnh thuộc chủ đề "Ảnh đại diện" hoặc "Avatar" (không hiển thị ở phần Kỷ niệm)
          const lowerCat = category.toLowerCase();
          if (
            lowerCat === "ảnh đại diện" ||
            lowerCat === "anh dai dien" ||
            lowerCat === "avatar" ||
            lowerCat.includes("ảnh đại diện")
          ) {
            continue;
          }

          const rawPriority =
            item.priorityLevel ??
            item.PriorityLevel ??
            item.priority ??
            item.Priority ??
            item["Mức độ ưu tiên"] ??
            item["Mức Độ Ưu Tiên"] ??
            item["Mức độ"] ??
            item["Mức Độ"] ??
            item["Độ ưu tiên"] ??
            item["Độ Ưu Tiên"] ??
            item["Ưu tiên"] ??
            item["Ưu Tiên"] ??
            item["Thứ tự"] ??
            item["Thứ Tự"] ??
            item.order ??
            item.Order;

          let priority = 1;
          if (rawPriority !== undefined && rawPriority !== null && String(rawPriority).trim() !== "") {
            const num = Number(rawPriority);
            if (!isNaN(num)) {
              priority = num;
            }
          }

          candidates.push({
            item,
            cleanUrl,
            rawCaption,
            category: category || "Kỷ Niệm",
            priority,
            idx,
          });
        }
      }
    }

    // Kiểm tra song song sự tồn tại thực tế của ảnh trên Cloud (loại bỏ ảnh đã xóa trả về 404)
    const validPhotos: GalleryItem[] = [];

    await Promise.all(
      candidates.map(async (c) => {
        let isValid = true;
        // Nếu là ảnh Cloudinary hoặc URL ngoài, kiểm tra mã phản hồi HTTP HEAD
        if (c.cleanUrl.startsWith("http://") || c.cleanUrl.startsWith("https://")) {
          try {
            const headRes = await fetch(c.cleanUrl, {
              method: "HEAD",
              signal: AbortSignal.timeout(3500),
            });
            if (headRes.status !== 200 && headRes.status !== 304) {
              isValid = false;
            }
          } catch {
            // Nếu timeout hoặc lỗi mạng kiểm tra, cho qua nếu không phải 404 rõ ràng
            isValid = true;
          }
        }

        if (isValid) {
          const filename = c.cleanUrl.split("/").pop()?.replace(/[^a-zA-Z0-9_-]/g, "") || c.idx;
          validPhotos.push({
            id: `cloud-${c.idx}-${filename}`,
            title: c.rawCaption || c.category || "Ảnh kỷ niệm",
            category: c.category,
            src: c.cleanUrl,
            alt: c.rawCaption || `Ảnh kỷ niệm [${c.category}]`,
            priority: c.priority ?? 1,
            uploadIdx: c.idx,
          });
        }
      })
    );

    // Sắp xếp:
    // 1. Mức độ ưu tiên nhỏ hơn xếp trước (1, 2, 3...)
    // 2. Cùng mức ưu tiên: Ảnh mới hơn (uploadIdx lớn hơn) xếp lên đầu trang
    validPhotos.sort((a, b) => {
      const pA = typeof a.priority === "number" && !isNaN(a.priority) ? a.priority : 1;
      const pB = typeof b.priority === "number" && !isNaN(b.priority) ? b.priority : 1;
      if (pA !== pB) return pA - pB;
      const idxA = a.uploadIdx ?? 0;
      const idxB = b.uploadIdx ?? 0;
      return idxB - idxA;
    });

    if (validPhotos.length > 0) {
      cachedPhotos = validPhotos;
      lastPhotosFetchTime = Date.now();
    }

    return NextResponse.json(validPhotos, {
      headers: {
        "Cache-Control": isRefresh
          ? "no-cache, no-store, must-revalidate"
          : "public, s-maxage=15, stale-while-revalidate=45",
      },
    });
  } catch (err) {
    console.error("Error in /api/photos route:", err);
    if (cachedPhotos && cachedPhotos.length > 0) {
      console.warn("[Photos Route] Returning cachedPhotos in error handler");
      return NextResponse.json(cachedPhotos, {
        headers: { "X-Data-Source": "stale-cache" },
      });
    }
    return NextResponse.json([]);
  }
}
