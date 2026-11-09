"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const PAGE_SIZE = 10;

/**
 * Phân trang phía trình duyệt.
 * - Tự về trang 1 khi `resetKey` đổi (đổi bộ lọc / từ khoá tìm kiếm).
 * - Tự kéo về trang cuối hợp lệ nếu danh sách ngắn lại (vd sau khi tải lại).
 */
export function usePagination<T>(items: T[], resetKey: unknown = null, pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const current = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => items.slice((current - 1) * pageSize, current * pageSize),
    [items, current, pageSize]
  );

  return {
    page: current,
    totalPages,
    total: items.length,
    from: items.length ? (current - 1) * pageSize + 1 : 0,
    to: Math.min(current * pageSize, items.length),
    pageItems,
    setPage,
  };
}

/** Thanh chuyển trang; ẩn khi chỉ có 1 trang. `anchorRef`: kéo lên đầu danh sách khi đổi trang. */
export function Pagination({
  page,
  totalPages,
  total,
  from,
  to,
  setPage,
  anchorRef,
}: {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  setPage: (p: number) => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}) {
  if (totalPages <= 1) return null;

  const go = (p: number) => {
    setPage(p);
    const el = anchorRef?.current;
    if (el && el.getBoundingClientRect().top < 64) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const btn =
    "inline-flex items-center justify-center gap-1 min-h-10 min-w-10 px-2.5 rounded-lg border border-emerald-900/15 bg-white text-sm sm:text-xs text-emerald-900/80 hover:border-gold hover:text-gold-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors";

  return (
    <nav className="flex items-center justify-between gap-2 pt-3 mt-1 border-t border-emerald-900/10" aria-label="Phân trang">
      <button type="button" className={btn} onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Trang trước">
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Trước</span>
      </button>

      <div className="text-center leading-tight">
        <div className="text-sm sm:text-xs text-emerald-950" style={{ fontVariantNumeric: "tabular-nums" }}>
          Trang {page}/{totalPages}
        </div>
        <div className="text-[11px] text-emerald-900/50" style={{ fontVariantNumeric: "tabular-nums" }}>
          {from}–{to} / {total}
        </div>
      </div>

      <button type="button" className={btn} onClick={() => go(page + 1)} disabled={page >= totalPages} aria-label="Trang sau">
        <span className="hidden sm:inline">Sau</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

/** Ref tiện dụng cho anchor của danh sách */
export function useListAnchor<T extends HTMLElement>() {
  return useRef<T>(null);
}
