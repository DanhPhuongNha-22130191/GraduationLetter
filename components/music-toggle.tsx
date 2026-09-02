"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Music, VolumeX } from "lucide-react";
import { graduationConfig } from "@/config/graduation";

export const playBackgroundMusic = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("PLAY_BACKGROUND_MUSIC"));
  }
};

export const MusicToggle: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isManuallyPausedRef = useRef(false);

  const startPlayback = (force = false) => {
    // If the user manually paused the music, don't auto-start unless forced by explicit button click
    if (isManuallyPausedRef.current && !force) return;

    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          isManuallyPausedRef.current = false;
        })
        .catch((err) => {
          console.log("Autoplay blocked until user interaction:", err);
        });
    }
  };

  useEffect(() => {
    // 1. Try immediate autoplay
    startPlayback();

    // 2. Listen to custom signal from "MỞ THIỆP" button
    const handleCustomPlaySignal = () => {
      isManuallyPausedRef.current = false;
      startPlayback(true);
    };

    // 3. Listen to FIRST user gesture once to unlock audio
    const handleFirstGesture = () => {
      startPlayback();
    };

    window.addEventListener("PLAY_BACKGROUND_MUSIC", handleCustomPlaySignal);
    window.addEventListener("pointerdown", handleFirstGesture, { once: true });
    window.addEventListener("touchstart", handleFirstGesture, { once: true });
    window.addEventListener("click", handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener("PLAY_BACKGROUND_MUSIC", handleCustomPlaySignal);
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
      window.removeEventListener("click", handleFirstGesture);
    };
  }, []);

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event propagation so parent gesture listeners don't re-trigger
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      isManuallyPausedRef.current = true; // Mark as manually turned off by user
    } else {
      isManuallyPausedRef.current = false;
      startPlayback(true);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-40">
      <audio ref={audioRef} src={graduationConfig.audioUrl} loop preload="auto" />
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={toggleMusic}
        aria-label={isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
        className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg border transition-all duration-300 active:scale-95 touch-manipulation ${
          isPlaying
            ? "bg-gold text-emerald-deep border-gold shadow-gold-glow animate-pulse"
            : "bg-emerald-deep/80 text-gold border-gold/40 backdrop-blur-md"
        }`}
      >
        {isPlaying ? (
          <Music className="w-5 h-5 animate-spin-slow stroke-[2]" />
        ) : (
          <VolumeX className="w-5 h-5 stroke-[2]" />
        )}
      </motion.button>
    </div>
  );
};
