"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type GuestPronounMode = "friend" | "elder" | "senior" | "junior";

interface GuestContextType {
  guestName: string;
  hasCustomGuest: boolean;
  pronounMode: GuestPronounMode;
  isFormal: boolean;
  isSenior: boolean;
  isJunior: boolean;
  setGuestName: (name: string, mode?: GuestPronounMode) => void;
  getGreetingPrefix: () => string;
  getSelfPronoun: () => string;
  generateGuestUrl: (name: string, mode?: GuestPronounMode) => string;
}

const GuestContext = createContext<GuestContextType>({
  guestName: "",
  hasCustomGuest: false,
  pronounMode: "friend",
  isFormal: false,
  isSenior: false,
  isJunior: false,
  setGuestName: () => {},
  getGreetingPrefix: () => "Thân mời",
  getSelfPronoun: () => "Nhã",
  generateGuestUrl: () => "",
});

/**
 * Helper to auto-detect pronoun mode from the guest name's prefix
 * Example:
 * - "Thầy Hoàng", "Cô Thuý", "Bác Ba", "Chú Tư" -> 'elder' (xưng con, kính mời)
 * - "Anh Nam", "Chị Hà", "Anh Chị" -> 'senior' (xưng em, thân ái mời)
 * - "Em Linh", "Bé Quỳnh" -> 'junior' (xưng anh, mời)
 * - "Gia Bảo", "Bạn Lan", ... -> 'friend' (xưng mình, Nhã thân mời)
 */
function autoDetectModeFromName(name: string): GuestPronounMode {
  const clean = name.trim().toLowerCase();
  if (!clean) return "friend";

  // Check elder keywords
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

  // Check senior keywords (Anh / Chị)
  if (
    clean.startsWith("anh ") ||
    clean.startsWith("chị ") ||
    clean.startsWith("chi ") ||
    clean.startsWith("anh chị") ||
    clean.startsWith("anh chi")
  ) {
    return "senior";
  }

  // Check junior keywords (Em / Bé)
  if (
    clean.startsWith("em ") ||
    clean.startsWith("bé ") ||
    clean.startsWith("be ")
  ) {
    return "junior";
  }

  return "friend";
}

export const GuestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [guestName, setGuestNameState] = useState<string>("");
  const [pronounMode, setPronounModeState] = useState<GuestPronounMode>("friend");

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);

        // 1. Explicit parameter by pronoun keyword:
        // Nhã xưng anh (dành cho các em): ?anh=..., ?t4o=..., ?toooo=..., ?junior=...
        const juniorParam =
          params.get("anh") ||
          params.get("t4o") ||
          params.get("toooo") ||
          params.get("junior");

        // Nhã xưng em (dành cho anh/chị): ?em=..., ?t3o=..., ?tooo=..., ?senior=...
        const seniorParam =
          params.get("em") ||
          params.get("t3o") ||
          params.get("tooo") ||
          params.get("senior");

        // Nhã xưng con (dành cho người lớn/thầy cô): ?con=..., ?too=..., ?kinh=..., ?elder=...
        const elderParam =
          params.get("con") ||
          params.get("too") ||
          params.get("kinh") ||
          params.get("elder");

        // Nhã xưng mình / bạn bè: ?ban=..., ?friend=...
        const friendParamExplicit = params.get("ban") || params.get("friend");

        // Generic / Standard parameter: ?to=..., ?gui=..., ?ten=..., ?guest=..., ?name=...
        const generalParam =
          params.get("to") ||
          params.get("gui") ||
          params.get("ten") ||
          params.get("guest") ||
          params.get("name") ||
          params.get("recipient") ||
          params.get("khach") ||
          params.get("n") ||
          params.get("u");

        let detectedMode: GuestPronounMode = "friend";
        let rawName = "";

        if (juniorParam) {
          detectedMode = "junior";
          rawName = juniorParam;
        } else if (seniorParam) {
          detectedMode = "senior";
          rawName = seniorParam;
        } else if (elderParam) {
          detectedMode = "elder";
          rawName = elderParam;
        } else if (friendParamExplicit) {
          detectedMode = "friend";
          rawName = friendParamExplicit;
        } else if (generalParam) {
          rawName = generalParam;
          // Auto-detect based on prefix like "Thầy", "Cô", "Anh", "Chị", "Em", "Bé", ...
          const decoded = decodeURIComponent(rawName.replace(/\+/g, " ")).trim();
          detectedMode = autoDetectModeFromName(decoded);
        }

        if (rawName && rawName.trim()) {
          const decoded = decodeURIComponent(rawName.replace(/\+/g, " ")).trim();
          setGuestNameState(decoded);
          setPronounModeState(detectedMode);
          try {
            sessionStorage.setItem("invitation_guest_name", decoded);
            sessionStorage.setItem("invitation_guest_mode", detectedMode);
          } catch {
            // ignore
          }
        } else {
          // Check session storage
          const saved = sessionStorage.getItem("invitation_guest_name");
          const savedMode = (sessionStorage.getItem("invitation_guest_mode") as GuestPronounMode) || "friend";
          if (saved) {
            setGuestNameState(saved);
            setPronounModeState(savedMode);
          }
        }
      }
    } catch (err) {
      console.warn("Could not parse guest name from URL:", err);
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
      }
    } catch {
      // ignore
    }
  };

  const getGreetingPrefix = (): string => {
    switch (pronounMode) {
      case "junior":
        return "Mời";
      case "elder":
        return "Kính mời";
      case "senior":
        return "Thân ái mời";
      case "friend":
      default:
        return "Thân mời";
    }
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

    // Use intuitive param keywords: con, em, anh, ban or standard to
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
