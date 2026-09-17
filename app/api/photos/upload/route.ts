import { NextResponse } from "next/server";
import { graduationConfig } from "@/config/graduation";

export const dynamic = "force-dynamic";

interface PhotoPayload {
  name?: string;
  caption?: string;
  category?: string;
  photoUrl: string;
  sourceType?: string;
  timestamp?: string;
  priority?: number;
}

// Global server-side queue to serialize all Google Sheets writes across all concurrent users
let serverWriteQueue: Promise<unknown> = Promise.resolve();

async function writeSinglePhotoToSheet(photo: PhotoPayload, retries = 3): Promise<boolean> {
  if (!graduationConfig.googleScriptUrl || !photo.photoUrl) {
    console.error("[Photos Upload] Missing googleScriptUrl or photoUrl", {
      hasScriptUrl: Boolean(graduationConfig.googleScriptUrl),
      photoUrl: photo.photoUrl,
    });
    return false;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(graduationConfig.googleScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          type: "PHOTO_UPLOAD",
          action: "PHOTO_UPLOAD",
          sheet: "photos",
          uploadTime: photo.timestamp || new Date().toLocaleString("vi-VN"),
          uploader: photo.name || "Khách mời",
          topic: photo.category || "Kỷ Niệm",
          label: photo.caption || "Ảnh kỷ niệm cùng Nhã",
          cloudinaryImageLink: photo.photoUrl,
          priorityLevel: typeof photo.priority === "number" && !isNaN(photo.priority) ? photo.priority : 1,
          // Backward-compatibility keys
          name: photo.name || "Khách mời",
          caption: photo.caption || "Ảnh kỷ niệm cùng Nhã",
          category: photo.category || "Kỷ Niệm",
          photoUrl: photo.photoUrl,
          sourceType: photo.sourceType || "file",
          timestamp: photo.timestamp || new Date().toLocaleString("vi-VN"),
          priority: typeof photo.priority === "number" && !isNaN(photo.priority) ? photo.priority : 1,
          "Mức độ ưu tiên": typeof photo.priority === "number" && !isNaN(photo.priority) ? photo.priority : 1,
          "Ưu tiên": typeof photo.priority === "number" && !isNaN(photo.priority) ? photo.priority : 1,
          "Thứ tự": typeof photo.priority === "number" && !isNaN(photo.priority) ? photo.priority : 1,
        }),
      });

      if (res.ok) {
        const text = await res.text();
        if (text) {
          try {
            const json = JSON.parse(text);
            if (json && (json.status === "error" || json.result === "error" || json.error)) {
              console.warn(`[Photos Upload] Google Script returned error response for ${photo.photoUrl}:`, json);
              continue;
            }
          } catch {
            if (text.includes("Exception:") || text.includes("Error:") || text.includes("<html")) {
              console.warn(`[Photos Upload] Google Script returned unexpected HTML/error response for ${photo.photoUrl}:`, text.slice(0, 200));
              continue;
            }
          }
        }
        return true;
      } else {
        console.warn(`[Photos Upload] Google Script responded with HTTP ${res.status} on attempt ${attempt}`);
      }
    } catch (err) {
      console.warn(`[Photos Upload] Attempt ${attempt} failed for ${photo.photoUrl}:`, err);
    }

    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
  return false;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawPhotos: PhotoPayload[] = Array.isArray(body.photos)
      ? body.photos
      : body.photoUrl
      ? [body]
      : [];

    // Giới hạn tối đa 12 ảnh mỗi lần gửi để đảm bảo chất lượng và tốc độ
    const photos = rawPhotos.slice(0, 12);

    if (photos.length === 0) {
      return NextResponse.json({ success: false, error: "Không có dữ liệu ảnh" }, { status: 400 });
    }

    // Task xử lý tuần tự cho request hiện tại
    const processBatch = async (): Promise<{ successCount: number; failedUrls: string[] }> => {
      let successCount = 0;
      const failedUrls: string[] = [];

      for (let i = 0; i < photos.length; i++) {
        const isSuccess = await writeSinglePhotoToSheet(photos[i]);
        if (isSuccess) {
          successCount++;
        } else {
          failedUrls.push(photos[i].photoUrl);
        }
        // Safe 350ms delay between consecutive rows for Google Sheets LockService
        if (i < photos.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 350));
        }
      }

      return { successCount, failedUrls };
    };

    // Chuỗi hóa hàng đợi tuần tự để bảo vệ Google Sheets LockService
    const queuePromise = serverWriteQueue.catch(() => {}).then(() => processBatch());
    serverWriteQueue = queuePromise;

    const { successCount, failedUrls } = await queuePromise;

    if (successCount === 0) {
      console.error("[Photos Upload] All photo writes failed to Google Sheets:", failedUrls);
      return NextResponse.json(
        {
          success: false,
          error: "Không thể lưu ảnh vào Google Sheets sau nhiều lần thử lại",
          failedUrls,
        },
        { status: 502 }
      );
    }

    if (failedUrls.length > 0) {
      console.warn(`[Photos Upload] Partially saved: ${successCount} succeeded, ${failedUrls.length} failed`);
      return NextResponse.json({
        success: true,
        partial: true,
        count: successCount,
        failedCount: failedUrls.length,
        failedUrls,
        message: `Đã lưu ${successCount}/${photos.length} ảnh vào Google Sheets (${failedUrls.length} ảnh thất bại)`,
      });
    }

    return NextResponse.json({
      success: true,
      count: successCount,
      message: `Đã lưu thành công ${successCount} ảnh vào Google Sheets`,
    });
  } catch (err) {
    console.error("[Photos Upload] Error in POST handler:", err);
    return NextResponse.json({ success: false, error: "Lỗi hệ thống khi lưu ảnh" }, { status: 500 });
  }
}
