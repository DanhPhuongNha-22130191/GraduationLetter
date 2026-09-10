import { NextResponse } from "next/server";
import { graduationConfig, AudioPreset } from "@/config/graduation";

export const dynamic = "force-dynamic";

let cachedMusicData: { activeAudioUrl: string | null; playlist: AudioPreset[] } | null = null;
let lastFetchTime = 0;

/**
 * Trích xuất đường dẫn âm thanh hợp lệ từ bất kỳ cột nào trong hàng dữ liệu Google Sheet
 */
function extractAudioUrl(item: Record<string, unknown>): string | null {
  // 1. Kiểm tra các trường thông dụng nhất (Google Sheet NhacNen lưu URL ở cột DangSuDung)
  const priorityCandidates = [
    item.DangSuDung,
    item.dangSuDung,
    item.url,
    item.Url,
    item.audioUrl,
    item.AudioUrl,
    item.linkNhac,
    item.LinkNhac,
    item.link,
    item.Link,
    item.nhacNen,
    item.NhacNen,
    item.src,
    item.Src,
  ];

  for (const c of priorityCandidates) {
    if (typeof c === "string") {
      const clean = c.trim();
      if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/")) {
        return clean;
      }
    }
  }

  // 2. Quét toàn bộ các giá trị của item để tìm bất kỳ URL âm thanh hợp lệ nào
  for (const val of Object.values(item)) {
    if (typeof val === "string") {
      const clean = val.trim();
      if (
        (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/audio/")) &&
        (clean.includes(".mp3") ||
          clean.includes(".m4a") ||
          clean.includes(".wav") ||
          clean.includes(".aac") ||
          clean.includes(".ogg") ||
          clean.includes("cloudinary.com") ||
          clean.includes("/audio/"))
      ) {
        return clean;
      }
    }
  }

  return null;
}

/**
 * Nhận diện trạng thái bài hát đang được phát (active)
 */
function extractIsActive(item: Record<string, unknown>): boolean {
  const activeCandidates = [
    item.ThuTu,
    item.thuTu,
    item.isActive,
    item.IsActive,
    item.dangSuDung,
    item.DangSuDung,
    item.active,
    item.Active,
    item.phat,
    item.Phat,
    item.phatChinh,
    item.PhatChinh,
  ];

  for (const a of activeCandidates) {
    if (a === true || a === 1) return true;
    if (typeof a === "string") {
      const s = a.trim().toLowerCase();
      if (
        s === "true" ||
        s === "1" ||
        s === "yes" ||
        s === "co" ||
        s === "có" ||
        s === "x" ||
        s === "phat" ||
        s === "phát" ||
        s === "active"
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Trích xuất tên bài hát chính xác
 */
function extractTitle(item: Record<string, unknown>, audioUrl: string, idx: number): string {
  const candidates = [
    item.CaSi, // Google Apps Script lưu title vào cột CaSi
    item.caSi,
    item.tenBaiHat,
    item.TenBaiHat,
    item.title,
    item.Title,
    item.name,
    item.Name,
  ];

  for (const c of candidates) {
    if (typeof c === "string") {
      const clean = c.trim();
      // Bỏ qua nếu giá trị chỉ là số thứ tự dòng hoặc text phân loại link
      if (
        clean &&
        !/^\d+$/.test(clean) &&
        clean !== "Graduation Theme" &&
        clean !== "Link MP3 Trực Tiếp" &&
        clean !== "Cloudinary Upload"
      ) {
        return clean.replace(/\.[^/.]+$/, "");
      }
    }
  }

  // Nếu không có tên cụ thể, trích xuất từ tên tệp URL
  try {
    const fileName = audioUrl.split("/").pop()?.split("?")[0];
    if (fileName && fileName.length > 2) {
      return decodeURIComponent(fileName).replace(/\.[^/.]+$/, "");
    }
  } catch {}

  return `Bản nhạc ${idx + 1}`;
}

/**
 * Trích xuất nghệ sĩ / nguồn phát
 */
function extractArtist(item: Record<string, unknown>): string {
  const candidates = [
    item.LinkNhac,
    item.linkNhac,
    item.artist,
    item.Artist,
    item.tacGia,
    item.TacGia,
    item.theLoai,
  ];

  for (const c of candidates) {
    if (typeof c === "string") {
      const clean = c.trim();
      if (clean && !clean.startsWith("http://") && !clean.startsWith("https://") && clean.length < 50) {
        return clean;
      }
    }
  }

  return "Nhạc Nền Graduation";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isRefresh = searchParams.get("refresh") === "1";
  const now = Date.now();

  // Bộ nhớ đệm tạm thời 1.5s để chống spam fetch từ nhiều component cùng lúc
  if (!isRefresh && cachedMusicData && now - lastFetchTime < 1500) {
    return NextResponse.json(cachedMusicData, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  if (!graduationConfig.googleScriptUrl) {
    return NextResponse.json({ activeAudioUrl: null, playlist: [] });
  }

  try {
    const res = await fetch(
      `${graduationConfig.googleScriptUrl}?action=getMusic&sheet=NhacNen&_t=${now}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        next: { revalidate: 0 },
      }
    );

    if (res.ok) {
      const rawList = await res.json();
      if (Array.isArray(rawList) && rawList.length > 0) {
        const playlist: AudioPreset[] = [];
        let activeAudioUrl: string | null = null;

        rawList.forEach((item: Record<string, unknown>, idx: number) => {
          const cleanUrl = extractAudioUrl(item);

          if (cleanUrl) {
            const title = extractTitle(item, cleanUrl, idx);
            const artist = extractArtist(item);
            const isActive = extractIsActive(item);

            if (isActive) {
              activeAudioUrl = cleanUrl;
            }

            const uploadedAt = String(
              item.ThoiGianUp ||
                item.thoiGianUp ||
                item.uploadedAt ||
                item.UploadedAt ||
                item.thoiGian ||
                item.timestamp ||
                ""
            ).trim();

            playlist.push({
              id: `sheet-music-${idx}`,
              title,
              artist,
              url: cleanUrl,
              uploadedAt: uploadedAt || undefined,
            });
          }
        });

        // Nếu không có bài nào có cờ active rõ ràng, chọn bài hát mới nhất (ở cuối sheet)
        if (!activeAudioUrl && playlist.length > 0) {
          activeAudioUrl = playlist[playlist.length - 1].url;
        }

        const resultData = {
          activeAudioUrl: activeAudioUrl || (playlist.length > 0 ? playlist[0].url : null),
          playlist,
        };

        cachedMusicData = resultData;
        lastFetchTime = now;

        return NextResponse.json(resultData, {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        });
      }
    }
  } catch (err) {
    console.warn("[Music Route GET] Error fetching from Google Sheet 'NhacNen':", err);
  }

  return NextResponse.json(cachedMusicData || { activeAudioUrl: null, playlist: [] }, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

/**
 * POST /api/music: Lưu nhạc vào Google Sheet siêu tốc & Cập nhật bộ nhớ đệm server ngay tức khắc
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = String(body.title || body.name || "Bài hát đã tải lên").trim();
    const artist = String(body.artist || "Cloudinary Upload").trim();
    const rawUrl = String(body.url || body.audioUrl || body.link || "").trim();

    if (
      !rawUrl ||
      (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://") && !rawUrl.startsWith("/"))
    ) {
      return NextResponse.json(
        { success: false, error: "Đường dẫn bài hát không hợp lệ" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toLocaleString("vi-VN");

    // 1. CẬP NHẬT NGAY LẬP TỨC VÀO RAM SERVER (0ms)
    // Giúp tất cả các thiết bị (điện thoại, laptop) đọc được bài hát mới ngay lập tức
    const newTrack: AudioPreset = {
      id: `sheet-music-${Date.now()}`,
      title,
      artist,
      url: rawUrl,
      uploadedAt: timestamp,
    };

    const existingPlaylist = cachedMusicData?.playlist || [];
    const filteredPlaylist = existingPlaylist.filter((p) => p.url !== rawUrl);
    cachedMusicData = {
      activeAudioUrl: rawUrl,
      playlist: [newTrack, ...filteredPlaylist],
    };
    lastFetchTime = Date.now();

    // 2. GỬI TỨC THỜI TỪ SERVER ĐẾN GOOGLE APPS SCRIPT
    // Server-to-server request không bị trình duyệt bóp băng thông, không bị lỗi CORS redirect
    let googleSheetSaved = false;
    if (graduationConfig.googleScriptUrl) {
      try {
        const sheetRes = await fetch(graduationConfig.googleScriptUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            type: "SAVE_MUSIC",
            action: "SAVE_MUSIC",
            title,
            artist,
            url: rawUrl,
            timestamp,
          }),
        });
        if (sheetRes.ok) {
          googleSheetSaved = true;
        }
      } catch (sheetErr) {
        console.warn("[Music POST] Warning when forwarding to Google Apps Script:", sheetErr);
      }
    }

    return NextResponse.json({
      success: true,
      googleSheetSaved,
      activeAudioUrl: rawUrl,
      playlist: cachedMusicData.playlist,
    });
  } catch (err) {
    console.error("[Music Route POST] Error handling music save:", err);
    return NextResponse.json(
      { success: false, error: "Lỗi hệ thống khi lưu nhạc" },
      { status: 500 }
    );
  }
}
