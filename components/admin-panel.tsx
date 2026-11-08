"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Check,
  Copy,
  Link2,
  List,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  Send,
  Share2,
  UserPlus,
} from "lucide-react";
import { AdminDashboard } from "@/components/admin-dashboard";
import { Pagination, usePagination, useListAnchor } from "@/components/admin-pagination";

type Mode = "friend" | "elder" | "senior" | "junior";
type Tab = "overview" | "create" | "list";

interface Guest {
  slug?: string;
  name: string;
  mode: Mode;
  customMessage?: string;
  customTime?: string;
  customDate?: string;
  canUpload?: boolean;
  /** Số thiết bị đã mở link (tối đa 2) */
  devices?: number;
}

const MAX_DEVICES = 2;

/** Xoá các thiết bị đã ghi nhận để khách mở lại link được (vd đổi điện thoại) */
function UnlockButton({ slug, name, onDone }: { slug: string; name: string; onDone: () => void }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const run = async () => {
    if (!window.confirm(`Mở khoá link của ${name}?\nCác thiết bị đã mở sẽ bị xoá; 2 thiết bị mở tiếp theo được xem lời nhắn riêng.`)) return;
    setState("busy");
    try {
      const r = await fetch("/api/admin/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const d = await r.json();
      setState(r.ok && d.success ? "done" : "error");
      if (r.ok && d.success) onDone();
    } catch {
      setState("error");
    }
  };
  return (
    <button
      type="button"
      onClick={run}
      disabled={state === "busy"}
      className={`${actionBtn} col-span-2 sm:col-span-1 bg-transparent border-white/20 text-ivory/80 hover:border-gold hover:text-gold disabled:opacity-50`}
    >
      {state === "busy" ? "Đang mở khoá…" : state === "done" ? "Đã mở khoá" : state === "error" ? "Lỗi — thử lại" : "Mở khoá"}
    </button>
  );
}

const MODE_LABEL: Record<Mode, string> = {
  friend: "Bạn bè — xưng Nhã (Thân mời)",
  elder: "Thầy cô / Người lớn — xưng con (Kính mời)",
  senior: "Anh / Chị — xưng em (Thân ái mời)",
  junior: "Em / Bé — xưng anh (Mời)",
};

const MODE_SHORT: Record<Mode, string> = {
  friend: "Bạn bè",
  elder: "Người lớn",
  senior: "Anh/Chị",
  junior: "Đàn em",
};

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "overview", label: "Tổng quan", icon: <BarChart3 className="w-5 h-5 sm:w-3.5 sm:h-3.5" /> },
  { key: "create", label: "Thêm khách", icon: <UserPlus className="w-5 h-5 sm:w-3.5 sm:h-3.5" /> },
  { key: "list", label: "Danh sách", icon: <List className="w-5 h-5 sm:w-3.5 sm:h-3.5" /> },
];

// text-base trên điện thoại: iPhone tự phóng to trang khi ô nhập có chữ < 16px
const inputCls =
  "w-full px-3.5 py-3 sm:py-2.5 rounded-xl bg-white/10 border border-gold/40 text-ivory placeholder-ivory/40 text-base sm:text-sm font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all";
const labelCls = "block text-xs font-sans uppercase tracking-wider text-gold-light font-semibold mb-1.5";
const cardCls = "rounded-2xl bg-emerald-deep border border-gold/40 p-4 sm:p-6 shadow-xl";
const actionBtn =
  "inline-flex items-center justify-center gap-1.5 min-h-11 sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-lg border text-sm sm:text-xs font-semibold transition-colors cursor-pointer";

function guestUrl(slug: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/?u=${encodeURIComponent(slug)}`;
}

/** "2026-12-04" (input date) -> "04/12/2026" */
function isoToDMY(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

function CopyButton({ text, label = "Copy", className = "" }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // Trình duyệt cũ / trong app Zalo: chọn sẵn để người dùng tự copy
          window.prompt("Copy link:", text);
        }
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }}
      className={`${actionBtn} bg-gold/15 border-gold/40 text-gold hover:bg-gold hover:text-emerald-deep ${className}`}
    >
      {done ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {done ? "Đã copy" : label}
    </button>
  );
}

/** Mở bảng chia sẻ của điện thoại (Zalo, Messenger…); máy không hỗ trợ thì mở Zalo share */
function ShareButton({ url, name, className = "" }: { url: string; name: string; className?: string }) {
  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Thiệp mời tốt nghiệp", text: `Thiệp mời gửi ${name}`, url });
        return;
      } catch {
        return; // người dùng bấm huỷ
      }
    }
    window.open(`https://zalo.me/share?url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
  };
  return (
    <button
      type="button"
      onClick={share}
      className={`${actionBtn} bg-white/5 border-white/20 text-ivory hover:border-gold hover:text-gold ${className}`}
    >
      <Share2 className="w-4 h-4" /> Gửi
    </button>
  );
}

export const AdminPanel: React.FC = () => {
  const [status, setStatus] = useState<{ configured: boolean; loggedIn: boolean } | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/login", { cache: "no-store" });
      setStatus(await r.json());
    } catch {
      setStatus({ configured: true, loggedIn: false });
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  if (!status) {
    return (
      <main className="min-h-dvh bg-emerald-950 text-ivory font-sans flex items-center justify-center">
        <p className="text-sm text-ivory/60">Đang tải…</p>
      </main>
    );
  }

  if (!status.loggedIn) {
    return (
      <main className="min-h-dvh bg-emerald-950 text-ivory font-sans px-4 py-10 flex flex-col justify-center">
        <header className="text-center mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gold-shimmer">Quản lý khách mời</h1>
        </header>
        <LoginForm configured={status.configured} onDone={refreshStatus} />
      </main>
    );
  }

  return <Dashboard onLogout={refreshStatus} />;
};

function LoginForm({ configured, onDone }: { configured: boolean; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await r.json();
      if (!r.ok || !data.success) setError(data.error || "Đăng nhập thất bại");
      else onDone();
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={`${cardCls} w-full max-w-sm mx-auto space-y-4`}>
      <div className="flex items-center gap-2 text-gold">
        <Lock className="w-4 h-4" />
        <span className="font-semibold text-sm">Đăng nhập</span>
      </div>
      {!configured && (
        <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-400/30 rounded-lg p-2.5">
          Chưa có biến môi trường <code>ADMIN_PASSWORD</code>. Thêm trong Vercel → Settings → Environment Variables rồi deploy lại.
        </p>
      )}
      <div>
        <label className={labelCls} htmlFor="admin-pw">Mật khẩu</label>
        <input
          id="admin-pw"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
          autoFocus
        />
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={busy || !password}
        className="w-full min-h-12 rounded-xl bg-gold-gradient text-emerald-deep font-bold text-sm uppercase tracking-wider disabled:opacity-50 cursor-pointer"
      >
        {busy ? "Đang kiểm tra…" : "Vào trang quản lý"}
      </button>
    </form>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("overview");

  const loadGuests = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const r = await fetch("/api/admin/guests", { cache: "no-store" });
      if (r.status === 401) return onLogout();
      const data = await r.json();
      if (data.success) setGuests(data.guests || []);
      else setListError(data.error || "Không tải được danh sách");
    } catch {
      setListError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

  const goTab = (t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0 });
  };

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" }).catch(() => {});
    onLogout();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter((g) => g.name.toLowerCase().includes(q) || (g.slug || "").toLowerCase().includes(q));
  }, [guests, query]);

  const listAnchor = useListAnchor<HTMLElement>();
  const pager = usePagination(filtered, query);

  return (
    <main className="min-h-dvh bg-emerald-950 text-ivory font-sans pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-12">
      {/* Thanh trên cùng: gọn trên điện thoại, có tab trên máy tính */}
      <header className="sticky top-0 z-30 bg-emerald-950/90 backdrop-blur-md border-b border-gold/20">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-3">
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-gold-shimmer truncate">Quản lý khách mời</h1>

          <nav className="hidden sm:inline-flex rounded-xl border border-gold/40 p-0.5 bg-emerald-deep" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => goTab(t.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs whitespace-nowrap rounded-lg cursor-pointer transition-colors ${
                  tab === t.key ? "bg-gold text-emerald-deep font-semibold" : "text-ivory/70 hover:text-gold"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>

          <button
            onClick={logout}
            aria-label="Đăng xuất"
            className="inline-flex items-center justify-center gap-1.5 min-h-10 min-w-10 -mr-2 px-2 text-xs whitespace-nowrap text-ivory/70 hover:text-gold cursor-pointer"
          >
            <LogOut className="w-5 h-5 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        {tab === "overview" && <AdminDashboard onUnauthorized={onLogout} />}

        {tab === "create" && <CreateGuestForm onCreated={loadGuests} onViewList={() => goTab("list")} />}

        {tab === "list" && (
          <section ref={listAnchor} className={`${cardCls} scroll-mt-16`}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="font-serif text-xl text-gold font-semibold">Khách đã có ({guests.length})</h2>
              <button
                onClick={loadGuests}
                aria-label="Tải lại danh sách"
                className="inline-flex items-center justify-center gap-1 min-h-10 min-w-10 -mr-2 px-2 text-xs text-gold-light hover:text-gold cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Tải lại</span>
              </button>
            </div>

            <div className="relative mb-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên hoặc mã…"
                className={`${inputCls} pl-9`}
              />
            </div>

            {listError && <p className="text-sm text-red-300 mb-2">{listError}</p>}

            <ul className="divide-y divide-white/10">
              {pager.pageItems.map((g) => {
                const slug = g.slug || g.name;
                const url = guestUrl(slug);
                return (
                  <li key={slug} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-base sm:text-sm font-semibold text-ivory truncate">{g.name}</p>
                      <p className="text-xs sm:text-[11px] text-ivory/50 truncate">
                        {MODE_SHORT[g.mode] || g.mode}
                        {g.customDate ? ` · ${g.customDate}` : ""}
                        {g.customTime ? ` · ${g.customTime}` : ""}
                      </p>
                      <p className="font-mono text-xs sm:text-[11px] text-gold/70 truncate">?u={slug}</p>
                      <p
                        className={`text-xs sm:text-[11px] ${
                          (g.devices || 0) >= MAX_DEVICES ? "text-[#ec835a]" : "text-ivory/50"
                        }`}
                      >
                        Thiết bị đã mở: {g.devices || 0}/{MAX_DEVICES}
                        {(g.devices || 0) >= MAX_DEVICES ? " · đã khoá thiết bị mới" : ""}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:flex gap-2 shrink-0">
                      <CopyButton text={url} label="Copy link" />
                      <ShareButton url={url} name={g.name} />
                      {(g.devices || 0) > 0 && g.slug && <UnlockButton slug={g.slug} name={g.name} onDone={loadGuests} />}
                    </div>
                  </li>
                );
              })}
              {!loading && filtered.length === 0 && (
                <li className="py-6 text-center text-sm text-ivory/50">Không có khách nào</li>
              )}
              {loading && guests.length === 0 && (
                <li className="py-6 text-center text-sm text-ivory/50">Đang tải…</li>
              )}
            </ul>
            <Pagination {...pager} anchorRef={listAnchor} />
          </section>
        )}
      </div>

      {/* Thanh điều hướng dưới cùng — chỉ trên điện thoại */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-emerald-deep/95 backdrop-blur-md border-t border-gold/30 pb-[env(safe-area-inset-bottom)]"
        role="tablist"
      >
        <div className="grid grid-cols-3">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => goTab(t.key)}
              className={`flex flex-col items-center justify-center gap-0.5 h-16 text-[11px] cursor-pointer transition-colors ${
                tab === t.key ? "text-gold font-semibold" : "text-ivory/60"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}

function CreateGuestForm({ onCreated, onViewList }: { onCreated: () => void; onViewList: () => void }) {
  const [name, setName] = useState("");
  const [mode, setMode] = useState<Mode>("friend");
  const [customMessage, setCustomMessage] = useState("");
  const [dateIso, setDateIso] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [canUpload, setCanUpload] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ name: string; url: string; verified: boolean } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const r = await fetch("/api/admin/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mode,
          customMessage,
          customDate: isoToDMY(dateIso),
          customTime,
          canUpload,
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.success) {
        setError(data.error || "Không tạo được khách");
        return;
      }
      setResult({ name: name.trim(), url: guestUrl(data.code), verified: Boolean(data.verified) });
      setName("");
      setCustomMessage("");
      onCreated();
      // Đưa kết quả vào tầm nhìn trên điện thoại
      setTimeout(() => document.getElementById("create-result")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={cardCls}>
      <h2 className="font-serif text-xl text-gold font-semibold mb-4 flex items-center gap-2">
        <UserPlus className="w-5 h-5" /> Thêm khách mới
      </h2>

      {result && (
        <div id="create-result" className="mb-5 p-4 rounded-xl bg-black/30 border border-gold/40 space-y-3">
          <p className="text-sm">
            <Check className="inline w-4 h-4 text-gold mr-1 -mt-0.5" />
            Đã tạo link cho <span className="font-semibold text-gold">{result.name}</span>
          </p>
          <p className="font-mono text-xs text-gold/90 break-all select-all bg-black/20 rounded-lg px-3 py-2">{result.url}</p>
          <div className="grid grid-cols-2 sm:flex gap-2">
            <CopyButton text={result.url} label="Copy link" />
            <ShareButton url={result.url} name={result.name} />
            <a
              href={`https://zalo.me/share?url=${encodeURIComponent(result.url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${actionBtn} col-span-2 sm:col-span-1 bg-white/5 border-white/20 text-ivory hover:border-gold hover:text-gold`}
            >
              <Send className="w-4 h-4" /> Gửi qua Zalo
            </a>
          </div>
          {!result.verified && (
            <p className="flex items-start gap-1.5 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Chưa thấy dòng mới trong Sheet. Mở tab &ldquo;Danh sách&rdquo; sau vài giây để kiểm tra; nếu vẫn không có, kiểm tra Apps Script đã Deploy bản mới chưa.
            </p>
          )}
          <button type="button" onClick={onViewList} className="text-xs text-gold-light underline underline-offset-2 cursor-pointer">
            Xem danh sách khách
          </button>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="g-name">Tên hiển thị *</label>
            <input
              id="g-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Gia Bảo, Thầy Minh…"
              className={inputCls}
              maxLength={80}
              autoComplete="off"
              enterKeyHint="next"
              required
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="g-mode">Vai xưng</label>
            <select
              id="g-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              className={`${inputCls} [&>option]:text-charcoal`}
            >
              {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
                <option key={m} value={m}>{MODE_LABEL[m]}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="g-msg">Lời nhắn riêng</label>
          <textarea
            id="g-msg"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={4}
            maxLength={1500}
            placeholder="Để trống nếu dùng lời mời mặc định"
            className={inputCls}
          />
          <p className="text-right text-[11px] text-ivory/40 mt-1">{customMessage.length}/1500</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="min-w-0">
            <label className={labelCls} htmlFor="g-date">Ngày</label>
            <input
              id="g-date"
              type="date"
              value={dateIso}
              onChange={(e) => setDateIso(e.target.value)}
              className={`${inputCls} [color-scheme:dark] min-w-0`}
            />
          </div>
          <div className="min-w-0">
            <label className={labelCls} htmlFor="g-time">Giờ</label>
            <input
              id="g-time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              placeholder="10:00 sáng"
              className={inputCls}
              maxLength={60}
            />
          </div>
        </div>
        <p className="text-[11px] text-ivory/40 -mt-2">Ngày và giờ có thể để trống để dùng mặc định của thiệp.</p>

        <label className="flex items-center gap-3 min-h-11 text-sm text-ivory/80 cursor-pointer">
          <input
            type="checkbox"
            checked={canUpload}
            onChange={(e) => setCanUpload(e.target.checked)}
            className="accent-gold w-5 h-5"
          />
          Cho phép khách tải ảnh lên
        </label>

        {error && <p className="text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="w-full min-h-12 rounded-xl bg-gold-gradient text-emerald-deep font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Link2 className="w-4 h-4" />
          {busy ? "Đang tạo & ghi vào Sheet…" : "Tạo link thiệp"}
        </button>
      </form>
    </section>
  );
}
