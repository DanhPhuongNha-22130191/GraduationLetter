"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, BookHeart, CalendarDays, Image as ImageIcon, Send } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export const MobileNav: React.FC = () => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState("hero");

  const navItems = React.useMemo(() => [
    { id: "hero", label: t.nav.home, icon: Home },
    { id: "invitation", label: t.nav.invitation, icon: BookHeart },
    { id: "details", label: t.nav.details, icon: CalendarDays },
    { id: "gallery", label: t.nav.gallery, icon: ImageIcon },
    { id: "rsvp", label: t.nav.rsvp, icon: Send },
  ], [t.nav.home, t.nav.invitation, t.nav.details, t.nav.gallery, t.nav.rsvp]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 220;
      for (const item of navItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(item.id);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navItems]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-xs sm:max-w-sm pb-[env(safe-area-inset-bottom)]">
      <motion.nav
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-emerald-950/90 backdrop-blur-md border border-gold-500/30 rounded-full px-2 sm:px-3 py-1.5 shadow-soft-xl flex items-center justify-around"
      >
        {navItems.map((item) => {
          const IconComp = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              aria-label={item.label}
              title={item.label}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-full transition-all duration-300 active:scale-90 touch-manipulation cursor-pointer relative focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-gold-500 ${
                isActive ? "text-gold-200 font-semibold" : "text-ivory-100/60 hover:text-ivory-100"
              }`}
            >
              <IconComp className={`w-4 h-4 transition-transform ${isActive ? "scale-110 text-gold-200" : ""}`} />
              <span className="text-[9px] sm:text-[10px] font-sans mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-gold-500 shadow-soft-xs"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
};
