"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music,
  VolumeX,
  SlidersHorizontal,
  UploadCloud,
  Link2,
  Check,
  Loader2,
  X,
  Radio,
  Sparkles,
  RotateCcw,
  FileAudio,
  Music2,
} from "lucide-react";
import { graduationConfig, AudioPreset } from "@/config/graduation";
import { useGuest } from "@/context/guest-context";

export const playBackgroundMusic = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("PLAY_BACKGROUND_MUSIC"));
  }
};

export const MusicToggle: React.FC = () => {
  const { isOwner, audioUrl, setAudioUrl } = useGuest();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "playlist" | "url">("upload");

  // State cho Cloudinary Upload
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // State cho Direct URL
  const [directUrlInput, setDirectUrlInput] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);
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

    const handleAudioUrlChanged = (e: Event) => {
      const customEvt = e as CustomEvent<string>;
      const newUrl = customEvt.detail || audioUrl;
      if (audioRef.current) {
        audioRef.current.src = newUrl;
        audioRef.current.load();
        if (isPlaying || !isManuallyPausedRef.current) {
          startPlayback(true);
        }
      }
    };

    window.addEventListener("PLAY_BACKGROUND_MUSIC", handleCustomPlaySignal);
    window.addEventListener("AUDIO_URL_CHANGED", handleAudioUrlChanged);

    return () => {
      window.removeEventListener("PLAY_BACKGROUND_MUSIC", handleCustomPlaySignal);
      window.removeEventListener("AUDIO_URL_CHANGED", handleAudioUrlChanged);
    };
  }, [audioUrl, isPlaying]);

  // Cập nhật lại audio element khi audioUrl thay đổi
  useEffect(() => {
    if (audioRef.current && audioRef.current.src !== audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [audioUrl, isPlaying]);

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

  const handleSelectPreset = (preset: AudioPreset) => {
    setAudioUrl(preset.url);
    setUploadSuccessMessage(`Đã chọn bài: ${preset.title}`);
    isManuallyPausedRef.current = false;
    setTimeout(() => {
      startPlayback(true);
    }, 150);
  };

  const handleApplyDirectUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = directUrlInput.trim();
    if (!clean) {
      setUploadError("Vui lòng nhập đường dẫn bài hát MP3.");
      return;
    }
    if (!clean.startsWith("http://") && !clean.startsWith("https://") && !clean.startsWith("/")) {
      setUploadError("Đường dẫn nhạc phải bắt đầu bằng http:// hoặc https://");
      return;
    }

    setAudioUrl(clean);
    setUploadError(null);
    setUploadSuccessMessage("Đã cập nhật bài nhạc nền mới thành công!");
    setDirectUrlInput("");
    isManuallyPausedRef.current = false;
    setTimeout(() => {
      startPlayback(true);
    }, 150);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/") && !/\.(mp3|m4a|wav|aac|ogg|flac)$/i.test(file.name)) {
      setUploadError("Vui lòng chọn file định dạng âm thanh (MP3, M4A, WAV, AAC, OGG)");
      setSelectedAudioFile(null);
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setUploadError("Dung lượng file âm thanh không được vượt quá 30MB");
      setSelectedAudioFile(null);
      return;
    }

    setSelectedAudioFile(file);
    setUploadError(null);
  };

  const handleUploadToCloudinary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAudioFile) {
      setUploadError("Vui lòng chọn 1 bản nhạc MP3 từ thiết bị.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgressText("Đang tải bài hát lên Cloudinary...");

    try {
      const formData = new FormData();
      formData.append("file", selectedAudioFile);
      formData.append("upload_preset", graduationConfig.cloudinaryUploadPreset);
      formData.append("folder", "graduation_music");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${graduationConfig.cloudinaryCloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || "Tải bài hát lên Cloudinary thất bại.");
      }

      const result = await response.json();
      const uploadedMusicUrl = result.secure_url;

      if (!uploadedMusicUrl) {
        throw new Error("Không nhận được liên kết bài hát từ Cloudinary.");
      }

      setAudioUrl(uploadedMusicUrl);
      setUploadSuccessMessage(`Tải lên thành công! Bài hát "${selectedAudioFile.name}" đã được đặt làm nhạc nền.`);
      setSelectedAudioFile(null);
      if (audioFileInputRef.current) {
        audioFileInputRef.current.value = "";
      }

      isManuallyPausedRef.current = false;
      setTimeout(() => {
        startPlayback(true);
      }, 300);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải nhạc lên Cloudinary.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
      setUploadProgressText("");
    }
  };

  const handleResetDefault = () => {
    setAudioUrl(graduationConfig.audioUrl);
    setUploadSuccessMessage("Đã khôi phục về bản nhạc nền mặc định!");
    isManuallyPausedRef.current = false;
    setTimeout(() => {
      startPlayback(true);
    }, 150);
  };

  return (
    <>
      <audio ref={audioRef} src={audioUrl} loop preload="auto" />

      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        {/* Equalizer Frequency Bar Animation */}
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-emerald-deep/90 backdrop-blur-md border border-gold/50 shadow-md"
          >
            <div className="w-1 h-3 bg-gold rounded-full animate-bounce" style={{ animationDuration: "0.6s" }} />
            <div className="w-1 h-4 bg-gold-shimmer rounded-full animate-bounce" style={{ animationDuration: "0.4s" }} />
            <div className="w-1 h-2 bg-gold rounded-full animate-bounce" style={{ animationDuration: "0.8s" }} />
            <span className="text-[9px] sm:text-[10px] font-sans font-bold text-gold uppercase tracking-wider ml-0.5 sm:ml-1">
              PLAYING
            </span>
          </motion.div>
        )}

        {/* Cài đặt âm nhạc (Chỉ dành riêng cho Owner - slug phuongnha) */}
        {isOwner && (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setUploadError(null);
              setUploadSuccessMessage(null);
              setIsModalOpen(true);
            }}
            aria-label="Cài đặt nhạc nền cho thiệp"
            title="Đổi nhạc nền (Dành cho Phương Nhã)"
            className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg border bg-gold text-emerald-deep border-gold hover:bg-gold-shimmer shadow-gold/20 transition-all duration-300 active:scale-95 touch-manipulation cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[2.2]" />
          </motion.button>
        )}

        {/* Nút Bật / Tắt Nhạc */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={toggleMusic}
          aria-label={isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
          className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg border transition-all duration-300 active:scale-95 touch-manipulation cursor-pointer ${
            isPlaying
              ? "bg-gold text-emerald-deep border-gold shadow-md"
              : "bg-emerald-deep/90 backdrop-blur-md text-gold border-gold/50 hover:border-gold"
          }`}
        >
          {isPlaying ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}>
              <Music className="w-5 h-5 stroke-[2]" />
            </motion.div>
          ) : (
            <VolumeX className="w-5 h-5 stroke-[2]" />
          )}
        </motion.button>
      </div>

      {/* Modal Quản Lý Âm Nhạc Dành Cho Phương Nhã */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-emerald-dark/95 border border-gold/40 rounded-2xl shadow-2xl overflow-hidden text-cream text-left"
            >
              {/* Header Modal */}
              <div className="relative px-6 py-5 border-b border-gold/20 bg-emerald-deep/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                    <Music2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-gold tracking-wide flex items-center gap-2">
                      Quản Lý Nhạc Nền Thiệp
                      <span className="text-[10px] uppercase font-sans font-semibold px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30">
                        Owner
                      </span>
                    </h3>
                    <p className="text-xs text-cream/70">Tùy chọn bản nhạc nền phát trên thiệp cho tất cả mọi người</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-black/20 hover:bg-gold/20 text-cream hover:text-gold flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs Navigation */}
              <div className="flex border-b border-gold/20 bg-black/20 p-1.5 gap-1">
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "upload"
                      ? "bg-gold text-emerald-deep font-bold shadow-md"
                      : "text-cream/80 hover:text-gold hover:bg-gold/10"
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Cloudinary Up
                </button>

                <button
                  onClick={() => setActiveTab("playlist")}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "playlist"
                      ? "bg-gold text-emerald-deep font-bold shadow-md"
                      : "text-cream/80 hover:text-gold hover:bg-gold/10"
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  Playlist Mẫu
                </button>

                <button
                  onClick={() => setActiveTab("url")}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "url"
                      ? "bg-gold text-emerald-deep font-bold shadow-md"
                      : "text-cream/80 hover:text-gold hover:bg-gold/10"
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Link Nhạc Trực Tiếp
                </button>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Error & Success Messages */}
                {uploadError && (
                  <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                    <X className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadSuccessMessage && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-gold/50 text-gold text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-gold shrink-0" />
                    <span>{uploadSuccessMessage}</span>
                  </div>
                )}

                {/* TAB 1: UPLOAD ĐẾN CLOUDINARY */}
                {activeTab === "upload" && (
                  <form onSubmit={handleUploadToCloudinary} className="space-y-4">
                    <div className="p-4 rounded-xl border border-dashed border-gold/40 bg-gold/5 text-center transition-colors hover:border-gold">
                      <input
                        ref={audioFileInputRef}
                        type="file"
                        accept="audio/*, .mp3, .m4a, .wav, .aac, .ogg"
                        onChange={handleFileChange}
                        className="hidden"
                        id="cloud-audio-upload"
                      />
                      <label htmlFor="cloud-audio-upload" className="cursor-pointer block space-y-2">
                        <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 mx-auto flex items-center justify-center text-gold">
                          <FileAudio className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gold">
                            {selectedAudioFile ? selectedAudioFile.name : "Nhấp để chọn file nhạc MP3 từ thiết bị"}
                          </p>
                          <p className="text-[11px] text-cream/60 mt-1">
                            Hỗ trợ MP3, M4A, WAV, AAC, OGG (Tối đa 30MB)
                          </p>
                        </div>
                        {selectedAudioFile && (
                          <span className="inline-block text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30">
                            {(selectedAudioFile.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        )}
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isUploading || !selectedAudioFile}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                        isUploading || !selectedAudioFile
                          ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                          : "bg-gold text-emerald-deep hover:bg-gold-shimmer active:scale-[0.99] cursor-pointer"
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{uploadProgressText || "Đang tải bài hát lên Cloudinary..."}</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          <span>Tải Nhạc Lên Cloudinary & Đặt Làm Nhạc Nền</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* TAB 2: PLAYLIST MẪU */}
                {activeTab === "playlist" && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-cream/70 mb-2">Chọn nhanh một bản nhạc mẫu không lời tinh tế:</p>
                    {graduationConfig.audioPlaylist.map((item) => {
                      const isCurrent = audioUrl === item.url;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectPreset(item)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isCurrent
                              ? "bg-gold/20 border-gold shadow-md text-gold"
                              : "bg-black/20 border-gold/20 hover:border-gold/50 text-cream"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isCurrent ? "bg-gold text-emerald-deep font-bold" : "bg-gold/10 text-gold"
                              }`}
                            >
                              <Music className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold">{item.title}</p>
                              <p className="text-[10px] text-cream/60">{item.artist}</p>
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold text-emerald-deep flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> ĐANG PHÁT
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* TAB 3: LINK MP3 TRỰC TIẾP */}
                {activeTab === "url" && (
                  <form onSubmit={handleApplyDirectUrl} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gold mb-1.5">
                        Đường dẫn trực tiếp bài hát (.mp3):
                      </label>
                      <input
                        type="url"
                        value={directUrlInput}
                        onChange={(e) => setDirectUrlInput(e.target.value)}
                        placeholder="https://res.cloudinary.com/.../music.mp3"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-gold/30 text-cream placeholder-cream/40 text-xs focus:outline-none focus:border-gold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-gold text-emerald-deep font-bold text-xs hover:bg-gold-shimmer transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      Áp Dụng Bản Nhạc Này
                    </button>
                  </form>
                )}

                {/* Reset Button */}
                <div className="pt-3 border-t border-gold/20 flex justify-between items-center text-xs">
                  <span className="text-[11px] text-cream/60 truncate max-w-[220px]">
                    Đang phát: <span className="text-gold font-mono">{audioUrl.split("/").pop() || "audio"}</span>
                  </span>
                  <button
                    onClick={handleResetDefault}
                    className="text-[11px] text-gold/80 hover:text-gold flex items-center gap-1 underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Mặc định
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
