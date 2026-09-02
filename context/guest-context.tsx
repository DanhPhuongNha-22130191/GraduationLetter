"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface GuestContextType {
  guestName: string;
  hasCustomGuest: boolean;
  isFormal: boolean;
  setGuestName: (name: string, formal?: boolean) => void;
  getGreetingPrefix: () => string;
  getSelfPronoun: () => string;
  generateGuestUrl: (name: string, formal?: boolean) => string;
}

const GuestContext = createContext<GuestContextType>({
  guestName: "",
  hasCustomGuest: false,
  isFormal: false,
  setGuestName: () => {},
  getGreetingPrefix: () => "Thân mời",
  getSelfPronoun: () => "Nhã",
  generateGuestUrl: () => "",
});

export const GuestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [guestName, setGuestNameState] = useState<string>("");
  const [isFormal, setIsFormalState] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);

        // Check if `too` parameter exists (Formal mode: Kính mời, xưng con)
        const formalParam = params.get("too") || params.get("kinh") || params.get("formal");
        const normalParam =
          params.get("to") ||
          params.get("guest") ||
          params.get("name") ||
          params.get("recipient") ||
          params.get("khach") ||
          params.get("n") ||
          params.get("u");

        const rawName = formalParam || normalParam || "";
        const formalFlag = Boolean(formalParam);

        if (rawName && rawName.trim()) {
          const decoded = decodeURIComponent(rawName.replace(/\+/g, " ")).trim();
          setGuestNameState(decoded);
          setIsFormalState(formalFlag);
          try {
            sessionStorage.setItem("invitation_guest_name", decoded);
            sessionStorage.setItem("invitation_guest_formal", formalFlag ? "1" : "0");
          } catch {
            // ignore
          }
        } else {
          // Check session storage
          const saved = sessionStorage.getItem("invitation_guest_name");
          const savedFormal = sessionStorage.getItem("invitation_guest_formal") === "1";
          if (saved) {
            setGuestNameState(saved);
            setIsFormalState(savedFormal);
          }
        }
      }
    } catch (err) {
      console.warn("Could not parse guest name from URL:", err);
    }
  }, []);

  const setGuestName = (name: string, formal = false) => {
    const clean = name.trim();
    setGuestNameState(clean);
    setIsFormalState(formal);
    try {
      if (clean) {
        sessionStorage.setItem("invitation_guest_name", clean);
        sessionStorage.setItem("invitation_guest_formal", formal ? "1" : "0");
      } else {
        sessionStorage.removeItem("invitation_guest_name");
        sessionStorage.removeItem("invitation_guest_formal");
      }
    } catch {
      // ignore
    }
  };

  const getGreetingPrefix = (): string => {
    return isFormal ? "Kính mời" : "Thân mời";
  };

  const getSelfPronoun = (): string => {
    return isFormal ? "con" : "Nhã";
  };

  const generateGuestUrl = (name: string, formal = false): string => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin + window.location.pathname;
    const clean = name.trim();
    if (!clean) return origin;
    const paramKey = formal ? "too" : "to";
    return `${origin}?${paramKey}=${encodeURIComponent(clean)}`;
  };

  return (
    <GuestContext.Provider
      value={{
        guestName,
        hasCustomGuest: Boolean(guestName.trim()),
        isFormal,
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
