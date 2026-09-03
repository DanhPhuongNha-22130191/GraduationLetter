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

export const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Number of particles (balanced for high performance 60fps on mobile & desktop)
    const totalCount = isMobile ? 32 : 55;
    const particles: Particle[] = [];

    const createParticle = (initialYRandom = true): Particle => {
      // 55% petals, 25% music notes, 20% golden sparkles
      const rand = Math.random();
      const type: ParticleType = rand < 0.55 ? "petal" : rand < 0.80 ? "note" : "sparkle";

      const y = initialYRandom ? Math.random() * height : -30;
      const x = Math.random() * width;

      if (type === "petal") {
        const size = Math.random() * (isMobile ? 5 : 7) + (isMobile ? 6 : 8);
        return {
          type: "petal",
          x,
          y,
          size,
          speedY: Math.random() * 0.7 + 0.5, // gentle slow fall
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

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

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

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20"
      style={{ willChange: "transform" }}
    />
  );
};

