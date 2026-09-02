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

export const GuestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [guestName, setGuestNameState] = useState<string>("");
  const [pronounMode, setPronounModeState] = useState<GuestPronounMode>("friend");

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);

        // 1. Check junior mode (t4o, toooo, anh) -> xưng "anh", dùng từ "Mời"
        const juniorParam = params.get("t4o") || params.get("toooo") || params.get("anh");

        // 2. Check senior mode (t3o, tooo, em) -> xưng "em", "Thân ái mời"
        const seniorParam = params.get("t3o") || params.get("tooo") || params.get("em");

        // 3. Check elder / formal mode (too, kinh, formal) -> xưng "con", "Kính mời"
        const elderParam = params.get("too") || params.get("kinh") || params.get("formal");

        // 4. Check friend mode (to, guest, name, ...) -> xưng "Nhã", "Thân mời"
        const friendParam =
          params.get("to") ||
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
        } else if (friendParam) {
          detectedMode = "friend";
          rawName = friendParam;
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

  const setGuestName = (name: string, mode: GuestPronounMode = "friend") => {
    const clean = name.trim();
    setGuestNameState(clean);
    setPronounModeState(mode);
    try {
      if (clean) {
        sessionStorage.setItem("invitation_guest_name", clean);
        sessionStorage.setItem("invitation_guest_mode", mode);
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

  const generateGuestUrl = (name: string, mode: GuestPronounMode = "friend"): string => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin + window.location.pathname;
    const clean = name.trim();
    if (!clean) return origin;

    let paramKey = "to";
    if (mode === "elder") paramKey = "too";
    if (mode === "senior") paramKey = "t3o";
    if (mode === "junior") paramKey = "t4o";

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
