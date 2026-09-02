"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { GalleryItem } from "@/config/graduation";

export const GallerySection: React.FC = () => {
  const { t } = useLanguage();
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  return (
    <section id="gallery" className="py-16 sm:py-24 px-4 bg-ivory text-emerald-deep">
      <div className="w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <span className="text-gold-dark font-sans text-xs uppercase tracking-[0.3em] font-semibold block mb-2">
            {t.gallery.eyebrow}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-emerald-deep">
            {t.gallery.title}
          </h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-3" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
          {t.gallery.items.map((photo, idx) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              onClick={() => setSelectedPhoto(photo as GalleryItem)}
              className="group relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer border border-gold/30 shadow-md bg-emerald-deep/5 transition-transform duration-300 hover:scale-[1.02] active:scale-95 touch-manipulation"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/85 via-emerald-deep/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 sm:p-4 text-ivory">
                <span className="text-[10px] font-sans uppercase tracking-widest text-gold font-medium mb-0.5">
                  {photo.category}
                </span>
                <p className="font-serif text-xs sm:text-sm font-semibold line-clamp-1">
                  {photo.title}
                </p>
                <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-gold backdrop-blur-sm opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-emerald-deep rounded-2xl overflow-hidden border border-gold/40 shadow-2xl"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 text-gold flex items-center justify-center hover:bg-gold hover:text-emerald-deep transition-colors touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={selectedPhoto.src}
                  alt={selectedPhoto.alt}
                  fill
                  className="object-contain bg-emerald-deep"
                />
              </div>

              <div className="p-4 sm:p-6 bg-emerald-deep text-ivory border-t border-gold/20 text-center">
                <span className="text-xs font-sans uppercase tracking-widest text-gold block mb-1">
                  {selectedPhoto.category}
                </span>
                <h3 className="font-serif text-lg font-bold text-ivory">
                  {selectedPhoto.title}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
