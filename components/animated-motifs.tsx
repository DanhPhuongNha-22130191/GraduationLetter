"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ======================================================================
   Họa tiết line-art chủ đề tốt nghiệp + primitive animation dùng chung.
   Tất cả SVG dùng stroke="currentColor" -> đổi màu bằng class text-*.
   ====================================================================== */

export const EASE_LUX = [0.22, 0.61, 0.36, 1] as const;

/** Fade-up khi cuộn vào view. Tự tắt khi người dùng bật prefers-reduced-motion. */
export const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}> = ({ children, delay = 0, y = 24, className }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: EASE_LUX }}
    >
      {children}
    </motion.div>
  );
};

/** Tiêu đề section: eyebrow + title + đường kẻ vàng. */
export const SectionHeading: React.FC<{
  eyebrow?: string;
  title: string;
  onDark?: boolean;
  icon?: React.ReactNode;
  className?: string;
}> = ({ eyebrow, title, onDark, icon, className = "mb-12 sm:mb-16" }) => (
  <Reveal className={`text-center ${className}`}>
    {icon && <div className="flex justify-center mb-5 text-gold-500">{icon}</div>}
    {eyebrow && <p className={`eyebrow mb-3 ${onDark ? "eyebrow-on-dark" : ""}`}>{eyebrow}</p>}
    <h2 className={`display-title ${onDark ? "display-title-on-dark" : ""}`}>{title}</h2>
    <AnimatedFlourishDivider className="mt-5" />
  </Reveal>
);

/* ---------- SVG line-art ---------- */

type IconProps = { className?: string };

/** Mũ cử nhân */
export const GradCapIcon: React.FC<IconProps> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M32 14 6 26l26 12 26-12-26-12Z" />
    <path d="M16 31.5V43c0 3 7.2 6 16 6s16-3 16-6V31.5" />
    <path d="M58 26v14" />
    <circle cx="58" cy="42" r="1.8" />
  </svg>
);

/** Cuộn bằng buộc ruy băng */
export const DiplomaScrollIcon: React.FC<IconProps> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="8" y="22" width="48" height="20" rx="10" />
    <path d="M14 26c-2 2-2 10 0 12M50 26c2 2 2 10 0 12" />
    <path d="M30 22v20M34 22v20" />
    <path d="M32 42 26 54M32 42l6 12M32 42l-3 8M32 42l3 8" />
  </svg>
);

/** Cành nguyệt quế */
export const LaurelBranch: React.FC<IconProps & { flip?: boolean }> = ({ className = "w-16 h-24", flip }) => (
  <svg viewBox="0 0 48 96" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden="true">
    <path d="M40 92C20 80 10 56 14 6" />
    {[16, 30, 44, 58, 72].map((y, i) => (
      <g key={y}>
        <path d={`M${15 + i * 0.6} ${y + 6}c-9-2-12-9-12-15 8 1 13 6 12 15Z`} />
        <path d={`M${16 + i * 0.6} ${y}c8-3 11-9 10-15-8 2-12 8-10 15Z`} />
      </g>
    ))}
  </svg>
);

/** Huy hiệu / ấn triện */
export const SealCrest: React.FC<IconProps & { label?: string }> = ({ className = "w-16 h-16", label }) => (
  <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="40" cy="40" r="36" />
    <circle cx="40" cy="40" r="31" strokeDasharray="1.5 3" />
    <circle cx="40" cy="40" r="24" />
    <path d="M40 22 28 28l12 5.5L52 28 40 22Z" />
    <path d="M32 31v6c0 1.6 3.6 3 8 3s8-1.4 8-3v-6" />
    <path d="M30 52c3 3 6 4 10 4s7-1 10-4" />
    {label && (
      <text x="40" y="67" textAnchor="middle" fontSize="5" letterSpacing="2" fill="currentColor" stroke="none" fontFamily="serif">
        {label}
      </text>
    )}
  </svg>
);

/** Góc khung văn bằng (ornament góc) */
export const CornerOrnament: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className={className} aria-hidden="true">
    <path d="M1 31V8C1 4 4 1 8 1h23" />
    <path d="M7 31V13c0-3.3 2.7-6 6-6h18" opacity="0.5" />
    <circle cx="4" cy="4" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

/* ---------- Legacy exports (giữ tương thích) ---------- */

export const RotatingBotanicalCrest: React.FC<{ className?: string }> = ({ className = "w-24 h-24" }) => (
  <div className={`relative ${className} pointer-events-none select-none flex items-center justify-center text-gold-500`}>
    <SealCrest className="w-full h-full animate-spin-slow opacity-60" />
  </div>
);

/** Đường kẻ mảnh + thoi nhỏ ở giữa */
export const AnimatedFlourishDivider: React.FC<{ className?: string }> = ({ className = "my-4" }) => {
  const reduce = useReducedMotion();
  const line = (dir: "r" | "l") => (
    <motion.div
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: EASE_LUX }}
      style={{ transformOrigin: dir === "r" ? "right" : "left" }}
      className={`h-px flex-1 ${dir === "r" ? "bg-gradient-to-r" : "bg-gradient-to-l"} from-transparent to-gold-500/70`}
    />
  );
  return (
    <div className={`flex items-center justify-center gap-3 w-full max-w-[14rem] mx-auto text-gold-500 ${className}`} aria-hidden="true">
      {line("r")}
      <div className="w-1.5 h-1.5 rotate-45 border border-current" />
      {line("l")}
    </div>
  );
};

export const FloatingSparklesBadge: React.FC = () => null;

/** Bông lúa — biểu tượng của Trường ĐH Nông Lâm (line-art) */
export const WheatBranch: React.FC<IconProps & { flip?: boolean }> = ({ className = "w-16 h-24", flip }) => (
  <svg viewBox="0 0 48 96" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden="true">
    <path d="M24 94V22" />
    <path d="M24 6c-4 3-5 8-4 12 4-1 6-6 4-12Z" />
    {[22, 36, 50, 64].map((y) => (
      <g key={y}>
        <path d={`M24 ${y + 6}c-7-1-11-6-11-12 7 0 11 5 11 12Z`} />
        <path d={`M24 ${y + 6}c7-1 11-6 11-12-7 0-11 5-11 12Z`} />
      </g>
    ))}
  </svg>
);
