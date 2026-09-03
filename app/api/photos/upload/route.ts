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
    const photos: PhotoPayload[] = Array.isArray(body.photos)
      ? body.photos
      : body.photoUrl
      ? [body]
      : [];

    if (photos.length === 0) {
      return NextResponse.json({ success: false, error: "Không có dữ liệu ảnh" }, { status: 400 });
    }

    // Schedule background queue processing on server with serialized execution
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

    // Return instant success to the client so UI updates immediately
    return NextResponse.json({
      success: true,
      count: photos.length,
      message: `Đã đưa ${photos.length} ảnh vào hàng đợi lưu trữ an toàn`,
    });
  } catch (err) {
    console.error("[Photos Upload] Error in POST handler:", err);
    return NextResponse.json({ success: false, error: "Lỗi hệ thống" }, { status: 500 });
  }
}
