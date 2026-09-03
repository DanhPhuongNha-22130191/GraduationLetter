import { NextResponse } from "next/server";
import { graduationConfig, GalleryItem } from "@/config/graduation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isRefresh = searchParams.get("refresh") === "1";

  if (!graduationConfig.googleScriptUrl) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `${graduationConfig.googleScriptUrl}?action=getPhotos&sheet=AnhKyNiem`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: isRefresh ? "no-store" : "default",
        next: isRefresh ? { revalidate: 0 } : { revalidate: 15 },
      }
    );

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const rawList = await res.json();
    if (!Array.isArray(rawList)) {
      return NextResponse.json([]);
    }

    const seenUrls = new Set<string>();
    const candidates: Array<{
      item: Record<string, unknown>;
      cleanUrl: string;
      rawCaption: string;
      category: string;
      idx: number;
    }> = [];

    for (let idx = 0; idx < rawList.length; idx++) {
      const item = rawList[idx];
      const rawUrl =
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
            item.category ||
              item.Category ||
              item["Chủ Đề"] ||
              item["Chủ đề"] ||
              item.chuDe ||
              item.ChuDe ||
              "Kỷ Niệm"
          ).trim();

          candidates.push({
            item,
            cleanUrl,
            rawCaption,
            category: category || "Kỷ Niệm",
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
          });
        }
      })
    );

    return NextResponse.json(validPhotos, {
      headers: {
        "Cache-Control": isRefresh
          ? "no-cache, no-store, must-revalidate"
          : "public, s-maxage=15, stale-while-revalidate=45",
      },
    });
  } catch (err) {
    console.error("Error in /api/photos route:", err);
    return NextResponse.json([]);
  }
}
