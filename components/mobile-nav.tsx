"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, BookHeart, CalendarDays, Image as ImageIcon, Send } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export const MobileNav: React.FC = () => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState("hero");

  const navItems = [
    { id: "hero", label: t.nav.home, icon: Home },
    { id: "invitation", label: t.nav.invitation, icon: BookHeart },
    { id: "details", label: t.nav.details, icon: CalendarDays },
    { id: "gallery", label: t.nav.gallery, icon: ImageIcon },
    { id: "rsvp", label: t.nav.rsvp, icon: Send },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
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
  }, [t]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm">
      <motion.nav
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-emerald-deep/90 backdrop-blur-md border border-gold/40 rounded-full px-3 py-2 shadow-2xl flex items-center justify-around"
      >
        {navItems.map((item) => {
          const IconComp = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all duration-300 active:scale-95 touch-manipulation relative ${
                isActive ? "text-gold font-semibold" : "text-ivory/70 hover:text-ivory"
              }`}
            >
              <IconComp className={`w-4 h-4 transition-transform ${isActive ? "scale-110" : ""}`} />
              <span className="text-[10px] font-sans mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-gold shadow-gold-glow"
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
