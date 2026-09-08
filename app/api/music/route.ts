import { NextResponse } from "next/server";
import { graduationConfig, AudioPreset } from "@/config/graduation";

export const dynamic = "force-dynamic";

let cachedMusicData: { activeAudioUrl: string | null; playlist: AudioPreset[] } | null = null;
let lastFetchTime = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isRefresh = searchParams.get("refresh") === "1";
  const now = Date.now();

  if (!isRefresh && cachedMusicData && now - lastFetchTime < 5000) {
    return NextResponse.json(cachedMusicData, {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
      },
    });
  }

  if (!graduationConfig.googleScriptUrl) {
    return NextResponse.json({ activeAudioUrl: null, playlist: [] });
  }

  try {
    const res = await fetch(
      `${graduationConfig.googleScriptUrl}?action=getMusic&sheet=NhacNen${isRefresh ? `&_t=${now}` : ""}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: isRefresh ? "no-store" : "default",
        next: isRefresh ? { revalidate: 0 } : { revalidate: 5 },
      }
    );

    if (res.ok) {
      const rawList = await res.json();
      if (Array.isArray(rawList) && rawList.length > 0) {
        const playlist: AudioPreset[] = [];
        let activeAudioUrl: string | null = null;

        rawList.forEach((item: Record<string, unknown>, idx: number) => {
          const rawUrl =
            item.url ||
            item.Url ||
            item.audioUrl ||
            item.AudioUrl ||
            item.link ||
            item.Link ||
            item.linkNhac ||
            item.LinkNhac ||
            item.nhacNen ||
            item.NhacNen ||
            item.src ||
            item.Src;

          if (rawUrl && typeof rawUrl === "string") {
            const cleanUrl = rawUrl.trim();
            if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://") || cleanUrl.startsWith("/")) {
              const title = String(
                item.title ||
                  item.Title ||
                  item.tenBaiHat ||
                  item.TenBaiHat ||
                  item.ten ||
                  item.Ten ||
                  item.name ||
                  item.Name ||
                  `Bài hát ${idx + 1}`
              ).trim();

              const artist = String(
                item.artist ||
                  item.Artist ||
                  item.caSi ||
                  item.CaSi ||
                  item.tacGia ||
                  item.TacGia ||
                  item.theLoai ||
                  "Nhạc Nền Cloud"
              ).trim();

              const rawActive =
                item.isActive ??
                item.IsActive ??
                item.dangSuDung ??
                item.DangSuDung ??
                item.phat ??
                item.Phat ??
                item.active ??
                item.Active ??
                item.phatChinh ??
                item.PhatChinh;

              let isActive = false;
              if (rawActive !== undefined && rawActive !== null && String(rawActive).trim() !== "") {
                const s = String(rawActive).trim().toLowerCase();
                if (s === "true" || s === "1" || s === "yes" || s === "co" || s === "có" || s === "x" || s === "phat" || s === "phát") {
                  isActive = true;
                }
              }

              if (isActive && !activeAudioUrl) {
                activeAudioUrl = cleanUrl;
              }

              const uploadedAt = String(
                item.uploadedAt ||
                  item.UploadedAt ||
                  item.thoiGianUp ||
                  item.ThoiGianUp ||
                  item.thoiGianThayDoi ||
                  item.ThoiGianThayDoi ||
                  item.thoiGian ||
                  item.ThoiGian ||
                  item.timestamp ||
                  item.Timestamp ||
                  item["Thời Gian"] ||
                  item["Thời gian"] ||
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
          }
        });

        const resultData = {
          activeAudioUrl: activeAudioUrl || (playlist.length > 0 ? playlist[0].url : null),
          playlist,
        };

        cachedMusicData = resultData;
        lastFetchTime = now;

        return NextResponse.json(resultData, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });
      }
    }
  } catch (err) {
    console.warn("[Music Route] Error fetching from Google Sheet 'NhacNen':", err);
  }

  return NextResponse.json(cachedMusicData || { activeAudioUrl: null, playlist: [] });
}
