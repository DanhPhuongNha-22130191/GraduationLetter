"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { GalleryItem } from "@/config/graduation";

export const GallerySection: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const items = t.gallery.items as GalleryItem[];

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(items.map((item) => item.category)))];

  const filteredItems = selectedCategory === "all"
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const handleOpenLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const handleCloseLightbox = () => {
    setSelectedIndex(null);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev === 0 ? filteredItems.length - 1 : (prev ?? 0) - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev === filteredItems.length - 1 ? 0 : (prev ?? 0) + 1));
  };

  const currentPhoto = selectedIndex !== null ? filteredItems[selectedIndex] : null;

  return (
    <section id="gallery" className="py-16 sm:py-24 px-4 bg-ivory text-emerald-deep relative overflow-hidden">
      <div className="w-full max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <span className="text-gold-dark font-sans text-xs uppercase tracking-[0.35em] font-semibold block mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>{t.gallery.eyebrow}</span>
            <Sparkles className="w-3.5 h-3.5 text-gold" />
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-emerald-deep">
            {t.gallery.title}
          </h2>
          <div className="w-16 h-0.5 bg-gold-gradient mx-auto mt-3 rounded-full" />
        </motion.div>

        {/* Filter Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 sm:mb-10">
          {categories.map((cat) => {
            const label = cat === "all" ? t.gallery.allTab : cat;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-sans text-xs font-semibold tracking-wider transition-all duration-300 active:scale-95 touch-manipulation cursor-pointer border ${
                  isActive
                    ? "bg-emerald-deep text-gold border-gold shadow-md"
                    : "bg-white/80 text-charcoal/80 border-gold/30 hover:border-gold hover:text-emerald-deep"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6"
        >
          <AnimatePresence>
            {filteredItems.map((photo, idx) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => handleOpenLightbox(idx)}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer border border-gold/30 shadow-card-glow bg-emerald-deep/5 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl active:scale-95 touch-manipulation"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Shimmer Gold Hover Line */}
                <div className="absolute inset-0 border-2 border-gold/0 group-hover:border-gold/60 rounded-2xl transition-colors pointer-events-none z-10" />

                <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/90 via-emerald-deep/20 to-transparent opacity-85 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-ivory">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-gold font-bold mb-0.5">
                    {photo.category}
                  </span>
                  <p className="font-serif text-xs sm:text-sm font-semibold line-clamp-1">
                    {photo.title}
                  </p>
                  <div className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-gold backdrop-blur-md opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all border border-gold/30">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox Slider Modal */}
      <AnimatePresence>
        {currentPhoto && selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseLightbox}
            className="fixed inset-0 z-50 bg-black/92 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 select-none"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-emerald-deep rounded-3xl overflow-hidden border border-gold/40 shadow-2xl flex flex-col"
            >
              {/* Top Bar with Counter & Close */}
              <div className="flex items-center justify-between p-4 px-6 border-b border-gold/20 text-ivory">
                <span className="text-xs font-sans tracking-widest uppercase text-gold font-semibold">
                  {selectedIndex + 1} / {filteredItems.length}
                </span>
                <button
                  onClick={handleCloseLightbox}
                  className="w-9 h-9 rounded-full bg-gold/15 text-gold flex items-center justify-center hover:bg-gold hover:text-emerald-deep transition-colors touch-manipulation border border-gold/30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Image Frame with Prev/Next Controls */}
              <div className="relative aspect-[4/5] sm:aspect-[16/11] w-full bg-black flex items-center justify-center overflow-hidden">
                <Image
                  src={currentPhoto.src}
                  alt={currentPhoto.alt}
                  fill
                  className="object-contain"
                />

                {/* Left/Right Arrow Navigation */}
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 text-gold flex items-center justify-center hover:bg-gold hover:text-emerald-deep transition-all backdrop-blur-md border border-gold/30 active:scale-95 touch-manipulation"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 text-gold flex items-center justify-center hover:bg-gold hover:text-emerald-deep transition-all backdrop-blur-md border border-gold/30 active:scale-95 touch-manipulation"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Caption Footer */}
              <div className="p-4 sm:p-6 bg-emerald-deep text-ivory border-t border-gold/20 text-center">
                <span className="text-xs font-sans uppercase tracking-[0.2em] text-gold font-bold block mb-1">
                  {currentPhoto.category}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-ivory">
                  {currentPhoto.title}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
