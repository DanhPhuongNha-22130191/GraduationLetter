"use client";

import React from "react";
import { motion } from "framer-motion";

export const RotatingBotanicalCrest: React.FC<{ className?: string }> = ({ className = "w-24 h-24" }) => {
  return (
    <div className={`relative ${className} pointer-events-none select-none flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="#C9A96E"
        strokeWidth="1.2"
        className="w-full h-full animate-spin-slow opacity-60 text-gold"
      >
        <circle cx="50" cy="50" r="44" strokeDasharray="3 3" opacity="0.6" />
        <path d="M 50,6 A 44,44 0 0,1 94,50" strokeWidth="1.8" />
        <path d="M 50,94 A 44,44 0 0,1 6,50" strokeWidth="1.8" />
        {/* Leaf details */}
        <circle cx="50" cy="6" r="3" fill="#C9A96E" />
        <circle cx="94" cy="50" r="3" fill="#C9A96E" />
        <circle cx="50" cy="94" r="3" fill="#C9A96E" />
        <circle cx="6" cy="50" r="3" fill="#C9A96E" />
      </svg>
    </div>
  );
};

export const AnimatedFlourishDivider: React.FC<{ className?: string }> = ({ className = "my-4" }) => {
  return (
    <div className={`flex items-center justify-center gap-2.5 w-full max-w-xs mx-auto ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="h-[1px] bg-gradient-to-r from-transparent via-gold-500/40 to-gold-500/70 flex-1"
      />
      
      <div className="relative flex items-center justify-center">
        <div className="w-2.5 h-2.5 rotate-45 border border-gold-500/80 bg-gold-500/20" />
      </div>

      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="h-[1px] bg-gradient-to-l from-transparent via-gold-500/40 to-gold-500/70 flex-1"
      />
    </div>
  );
};

export const FloatingSparklesBadge: React.FC = () => {
  return (
    <div className="absolute -top-3 -right-3 pointer-events-none">
      <motion.div
        animate={{ y: [-3, 3, -3], rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
        className="w-7 h-7 rounded-full bg-gold/20 border border-gold text-gold flex items-center justify-center shadow-gold-glow backdrop-blur-sm text-xs"
      >
        ✦
      </motion.div>
    </div>
  );
};
