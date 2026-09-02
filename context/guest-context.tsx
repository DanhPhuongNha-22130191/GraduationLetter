"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface GuestContextType {
  guestName: string;
  hasCustomGuest: boolean;
  setGuestName: (name: string) => void;
  getGreetingPrefix: () => string;
  generateGuestUrl: (name: string) => string;
}

const GuestContext = createContext<GuestContextType>({
  guestName: "",
  hasCustomGuest: false,
  setGuestName: () => {},
  getGreetingPrefix: () => "Thân mời",
  generateGuestUrl: () => "",
});

export const GuestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [guestName, setGuestNameState] = useState<string>("");

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        // Look for parameters: to, guest, name, recipient, n, u, khach
        const rawName =
          params.get("to") ||
          params.get("guest") ||
          params.get("name") ||
          params.get("recipient") ||
          params.get("khach") ||
          params.get("n") ||
          params.get("u") ||
          "";

        if (rawName && rawName.trim()) {
          const decoded = decodeURIComponent(rawName.replace(/\+/g, " ")).trim();
          setGuestNameState(decoded);
          try {
            sessionStorage.setItem("invitation_guest_name", decoded);
          } catch {
            // ignore
          }
        } else {
          // Check session storage if visited before in same session
          const saved = sessionStorage.getItem("invitation_guest_name");
          if (saved) {
            setGuestNameState(saved);
          }
        }
      }
    } catch (err) {
      console.warn("Could not parse guest name from URL:", err);
    }
  }, []);

  const setGuestName = (name: string) => {
    const clean = name.trim();
    setGuestNameState(clean);
    try {
      if (clean) {
        sessionStorage.setItem("invitation_guest_name", clean);
      } else {
        sessionStorage.removeItem("invitation_guest_name");
      }
    } catch {
      // ignore
    }
  };

  const getGreetingPrefix = (): string => {
    return "Thân mời";
  };

  const generateGuestUrl = (name: string): string => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin + window.location.pathname;
    const clean = name.trim();
    if (!clean) return origin;
    return `${origin}?to=${encodeURIComponent(clean)}`;
  };

  return (
    <GuestContext.Provider
      value={{
        guestName,
        hasCustomGuest: Boolean(guestName.trim()),
        setGuestName,
        getGreetingPrefix,
        generateGuestUrl,
      }}
    >
      {children}
    </GuestContext.Provider>
  );
};

export const useGuest = () => useContext(GuestContext);
