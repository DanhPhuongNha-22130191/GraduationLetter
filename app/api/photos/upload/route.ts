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
let serverWriteQueue: Promise<void> = Promise.resolve();

async function writeSinglePhotoToSheet(photo: PhotoPayload, retries = 3): Promise<boolean> {
  if (!graduationConfig.googleScriptUrl || !photo.photoUrl) return false;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(graduationConfig.googleScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          type: "PHOTO_UPLOAD",
          action: "PHOTO_UPLOAD",
          sheet: "AnhKyNiem",
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
        return true;
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

    // Serialize Google Sheets write execution and wait for completion
    serverWriteQueue = serverWriteQueue
      .then(async () => {
        for (let i = 0; i < photos.length; i++) {
          await writeSinglePhotoToSheet(photos[i]);
          // Safe 350ms delay between consecutive rows for Google Sheets LockService
          if (i < photos.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 350));
          }
        }
      })
      .catch((err) => {
        console.error("[Photos Upload] Server queue processing error:", err);
      });

    // Wait for current queue batch to finish writing to Google Sheets
    await serverWriteQueue;

    return NextResponse.json({
      success: true,
      count: photos.length,
      message: `Đã lưu thành công ${photos.length} ảnh vào Google Sheets`,
    });
  } catch (err) {
    console.error("[Photos Upload] Error in POST handler:", err);
    return NextResponse.json({ success: false, error: "Lỗi hệ thống" }, { status: 500 });
  }
}
