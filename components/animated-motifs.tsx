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

export const AnimatedFlourishDivider: React.FC<{ className?: string }> = ({ className = "my-6" }) => {
  return (
    <div className={`flex items-center justify-center gap-3 w-full max-w-xs mx-auto ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="h-[1px] bg-gradient-to-r from-transparent via-gold to-gold flex-1"
      />
      
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.25, 1], rotate: [0, 45, 90] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="w-3 h-3 rotate-45 border-2 border-gold bg-gold/30 shadow-gold-glow"
        />
        <div className="absolute w-1.5 h-1.5 bg-gold-shimmer rounded-full animate-pulse" />
      </div>

      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="h-[1px] bg-gradient-to-l from-transparent via-gold to-gold flex-1"
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
