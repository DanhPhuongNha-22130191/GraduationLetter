"use client";

import React, { useEffect, useRef } from "react";

type ParticleType = "petal" | "note" | "sparkle";

interface Particle {
  type: ParticleType;
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  swayAmp: number;
  swayFreq: number;
  swayOffset: number;
  angle: number;
  rotSpeed: number;
  flipAngle: number;
  flipSpeed: number;
  alpha: number;
  color: string;
  noteChar?: string;
  petalStyle?: number; // variation of petal curve
}

interface LightDroplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: string;
  isTeardrop: boolean;
}

interface GradCap {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  speed: number;
  angle: number;
  rotSpeed: number;
  swayPhase: number;
  swaySpeed: number;
  size: number;
  alpha: number;
  depth: number;
  capStyle: number;
  colorTheme: "royal-gold" | "rose-gold" | "emerald-gold" | "crimson-phoenix" | "platinum-silver" | "midnight-violet" | "sunfire-orange";
  emitTimer: number;
}



const NOTE_SYMBOLS = ["♪", "♫", "♩", "♬", "𝄞"];

const PETAL_COLORS = [
  "rgba(255, 182, 193, ",  // Light pink
  "rgba(254, 205, 211, ",  // Rose petal
  "rgba(251, 207, 232, ",  // Soft blush
  "rgba(253, 224, 210, ",  // Warm peach
  "rgba(238, 205, 163, ",  // Gold-apricot
  "rgba(244, 222, 189, ",  // Champagne rose
];

const NOTE_COLORS = [
  "rgba(201, 169, 110, ",  // Classic luxury gold
  "rgba(229, 199, 139, ",  // Shimmer gold
  "rgba(180, 142, 70, ",   // Warm brass gold
  "rgba(245, 230, 200, ",  // Ivory gold
];

const SPARKLE_COLORS = [
  "rgba(255, 235, 175, ",
  "rgba(229, 199, 139, ",
  "rgba(255, 255, 255, ",
];

const DROPLET_COLORS = [
  "255, 235, 175", // Bright gold
  "255, 215, 0",   // Pure gold
  "254, 243, 199", // Ivory glow
  "253, 164, 175", // Rose gold accent
  "255, 255, 255", // Pure light
];

interface ParticleCanvasProps {
  showButterflies?: boolean;
  showEagles?: boolean;
  showGradCaps?: boolean;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  showButterflies,
  showEagles,
  showGradCaps = true,
}) => {
  const activeGradCaps = showGradCaps !== undefined
    ? showGradCaps
    : (showEagles !== undefined ? showEagles : (showButterflies !== undefined ? showButterflies : true));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const showGradCapsRef = useRef(activeGradCaps);

  useEffect(() => {
    showGradCapsRef.current = activeGradCaps;
  }, [activeGradCaps]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;

    // Track cursor/touch position for interactive cap attraction
    const mouse = {
      x: width / 2,
      y: height / 2,
      active: false,
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    // Number of particles (balanced for high performance 60fps on mobile & desktop)
    const totalCount = isMobile ? 28 : 48;
    const particles: Particle[] = [];
    const lightDroplets: LightDroplet[] = [];
    const gradCaps: GradCap[] = [];

    // Initialize Graduation Caps grouped in pairs (2 per opacity tier) with inverse size-to-clarity scaling
    const capCount = isMobile ? 5 : 6;
    const themes: ("royal-gold" | "rose-gold" | "emerald-gold" | "crimson-phoenix" | "platinum-silver" | "midnight-violet" | "sunfire-orange")[] = [
      "royal-gold", "rose-gold", "emerald-gold", "crimson-phoenix", "platinum-silver", "midnight-violet", "sunfire-orange", "royal-gold", "rose-gold", "emerald-gold"
    ];

    // 4 distinct opacity level tiers (every 2 caps change tier)
    // Tier 0 (Smallest size ~18-24px): 1.0 opacity (100% rõ nét, KHÔNG MỜ)
    // Tier 1 (Mid-small ~32-42px): Clarity ~45%
    // Tier 2 (Mid-large ~48-58px): Clarity ~22%
    // Tier 3 (Largest size 65px-80px): Smallest clarity ~8% (mờ ảo bồng bềnh)
    const opacityTiers = [1.0, 0.45, 0.22, 0.08];

    for (let i = 0; i < capCount; i++) {
      // Pair grouping: every 2 caps share a tier level
      const tierIndex = Math.floor(i / 2) % opacityTiers.length;
      const baseAlpha = opacityTiers[tierIndex];

      // Inverse size calculation: Tier 0 is 18-24px, Tier 3 is 65-80px!
      const tierRatio = tierIndex / (opacityTiers.length - 1); // 0.0 to 1.0
      const minSize = isMobile ? (14 + tierRatio * 34) : (18 + tierRatio * 47); // 18px -> 65px
      const maxSize = isMobile ? (18 + tierRatio * 42) : (24 + tierRatio * 56); // 24px -> 80px
      const size = minSize + Math.random() * (maxSize - minSize);

      // Speed calculation: Mũ càng nhỏ (tierRatio gần 0) tốc độ bay & xoay càng nhanh!
      const speed = Math.max(0.6, (2.6 - tierRatio * 1.8) + (Math.random() * 0.4 - 0.2));
      const rotSpeed = ((i % 2 === 0 ? 1 : -1) * (0.015 - tierRatio * 0.008)) + (Math.random() * 0.004 - 0.002);

      gradCaps.push({
        x: Math.random() * width,
        y: Math.random() * height,
        targetX: Math.random() * width,
        targetY: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        speed,
        angle: Math.random() * Math.PI * 2,
        rotSpeed,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.04 + 0.02,
        size,
        alpha: baseAlpha,
        depth: 1 - tierRatio * 0.6,
        capStyle: i % 3,
        colorTheme: "royal-gold",
        emitTimer: 0,
      });
    }

    const createParticle = (initialYRandom = true): Particle => {
      // 50% petals, 30% music notes, 20% golden sparkles
      const rand = Math.random();
      const type: ParticleType = rand < 0.50 ? "petal" : rand < 0.80 ? "note" : "sparkle";

      const y = initialYRandom ? Math.random() * height : -30;
      const x = Math.random() * width;

      if (type === "petal") {
        const size = Math.random() * (isMobile ? 5 : 7) + (isMobile ? 6 : 8);
        return {
          type: "petal",
          x,
          y,
          size,
          speedY: Math.random() * 0.7 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          swayAmp: Math.random() * 1.6 + 0.8,
          swayFreq: Math.random() * 0.008 + 0.004,
          swayOffset: Math.random() * Math.PI * 2,
          angle: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          flipAngle: Math.random() * Math.PI * 2,
          flipSpeed: Math.random() * 0.025 + 0.01,
          alpha: Math.random() * 0.45 + 0.4,
          color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
          petalStyle: Math.floor(Math.random() * 3),
        };
      } else if (type === "note") {
        const size = Math.random() * (isMobile ? 6 : 9) + (isMobile ? 12 : 15);
        return {
          type: "note",
          x,
          y,
          size,
          speedY: Math.random() * 0.6 + 0.4,
          speedX: (Math.random() - 0.5) * 0.2,
          swayAmp: Math.random() * 1.2 + 0.5,
          swayFreq: Math.random() * 0.007 + 0.003,
          swayOffset: Math.random() * Math.PI * 2,
          angle: Math.random() * 0.6 - 0.3, // slight tilt
          rotSpeed: (Math.random() - 0.5) * 0.008,
          flipAngle: Math.random() * Math.PI * 2,
          flipSpeed: Math.random() * 0.015 + 0.005,
          alpha: Math.random() * 0.4 + 0.45,
          color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
          noteChar: NOTE_SYMBOLS[Math.floor(Math.random() * NOTE_SYMBOLS.length)],
        };
      } else {
        // sparkle
        const size = Math.random() * 2 + 1;
        return {
          type: "sparkle",
          x,
          y,
          size,
          speedY: Math.random() * 0.4 + 0.2,
          speedX: (Math.random() - 0.5) * 0.2,
          swayAmp: Math.random() * 0.5 + 0.2,
          swayFreq: Math.random() * 0.01 + 0.005,
          swayOffset: Math.random() * Math.PI * 2,
          angle: 0,
          rotSpeed: 0,
          flipAngle: 0,
          flipSpeed: 0,
          alpha: Math.random() * 0.5 + 0.3,
          color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
        };
      }
    };

    for (let i = 0; i < totalCount; i++) {
      particles.push(createParticle(true));
    }

    // Helper to spawn glowing light droplet behind butterfly
    const spawnLightDroplet = (x: number, y: number, butterflyAngle: number, depth: number = 1) => {
      // Spawn slightly behind the butterfly body
      const backDist = (Math.random() * 8 + 4) * depth;
      const spawnX = x - Math.cos(butterflyAngle) * backDist + (Math.random() - 0.5) * 6 * depth;
      const spawnY = y - Math.sin(butterflyAngle) * backDist + (Math.random() - 0.5) * 6 * depth;

      const isTeardrop = Math.random() < 0.65;
      const size = (isTeardrop ? Math.random() * 2.5 + 2 : Math.random() * 1.8 + 1.2) * depth;
      const color = DROPLET_COLORS[Math.floor(Math.random() * DROPLET_COLORS.length)];

      lightDroplets.push({
        x: spawnX,
        y: spawnY,
        vx: (Math.random() - 0.5) * 0.6 * depth,
        vy: (Math.random() * 0.6 + 0.3) * depth, // falls gently downward like glowing liquid droplets
        size,
        alpha: (Math.random() * 0.4 + 0.5) * depth,
        maxLife: Math.floor(Math.random() * 40 + 40),
        life: Math.floor(Math.random() * 40 + 40),
        color,
        isTeardrop,
      });
    };

    const drawPetal = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      // Tumbling effect via vertical scaling
      ctx.scale(Math.cos(p.flipAngle), 1);

      ctx.beginPath();
      const s = p.size;

      if (p.petalStyle === 0) {
        // Heart-shaped cherry / rose blossom petal
        ctx.moveTo(0, -s * 1.1);
        ctx.bezierCurveTo(s * 0.9, -s * 0.8, s * 0.9, s * 0.6, 0, s);
        ctx.bezierCurveTo(-s * 0.9, s * 0.6, -s * 0.9, -s * 0.8, 0, -s * 1.1);
      } else if (p.petalStyle === 1) {
        // Elongated graceful peach blossom petal
        ctx.moveTo(0, -s * 1.2);
        ctx.bezierCurveTo(s * 0.7, -s * 0.5, s * 0.5, s * 0.8, 0, s * 1.1);
        ctx.bezierCurveTo(-s * 0.5, s * 0.8, -s * 0.7, -s * 0.5, 0, -s * 1.2);
      } else {
        // Curved fluttering petal
        ctx.moveTo(-s * 0.2, -s);
        ctx.bezierCurveTo(s * 1.0, -s * 0.4, s * 0.6, s * 0.7, 0, s);
        ctx.bezierCurveTo(-s * 0.7, s * 0.5, -s * 0.8, -s * 0.4, -s * 0.2, -s);
      }
      ctx.closePath();

      // Soft petal gradient fill
      const grad = ctx.createLinearGradient(0, -s, 0, s);
      grad.addColorStop(0, `${p.color}${p.alpha * 0.95})`);
      grad.addColorStop(0.7, `${p.color}${p.alpha * 0.8})`);
      grad.addColorStop(1, `rgba(255, 230, 210, ${p.alpha * 0.6})`);
      ctx.fillStyle = grad;

      if (!isMobile) {
        ctx.shadowBlur = 4;
        ctx.shadowColor = "rgba(255, 192, 203, 0.35)";
      }
      ctx.fill();

      // Delicate inner petal highlight vein
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.7);
      ctx.quadraticCurveTo(s * 0.1, 0, 0, s * 0.7);
      ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * 0.4})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();

      ctx.restore();
    };

    const drawNote = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.scale(Math.cos(p.flipAngle * 0.6), 1);

      ctx.font = `600 ${p.size}px "Times New Roman", "Playfair Display", Georgia, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = `${p.color}${p.alpha})`;

      if (!isMobile) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(201, 169, 110, 0.6)";
      }

      ctx.fillText(p.noteChar || "♪", 0, 0);
      ctx.restore();
    };

    const drawSparkle = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);

      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${p.alpha})`;

      if (!isMobile) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(255, 235, 175, 0.7)";
      }
      ctx.fill();
      ctx.restore();
    };

    // Render dropping liquid light droplets behind butterflies
    const drawLightDroplet = (d: LightDroplet) => {
      ctx.save();
      ctx.translate(d.x, d.y);

      const lifeRatio = d.life / d.maxLife;
      const currentAlpha = d.alpha * Math.sin(lifeRatio * Math.PI); // smooth fade in & out

      if (d.isTeardrop) {
        // Glowing teardrop droplet shape
        ctx.beginPath();
        const s = d.size * (0.8 + 0.4 * lifeRatio);
        ctx.moveTo(0, -s * 1.5);
        ctx.bezierCurveTo(s * 1.2, 0, s * 1.0, s * 1.5, 0, s * 1.5);
        ctx.bezierCurveTo(-s * 1.0, s * 1.5, -s * 1.2, 0, 0, -s * 1.5);
        ctx.closePath();

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 1.8);
        grad.addColorStop(0, `rgba(255, 255, 255, ${currentAlpha})`);
        grad.addColorStop(0.4, `rgba(${d.color}, ${currentAlpha * 0.95})`);
        grad.addColorStop(1, `rgba(${d.color}, 0)`);
        ctx.fillStyle = grad;

        if (!isMobile) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(${d.color}, ${currentAlpha * 0.8})`;
        }
        ctx.fill();
      } else {
        // Starburst light droplet
        const s = d.size * (0.6 + 0.6 * lifeRatio);

        // Core glow
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.fill();

        // Cross rays
        ctx.beginPath();
        ctx.moveTo(-s * 2.5, 0);
        ctx.lineTo(s * 2.5, 0);
        ctx.moveTo(0, -s * 2.5);
        ctx.lineTo(0, s * 2.5);
        ctx.strokeStyle = `rgba(${d.color}, ${currentAlpha * 0.8})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        if (!isMobile) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(${d.color}, ${currentAlpha})`;
        }
      }

      ctx.restore();
    };

    // Render floating/tossing graduation cap (Mortarboard) with 3D perspective and dynamic swinging tassel
    const drawGradCap = (c: GradCap) => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.angle);

      // Apply opacity tier (Tier 0: 1.0, Tier 3: 0.08)
      const shimmerAlpha = c.alpha * (0.90 + 0.10 * Math.sin(c.swayPhase));
      ctx.globalAlpha = Math.max(0.04, Math.min(1.0, shimmerAlpha));

      const s = c.size;

      // Soft ambient light aura behind graduation cap
      const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 1.8);
      if (c.colorTheme === "royal-gold") {
        auraGrad.addColorStop(0, "rgba(255, 235, 175, 0.5)");
        auraGrad.addColorStop(1, "rgba(245, 208, 110, 0)");
      } else if (c.colorTheme === "crimson-phoenix") {
        auraGrad.addColorStop(0, "rgba(254, 202, 202, 0.5)");
        auraGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
      } else if (c.colorTheme === "emerald-gold") {
        auraGrad.addColorStop(0, "rgba(167, 243, 208, 0.5)");
        auraGrad.addColorStop(1, "rgba(16, 185, 129, 0)");
      } else if (c.colorTheme === "midnight-violet") {
        auraGrad.addColorStop(0, "rgba(233, 213, 255, 0.5)");
        auraGrad.addColorStop(1, "rgba(139, 92, 246, 0)");
      } else if (c.colorTheme === "sunfire-orange") {
        auraGrad.addColorStop(0, "rgba(254, 215, 170, 0.5)");
        auraGrad.addColorStop(1, "rgba(234, 88, 12, 0)");
      } else if (c.colorTheme === "rose-gold") {
        auraGrad.addColorStop(0, "rgba(254, 205, 211, 0.5)");
        auraGrad.addColorStop(1, "rgba(244, 114, 182, 0)");
      } else {
        auraGrad.addColorStop(0, "rgba(255, 255, 255, 0.55)");
        auraGrad.addColorStop(1, "rgba(226, 232, 240, 0)");
      }

      ctx.beginPath();
      ctx.arc(0, 0, s * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = auraGrad;
      ctx.fill();

      // 1. Skull Cap Base (thế mũ bên dưới)
      ctx.beginPath();
      ctx.ellipse(0, s * 0.15, s * 0.42, s * 0.28, 0, 0, Math.PI);
      const skullGrad = ctx.createLinearGradient(0, s * 0.15, 0, s * 0.43);
      skullGrad.addColorStop(0, "#1F2937");
      skullGrad.addColorStop(1, "#111827");
      ctx.fillStyle = skullGrad;
      ctx.fill();

      // 2. Rhombus Diamond Top Cap (mặt trên hình thoi 3D)
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.55);                // Top corner
      ctx.lineTo(s * 0.95, -s * 0.08);           // Right corner
      ctx.lineTo(0, s * 0.32);                  // Bottom corner
      ctx.lineTo(-s * 0.95, -s * 0.08);          // Left corner
      ctx.closePath();

      const capGrad = ctx.createLinearGradient(-s * 0.5, -s * 0.55, s * 0.5, s * 0.32);
      if (c.colorTheme === "royal-gold") {
        capGrad.addColorStop(0, "#FEF3C7");
        capGrad.addColorStop(0.5, "#F59E0B");
        capGrad.addColorStop(1, "#B45309");
      } else if (c.colorTheme === "crimson-phoenix") {
        capGrad.addColorStop(0, "#FEE2E2");
        capGrad.addColorStop(0.5, "#EF4444");
        capGrad.addColorStop(1, "#991B1B");
      } else if (c.colorTheme === "emerald-gold") {
        capGrad.addColorStop(0, "#D1FAE5");
        capGrad.addColorStop(0.5, "#10B981");
        capGrad.addColorStop(1, "#047857");
      } else if (c.colorTheme === "midnight-violet") {
        capGrad.addColorStop(0, "#F3E8FF");
        capGrad.addColorStop(0.5, "#8B5CF6");
        capGrad.addColorStop(1, "#581C87");
      } else if (c.colorTheme === "sunfire-orange") {
        capGrad.addColorStop(0, "#FFEDD5");
        capGrad.addColorStop(0.5, "#F97316");
        capGrad.addColorStop(1, "#9A3412");
      } else if (c.colorTheme === "rose-gold") {
        capGrad.addColorStop(0, "#FFE4E6");
        capGrad.addColorStop(0.5, "#FB7185");
        capGrad.addColorStop(1, "#BE185D");
      } else {
        capGrad.addColorStop(0, "#FFFFFF");
        capGrad.addColorStop(0.5, "#CBD5E1");
        capGrad.addColorStop(1, "#334155");
      }

      ctx.fillStyle = capGrad;
      if (!isMobile) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
      }
      ctx.fill();

      // Diamond Rim Metallic Highlight Line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = Math.max(0.8, s * 0.035);
      ctx.stroke();

      // Inner diamond accent line
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.42);
      ctx.lineTo(s * 0.72, -s * 0.08);
      ctx.lineTo(0, s * 0.22);
      ctx.lineTo(-s * 0.72, -s * 0.08);
      ctx.closePath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // 3. Center Button Cap
      ctx.beginPath();
      ctx.arc(0, -s * 0.1, s * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = "#FEF3C7";
      ctx.fill();

      // 4. Swinging Golden Tassel Cord & Brush (tua mũ rủ xoay)
      const swayOffset = Math.sin(c.swayPhase) * s * 0.15;
      const tasselEndX = s * 0.7 + swayOffset;
      const tasselEndY = s * 0.45;

      ctx.beginPath();
      ctx.moveTo(0, -s * 0.1);
      ctx.quadraticCurveTo(s * 0.4, -s * 0.05, tasselEndX, tasselEndY);
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = Math.max(1.2, s * 0.045);
      ctx.stroke();

      // Tassel Ring/Band
      ctx.beginPath();
      ctx.arc(tasselEndX, tasselEndY, s * 0.04, 0, Math.PI * 2);
      ctx.fillStyle = "#FEF3C7";
      ctx.fill();

      // Tassel Fluffy Brush Head
      ctx.beginPath();
      ctx.moveTo(tasselEndX - s * 0.05, tasselEndY + s * 0.04);
      ctx.lineTo(tasselEndX + s * 0.05, tasselEndY + s * 0.04);
      ctx.lineTo(tasselEndX + s * 0.08, tasselEndY + s * 0.35);
      ctx.lineTo(tasselEndX - s * 0.08, tasselEndY + s * 0.35);
      ctx.closePath();
      ctx.fillStyle = "#F59E0B";
      ctx.fill();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Update and draw background floating particles (petals, notes, sparkles)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Skip rendering rose petals on envelope cover screen (showGradCapsRef.current === true)
        // so envelope screen has NO petals, but inside invitation page HAS rose petals!
        if (p.type === "petal" && showGradCapsRef.current) {
          continue;
        }

        // Update Position with gentle sway
        p.y += p.speedY;
        p.x += Math.sin(p.swayOffset + p.y * p.swayFreq) * p.swayAmp + p.speedX;

        // Rotation and flip
        p.angle += p.rotSpeed;
        p.flipAngle += p.flipSpeed;

        // Draw based on particle type
        if (p.type === "petal") {
          drawPetal(p);
        } else if (p.type === "note") {
          drawNote(p);
        } else {
          drawSparkle(p);
        }

        // Boundary check & respawn at top
        if (p.y > height + 40) {
          particles[i] = createParticle(false);
        }
        if (p.x < -40) {
          p.x = width + 30;
        } else if (p.x > width + 40) {
          p.x = -30;
        }
      }

      // 2. Update and draw falling light droplets ("giọt ánh sáng")
      if (showGradCapsRef.current || lightDroplets.length > 0) {
        for (let i = lightDroplets.length - 1; i >= 0; i--) {
          const d = lightDroplets[i];

          d.x += d.vx;
          d.y += d.vy;
          d.life -= 1;

          drawLightDroplet(d);

          // Remove dead droplets
          if (d.life <= 0 || d.y > height + 20) {
            lightDroplets.splice(i, 1);
          }
        }
      }

      // 3. Update and draw smooth floating graduation caps ("mũ tốt nghiệp") - ONLY on envelope page
      if (showGradCapsRef.current) {
        for (let i = 0; i < gradCaps.length; i++) {
          const c = gradCaps[i];

          // 1. Rotate and sway tassel
          c.angle += c.rotSpeed;
          c.swayPhase += c.swaySpeed;

          // 2. Free-wandering target steering (Quỹ đạo bay tự do uyển chuyển)
          const dx = c.targetX - c.x;
          const dy = c.targetY - c.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 40 || Math.random() < 0.005) {
            if (mouse.active && Math.random() < 0.4) {
              c.targetX = mouse.x + (Math.random() - 0.5) * 220;
              c.targetY = mouse.y + (Math.random() - 0.5) * 220;
            } else {
              c.targetX = Math.random() * (width - 120) + 60;
              c.targetY = Math.random() * (height - 120) + 60;
            }
          }

          const targetAngle = Math.atan2(dy, dx);
          let moveAngle = Math.atan2(c.vy, c.vx || 0.001);
          let angleDiff = targetAngle - moveAngle;

          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

          moveAngle += angleDiff * 0.04 + Math.sin(c.swayPhase * 0.5) * 0.02;

          // 3. Anti-Collision Soft Repulsion Force (Chống nón chồng lên nhau)
          let pushX = 0;
          let pushY = 0;
          for (let j = 0; j < gradCaps.length; j++) {
            if (i === j) continue;
            const other = gradCaps[j];
            const cdx = c.x - other.x;
            const cdy = c.y - other.y;
            const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
            const minDist = (c.size + other.size) * 0.85 + 28; // padding distance

            if (cdist < minDist && cdist > 0) {
              const force = ((minDist - cdist) / minDist) * 1.5;
              pushX += (cdx / cdist) * force;
              pushY += (cdy / cdist) * force;
            }
          }

          c.vx = Math.cos(moveAngle) * c.speed + pushX;
          c.vy = Math.sin(moveAngle) * c.speed + pushY;

          c.x += c.vx;
          c.y += c.vy;

          // Screen edge bounds
          if (c.x < -40) c.x = width + 30;
          if (c.x > width + 40) c.x = -30;
          if (c.y < -40) c.y = height + 30;
          if (c.y > height + 40) c.y = -30;

          // 4. Emit falling light droplets every few frames along flight path
          c.emitTimer += 1;
          if (c.emitTimer >= 3) {
            spawnLightDroplet(c.x, c.y, c.angle, c.depth);
            c.emitTimer = 0;
          }

          drawGradCap(c);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[60]"
      style={{ willChange: "transform" }}
    />
  );
};


