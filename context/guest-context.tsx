"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  findGuestBySlug,
  fetchGuestsFromSheet,
  GuestProfile,
  getEarliestGraduationDateTime,
} from "@/config/guests";
import { graduationConfig } from "@/config/graduation";
import { Language, translations } from "@/config/i18n";

export type GuestPronounMode = "friend" | "elder" | "senior" | "junior";

interface GuestContextType {
  guestName: string;
  currentSlug: string;
  isOwner: boolean;
  hasCustomGuest: boolean;
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
export function trackOpenInvitation(guestName?: string, mode?: string) {
  if (typeof window === "undefined") return;
  const isAnonymous = !guestName || !guestName.trim();
  const nameToLog = isAnonymous ? "Khách vãng lai (Link chung)" : guestName.trim();
  const sessionKey = `tracked_open_${encodeURIComponent(nameToLog)}`;
  if (sessionStorage.getItem(sessionKey)) return;

  sessionStorage.setItem(sessionKey, "1");

  try {
    if (graduationConfig.googleScriptUrl) {
      const modeLabel = isAnonymous
        ? "Mời chung"
        : mode === "elder"
        ? "Người lớn (con)"
        : mode === "senior"
        ? "Anh/Chị (em)"
        : mode === "junior"
        ? "Đàn em (anh)"
        : "Bạn bè (mình)";

      const payload = {
        type: "OPEN",
        action: "OPEN",
        sheet: "LuotXem",
        name: nameToLog,
        phone: "-",
        attending: "ĐÃ MỞ THIỆP 💌",
        guests: 0,
        mode: modeLabel,
        message: isAnonymous ? "Khách mở thiệp (Link chung)" : `Khách mở thiệp (${modeLabel})`,
        timestamp: new Date().toLocaleString("vi-VN"),
      };

      fetch(graduationConfig.googleScriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
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
  const isInitialized = useRef(false);
  const isFetchingSheetRef = useRef(false);

  useEffect(() => {
    // 0. Khởi tạo ngày giờ sớm nhất từ bộ nhớ đệm
    const initialEarliest = getEarliestGraduationDateTime();
    if (initialEarliest.earliestDate) setDefaultEarliestDate(initialEarliest.earliestDate);
    if (initialEarliest.earliestTime) setDefaultEarliestTime(initialEarliest.earliestTime);

    if (isInitialized.current) return;
    isInitialized.current = true;

    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        let hasParams = false;

        // 1. CÁCH 1: Lấy từ Google Sheet qua Slug (?u=giabao hoặc ?slug=giabao hoặc ?id=giabao)
        const slugParam = params.get("u") || params.get("slug") || params.get("id");
        
        if (slugParam) {
          setCurrentSlugState(slugParam);
          try {
            sessionStorage.setItem("invitation_guest_slug", slugParam);
          } catch {}
        } else {
          const savedSlug = sessionStorage.getItem("invitation_guest_slug");
          if (savedSlug) {
            setCurrentSlugState(savedSlug);
          }
        }

        // 2. CÁCH 2: Truyền theo 4 tiền tố danh xưng trực tiếp
        const conParam = params.get("con"); // Bậc tiền bối, Thầy Cô, Người lớn -> xưng con (Kính mời)
        const emParam = params.get("em");   // Anh / Chị -> xưng em (Thân ái mời)
        const anhParam = params.get("anh"); // Em / Bé -> xưng anh (Mời)
        const banParam = params.get("ban"); // Bạn bè thân thiết -> xưng Nhã (Thân mời)

        let detectedMode: GuestPronounMode = "friend";
        let rawName = "";
        let foundCustomMsg: string | undefined = undefined;
        let foundCustomTime: string | undefined = undefined;
        let foundCustomDate: string | undefined = undefined;
        let isRegistered = false;
        let isAllowedUpload = false;

        if (slugParam) {
          hasParams = true;
          const profile: GuestProfile | null = findGuestBySlug(slugParam);
          if (profile) {
            rawName = profile.name;
            detectedMode = profile.mode;
            foundCustomMsg = profile.customMessage;
            foundCustomTime = profile.customTime;
            foundCustomDate = profile.customDate;
            isRegistered = true;
            isAllowedUpload = profile.canUpload !== false;
          }
        } else if (conParam) {
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

        if (rawName && rawName.trim()) {
          const decoded = decodeURIComponent(rawName.replace(/\+/g, " ")).trim();
          setGuestNameState(decoded);
          setIsRegisteredGuest(isRegistered);
          setCanUploadState(isAllowedUpload);
          setPronounModeState(detectedMode);
          setCustomMessageState(foundCustomMsg);
          setCustomTimeState(foundCustomTime);
          setCustomDateState(foundCustomDate);

          try {
            sessionStorage.setItem("invitation_guest_name", decoded);
            sessionStorage.setItem("invitation_guest_is_registered", isRegistered ? "true" : "false");
            sessionStorage.setItem("invitation_guest_can_upload", isAllowedUpload ? "true" : "false");
            sessionStorage.setItem("invitation_guest_mode", detectedMode);
            if (foundCustomMsg) {
              sessionStorage.setItem("invitation_guest_msg", foundCustomMsg);
            }
            if (foundCustomTime) {
              sessionStorage.setItem("invitation_guest_time", foundCustomTime);
            }
            if (foundCustomDate) {
              sessionStorage.setItem("invitation_guest_date", foundCustomDate);
            }
          } catch {
            // ignore
          }

          // Theo dõi mở thiệp ngầm vào Google Sheets
          trackOpenInvitation(decoded, detectedMode);
        } else {
          // Khôi phục từ sessionStorage nếu reload
          const saved = sessionStorage.getItem("invitation_guest_name");
          const savedIsRegistered = sessionStorage.getItem("invitation_guest_is_registered") === "true";
          const savedCanUpload = sessionStorage.getItem("invitation_guest_can_upload") === "true";
          const savedMode = (sessionStorage.getItem("invitation_guest_mode") as GuestPronounMode) || "friend";
          const savedMsg = sessionStorage.getItem("invitation_guest_msg") || undefined;
          const savedTime = sessionStorage.getItem("invitation_guest_time") || undefined;
          const savedDate = sessionStorage.getItem("invitation_guest_date") || undefined;
          if (saved) {
            setGuestNameState(saved);
            setIsRegisteredGuest(savedIsRegistered);
            setCanUploadState(savedCanUpload);
            setPronounModeState(savedMode);
            setCustomMessageState(savedMsg);
            setCustomTimeState(savedTime);
            setCustomDateState(savedDate);
          }
        }

        // 3. TỰ ĐỘNG ĐỒNG BỘ REALTIME TỪ GOOGLE SHEET (Cập nhật siêu tốc không cần bấm Reload)
        const syncGuestDataFromSheet = () => {
          if (isFetchingSheetRef.current) return;
          isFetchingSheetRef.current = true;

          const activeSlug = slugParam || sessionStorage.getItem("invitation_guest_slug");
          fetchGuestsFromSheet(true)
            .then((dynamicRegistry) => {
              // Cập nhật ngày giờ sớm nhất từ danh sách Sheet
              const dynamicEarliest = getEarliestGraduationDateTime(dynamicRegistry);
              if (dynamicEarliest.earliestDate) setDefaultEarliestDate(dynamicEarliest.earliestDate);
              if (dynamicEarliest.earliestTime) setDefaultEarliestTime(dynamicEarliest.earliestTime);

              if (activeSlug) {
                const dynamicProfile = findGuestBySlug(activeSlug, dynamicRegistry);
                if (dynamicProfile) {
                  const allowUpload = dynamicProfile.canUpload !== false;
                  setGuestNameState(dynamicProfile.name);
                  setIsRegisteredGuest(true);
                  setCanUploadState(allowUpload);
                  setPronounModeState(dynamicProfile.mode);
                  setCustomMessageState(dynamicProfile.customMessage);
                  setCustomTimeState(dynamicProfile.customTime);
                  setCustomDateState(dynamicProfile.customDate);

                  try {
                    sessionStorage.setItem("invitation_guest_name", dynamicProfile.name);
                    sessionStorage.setItem("invitation_guest_is_registered", "true");
                    sessionStorage.setItem("invitation_guest_can_upload", allowUpload ? "true" : "false");
                    sessionStorage.setItem("invitation_guest_mode", dynamicProfile.mode);
                    if (dynamicProfile.customMessage) {
                      sessionStorage.setItem("invitation_guest_msg", dynamicProfile.customMessage);
                    } else {
                      sessionStorage.removeItem("invitation_guest_msg");
                    }
                    if (dynamicProfile.customTime) {
                      sessionStorage.setItem("invitation_guest_time", dynamicProfile.customTime);
                    } else {
                      sessionStorage.removeItem("invitation_guest_time");
                    }
                    if (dynamicProfile.customDate) {
                      sessionStorage.setItem("invitation_guest_date", dynamicProfile.customDate);
                    } else {
                      sessionStorage.removeItem("invitation_guest_date");
                    }
                  } catch {
                    // ignore
                  }
                }
              }
            })
            .catch(() => {
              // ignore
            })
            .finally(() => {
              isFetchingSheetRef.current = false;
            });
        };

        // Chạy ngay khi vừa tải xong trang
        syncGuestDataFromSheet();

        // Thiết lập vòng lặp Realtime tự động quét thay đổi từ Google Sheets siêu tốc mỗi 3 giây khi Tab đang mở
        const intervalId = setInterval(() => {
          if (typeof document !== "undefined" && document.visibilityState === "visible") {
            syncGuestDataFromSheet();
          }
        }, 3000);

        // Tự động quét lại ngay lập tức khi người dùng quay lại tab thiệp
        const handleVisibilityChange = () => {
          if (document.visibilityState === "visible") {
            syncGuestDataFromSheet();
          }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // TỰ ĐỘNG XÓA SẠCH URL TRÊN THANH ĐỊA CHỈ (Clean URL & chống sửa tên)
        if (hasParams && window.history && window.history.replaceState) {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }

        return () => {
          clearInterval(intervalId);
          document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
      }
    } catch (err) {
      console.warn("Could not process guest context:", err);
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

  const effectiveDate = customDate || defaultEarliestDate;
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
