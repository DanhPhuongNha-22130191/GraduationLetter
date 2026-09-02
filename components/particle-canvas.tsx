"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  speedX: number;
  speedY: number;
  pulseSpeed: number;
  isPetal?: boolean;
  rotation?: number;
  rotationSpeed?: number;
}

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

    const isMobile = width < 640;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const goldColors = [
      "rgba(201, 169, 110, ",
      "rgba(244, 231, 206, ",
      "rgba(229, 199, 139, ",
      "rgba(158, 123, 59, ",
    ];

    // Mobile-optimized particle count to ensure high FPS & low battery drain
    const maxParticles = isMobile ? 25 : 50;
    const particleCount = Math.min(Math.floor((width * height) / (isMobile ? 20000 : 18000)), maxParticles);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const isPetal = i % 4 === 0;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: isPetal ? Math.random() * 2.5 + 1.8 : Math.random() * 1.8 + 0.8,
        color: goldColors[Math.floor(Math.random() * goldColors.length)],
        alpha: Math.random() * 0.5 + 0.25,
        speedX: (Math.random() - 0.5) * (isPetal ? 0.4 : 0.25),
        speedY: isPetal ? Math.random() * 0.4 + 0.15 : -Math.random() * 0.3 - 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        isPetal: isPetal,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.015,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.006;

        if (p.alpha < 0.15) p.alpha = 0.15;
        if (p.alpha > 0.85) p.alpha = 0.85;

        if (p.isPetal) {
          p.rotation = (p.rotation || 0) + (p.rotationSpeed || 0.01);
          p.x += Math.sin(p.y * 0.01) * 0.3;
        }

        // Loop boundaries
        if (p.y < -15) {
          p.y = height + 15;
          p.x = Math.random() * width;
        } else if (p.y > height + 15) {
          p.y = -15;
          p.x = Math.random() * width;
        }

        if (p.x < -15) p.x = width + 15;
        if (p.x > width + 15) p.x = -15;

        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.isPetal && p.rotation) {
          ctx.rotate(p.rotation);
        }

        if (p.isPetal) {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.radius * 1.6, p.radius * 0.8, 0, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.alpha * 0.85})`;
          if (!isMobile) {
            ctx.shadowBlur = 6;
            ctx.shadowColor = "rgba(201, 169, 110, 0.4)";
          }
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.alpha})`;
          if (!isMobile) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = "rgba(201, 169, 110, 0.5)";
          }
          ctx.fill();
        }

        ctx.restore();
      });

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
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
};
