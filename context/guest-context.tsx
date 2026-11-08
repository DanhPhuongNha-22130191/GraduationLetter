"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { fetchMyGuest, purgeLegacyGuestCache, type GuestProfile } from "@/config/guests";
import { graduationConfig } from "@/config/graduation";
import { normalizeSheetDate } from "@/config/date-utils";
import { Language, translations } from "@/config/i18n";
import { getVisitorId, visitorNote } from "@/config/visitor";

export type GuestPronounMode = "friend" | "elder" | "senior" | "junior";

// Thông tin của chính khách đang dùng thiết bị này (chỉ 1 khách, không phải cả danh sách)
const OWN_GUEST_CACHE_KEY = "invitation_own_guest_v1";

interface GuestContextType {
  guestName: string;
  currentSlug: string;
  isOwner: boolean;
  hasCustomGuest: boolean;
  /** Đang chờ server xác nhận khách của link riêng */
  isResolvingGuest: boolean;
  isRegisteredGuest: boolean;
  canUpload: boolean;
  pronounMode: GuestPronounMode;
  customMessage?: string;
  customTime?: string;
  customDate?: string;
  effectiveTime?: string;
  effectiveDate?: string;
  hasCustomDate: boolean;
  hasCustomTime: boolean;
  isFormal: boolean;
  isSenior: boolean;
  isJunior: boolean;
  audioUrl: string;
  setAudioUrl: (url: string) => void;
  setGuestName: (name: string, mode?: GuestPronounMode) => void;
  getGreetingPrefix: (lang?: Language) => string;
  getSelfPronoun: () => string;
  generateGuestUrl: (name: string, mode?: GuestPronounMode) => string;
}

const GuestContext = createContext<GuestContextType>({
  guestName: "",
  currentSlug: "",
  isOwner: false,
  hasCustomGuest: false,
  isResolvingGuest: false,
  isRegisteredGuest: false,
  canUpload: false,
  pronounMode: "friend",
  customMessage: undefined,
  customTime: undefined,
  customDate: undefined,
  effectiveTime: undefined,
  effectiveDate: undefined,
  hasCustomDate: false,
  hasCustomTime: false,
  isFormal: false,
  isSenior: false,
  isJunior: false,
  audioUrl: graduationConfig.audioUrl,
  setAudioUrl: () => {},
  setGuestName: () => {},
  getGreetingPrefix: (_lang?: Language) => "Thân mời",
  getSelfPronoun: () => "Nhã",
  generateGuestUrl: () => "",
});

/**
 * Tự động nhận diện vai xưng dựa vào danh xưng đầu câu của khách
 */
function autoDetectModeFromName(name: string): GuestPronounMode {
  const clean = name.trim().toLowerCase();
  if (!clean) return "friend";

  // Bậc tiền bối, Thầy Cô, Người lớn tuổi -> xưng con, Kính mời
  if (
    clean.startsWith("thầy") ||
    clean.startsWith("thay ") ||
    clean.startsWith("cô ") ||
    clean.startsWith("co ") ||
    clean.startsWith("bác") ||
    clean.startsWith("bac ") ||
    clean.startsWith("chú") ||
    clean.startsWith("chu ") ||
    clean.startsWith("cô chú") ||
    clean.startsWith("co chu") ||
    clean.startsWith("ông") ||
    clean.startsWith("ong ") ||
    clean.startsWith("bà") ||
    clean.startsWith("ba ") ||
    clean.startsWith("gia đình") ||
    clean.startsWith("gia dinh")
  ) {
    return "elder";
  }

  // Anh / Chị -> xưng em, Thân ái mời
  if (
    clean.startsWith("anh ") ||
    clean.startsWith("chị ") ||
    clean.startsWith("chi ") ||
    clean.startsWith("anh chị") ||
    clean.startsWith("anh chi")
  ) {
    return "senior";
  }

  // Em / Bé -> xưng anh, Mời
  if (
    clean.startsWith("em ") ||
    clean.startsWith("bé ") ||
    clean.startsWith("be ")
  ) {
    return "junior";
  }

  return "friend";
}

/**
 * Gửi log ngầm (Silent Beacon) về Google Sheets để biết ai đã mở thiệp (kể cả khách link chung)
 */
export function trackOpenInvitation(
  guestName?: string,
  mode?: string,
  opts?: { source?: "link" | "self" | "rsvp" }
) {
  if (typeof window === "undefined") return;
  const source = opts?.source ?? "link";
  const isAnonymous = !guestName || !guestName.trim();
  const vid = getVisitorId();
  // Khách link chung không nhập tên: kèm mã khách ngay trong cột viewer để đối chiếu sau
  const nameToLog = isAnonymous ? `Khách vãng lai (Link chung) · ${vid}` : guestName.trim();
  const sessionKey = `tracked_open_${source}_${encodeURIComponent(nameToLog)}`;
  try {
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "1");
  } catch {
    // ignore
  }

  try {
    {
      const modeLabel = isAnonymous
        ? "Mời chung"
        : mode === "elder"
        ? "Người lớn (con)"
        : mode === "senior"
        ? "Anh/Chị (em)"
        : mode === "junior"
        ? "Đàn em (anh)"
        : "Bạn bè (mình)";

      const how =
        isAnonymous
          ? "Khách mở thiệp (Link chung, không nhập tên)"
          : source === "self"
          ? "Khách mở link chung & tự nhập tên"
          : source === "rsvp"
          ? "Khách link chung đã gửi RSVP"
          : `Khách mở thiệp (${modeLabel})`;
      const note = `${how} · ${visitorNote()}`;

      const payload = {
        visitTime: new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
        viewer: nameToLog,
        role: modeLabel,
        note,
      };

      // Gửi qua server (server mới biết link Google Sheet)
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        // Silent fail
      });
    }
  } catch {
    // Silent fail
  }
}

export const GuestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [guestName, setGuestNameState] = useState<string>("");
  const [currentSlug, setCurrentSlugState] = useState<string>("");
  const [isRegisteredGuest, setIsRegisteredGuest] = useState<boolean>(false);
  const [canUpload, setCanUploadState] = useState<boolean>(false);
  const [pronounMode, setPronounModeState] = useState<GuestPronounMode>("friend");
  const [customMessage, setCustomMessageState] = useState<string | undefined>(undefined);
  const [customTime, setCustomTimeState] = useState<string | undefined>(undefined);
  const [customDate, setCustomDateState] = useState<string | undefined>(undefined);
  const [defaultEarliestDate, setDefaultEarliestDate] = useState<string | undefined>(undefined);
  const [defaultEarliestTime, setDefaultEarliestTime] = useState<string | undefined>(undefined);
  const [audioUrl, setAudioUrlState] = useState<string>(graduationConfig.audioUrl);
  const isInitialized = useRef(false);
  const isFetchingSheetRef = useRef(false);
  // true khi mở bằng link riêng và đang chờ server xác nhận khách (tránh hiện ô nhập tên 1-2 giây)
  // Mặc định true để lần vẽ đầu tiên (trước khi đọc URL) cũng không nháy ô nhập tên.
  const [isResolvingGuest, setIsResolvingGuest] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedAudio = localStorage.getItem("invitation_bg_audio_url") || sessionStorage.getItem("invitation_bg_audio_url");
        if (savedAudio) {
          setAudioUrlState(savedAudio);
        }
      } catch {}
    }
  }, []);

  const setAudioUrl = (url: string) => {
    const clean = url.trim();
    const finalUrl = clean || graduationConfig.audioUrl;
    setAudioUrlState(finalUrl);
    if (typeof window !== "undefined") {
      try {
        if (clean) {
          localStorage.setItem("invitation_bg_audio_url", clean);
          sessionStorage.setItem("invitation_bg_audio_url", clean);
        } else {
          localStorage.removeItem("invitation_bg_audio_url");
          sessionStorage.removeItem("invitation_bg_audio_url");
        }
        window.dispatchEvent(new CustomEvent("AUDIO_URL_CHANGED", { detail: finalUrl }));
      } catch {}
    }
  };

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Bản cũ lưu CẢ danh sách khách (kèm lời nhắn) trong trình duyệt -> xoá đi
    purgeLegacyGuestCache();

    const GUEST_KEYS = [
      "invitation_guest_name",
      "invitation_guest_is_registered",
      "invitation_guest_can_upload",
      "invitation_guest_mode",
      "invitation_guest_msg",
      "invitation_guest_time",
      "invitation_guest_date",
      "invitation_guest_slug",
    ];

    /** Áp dụng thông tin khách do server xác nhận (thiết bị được phép) */
    const applyGuest = (profile: GuestProfile, preview = false) => {
      const allowUpload = profile.canUpload !== false;
      setGuestNameState(profile.name);
      setIsRegisteredGuest(true);
      setCanUploadState(allowUpload);
      setPronounModeState(profile.mode);
      setCustomMessageState(profile.customMessage);
      setCustomTimeState(profile.customTime);
      setCustomDateState(profile.customDate);
      setCurrentSlugState(profile.slug || "");
      try {
        sessionStorage.setItem("invitation_guest_name", profile.name);
        sessionStorage.setItem("invitation_guest_is_registered", "true");
        sessionStorage.setItem("invitation_guest_can_upload", allowUpload ? "true" : "false");
        sessionStorage.setItem("invitation_guest_mode", profile.mode);
        sessionStorage.setItem("invitation_guest_slug", profile.slug || "");
        const setOrRemove = (k: string, v?: string) => (v ? sessionStorage.setItem(k, v) : sessionStorage.removeItem(k));
        setOrRemove("invitation_guest_msg", profile.customMessage);
        setOrRemove("invitation_guest_time", profile.customTime);
        setOrRemove("invitation_guest_date", profile.customDate);
        // Nhớ thông tin của CHÍNH khách này trên thiết bị của họ -> lần sau mở link hiện tên ngay
        const param = sessionStorage.getItem("invitation_pending_slug") || profile.slug || "";
        if (param && !preview) {
          localStorage.setItem(OWN_GUEST_CACHE_KEY, JSON.stringify({ param, profile }));
        }
      } catch {
        // ignore
      }
      if (!preview) trackOpenInvitation(profile.name, profile.mode);
    };

    /** Link bị khoá trên thiết bị này -> chỉ hiện thiệp chung, xoá mọi thông tin riêng */
    const applyLocked = () => {
      setGuestNameState("");
      setIsRegisteredGuest(false);
      setCanUploadState(false);
      setPronounModeState("friend");
      setCustomMessageState(undefined);
      setCustomTimeState(undefined);
      setCustomDateState(undefined);
      setCurrentSlugState("");
      try {
        GUEST_KEYS.forEach((k) => sessionStorage.removeItem(k));
        localStorage.removeItem(OWN_GUEST_CACHE_KEY);
      } catch {
        // ignore
      }
    };

    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        let hasParams = false;

        // 1. CÁCH 1: Link riêng qua mã (?u=k7q2m9xa hoặc ?slug= / ?id=)
        //    Thông tin khách chỉ có sau khi SERVER xác nhận thiết bị này được phép.
        const slugParam = (params.get("u") || params.get("slug") || params.get("id") || "").trim();
        if (slugParam) {
          hasParams = true;
          try {
            // Giữ mã trong phiên để reload vẫn hỏi lại server (URL sẽ bị xoá tham số)
            sessionStorage.setItem("invitation_pending_slug", slugParam);
            // Mở link khác với phiên trước -> bỏ thông tin khách cũ
            if (sessionStorage.getItem("invitation_guest_slug") !== slugParam) {
              GUEST_KEYS.forEach((k) => sessionStorage.removeItem(k));
            }
          } catch {}
        }

        // 2. CÁCH 2: Truyền theo 4 tiền tố danh xưng trực tiếp
        const conParam = params.get("con"); // Bậc tiền bối, Thầy Cô, Người lớn -> xưng con (Kính mời)
        const emParam = params.get("em");   // Anh / Chị -> xưng em (Thân ái mời)
        const anhParam = params.get("anh"); // Em / Bé -> xưng anh (Mời)
        const banParam = params.get("ban"); // Bạn bè thân thiết -> xưng Nhã (Thân mời)

        let detectedMode: GuestPronounMode = "friend";
        let rawName = "";

        if (!slugParam) {
          if (conParam) {
            hasParams = true;
            detectedMode = "elder";
            rawName = conParam;
          } else if (emParam) {
            hasParams = true;
            detectedMode = "senior";
            rawName = emParam;
          } else if (anhParam) {
            hasParams = true;
            detectedMode = "junior";
            rawName = anhParam;
          } else if (banParam) {
            hasParams = true;
            detectedMode = "friend";
            rawName = banParam;
          }
        }

        if (rawName && rawName.trim()) {
          const decoded = decodeURIComponent(rawName.replace(/\+/g, " ")).trim();
          setGuestNameState(decoded);
          setIsRegisteredGuest(false);
          setCanUploadState(false);
          setPronounModeState(detectedMode);
          try {
            sessionStorage.removeItem("invitation_pending_slug");
            GUEST_KEYS.forEach((k) => sessionStorage.removeItem(k));
            sessionStorage.setItem("invitation_guest_name", decoded);
            sessionStorage.setItem("invitation_guest_mode", detectedMode);
          } catch {
            // ignore
          }
          trackOpenInvitation(decoded, detectedMode);
        } else {
          // Khôi phục từ sessionStorage nếu reload (chỉ dữ liệu đã được server xác nhận trong phiên này)
          const saved = sessionStorage.getItem("invitation_guest_name");
          if (saved) {
            setGuestNameState(saved);
            setIsRegisteredGuest(sessionStorage.getItem("invitation_guest_is_registered") === "true");
            setCanUploadState(sessionStorage.getItem("invitation_guest_can_upload") === "true");
            setPronounModeState((sessionStorage.getItem("invitation_guest_mode") as GuestPronounMode) || "friend");
            setCustomMessageState(sessionStorage.getItem("invitation_guest_msg") || undefined);
            setCustomTimeState(sessionStorage.getItem("invitation_guest_time") || undefined);
            setCustomDateState(sessionStorage.getItem("invitation_guest_date") || undefined);
            setCurrentSlugState(sessionStorage.getItem("invitation_guest_slug") || "");
          }
        }

        // 2b. Link riêng mở lại trên CÙNG thiết bị: hiện tên ngay từ bộ nhớ của chính khách đó,
        //     server vẫn kiểm tra lại ở bước 3 (bị khoá/xoá thì thông tin sẽ được gỡ).
        let pendingSlug = "";
        try {
          pendingSlug = sessionStorage.getItem("invitation_pending_slug") || "";
        } catch {}
        let hasLocalGuest = Boolean(pendingSlug) && Boolean(sessionStorage.getItem("invitation_guest_name"));
        if (pendingSlug && !hasLocalGuest) {
          try {
            const cached = JSON.parse(localStorage.getItem(OWN_GUEST_CACHE_KEY) || "null");
            if (cached?.param === pendingSlug && cached.profile?.name) {
              const p = cached.profile as GuestProfile;
              setGuestNameState(p.name);
              setIsRegisteredGuest(true);
              setCanUploadState(p.canUpload !== false);
              setPronounModeState(p.mode || "friend");
              setCustomMessageState(p.customMessage);
              setCustomTimeState(p.customTime);
              setCustomDateState(p.customDate);
              setCurrentSlugState(p.slug || "");
              hasLocalGuest = true;
            }
          } catch {
            // ignore
          }
        }
        // Có link riêng mà chưa biết là ai -> phong bì hiện "đang mở thiệp" thay vì ô nhập tên
        setIsResolvingGuest(Boolean(pendingSlug) && !hasLocalGuest);
        const resolveTimeout = window.setTimeout(() => setIsResolvingGuest(false), 8000);

        // 3. ĐỒNG BỘ VỚI SERVER: lấy thông tin của chính khách này + ngày giờ mặc định
        const syncGuestDataFromSheet = () => {
          if (isFetchingSheetRef.current) return;
          isFetchingSheetRef.current = true;

          let activeSlug = "";
          try {
            activeSlug = sessionStorage.getItem("invitation_pending_slug") || "";
          } catch {}

          fetchMyGuest(activeSlug)
            .then((res) => {
              if (!res) return;
              // Luôn ghi đè (kể cả undefined) để không giữ lại ngày cũ khi Sheet đã đổi/xóa
              setDefaultEarliestDate(res.defaults?.earliestDate);
              setDefaultEarliestTime(res.defaults?.earliestTime);

              if (!activeSlug) return;
              if (res.locked) applyLocked();
              else if (res.guest) applyGuest(res.guest, Boolean(res.preview));
            })
            .catch((err) => {
              console.warn("[GuestContext] Error syncing guest data:", err);
            })
            .finally(() => {
              isFetchingSheetRef.current = false;
              setIsResolvingGuest(false);
              window.clearTimeout(resolveTimeout);
            });
        };

        // 4. TỰ ĐỘNG ĐỒNG BỘ REALTIME NHẠC NỀN TỪ SHEET 'NhacNen'
        const syncMusicFromSheet = () => {
          fetch(`/api/music?refresh=1&_t=${Date.now()}`, {
            cache: "no-store",
            headers: { Accept: "application/json" },
          })
            .then((res) => {
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              return res.json();
            })
            .then((data) => {
              if (data && typeof data === "object" && typeof data.activeAudioUrl === "string") {
                const newUrl = data.activeAudioUrl.trim();
                if (newUrl) {
                  setAudioUrlState((prev) => {
                    if (prev !== newUrl) {
                      try {
                        localStorage.setItem("invitation_bg_audio_url", newUrl);
                        sessionStorage.setItem("invitation_bg_audio_url", newUrl);
                      } catch {}
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("AUDIO_URL_CHANGED", { detail: newUrl }));
                      }
                      return newUrl;
                    }
                    return prev;
                  });
                }
              }
            })
            .catch((err) => {
              console.warn("[GuestContext] Error syncing music from sheet:", err);
            });
        };

        // Chạy ngay khi vừa tải xong trang
        syncGuestDataFromSheet();
        syncMusicFromSheet();

        let lastSyncTime = Date.now();

        // 5. Chu kỳ đồng bộ định kỳ 45s (chỉ khi tab đang hiển thị) thay vì 3s để bảo vệ quota Google Apps Script
        const intervalId = setInterval(() => {
          if (typeof document !== "undefined" && document.visibilityState === "visible") {
            if (typeof navigator !== "undefined" && !navigator.onLine) return;
            lastSyncTime = Date.now();
            syncGuestDataFromSheet();
            syncMusicFromSheet();
          }
        }, 45000);

        // Tự động kiểm tra lại khi người dùng quay lại tab (với debounce tối thiểu 15s để tránh spam)
        const handleVisibilityChange = () => {
          if (document.visibilityState === "visible") {
            const now = Date.now();
            if (now - lastSyncTime > 15000) {
              lastSyncTime = now;
              syncGuestDataFromSheet();
              syncMusicFromSheet();
            }
          }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        const handleWindowFocus = () => {
          const now = Date.now();
          if (now - lastSyncTime > 15000) {
            lastSyncTime = now;
            syncGuestDataFromSheet();
            syncMusicFromSheet();
          }
        };
        window.addEventListener("focus", handleWindowFocus);

        // Lắng nghe sự kiện người dùng tương tác mở modal nhạc hoặc upload thành công
        const handleManualRefreshMusic = () => {
          syncMusicFromSheet();
        };
        window.addEventListener("REFRESH_MUSIC_DATA", handleManualRefreshMusic);

        const handleManualRefreshGuest = () => {
          syncGuestDataFromSheet();
        };
        window.addEventListener("REFRESH_GUEST_DATA", handleManualRefreshGuest);

        // Đồng bộ tức thì giữa các tab khác nhau trên cùng trình duyệt (0ms)
        const handleStorageChange = (e: StorageEvent) => {
          if (e.key === "invitation_bg_audio_url" && e.newValue) {
            const freshUrl = e.newValue.trim();
            setAudioUrlState((prev) => {
              if (prev !== freshUrl) {
                window.dispatchEvent(new CustomEvent("AUDIO_URL_CHANGED", { detail: freshUrl }));
                return freshUrl;
              }
              return prev;
            });
          }
        };
        window.addEventListener("storage", handleStorageChange);

        // TỰ ĐỘNG XÓA SẠCH URL TRÊN THANH ĐỊA CHỈ (Clean URL & chống sửa tên)
        if (hasParams && window.history && window.history.replaceState) {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }

        return () => {
          clearInterval(intervalId);
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          window.removeEventListener("focus", handleWindowFocus);
          window.removeEventListener("REFRESH_MUSIC_DATA", handleManualRefreshMusic);
          window.removeEventListener("REFRESH_GUEST_DATA", handleManualRefreshGuest);
          window.removeEventListener("storage", handleStorageChange);
        };
      }
    } catch (err) {
      console.warn("Could not process guest context:", err);
      setIsResolvingGuest(false);
    }
  }, []);

  const setGuestName = (name: string, mode?: GuestPronounMode) => {
    const clean = name.trim();
    const finalMode = mode !== undefined ? mode : autoDetectModeFromName(clean);
    setGuestNameState(clean);
    setPronounModeState(finalMode);
    try {
      if (clean) {
        sessionStorage.setItem("invitation_guest_name", clean);
        sessionStorage.setItem("invitation_guest_mode", finalMode);
      } else {
        sessionStorage.removeItem("invitation_guest_name");
        sessionStorage.removeItem("invitation_guest_is_registered");
        sessionStorage.removeItem("invitation_guest_can_upload");
        sessionStorage.removeItem("invitation_guest_mode");
        sessionStorage.removeItem("invitation_guest_msg");
        sessionStorage.removeItem("invitation_guest_time");
        sessionStorage.removeItem("invitation_guest_date");
      }
    } catch {
      // ignore
    }
  };

  const getGreetingPrefix = (lang: Language = "vi"): string => {
    const langDict = translations[lang] || translations.vi;
    return langDict.greetings?.[pronounMode] || translations.vi.greetings[pronounMode] || "Thân mời";
  };

  const getSelfPronoun = (): string => {
    switch (pronounMode) {
      case "junior":
        return "anh";
      case "elder":
        return "con";
      case "senior":
        return "em";
      case "friend":
      default:
        return "Nhã";
    }
  };

  const generateGuestUrl = (name: string, mode?: GuestPronounMode): string => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin + window.location.pathname;
    const clean = name.trim();
    if (!clean) return origin;

    const finalMode = mode !== undefined ? mode : autoDetectModeFromName(clean);
    let paramKey = "ban";
    if (finalMode === "elder") paramKey = "con";
    else if (finalMode === "senior") paramKey = "em";
    else if (finalMode === "junior") paramKey = "anh";
    else paramKey = "ban";

    return `${origin}?${paramKey}=${encodeURIComponent(clean)}`;
  };

  // Ngày từ DB (Google Sheet) lỗi/sai định dạng -> bỏ qua để dùng ngày mặc định 04/12/2026 (graduationConfig)
  // Chuẩn hóa về "DD/MM/YYYY" theo giờ VN (xử lý cả ISO UTC từ Sheet / sessionStorage cũ)
  const effectiveDate = normalizeSheetDate(customDate) ?? normalizeSheetDate(defaultEarliestDate);
  const effectiveTime = customTime || defaultEarliestTime;

  const cleanSlug = (currentSlug || "").trim().toLowerCase().replace(/[-_]/g, "");
  const isOwner = cleanSlug === "phuongnha";

  return (
    <GuestContext.Provider
      value={{
        guestName,
        currentSlug,
        isOwner,
        hasCustomGuest: Boolean(guestName.trim()),
        isResolvingGuest,
        isRegisteredGuest,
        canUpload,
        pronounMode,
        customMessage,
        customTime,
        customDate,
        effectiveDate,
        effectiveTime,
        hasCustomDate: Boolean(customDate),
        hasCustomTime: Boolean(customTime),
        isFormal: pronounMode === "elder",
        isSenior: pronounMode === "senior",
        isJunior: pronounMode === "junior",
        audioUrl,
        setAudioUrl,
        setGuestName,
        getGreetingPrefix,
        getSelfPronoun,
        generateGuestUrl,
      }}
    >
      {children}
    </GuestContext.Provider>
  );
};

export const useGuest = () => useContext(GuestContext);
