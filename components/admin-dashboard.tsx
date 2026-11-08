"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, Check, Clock, RefreshCw, Table2, X, MousePointerClick, Eye, Users, UserCheck } from "lucide-react";

/* ───────────────────────────── Types ───────────────────────────── */

type Mode = "friend" | "elder" | "senior" | "junior";
interface RawView { time: string; viewer: string; role: string; note: string }
interface RawRsvp { time: string; name: string; status: string; quantity: number; message: string }
interface RawGuest { slug?: string; name: string; mode: Mode }
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
interface ViewEvent {
  t: VnTime | null;
  viewer: string;
  role: string;
  note: string;
  isClick: boolean;
  isAnon: boolean;
  personKey: string;
  ip?: string;
  os?: string;
  app?: string;
}

type Range = "7" | "30" | "all";

const MODE_SHORT: Record<Mode, string> = { friend: "Bạn bè", elder: "Người lớn", senior: "Anh/Chị", junior: "Đàn em" };

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

function osFamily(s: string): string {
  if (/^iPhone/i.test(s)) return "iPhone";
  if (/^iPad/i.test(s)) return "iPad";
  if (/^Android/i.test(s)) return "Android";
  if (/^Windows/i.test(s)) return "Windows";
  if (/^macOS/i.test(s)) return "macOS";
  return s || "Không rõ";
}

function toEvent(v: RawView): ViewEvent {
  const isClick = v.viewer === "Lượt bấm link" || /^Bấm link \(server\)/.test(v.note);
  const isAnon = /^Khách vãng lai/i.test(v.viewer);
  const vid = (v.viewer + " " + v.note).match(/V-[A-Z0-9]{4,}/)?.[0];
  const ev: ViewEvent = {
    t: parseVnTime(v.time),
    viewer: isAnon ? "Khách vãng lai (link chung)" : v.viewer || "Không rõ",
    role: isAnon ? "Mời chung" : v.role || "Không rõ",
    note: v.note,
    isClick,
    isAnon,
    personKey: isAnon ? `anon:${vid ?? v.note}` : `name:${normName(v.viewer)}`,
  };
  if (isClick) {
    // "Bấm link (server) · IP 1.2.3.4 · iPhone iOS 17.5 · Zalo" | "... · Android 14 · SM-S918B · Chrome"
    const parts = v.note.split(" · ").map((p) => p.trim());
    ev.ip = parts.find((p) => p.startsWith("IP "))?.slice(3);
    const rest = parts.filter((p, i) => i > 0 && !p.startsWith("IP "));
    ev.os = osFamily(rest[0] || "");
    ev.app = rest.length > 1 ? rest[rest.length - 1] : "Không rõ";
  }
  return ev;
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

function countBy<T>(items: T[], key: (t: T) => string | undefined) {
  const m = new Map<string, number>();
  for (const it of items) {
    const k = key(it);
    if (k) m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

/* ───────────────────────────── Chart primitives ───────────────────────────── */

const ACCENT = "rgb(var(--c-gold-500))";
const GRID = "rgb(var(--c-ivory-100) / 0.08)";
const AXIS = "rgb(var(--c-ivory-100) / 0.22)";
const MUTED = "rgb(var(--c-ivory-100) / 0.55)";

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

function ColumnChart({ data, height = 200, unit = "lượt" }: { data: ColumnDatum[]; height?: number; unit?: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const padL = 32, padR = 8, padT = 18, padB = 24;
  const innerW = Math.max(0, width - padL - padR);
  const innerH = height - padT - padB;
  const max = Math.max(0, ...data.map((d) => d.value));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1] || 1;
  const band = data.length ? innerW / data.length : 0;
  const barW = Math.max(2, Math.min(24, band - 2));
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(innerW / 40))));
  const maxIdx = data.reduce((bi, d, i) => (d.value > (data[bi]?.value ?? -1) ? i : bi), 0);

  const y = (v: number) => padT + innerH - (v / top) * innerH;

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label="Biểu đồ cột">
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
                  fill={ACCENT}
                  opacity={hover === null || active ? 1 : 0.45}
                />
                {i % labelEvery === 0 && (
                  <text x={cx} y={height - 8} textAnchor="middle" fontSize={10} fill={MUTED}>
                    {d.label}
                  </text>
                )}
                {i === maxIdx && d.value > 0 && hover === null && (
                  <text x={cx} y={y(d.value) - 5} textAnchor="middle" fontSize={10} fontWeight={600} fill="rgb(var(--c-ivory-100))">
                    {d.value}
                  </text>
                )}
                <rect
                  x={padL + band * i}
                  y={padT}
                  width={band}
                  height={innerH}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={d.tip}
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
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-emerald-950 border border-gold/40 px-2.5 py-1.5 text-[11px] shadow-lg whitespace-nowrap"
          style={{
            left: Math.min(Math.max(padL + band * hover + band / 2, 60), width - 60),
            top: Math.max(y(data[hover].value) - 8, 30),
          }}
        >
          <div className="text-ivory/60">{data[hover].tip}</div>
          <div className="font-semibold text-ivory">
            {data[hover].value} {unit}
          </div>
        </div>
      )}
    </div>
  );
}

function BarList({ items, unit = "lượt", max = 8 }: { items: { label: string; value: number }[]; unit?: string; max?: number }) {
  const [hover, setHover] = useState<string | null>(null);
  const shown = items.slice(0, max);
  const rest = items.slice(max).reduce((s, i) => s + i.value, 0);
  const rows = shown;
  const top = Math.max(1, ...rows.map((r) => r.value));
  const total = items.reduce((s, i) => s + i.value, 0) || 1;

  if (!rows.length) return <p className="text-xs text-ivory/50 py-6 text-center">Chưa có dữ liệu</p>;

  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li
          key={r.label}
          className="grid grid-cols-[minmax(0,7.5rem)_1fr] sm:grid-cols-[minmax(0,10rem)_1fr] items-center gap-3"
          onMouseEnter={() => setHover(r.label)}
          onMouseLeave={() => setHover(null)}
        >
          <span className="text-xs text-ivory/80 truncate" title={r.label}>{r.label}</span>
          <span className="flex items-center gap-2 min-w-0">
            <span
              className="h-3 shrink-0"
              style={{
                width: `calc((100% - 4.5rem) * ${r.value / top})`,
                minWidth: 2,
                background: ACCENT,
                borderRadius: "0 4px 4px 0",
                opacity: hover === null || hover === r.label ? 1 : 0.45,
              }}
            />
            <span className="text-[11px] text-ivory whitespace-nowrap" style={{ fontVariantNumeric: "tabular-nums" }}>
              {r.value}
              {hover === r.label && <span className="text-ivory/50"> · {Math.round((r.value / total) * 100)}%</span>}
            </span>
          </span>
        </li>
      ))}
      {rest > 0 && (
        <li className="text-[11px] text-ivory/50 pt-0.5">
          + {items.length - max} mục khác · {rest} {unit}
        </li>
      )}
    </ul>
  );
}

function ChartCard({
  title,
  subtitle,
  table,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  table: { head: [string, string]; rows: [string, string | number][] };
  children: React.ReactNode;
  className?: string;
}) {
  const [asTable, setAsTable] = useState(false);
  return (
    <section className={`rounded-2xl bg-emerald-deep border border-gold/30 p-4 sm:p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-ivory">{title}</h3>
          {subtitle && <p className="text-[11px] text-ivory/50 mt-0.5">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={() => setAsTable((v) => !v)}
          className="shrink-0 inline-flex items-center gap-1 text-[11px] text-ivory/60 hover:text-gold cursor-pointer"
          aria-pressed={asTable}
        >
          {asTable ? <BarChart3 className="w-3.5 h-3.5" /> : <Table2 className="w-3.5 h-3.5" />}
          {asTable ? "Biểu đồ" : "Bảng"}
        </button>
      </div>
      {asTable ? (
        <div className="max-h-64 overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-ivory/50 text-left">
                <th className="py-1 font-medium">{table.head[0]}</th>
                <th className="py-1 font-medium text-right">{table.head[1]}</th>
              </tr>
            </thead>
            <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
              {table.rows.map(([a, b], i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="py-1 text-ivory/80">{a}</td>
                  <td className="py-1 text-right text-ivory">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

function StatTile({
  icon,
  label,
  value,
  sub,
  hero = false,
  meter,
  wide = false,
}: {
  wide?: boolean;
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  hero?: boolean;
  meter?: number;
}) {
  return (
    <div className={`rounded-2xl bg-emerald-deep border border-gold/30 p-4 ${hero ? "col-span-2 lg:col-span-1" : ""} ${wide ? "col-span-2 lg:col-span-1" : ""}`}>
      <div className="flex items-center gap-1.5 text-[11px] text-ivory/60">
        {icon}
        {label}
      </div>
      <div className={`font-semibold text-ivory mt-1 ${hero ? "text-5xl" : "text-3xl"}`}>{value}</div>
      {meter !== undefined && (
        <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: "rgb(var(--c-gold-500) / 0.2)" }}>
          <div className="h-full rounded-full" style={{ width: `${Math.round(meter * 100)}%`, background: ACCENT }} />
        </div>
      )}
      {sub && <div className="text-[11px] text-ivory/50 mt-1.5">{sub}</div>}
    </div>
  );
}

/* ───────────────────────────── Dashboard ───────────────────────────── */

export function AdminDashboard({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [data, setData] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [range, setRange] = useState<Range>("all");
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
    const all = data.views.map(toEvent);

    let startDay: string;
    if (range === "all") {
      const days = all.map((e) => e.t?.day).filter(Boolean).sort() as string[];
      startDay = days[0] || today;
    } else {
      startDay = addDays(today, -(parseInt(range, 10) - 1));
    }
    const inRange = (e: { t: VnTime | null }) => (range === "all" ? true : !!e.t && e.t.day >= startDay);

    const events = all.filter(inRange);
    const opens = events.filter((e) => !e.isClick);
    const clicks = events.filter((e) => e.isClick);

    // Theo ngày
    const perDay = new Map<string, number>();
    opens.forEach((e) => e.t && perDay.set(e.t.day, (perDay.get(e.t.day) || 0) + 1));
    const dayKeys: string[] = [];
    for (let d = startDay; d <= today && dayKeys.length < 400; d = addDays(d, 1)) dayKeys.push(d);
    const byDay: ColumnDatum[] = dayKeys.map((k) => ({
      key: k,
      label: dayLabel(k),
      value: perDay.get(k) || 0,
      tip: `Ngày ${dayLabel(k)}/${k.slice(0, 4)}`,
    }));

    // Theo giờ
    const perHour = new Array(24).fill(0);
    opens.forEach((e) => e.t && perHour[e.t.hour]++);
    const byHour: ColumnDatum[] = perHour.map((v, h) => ({
      key: String(h),
      label: `${h}h`,
      value: v,
      tip: `${pad(h)}:00 – ${pad(h)}:59`,
    }));

    const byRole = countBy(opens, (e) => e.role);
    const byViewer = countBy(opens, (e) => e.viewer);
    const byOs = countBy(clicks, (e) => e.os);
    const byApp = countBy(clicks, (e) => e.app);
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

    const recent = [...events]
      .filter((e) => e.t)
      .sort((a, b) => (b.t!.ts || 0) - (a.t!.ts || 0))
      .slice(0, 15);

    return {
      opens, clicks, byDay, byHour, byRole, byViewer, byOs, byApp, uniqueViewers,
      rsvpList, yes, yesPeople, guestRows, openedGuests, recent,
    };
  }, [data, range]);

  const filteredGuests = useMemo(() => {
    if (!s) return [];
    if (guestFilter === "opened") return s.guestRows.filter((g) => g.opens > 0);
    if (guestFilter === "not") return s.guestRows.filter((g) => g.opens === 0);
    return s.guestRows;
  }, [s, guestFilter]);

  const RANGE_LABEL: Record<Range, string> = { "7": "7 ngày", "30": "30 ngày", all: "Tất cả" };

  return (
    <div className="space-y-4">
      {/* Bộ lọc — một hàng phía trên biểu đồ */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-xl border border-gold/30 p-0.5 bg-emerald-deep" role="group" aria-label="Khoảng thời gian">
          {(["7", "30", "all"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-colors ${
                range === r ? "bg-gold text-emerald-deep font-semibold" : "text-ivory/70 hover:text-gold"
              }`}
            >
              {RANGE_LABEL[r]}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 text-xs text-ivory/70 hover:text-gold cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {data ? `Cập nhật ${new Date(data.fetchedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}` : "Tải"}
        </button>
      </div>

      {error && <p className="text-xs text-red-300">{error}</p>}
      {data?.errors?.map((e) => (
        <p key={e} className="text-xs text-amber-200">⚠ {e}</p>
      ))}

      {!s ? (
        <p className="text-center text-sm text-ivory/60 py-10">{loading ? "Đang tải dữ liệu từ Sheet…" : "Chưa có dữ liệu"}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile hero icon={<Eye className="w-3.5 h-3.5" />} label="Lượt mở thiệp" value={s.opens.length} sub={`${s.uniqueViewers} người xem khác nhau`} />
            <StatTile
              icon={<Users className="w-3.5 h-3.5" />}
              label="Khách mời đã mở"
              value={`${s.openedGuests}/${s.guestRows.length}`}
              meter={s.guestRows.length ? s.openedGuests / s.guestRows.length : 0}
              sub={`${s.guestRows.length - s.openedGuests} khách chưa mở`}
            />
            <StatTile
              icon={<UserCheck className="w-3.5 h-3.5" />}
              label="Xác nhận tham dự"
              value={s.yesPeople}
              sub={`${s.yes.length}/${s.rsvpList.length} phản hồi đồng ý · tính cả người đi cùng`}
            />
            <StatTile
              wide
              icon={<MousePointerClick className="w-3.5 h-3.5" />}
              label="Lượt bấm link"
              value={s.clicks.length}
              sub="Ghi từ server, đã lọc bot xem trước"
            />
          </div>

          <ChartCard
            title="Lượt mở thiệp theo ngày"
            subtitle={RANGE_LABEL[range]}
            table={{ head: ["Ngày", "Lượt mở"], rows: s.byDay.map((d) => [d.tip.replace("Ngày ", ""), d.value]) }}
          >
            <ColumnChart data={s.byDay} height={220} />
          </ChartCard>

          <div className="grid lg:grid-cols-2 gap-4">
            <ChartCard
              title="Khung giờ khách mở thiệp"
              subtitle="Giờ Việt Nam"
              table={{ head: ["Giờ", "Lượt mở"], rows: s.byHour.map((d) => [d.tip, d.value]) }}
            >
              <ColumnChart data={s.byHour} height={180} />
            </ChartCard>

            <ChartCard
              title="Theo vai xưng"
              table={{ head: ["Vai xưng", "Lượt mở"], rows: s.byRole.map((r) => [r.label, r.value]) }}
            >
              <BarList items={s.byRole} />
            </ChartCard>

            <ChartCard
              title="Xem nhiều nhất"
              subtitle="Số lượt mở thiệp theo người"
              table={{ head: ["Người xem", "Lượt mở"], rows: s.byViewer.map((r) => [r.label, r.value]) }}
            >
              <BarList items={s.byViewer} max={8} />
            </ChartCard>

            <ChartCard
              title="Thiết bị & ứng dụng"
              subtitle="Từ lượt bấm link (server)"
              table={{
                head: ["Thiết bị / ứng dụng", "Lượt bấm"],
                rows: [...s.byOs.map((r) => [r.label, r.value] as [string, number]), ...s.byApp.map((r) => [`App: ${r.label}`, r.value] as [string, number])],
              }}
            >
              {s.clicks.length === 0 ? (
                <p className="text-xs text-ivory/50 py-6 text-center">Chưa có lượt bấm link nào được ghi từ server</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <p className="text-[11px] text-ivory/50 mb-2">Thiết bị</p>
                    <BarList items={s.byOs} max={5} />
                  </div>
                  <div>
                    <p className="text-[11px] text-ivory/50 mb-2">Mở từ</p>
                    <BarList items={s.byApp} max={5} />
                  </div>
                </div>
              )}
            </ChartCard>
          </div>

          {/* Tình trạng từng khách */}
          <section className="rounded-2xl bg-emerald-deep border border-gold/30 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-semibold text-ivory">Tình trạng từng khách mời</h3>
              <div className="inline-flex rounded-lg border border-gold/30 p-0.5" role="group" aria-label="Lọc khách">
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
                    className={`px-2.5 py-1 text-[11px] rounded-md cursor-pointer ${
                      guestFilter === k ? "bg-gold text-emerald-deep font-semibold" : "text-ivory/70 hover:text-gold"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-xs min-w-[520px]">
                <thead>
                  <tr className="text-left text-ivory/50">
                    <th className="py-1.5 font-medium">Khách</th>
                    <th className="py-1.5 font-medium">Vai xưng</th>
                    <th className="py-1.5 font-medium text-right">Lượt mở</th>
                    <th className="py-1.5 pl-4 font-medium">Lần cuối</th>
                    <th className="py-1.5 font-medium">RSVP</th>
                  </tr>
                </thead>
                <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
                  {filteredGuests.map((g) => (
                    <tr key={g.slug || g.name} className="border-t border-white/5">
                      <td className="py-2 pr-2">
                        <div className="text-ivory font-medium">{g.name}</div>
                        <div className="text-[10px] text-ivory/40 font-mono">{g.slug}</div>
                      </td>
                      <td className="py-2 pr-2 text-ivory/70">{MODE_SHORT[g.mode] || g.mode}</td>
                      <td className="py-2 pr-2 text-right text-ivory">{g.opens || <span className="text-ivory/40">0</span>}</td>
                      <td className="py-2 pl-4 pr-2 text-ivory/70">{g.last?.label || <span className="text-ivory/40">Chưa mở</span>}</td>
                      <td className="py-2">
                        {g.rsvp === "yes" ? (
                          <span className="inline-flex items-center gap-1 text-[#4fd14f]">
                            <Check className="w-3.5 h-3.5" /> <span className="text-ivory/80">{g.rsvpText}</span>
                          </span>
                        ) : g.rsvp === "no" ? (
                          <span className="inline-flex items-center gap-1 text-[#e66767]">
                            <X className="w-3.5 h-3.5" /> <span className="text-ivory/80">{g.rsvpText}</span>
                          </span>
                        ) : g.rsvp ? (
                          <span className="text-ivory/70">{g.rsvpText}</span>
                        ) : (
                          <span className="text-ivory/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredGuests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-ivory/50">Không có khách nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Hoạt động gần đây */}
          <section className="rounded-2xl bg-emerald-deep border border-gold/30 p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-ivory mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gold" /> Hoạt động gần đây
            </h3>
            <ul className="divide-y divide-white/5">
              {s.recent.map((e, i) => (
                <li key={i} className="py-2 flex gap-3 text-xs">
                  <span className="shrink-0 w-[5.5rem] text-ivory/50" style={{ fontVariantNumeric: "tabular-nums" }}>{e.t?.label}</span>
                  <span className="min-w-0">
                    <span className="text-ivory font-medium">{e.isClick ? "Bấm link" : e.viewer}</span>
                    <span className="text-ivory/50">
                      {" · "}
                      {e.isClick ? [e.os, e.app, e.ip && `IP ${e.ip}`].filter(Boolean).join(" · ") : e.role}
                    </span>
                  </span>
                </li>
              ))}
              {s.recent.length === 0 && <li className="py-4 text-center text-xs text-ivory/50">Chưa có hoạt động</li>}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
