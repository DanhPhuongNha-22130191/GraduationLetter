"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Check, Copy, Link2, LogOut, RefreshCw, Search, Send, UserPlus, Lock, AlertTriangle } from "lucide-react";
import { AdminDashboard } from "@/components/admin-dashboard";

type Mode = "friend" | "elder" | "senior" | "junior";

interface Guest {
  slug?: string;
  name: string;
  mode: Mode;
  customMessage?: string;
  customTime?: string;
  customDate?: string;
  canUpload?: boolean;
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

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-gold/40 text-ivory placeholder-ivory/40 text-sm font-sans focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold transition-all";
const labelCls = "block text-xs font-sans uppercase tracking-wider text-gold-light font-semibold mb-1.5";
const cardCls = "rounded-2xl bg-emerald-deep border border-gold/40 p-5 sm:p-6 shadow-xl";

function guestUrl(slug: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/?u=${encodeURIComponent(slug)}`;
}

/** "2026-12-04" (input date) -> "04/12/2026" */
function isoToDMY(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }}
      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gold/15 border border-gold/40 text-gold text-xs font-semibold hover:bg-gold hover:text-emerald-deep transition-colors cursor-pointer"
    >
      {done ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {done ? "Đã copy" : label}
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

  return (
    <main className="min-h-screen bg-emerald-950 text-ivory font-sans px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gold-shimmer">Quản lý khách mời</h1>
          <p className="text-xs text-ivory/60 mt-1">Tạo link thiệp riêng cho khách mới · Link đã gửi trước đây vẫn dùng bình thường</p>
        </header>

        {!status ? (
          <p className="text-center text-sm text-ivory/60">Đang tải…</p>
        ) : !status.loggedIn ? (
          <LoginForm configured={status.configured} onDone={refreshStatus} />
        ) : (
          <Dashboard onLogout={refreshStatus} />
        )}
      </div>
    </main>
  );
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
    <form onSubmit={submit} className={`${cardCls} max-w-sm mx-auto space-y-4`}>
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
      {error && <p className="text-xs text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={busy || !password}
        className="w-full py-2.5 rounded-xl bg-gold-gradient text-emerald-deep font-bold text-sm uppercase tracking-wider disabled:opacity-50 cursor-pointer"
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
  const [tab, setTab] = useState<"overview" | "guests">("overview");

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

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" }).catch(() => {});
    onLogout();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter((g) => g.name.toLowerCase().includes(q) || (g.slug || "").toLowerCase().includes(q));
  }, [guests, query]);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-gold/40 p-0.5 bg-emerald-deep" role="tablist">
          {([
            ["overview", "Tổng quan", <BarChart3 key="i" className="w-3.5 h-3.5" />],
            ["guests", "Khách mời", <UserPlus key="i" className="w-3.5 h-3.5" />],
          ] as const).map(([k, label, icon]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs whitespace-nowrap rounded-lg cursor-pointer transition-colors ${
                tab === k ? "bg-gold text-emerald-deep font-semibold" : "text-ivory/70 hover:text-gold"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 text-xs whitespace-nowrap text-ivory/70 hover:text-gold cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Đăng xuất
        </button>
      </div>

      {tab === "overview" ? (
        <AdminDashboard onUnauthorized={onLogout} />
      ) : (
      <>
      <CreateGuestForm onCreated={loadGuests} />

      <section className={cardCls}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-serif text-xl text-gold font-semibold">Khách đã có ({guests.length})</h2>
          <button
            onClick={loadGuests}
            className="inline-flex items-center gap-1 text-xs text-gold-light hover:text-gold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Tải lại
          </button>
        </div>

        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc mã…"
            className={`${inputCls} pl-9`}
          />
        </div>

        {listError && <p className="text-xs text-red-300 mb-2">{listError}</p>}

        <ul className="divide-y divide-white/10">
          {filtered.map((g) => {
            const slug = g.slug || g.name;
            const url = guestUrl(slug);
            return (
              <li key={slug} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ivory truncate">{g.name}</p>
                  <p className="text-[11px] text-ivory/50 truncate">
                    {MODE_SHORT[g.mode] || g.mode}
                    {g.customDate ? ` · ${g.customDate}` : ""}
                    {g.customTime ? ` · ${g.customTime}` : ""}
                  </p>
                  <p className="font-mono text-[11px] text-gold/80 break-all">{url}</p>
                </div>
                <CopyButton text={url} label="Copy link" />
              </li>
            );
          })}
          {!loading && filtered.length === 0 && (
            <li className="py-4 text-center text-xs text-ivory/50">Không có khách nào</li>
          )}
        </ul>
      </section>
      </>
      )}
    </>
  );
}

function CreateGuestForm({ onCreated }: { onCreated: () => void }) {
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
            rows={3}
            maxLength={1500}
            placeholder="Để trống nếu dùng lời mời mặc định"
            className={inputCls}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="g-date">Ngày (tùy chọn)</label>
            <input
              id="g-date"
              type="date"
              value={dateIso}
              onChange={(e) => setDateIso(e.target.value)}
              className={`${inputCls} [color-scheme:dark]`}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="g-time">Giờ (tùy chọn)</label>
            <input
              id="g-time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              placeholder="VD: 10:00 - 11:30 sáng"
              className={inputCls}
              maxLength={60}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-ivory/80 cursor-pointer">
          <input
            type="checkbox"
            checked={canUpload}
            onChange={(e) => setCanUpload(e.target.checked)}
            className="accent-gold w-4 h-4"
          />
          Cho phép khách tải ảnh lên
        </label>

        {error && <p className="text-xs text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="w-full py-3 rounded-xl bg-gold-gradient text-emerald-deep font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Link2 className="w-4 h-4" />
          {busy ? "Đang tạo & ghi vào Sheet…" : "Tạo link thiệp"}
        </button>
      </form>

      {result && (
        <div className="mt-5 p-4 rounded-xl bg-black/30 border border-gold/40 space-y-3">
          <p className="text-sm">
            Link cho <span className="font-semibold text-gold">{result.name}</span>:
          </p>
          <div className="flex items-center gap-2">
            <p className="font-mono text-xs text-gold/90 break-all select-all flex-1">{result.url}</p>
            <CopyButton text={result.url} />
          </div>
          <a
            href={`https://zalo.me/share?url=${encodeURIComponent(result.url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gold-light hover:text-gold"
          >
            <Send className="w-3.5 h-3.5" /> Gửi qua Zalo
          </a>
          {!result.verified && (
            <p className="flex items-start gap-1.5 text-[11px] text-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Chưa thấy dòng mới trong Sheet. Bấm &ldquo;Tải lại&rdquo; sau vài giây; nếu vẫn không có, kiểm tra Apps Script (docs/apps-script.gs) đã được Deploy bản mới chưa.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
