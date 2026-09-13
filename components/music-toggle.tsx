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
  ArrowLeft,
  Trash2,
  Clock,
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

  // State lưu danh sách bài hát đã upload/thêm mới vào Playlist
  const [customAudioTracks, setCustomAudioTracks] = useState<AudioPreset[]>([]);
  // State lưu danh sách bài hát đồng bộ từ Google Sheet 'NhacNen'
  const [sheetAudioTracks, setSheetAudioTracks] = useState<AudioPreset[]>([]);

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

  // Khôi phục danh sách bài hát đã up từ LocalStorage & Tải nhạc từ Sheet 'NhacNen'
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("custom_audio_playlist");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setCustomAudioTracks(parsed);
          }
        }
      } catch {}

      fetch("/api/music?refresh=1")
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.playlist)) {
            setSheetAudioTracks(data.playlist);
          }
        })
        .catch(() => {});
    }
  }, []);

  const addCustomTrackToPlaylist = (title: string, url: string, artist = "Cloudinary Upload") => {
    const newTrack: AudioPreset = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: title.trim() || "Bài hát đã tải lên",
      artist,
      url: url.trim(),
      uploadedAt: new Date().toLocaleString("vi-VN"),
    };

    setCustomAudioTracks((prev) => {
      const filtered = prev.filter((item) => item.url !== newTrack.url);
      const updated = [newTrack, ...filtered];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("custom_audio_playlist", JSON.stringify(updated));
          sessionStorage.setItem("custom_audio_playlist", JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  const handleDeleteCustomTrack = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    setCustomAudioTracks((prev) => {
      const updated = prev.filter((t) => t.id !== trackId);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("custom_audio_playlist", JSON.stringify(updated));
          sessionStorage.setItem("custom_audio_playlist", JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

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

  const saveMusicToSheet = async (title: string, url: string, artist = "Cloudinary Upload") => {
    try {
      // 1. Gửi ngay lập tức qua API Route Server (0ms cập nhật RAM server, server chuyển tiếp Google Sheet)
      const apiPromise = fetch("/api/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          artist: artist.trim(),
          url: url.trim(),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.playlist)) {
            setSheetAudioTracks(data.playlist);
          }
          return data;
        })
        .catch(() => null);


      await apiPromise;
    } catch {}
  };

  const handleSelectPreset = async (preset: AudioPreset) => {
    setAudioUrl(preset.url);
    setUploadSuccessMessage(`Đã chọn bài: "${preset.title}". Đang đồng bộ Google Sheets...`);
    await saveMusicToSheet(preset.title, preset.url, preset.artist);
    setUploadSuccessMessage(`Đã chọn bài: "${preset.title}" & đồng bộ tức thì cho tất cả thiết bị!`);
    isManuallyPausedRef.current = false;
    setTimeout(() => {
      startPlayback(true);
    }, 150);
  };

  const handleApplyDirectUrl = async (e: React.FormEvent) => {
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

    const fileName = clean.split("/").pop()?.split("?")[0] || "Link Nhạc Trực Tiếp";
    const songTitle = decodeURIComponent(fileName);
    addCustomTrackToPlaylist(songTitle, clean, "Link MP3 Trực Tiếp");
    setAudioUrl(clean);
    setUploadError(null);
    setUploadSuccessMessage("Đang lưu bài hát vào Google Sheets...");

    await saveMusicToSheet(songTitle, clean, "Link MP3 Trực Tiếp");
    setUploadSuccessMessage("Đã cập nhật & lưu nhạc vào Google Sheet thành công!");
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

      const songTitle = selectedAudioFile.name.replace(/\.[^/.]+$/, "");
      addCustomTrackToPlaylist(songTitle, uploadedMusicUrl, "Cloudinary Upload");

      setUploadProgressText("Đang lưu link nhạc vào Google Sheets ngay tức khắc...");
      await saveMusicToSheet(songTitle, uploadedMusicUrl, "Cloudinary Upload");

      setAudioUrl(uploadedMusicUrl);
      setUploadSuccessMessage(`Tải lên & đồng bộ thành công! Bài hát "${songTitle}" đã được đặt làm nhạc nền cho toàn bộ thiết bị.`);
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

  const handleResetDefault = async () => {
    setAudioUrl(graduationConfig.audioUrl);
    setUploadSuccessMessage("Đang khôi phục về bản nhạc mặc định & đồng bộ Google Sheets...");
    await saveMusicToSheet(
      "Nhạc Nền Mặc Định (Acoustic Piano)",
      graduationConfig.audioUrl,
      "Graduation Theme"
    );
    setUploadSuccessMessage("Đã khôi phục về bản nhạc nền mặc định & đồng bộ Google Sheets!");
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-[#0D2E26] border-2 border-gold/60 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden text-white text-left"
            >
              {/* Header Modal */}
              <div className="relative px-6 py-5 border-b border-gold/30 bg-[#081F1A] flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    title="Quay lại thiệp"
                    className="px-2.5 py-1.5 rounded-xl bg-gold/15 hover:bg-gold text-gold hover:text-[#0D2E26] border border-gold/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Quay lại</span>
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-gold/20 border border-gold/50 flex items-center justify-center text-gold shrink-0">
                    <Music2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-gold tracking-wide flex items-center gap-2">
                      Quản Lý Nhạc Nền Thiệp
                      <span className="text-[10px] uppercase font-sans font-extrabold px-2.5 py-0.5 rounded-full bg-gold text-[#0D2E26]">
                        Owner
                      </span>
                    </h3>
                    <p className="text-xs text-white/90 font-medium">Tùy chọn bản nhạc nền phát trên thiệp cho tất cả mọi người</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  title="Đóng cửa sổ"
                  className="w-8 h-8 rounded-full bg-gold/20 hover:bg-gold text-gold hover:text-[#0D2E26] flex items-center justify-center transition-all cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs Navigation */}
              <div className="flex border-b border-gold/30 bg-[#061713] p-1.5 gap-1.5">
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "upload"
                      ? "bg-gold text-[#0D2E26] font-extrabold shadow-md border border-gold-shimmer"
                      : "bg-[#123C32] text-white hover:text-gold hover:bg-[#1A4D41] border border-gold/30"
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  Cloudinary Up
                </button>

                <button
                  onClick={() => setActiveTab("playlist")}
                  className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "playlist"
                      ? "bg-gold text-[#0D2E26] font-extrabold shadow-md border border-gold-shimmer"
                      : "bg-[#123C32] text-white hover:text-gold hover:bg-[#1A4D41] border border-gold/30"
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  Playlist Mẫu
                </button>

                <button
                  onClick={() => setActiveTab("url")}
                  className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "url"
                      ? "bg-gold text-[#0D2E26] font-extrabold shadow-md border border-gold-shimmer"
                      : "bg-[#123C32] text-white hover:text-gold hover:bg-[#1A4D41] border border-gold/30"
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                  Link Nhạc Trực Tiếp
                </button>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Error & Success Messages */}
                {uploadError && (
                  <div className="p-3.5 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-xs font-medium flex items-center gap-2 shadow-md">
                    <X className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadSuccessMessage && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-gold text-gold text-xs font-bold flex items-center gap-2 shadow-md">
                    <Check className="w-4 h-4 text-gold shrink-0" />
                    <span>{uploadSuccessMessage}</span>
                  </div>
                )}

                {/* TAB 1: UPLOAD ĐẾN CLOUDINARY */}
                {activeTab === "upload" && (
                  <form onSubmit={handleUploadToCloudinary} className="space-y-4">
                    <div className="p-5 rounded-xl border-2 border-dashed border-gold/50 bg-[#081F1A] text-center transition-colors hover:border-gold">
                      <input
                        ref={audioFileInputRef}
                        type="file"
                        accept="audio/*, .mp3, .m4a, .wav, .aac, .ogg"
                        onChange={handleFileChange}
                        className="hidden"
                        id="cloud-audio-upload"
                      />
                      <label htmlFor="cloud-audio-upload" className="cursor-pointer block space-y-2">
                        <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/40 mx-auto flex items-center justify-center text-gold">
                          <FileAudio className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gold">
                            {selectedAudioFile ? selectedAudioFile.name : "Nhấp để chọn file nhạc MP3 từ thiết bị"}
                          </p>
                          <p className="text-xs text-white/80 mt-1">
                            Hỗ trợ MP3, M4A, WAV, AAC, OGG (Tối đa 30MB)
                          </p>
                        </div>
                        {selectedAudioFile && (
                          <span className="inline-block text-xs font-mono font-bold px-3 py-1 rounded-full bg-gold text-[#0D2E26] shadow-sm">
                            {(selectedAudioFile.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        )}
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="py-3 px-4 rounded-xl border border-gold/40 text-gold hover:bg-gold/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Quay lại</span>
                      </button>
                      <button
                        type="submit"
                        disabled={isUploading || !selectedAudioFile}
                        className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                          isUploading || !selectedAudioFile
                            ? "bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700"
                            : "bg-gold text-[#0D2E26] hover:bg-gold-shimmer active:scale-[0.99] cursor-pointer"
                        }`}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{uploadProgressText || "Đang tải lên..."}</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4" />
                            <span>Tải Lên Cloudinary</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 2: PLAYLIST MẪU & BÀI HÁT ĐÃ TẢI LÊN */}
                {activeTab === "playlist" && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-white/90 font-medium mb-2">
                      Chọn bài hát từ danh sách đã tải lên hoặc playlist mẫu:
                    </p>

                    {Array.from(
                      new Map(
                        [...customAudioTracks, ...sheetAudioTracks, ...graduationConfig.audioPlaylist].map((item) => [item.url, item])
                      ).values()
                    ).map((item) => {
                      const isCurrent = audioUrl === item.url;
                      const isCustom = item.id.startsWith("custom-");
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectPreset(item)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isCurrent
                              ? "bg-gold/25 border-2 border-gold shadow-md text-gold"
                              : "bg-[#081F1A] border border-gold/30 hover:border-gold text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                isCurrent ? "bg-gold text-[#0D2E26] font-bold" : "bg-gold/20 text-gold"
                              }`}
                            >
                              <Music className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-white truncate">{item.title}</p>
                              <p className="text-[11px] text-white/70 truncate">{item.artist}</p>
                              {item.uploadedAt && (
                                <p className="text-[10px] text-gold/80 flex items-center gap-1 mt-0.5 font-mono">
                                  <Clock className="w-3 h-3 text-gold/60 shrink-0" />
                                  <span>{item.uploadedAt}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isCurrent && (
                              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-gold text-[#0D2E26] flex items-center gap-1 shadow-sm">
                                <Sparkles className="w-3 h-3" /> ĐANG PHÁT
                              </span>
                            )}
                            {isCustom && (
                              <button
                                onClick={(e) => handleDeleteCustomTrack(e, item.id)}
                                title="Xóa bài hát khỏi Playlist"
                                className="w-7 h-7 rounded-lg bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white flex items-center justify-center transition-all border border-red-500/40 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="w-full mt-3 py-2.5 px-4 rounded-xl border border-gold/40 text-gold hover:bg-gold/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Quay lại thiệp mời</span>
                    </button>
                  </div>
                )}

                {/* TAB 3: LINK MP3 TRỰC TIẾP */}
                {activeTab === "url" && (
                  <form onSubmit={handleApplyDirectUrl} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gold mb-1.5">
                        Đường dẫn trực tiếp bài hát (.mp3):
                      </label>
                      <input
                        type="url"
                        value={directUrlInput}
                        onChange={(e) => setDirectUrlInput(e.target.value)}
                        placeholder="https://res.cloudinary.com/.../music.mp3"
                        className="w-full px-3.5 py-3 rounded-xl bg-[#061713] border-2 border-gold/50 text-white placeholder:text-white/40 text-xs font-medium focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 shadow-inner"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="py-3 px-4 rounded-xl border border-gold/40 text-gold hover:bg-gold/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Quay lại</span>
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 px-4 rounded-xl bg-gold text-[#0D2E26] font-extrabold text-xs hover:bg-gold-shimmer transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg border border-gold-shimmer"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Áp Dụng Bản Nhạc Này</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Reset Button & Back Link */}
                <div className="pt-3 border-t border-gold/30 flex justify-between items-center text-xs">
                  <span className="text-[11px] text-white/80 font-medium truncate max-w-[220px]">
                    Đang phát: <span className="text-gold font-mono font-bold">{audioUrl.split("/").pop() || "audio"}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleResetDefault}
                      className="text-[11px] text-gold hover:text-gold-shimmer font-bold flex items-center gap-1 underline cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Mặc định
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-[11px] text-white/90 hover:text-gold font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" /> Thoát
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};



