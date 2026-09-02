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
    const handleCustomPlaySignal = () => {
      isManuallyPausedRef.current = false;
      startPlayback(true);
    };

    window.addEventListener("PLAY_BACKGROUND_MUSIC", handleCustomPlaySignal);

    return () => {
      window.removeEventListener("PLAY_BACKGROUND_MUSIC", handleCustomPlaySignal);
    };
  }, []);

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      isManuallyPausedRef.current = true;
    } else {
      isManuallyPausedRef.current = false;
      startPlayback(true);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
      <audio ref={audioRef} src={graduationConfig.audioUrl} loop preload="auto" />
      
      {/* Equalizer Frequency Bar Animation */}
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-emerald-deep border border-gold/50 shadow-md"
        >
          <div className="w-1 h-3 bg-gold rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
          <div className="w-1 h-4 bg-gold-shimmer rounded-full animate-bounce" style={{ animationDuration: '0.4s' }} />
          <div className="w-1 h-2 bg-gold rounded-full animate-bounce" style={{ animationDuration: '0.8s' }} />
          <span className="text-[9px] sm:text-[10px] font-sans font-bold text-gold uppercase tracking-wider ml-0.5 sm:ml-1">PLAYING</span>
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={toggleMusic}
        aria-label={isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
        className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg border transition-all duration-300 active:scale-95 touch-manipulation cursor-pointer ${
          isPlaying
            ? "bg-gold text-emerald-deep border-gold shadow-md"
            : "bg-emerald-deep text-gold border-gold/50 hover:border-gold"
        }`}
      >
        {isPlaying ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          >
            <Music className="w-5 h-5 stroke-[2]" />
          </motion.div>
        ) : (
          <VolumeX className="w-5 h-5 stroke-[2]" />
        )}
      </motion.button>
    </div>
  );
};
