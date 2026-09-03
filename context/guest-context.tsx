"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { findGuestBySlug, GuestProfile } from "@/config/guests";
import { graduationConfig } from "@/config/graduation";
import { Language, translations } from "@/config/i18n";

export type GuestPronounMode = "friend" | "elder" | "senior" | "junior";

interface GuestContextType {
  guestName: string;
  hasCustomGuest: boolean;
  pronounMode: GuestPronounMode;
  customMessage?: string;
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
  hasCustomGuest: false,
  pronounMode: "friend",
  customMessage: undefined,
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
  const [pronounMode, setPronounModeState] = useState<GuestPronounMode>("friend");
  const [customMessage, setCustomMessageState] = useState<string | undefined>(undefined);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        let hasParams = false;

        // 1. Kiểm tra mã Slug / Mã khách mời ngắn: ?u=giabao hoặc ?id=thayhoang
        const slugParam = params.get("u") || params.get("id") || params.get("user") || params.get("slug");
        
        // 2. Kiểm tra các tham số danh xưng trực tiếp:
        const juniorParam = params.get("anh") || params.get("t4o") || params.get("toooo") || params.get("junior");
        const seniorParam = params.get("em") || params.get("t3o") || params.get("tooo") || params.get("senior");
        const elderParam = params.get("con") || params.get("too") || params.get("kinh") || params.get("elder");
        const friendParamExplicit = params.get("ban") || params.get("friend");
        const generalParam =
          params.get("to") ||
          params.get("gui") ||
          params.get("ten") ||
          params.get("guest") ||
          params.get("name") ||
          params.get("recipient") ||
          params.get("khach") ||
          params.get("n");

        let detectedMode: GuestPronounMode = "friend";
        let rawName = "";
        let foundCustomMsg: string | undefined = undefined;

        if (slugParam) {
          hasParams = true;
          const profile: GuestProfile | null = findGuestBySlug(slugParam);
          if (profile) {
            rawName = profile.name;
            detectedMode = profile.mode;
            foundCustomMsg = profile.customMessage;
          } else {
            rawName = slugParam;
            detectedMode = autoDetectModeFromName(slugParam);
          }
        } else if (juniorParam) {
          hasParams = true;
          detectedMode = "junior";
          rawName = juniorParam;
        } else if (seniorParam) {
          hasParams = true;
          detectedMode = "senior";
          rawName = seniorParam;
        } else if (elderParam) {
          hasParams = true;
          detectedMode = "elder";
          rawName = elderParam;
        } else if (friendParamExplicit) {
          hasParams = true;
          detectedMode = "friend";
          rawName = friendParamExplicit;
        } else if (generalParam) {
          hasParams = true;
          // Kiểm tra xem generalParam có phải là 1 slug trong registry không (VD: ?to=giabao)
          const profile = findGuestBySlug(generalParam);
          if (profile) {
            rawName = profile.name;
            detectedMode = profile.mode;
            foundCustomMsg = profile.customMessage;
          } else {
            rawName = generalParam;
            const decoded = decodeURIComponent(rawName.replace(/\+/g, " ")).trim();
            detectedMode = autoDetectModeFromName(decoded);
          }
        }

        if (rawName && rawName.trim()) {
          const decoded = decodeURIComponent(rawName.replace(/\+/g, " ")).trim();
          setGuestNameState(decoded);
          setPronounModeState(detectedMode);
          setCustomMessageState(foundCustomMsg);

          try {
            sessionStorage.setItem("invitation_guest_name", decoded);
            sessionStorage.setItem("invitation_guest_mode", detectedMode);
            if (foundCustomMsg) {
              sessionStorage.setItem("invitation_guest_msg", foundCustomMsg);
            }
          } catch {
            // ignore
          }

          // Theo dõi mở thiệp ngầm vào Google Sheets
          trackOpenInvitation(decoded, detectedMode);
        } else {
          // Khôi phục từ sessionStorage nếu reload
          const saved = sessionStorage.getItem("invitation_guest_name");
          const savedMode = (sessionStorage.getItem("invitation_guest_mode") as GuestPronounMode) || "friend";
          const savedMsg = sessionStorage.getItem("invitation_guest_msg") || undefined;
          if (saved) {
            setGuestNameState(saved);
            setPronounModeState(savedMode);
            setCustomMessageState(savedMsg);
          }
        }

        // TỰ ĐỘNG XÓA SẠCH URL TRÊN THANH ĐỊA CHỈ (Clean URL & chống sửa tên)
        if (hasParams && window.history && window.history.replaceState) {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
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
        sessionStorage.removeItem("invitation_guest_mode");
        sessionStorage.removeItem("invitation_guest_msg");
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
    let paramKey = "to";
    if (finalMode === "elder") paramKey = "con";
    else if (finalMode === "senior") paramKey = "em";
    else if (finalMode === "junior") paramKey = "anh";
    else paramKey = "ban";

    return `${origin}?${paramKey}=${encodeURIComponent(clean)}`;
  };

  return (
    <GuestContext.Provider
      value={{
        guestName,
        hasCustomGuest: Boolean(guestName.trim()),
        pronounMode,
        customMessage,
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
