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

/**
 * In-Memory Sliding Rate Limiter
 * Giới hạn: Tối đa 5 yêu cầu upload / 60 giây trên mỗi địa chỉ IP
 * Trong môi trường production multi-instance serverless, giải pháp lý tưởng là Upstash / Redis.
 * Với instance hiện tại, in-memory Map này bảo vệ API chống spam và cạn kiệt quota Google Apps Script.
 */
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

function checkRateLimit(ip: string, maxRequests = 5, windowMs = 60000): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Dọn dẹp định kỳ nếu map quá lớn (> 5000 IPs)
  if (rateLimitMap.size > 5000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (record.count >= maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

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
    // 1. Rate Limiting Protection per Client IP
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "client-ip";

    const { allowed, retryAfterSeconds } = checkRateLimit(clientIp, 5, 60000);
    if (!allowed) {
      console.warn(`[Photos Upload] Rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json(
        {
          success: false,
          error: `Bạn đang gửi yêu cầu tải ảnh quá nhanh. Vui lòng chờ ${retryAfterSeconds} giây trước khi gửi tiếp.`,
          retryAfter: retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
          },
        }
      );
    }

    // 2. Validate payload
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Dữ liệu gửi lên không đúng định dạng JSON" }, { status: 400 });
    }

    const rawPhotos: PhotoPayload[] = Array.isArray(body.photos)
      ? (body.photos as PhotoPayload[])
      : body.photoUrl
      ? [body as unknown as PhotoPayload]
      : [];

    // Giới hạn tối đa 12 ảnh mỗi lần gửi
    const photos = rawPhotos.slice(0, 12).filter((p) => {
      if (!p || typeof p.photoUrl !== "string") return false;
      const url = p.photoUrl.trim();
      return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/");
    });

    if (photos.length === 0) {
      return NextResponse.json({ success: false, error: "Không có dữ liệu ảnh hợp lệ" }, { status: 400 });
    }

    // Sanitize string fields
    photos.forEach((p) => {
      p.name = (p.name || "Khách mời").toString().trim().slice(0, 200);
      p.caption = (p.caption || "Ảnh kỷ niệm cùng Nhã").toString().trim().slice(0, 500);
      p.category = (p.category || "Kỷ Niệm").toString().trim().slice(0, 100);
      p.photoUrl = p.photoUrl.trim().slice(0, 2048);
    });

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
        // Delay 350ms giữa các dòng ghi để bảo vệ Google Sheets LockService
        if (i < photos.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 350));
        }
      }

      return { successCount, failedUrls };
    };

    // Chuỗi hóa hàng đợi tuần tự để bảo vệ Google Sheets LockService
    const queuePromise = serverWriteQueue.catch(() => {}).then(() => processBatch());
    serverWriteQueue = queuePromise.catch(() => {});

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
