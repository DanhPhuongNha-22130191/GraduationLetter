"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pagination, usePagination, useListAnchor } from "@/components/admin-pagination";
import { AlertTriangle, Check, Eye, RefreshCw, UserCheck, Users, X } from "lucide-react";

/* ───────────────────────────── Types ───────────────────────────── */

type Mode = "friend" | "elder" | "senior" | "junior";
interface RawView { time: string; viewer: string; role: string; note: string }
interface RawRsvp { time: string; name: string; status: string; quantity: number; message: string }
interface RawGuest { slug?: string; name: string; mode: Mode; devices?: number }
interface StatsPayload {
  success: boolean;
  views: RawView[];
  rsvps: RawRsvp[];
  guests: RawGuest[];
  errors?: string[];
  fetchedAt: number;
  error?: string;
}

interface VnTime { ts: number; day: string; hour: number; label: string }

const MODE_SHORT: Record<Mode, string> = { friend: "Bạn bè", elder: "Người lớn", senior: "Anh/Chị", junior: "Đàn em" };

/** Số ngày gần nhất hiện trên biểu đồ */
const CHART_DAYS = 14;

/* ───────────────────────────── Parsing ───────────────────────────── */

const pad = (n: number) => String(n).padStart(2, "0");
const normName = (s: string) => s.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");

/** "15:03:54 25/10/2026" | "25/10/2026 15:03:54" | "25/10/2026, 15:03" | ISO -> giờ Việt Nam */
function parseVnTime(raw: string): VnTime | null {
  const s = (raw || "").trim();
  if (!s) return null;
  let y: number, m: number, d: number, h = 0, mi = 0, se = 0;

  const dm = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dm) {
    d = +dm[1]; m = +dm[2]; y = +dm[3];
    const tm = s.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (tm) { h = +tm[1]; mi = +tm[2]; se = tm[3] ? +tm[3] : 0; }
    if (/CH|PM/i.test(s) && h < 12) h += 12;
  } else {
    const iso = new Date(s);
    if (isNaN(iso.getTime())) return null;
    const vn = new Date(iso.getTime() + 7 * 3600_000);
    y = vn.getUTCFullYear(); m = vn.getUTCMonth() + 1; d = vn.getUTCDate();
    h = vn.getUTCHours(); mi = vn.getUTCMinutes(); se = vn.getUTCSeconds();
  }
  if (!(m >= 1 && m <= 12 && d >= 1 && d <= 31)) return null;
  return {
    ts: Date.UTC(y, m - 1, d, h - 7, mi, se),
    day: `${y}-${pad(m)}-${pad(d)}`,
    hour: h,
    label: `${pad(h)}:${pad(mi)} ${pad(d)}/${pad(m)}`,
  };
}

interface ViewEvent {
  t: VnTime | null;
  viewer: string;
  note: string;
  isClick: boolean;
  /** Link bị mở trên thiết bị lạ (quá giới hạn thiết bị) */
  isAlert: boolean;
  isAnon: boolean;
  personKey: string;
}

function toEvent(v: RawView): ViewEvent {
  const isClick = v.viewer === "Lượt bấm link" || /^Bấm link \(server\)/.test(v.note);
  const isAlert = /Thiết bị lạ/.test(v.role) || /^⚠ Link của/.test(v.note);
  const isAnon = /^Khách vãng lai/i.test(v.viewer);
  const vid = (v.viewer + " " + v.note).match(/V-[A-Z0-9]{4,}/)?.[0];
  return {
    t: parseVnTime(v.time),
    viewer: isAnon ? "Khách vãng lai (link chung)" : v.viewer || "Không rõ",
    note: v.note,
    isClick,
    isAlert,
    isAnon,
    personKey: isAnon ? `anon:${vid ?? v.note}` : `name:${normName(v.viewer)}`,
  };
}

const isYes = (s: string) => /^(có|co|yes|tham|sẽ|se |attend)/i.test(s.trim());
const isNo = (s: string) => /(không|khong|^no|vắng|bận)/i.test(s.trim());

function vnToday(): string {
  const vn = new Date(Date.now() + 7 * 3600_000);
  return `${vn.getUTCFullYear()}-${pad(vn.getUTCMonth() + 1)}-${pad(vn.getUTCDate())}`;
}
function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}
const dayLabel = (day: string) => `${day.slice(8)}/${day.slice(5, 7)}`;

/* ───────────────────────────── Biểu đồ cột (lượt mở theo ngày) ───────────────────────────── */

const BAR = "rgb(var(--c-emerald-700))";
const GOLD = "rgb(var(--c-gold-500))";
const GRID = "rgb(var(--c-emerald-900) / 0.08)";
const AXIS = "rgb(var(--c-emerald-900) / 0.25)";
const MUTED = "rgb(var(--c-emerald-900) / 0.55)";

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 5, 10].map((k) => k * mag).find((s) => s >= raw) || mag * 10;
  const st = Math.max(1, step);
  const top = Math.ceil(max / st) * st;
  const out: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += st) out.push(Math.round(v));
  return out;
}

function columnPath(x: number, y: number, w: number, h: number) {
  if (h <= 0) return "";
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}L${x},${y + r}Q${x},${y} ${x + r},${y}L${x + w - r},${y}Q${x + w},${y} ${x + w},${y + r}L${x + w},${y + h}Z`;
}

interface ColumnDatum { key: string; label: string; value: number; tip: string }

function ColumnChart({ data, height = 200 }: { data: ColumnDatum[]; height?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (hover === null) return;
    const onTouch = (e: TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setHover(null);
    };
    document.addEventListener("touchstart", onTouch, { passive: true });
    return () => document.removeEventListener("touchstart", onTouch);
  }, [hover, ref]);

  const padL = 28, padR = 8, padT = 16, padB = 24;
  const innerW = Math.max(0, width - padL - padR);
  const innerH = height - padT - padB;
  const max = Math.max(0, ...data.map((d) => d.value));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1] || 1;
  const band = data.length ? innerW / data.length : 0;
  const barW = Math.max(3, Math.min(26, band - 4));
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(innerW / 44))));
  const y = (v: number) => padT + innerH - (v / top) * innerH;

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label="Biểu đồ lượt mở thiệp theo ngày">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={padL} x2={width - padR} y1={y(t)} y2={y(t)} stroke={t === 0 ? AXIS : GRID} strokeWidth={1} />
              <text x={padL - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize={10} fill={MUTED} style={{ fontVariantNumeric: "tabular-nums" }}>
                {t}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = padL + band * i + band / 2;
            const h = innerH - (y(d.value) - padT);
            const active = hover === i;
            return (
              <g key={d.key}>
                <path
                  d={columnPath(cx - barW / 2, y(d.value), barW, h)}
                  fill={active || i === data.length - 1 ? GOLD : BAR}
                  opacity={hover === null || active ? 1 : 0.45}
                />
                {i % labelEvery === 0 && (
                  <text x={cx} y={height - 8} textAnchor="middle" fontSize={10} fill={MUTED}>
                    {d.label}
                  </text>
                )}
                <rect
                  x={padL + band * i}
                  y={padT}
                  width={band}
                  height={innerH}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`${d.tip}: ${d.value} lượt`}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  onTouchStart={() => setHover(i)}
                  style={{ outline: "none", cursor: "default" }}
                />
              </g>
            );
          })}
        </svg>
      )}
      {hover !== null && data[hover] && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-emerald-900 text-white border border-gold/60 px-2.5 py-1.5 text-[11px] shadow-soft-md whitespace-nowrap"
          style={{
            left: Math.min(Math.max(padL + band * hover + band / 2, 60), width - 60),
            top: Math.max(y(data[hover].value) - 8, 34),
          }}
        >
          <div className="text-white/70">{data[hover].tip}</div>
          <div className="font-semibold text-gold">{data[hover].value} lượt</div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────── Thành phần nhỏ ───────────────────────────── */

const panelCls = "rounded-2xl bg-white border border-emerald-900/10 shadow-soft-md p-4 sm:p-5";
const titleCls = "text-sm font-bold text-emerald-900 border-l-4 border-gold pl-2.5";

function StatTile({
  icon,
  label,
  value,
  sub,
  meter,
  tone = "green",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  meter?: number;
  tone?: "green" | "gold";
}) {
  return (
    <div className="rounded-2xl bg-white border border-emerald-900/10 shadow-soft-md p-4 flex gap-3.5">
      <span
        className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
          tone === "gold" ? "bg-gold/20 text-gold-700" : "bg-emerald-900 text-gold"
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-emerald-900/65 font-medium">{label}</div>
        <div className="font-serif font-bold text-emerald-900 mt-0.5 text-3xl leading-none" style={{ fontVariantNumeric: "tabular-nums" }}>
          {value}
        </div>
        {meter !== undefined && (
          <div className="mt-2.5 h-1.5 rounded-full overflow-hidden bg-emerald-900/10">
            <div className="h-full rounded-full bg-gold" style={{ width: `${Math.round(meter * 100)}%` }} />
          </div>
        )}
        {sub && <div className="text-[11px] text-emerald-900/55 mt-1.5">{sub}</div>}
      </div>
    </div>
  );
}

/* ───────────────────────────── Dashboard ───────────────────────────── */

export function AdminDashboard({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [data, setData] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [guestFilter, setGuestFilter] = useState<"all" | "opened" | "not">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/admin/stats", { cache: "no-store" });
      if (r.status === 401) return onUnauthorized();
      const d: StatsPayload = await r.json();
      if (!d.success) setError(d.error || "Không tải được dữ liệu");
      else setData(d);
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60_000);
    return () => clearInterval(id);
  }, [load]);

  const s = useMemo(() => {
    if (!data) return null;
    const today = vnToday();
    const events = data.views.map(toEvent);
    const opens = events.filter((e) => !e.isClick && !e.isAlert);

    // Cảnh báo thiết bị lạ: gom theo khách
    const alertMap = new Map<string, { name: string; count: number; last: VnTime | null; detail: string }>();
    events
      .filter((e) => e.isAlert)
      .forEach((e) => {
        const cur = alertMap.get(e.viewer) || { name: e.viewer, count: 0, last: null, detail: "" };
        cur.count++;
        if (e.t && (!cur.last || e.t.ts > cur.last.ts)) {
          cur.last = e.t;
          cur.detail = e.note.split(" · ").slice(2).join(" · ");
        }
        alertMap.set(e.viewer, cur);
      });
    const alerts = [...alertMap.values()].sort((a, b) => (b.last?.ts || 0) - (a.last?.ts || 0));

    // Lượt mở theo ngày (14 ngày gần nhất)
    const startDay = addDays(today, -(CHART_DAYS - 1));
    const perDay = new Map<string, number>();
    opens.forEach((e) => e.t && perDay.set(e.t.day, (perDay.get(e.t.day) || 0) + 1));
    const byDay: ColumnDatum[] = [];
    for (let i = 0; i < CHART_DAYS; i++) {
      const k = addDays(startDay, i);
      byDay.push({ key: k, label: dayLabel(k), value: perDay.get(k) || 0, tip: `Ngày ${dayLabel(k)}/${k.slice(0, 4)}` });
    }

    const uniqueViewers = new Set(opens.map((e) => e.personKey)).size;

    // RSVP: mỗi người lấy phản hồi mới nhất
    const latestRsvp = new Map<string, RawRsvp & { ts: number }>();
    data.rsvps.forEach((r) => {
      const ts = parseVnTime(r.time)?.ts ?? 0;
      const k = normName(r.name);
      if (!k) return;
      const prev = latestRsvp.get(k);
      if (!prev || ts >= prev.ts) latestRsvp.set(k, { ...r, ts });
    });
    const rsvpList = [...latestRsvp.values()];
    const yes = rsvpList.filter((r) => isYes(r.status));
    const yesPeople = yes.reduce((sum, r) => sum + Math.max(1, r.quantity), 0);

    // Tình trạng từng khách
    const openStats = new Map<string, { count: number; last: VnTime | null }>();
    opens.forEach((e) => {
      if (e.isAnon) return;
      const k = normName(e.viewer);
      const cur = openStats.get(k) || { count: 0, last: null };
      cur.count++;
      if (e.t && (!cur.last || e.t.ts > cur.last.ts)) cur.last = e.t;
      openStats.set(k, cur);
    });
    const guestRows = data.guests
      .map((g) => {
        const k = normName(g.name);
        const st = openStats.get(k);
        const rs = latestRsvp.get(k);
        return {
          name: g.name,
          slug: g.slug || "",
          mode: g.mode,
          opens: st?.count || 0,
          last: st?.last || null,
          rsvp: rs ? (isYes(rs.status) ? "yes" : isNo(rs.status) ? "no" : "other") : "",
          rsvpText: rs ? `${rs.status}${rs.quantity > 1 ? ` · ${rs.quantity} người` : ""}` : "",
        };
      })
      .sort((a, b) => b.opens - a.opens || a.name.localeCompare(b.name, "vi"));
    const openedGuests = guestRows.filter((g) => g.opens > 0).length;

    return { opens, alerts, byDay, uniqueViewers, rsvpList, yes, yesPeople, guestRows, openedGuests };
  }, [data]);

  const filteredGuests = useMemo(() => {
    if (!s) return [];
    if (guestFilter === "opened") return s.guestRows.filter((g) => g.opens > 0);
    if (guestFilter === "not") return s.guestRows.filter((g) => g.opens === 0);
    return s.guestRows;
  }, [s, guestFilter]);

  const statusAnchor = useListAnchor<HTMLHeadingElement>();
  const statusPager = usePagination(filteredGuests, guestFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-emerald-900 border-l-4 border-gold pl-3">Tổng quan</h2>
        <button
          onClick={load}
          aria-label="Tải lại số liệu"
          className="inline-flex items-center justify-center gap-1.5 min-h-10 min-w-10 -mr-2 px-2 text-xs text-emerald-900/70 hover:text-gold-700 cursor-pointer whitespace-nowrap"
        >
          <RefreshCw className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Cập nhật </span>
          {data ? new Date(data.fetchedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "Tải"}
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {data?.errors?.map((e) => (
        <p key={e} className="text-xs text-amber-700">⚠ {e}</p>
      ))}

      {!s ? (
        <p className="text-center text-sm text-emerald-900/60 py-10">{loading ? "Đang tải dữ liệu từ Sheet…" : "Chưa có dữ liệu"}</p>
      ) : (
        <>
          {/* Cảnh báo: chỉ hiện khi có */}
          {s.alerts.length > 0 && (
            <section role="alert" className="rounded-2xl border border-amber-300 border-l-4 border-l-amber-500 bg-amber-50 p-4 sm:p-5 shadow-soft-sm">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Link bị mở trên thiết bị lạ ({s.alerts.length} khách)
              </h3>
              <p className="text-xs text-amber-900/70 mt-1">
                Người mở ở thiết bị thứ 3 trở đi chỉ thấy thiệp chung. Nếu đó là chính khách (vd đổi điện thoại), vào tab Danh sách → Mở khoá.
              </p>
              <ul className="mt-3 divide-y divide-amber-200">
                {s.alerts.map((a) => (
                  <li key={a.name} className="py-2 flex items-start justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="text-sm text-emerald-950 font-medium truncate">{a.name}</div>
                      <div className="text-amber-900/60 truncate">{a.detail || "Thiết bị không rõ"}</div>
                    </div>
                    <div className="shrink-0 text-right text-amber-900/80" style={{ fontVariantNumeric: "tabular-nums" }}>
                      <div>{a.count} lần</div>
                      <div className="text-amber-900/50">{a.last?.label}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 3 số liệu chính */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatTile
              icon={<Eye className="w-5 h-5" />}
              label="Lượt mở thiệp"
              value={s.opens.length}
              sub={`${s.uniqueViewers} người xem khác nhau`}
            />
            <StatTile
              icon={<Users className="w-5 h-5" />}
              tone="gold"
              label="Khách đã mở link"
              value={`${s.openedGuests}/${s.guestRows.length}`}
              meter={s.guestRows.length ? s.openedGuests / s.guestRows.length : 0}
              sub={`${s.guestRows.length - s.openedGuests} khách chưa mở`}
            />
            <StatTile
              icon={<UserCheck className="w-5 h-5" />}
              label="Xác nhận tham dự"
              value={s.yesPeople}
              sub={`${s.yes.length}/${s.rsvpList.length} phản hồi đồng ý · tính cả người đi cùng`}
            />
          </div>

          {/* Biểu đồ duy nhất */}
          <section className={panelCls}>
            <div className="mb-3">
              <h3 className={titleCls}>Lượt mở thiệp theo ngày</h3>
              <p className="text-[11px] text-emerald-900/55 mt-1 pl-3.5">{CHART_DAYS} ngày gần nhất · cột vàng là hôm nay</p>
            </div>
            <ColumnChart data={s.byDay} height={200} />
          </section>

          {/* Tình trạng từng khách */}
          <section className={panelCls}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h3 ref={statusAnchor} className={`${titleCls} scroll-mt-20`}>
                Tình trạng từng khách mời
              </h3>
              <div className="grid grid-cols-3 sm:inline-flex rounded-lg bg-[#F1F5EE] p-0.5" role="group" aria-label="Lọc khách">
                {([
                  ["all", `Tất cả (${s.guestRows.length})`],
                  ["opened", `Đã mở (${s.openedGuests})`],
                  ["not", `Chưa mở (${s.guestRows.length - s.openedGuests})`],
                ] as const).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setGuestFilter(k)}
                    aria-pressed={guestFilter === k}
                    className={`min-h-10 sm:min-h-0 px-2.5 py-1 text-xs whitespace-nowrap rounded-md cursor-pointer transition-colors ${
                      guestFilter === k ? "bg-emerald-900 text-white font-semibold shadow-soft-xs" : "text-emerald-900/70 hover:text-emerald-950"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Điện thoại: dạng thẻ */}
            <ul className="sm:hidden divide-y divide-emerald-900/10">
              {statusPager.pageItems.map((g) => (
                <li key={g.slug || g.name} className="py-2.5 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-emerald-950 font-medium truncate">{g.name}</div>
                    <div className="text-xs text-emerald-900/55 truncate">
                      {MODE_SHORT[g.mode] || g.mode} · {g.last ? `Lần cuối ${g.last.label}` : "Chưa mở"}
                    </div>
                    {g.rsvp && (
                      <div className="text-xs mt-0.5 inline-flex items-center gap-1">
                        {g.rsvp === "yes" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                        ) : g.rsvp === "no" ? (
                          <X className="w-3.5 h-3.5 text-red-500" />
                        ) : null}
                        <span className="text-emerald-900/70">RSVP: {g.rsvpText}</span>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div
                      className={`text-lg font-semibold ${g.opens ? "text-emerald-950" : "text-emerald-900/25"}`}
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {g.opens}
                    </div>
                    <div className="text-[10px] text-emerald-900/40">lượt mở</div>
                  </div>
                </li>
              ))}
              {filteredGuests.length === 0 && <li className="py-4 text-center text-sm text-emerald-900/50">Không có khách nào</li>}
            </ul>

            {/* Máy tính: dạng bảng */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-emerald-900/70 bg-[#F1F5EE]">
                    <th className="py-2 pl-3 font-semibold rounded-l-lg">Khách</th>
                    <th className="py-2 font-semibold">Vai xưng</th>
                    <th className="py-2 font-semibold text-right">Lượt mở</th>
                    <th className="py-2 pl-4 font-semibold">Lần cuối</th>
                    <th className="py-2 font-semibold rounded-r-lg">RSVP</th>
                  </tr>
                </thead>
                <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
                  {statusPager.pageItems.map((g) => (
                    <tr key={g.slug || g.name} className="border-b border-emerald-900/5 last:border-0 hover:bg-[#F6F8F3]">
                      <td className="py-2.5 pl-3 pr-2">
                        <div className="text-emerald-950 font-medium">{g.name}</div>
                        <div className="text-[10px] text-emerald-900/40 font-mono">{g.slug}</div>
                      </td>
                      <td className="py-2 pr-2 text-emerald-900/70">{MODE_SHORT[g.mode] || g.mode}</td>
                      <td className="py-2 pr-2 text-right text-emerald-950">{g.opens || <span className="text-emerald-900/30">0</span>}</td>
                      <td className="py-2 pl-4 pr-2 text-emerald-900/70">{g.last?.label || <span className="text-emerald-900/35">Chưa mở</span>}</td>
                      <td className="py-2">
                        {g.rsvp === "yes" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <Check className="w-3.5 h-3.5" /> <span className="text-emerald-900/80">{g.rsvpText}</span>
                          </span>
                        ) : g.rsvp === "no" ? (
                          <span className="inline-flex items-center gap-1 text-red-500">
                            <X className="w-3.5 h-3.5" /> <span className="text-emerald-900/80">{g.rsvpText}</span>
                          </span>
                        ) : g.rsvp ? (
                          <span className="text-emerald-900/70">{g.rsvpText}</span>
                        ) : (
                          <span className="text-emerald-900/30">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredGuests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-emerald-900/50">Không có khách nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination {...statusPager} anchorRef={statusAnchor} />
          </section>
        </>
      )}
    </div>
  );
}
