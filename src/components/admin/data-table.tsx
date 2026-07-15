/* ------------------------------------------------------------------ */
/*  DataTable — reusable admin table with search, pagination, sorting */
/* ------------------------------------------------------------------ */
import { useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-states";
import { cn } from "@/lib/utils";

/* ─── Pagination type ─── */
export type PaginationMeta = { page: number; limit: number; total: number; totalPages: number };

/* ─── Column definition ─── */
export type Column<T> = {
  key: string;
  label: ReactNode;
  sortable?: boolean;
  render: (item: T) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
};

/* ─── Sort state ─── */
export type SortState = { key: string; dir: "asc" | "desc" } | null;

/* ─── Props ─── */
type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  pagination?: PaginationMeta;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onPageChange?: (page: number) => void;
  sortState?: SortState;
  onSortChange?: (sort: SortState) => void;
  filters?: ReactNode;
  actions?: ReactNode;
  onRowClick?: (item: T) => void;
};

/* ─── Animated counter ─── */
export function AnimatedCount({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <span>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Stat Card ─── */
export function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 transition-all duration-300 hover:shadow-elegant hover:border-gold/20"
    >
      {/* Gold accent line */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-gold/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            {label}
          </p>
          <p className="font-serif text-3xl text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trendUp ? "text-emerald-600" : "text-red-500",
              )}
            >
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Stat Card Skeleton ─── */
export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-8 w-20" />
      <Skeleton className="mt-2 h-3 w-16" />
    </div>
  );
}

/* ─── Loading Skeleton for Table ─── */
function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─── DataTable ─── */
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  pagination,
  isLoading,
  isError,
  errorMessage,
  emptyTitle,
  emptyDescription,
  searchPlaceholder = "Search…",
  searchValue,
  onSearchChange,
  onPageChange,
  sortState,
  onSortChange,
  filters,
  actions,
  onRowClick,
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = useState("");

  const handleSearch = useCallback(
    (val: string) => {
      setLocalSearch(val);
      onSearchChange?.(val);
    },
    [onSearchChange],
  );

  const searchVal = searchValue !== undefined ? searchValue : localSearch;

  const handleSort = useCallback(
    (key: string) => {
      if (!onSortChange) return;
      if (sortState?.key === key) {
        onSortChange(sortState.dir === "asc" ? { key, dir: "desc" } : null);
      } else {
        onSortChange({ key, dir: "asc" });
      }
    },
    [onSortChange, sortState],
  );

  /* ── Error State ── */
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h3 className="font-serif text-xl text-foreground">Failed to load data</h3>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            {errorMessage || "Something went wrong. Please try again."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchVal}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 pl-9 text-sm"
            />
          </div>
          {filters}
        </div>
        {actions}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "h-10 px-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground",
                      col.sortable && "cursor-pointer select-none hover:text-foreground",
                      col.hideOnMobile && "hidden md:table-cell",
                      col.className,
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable &&
                        sortState?.key === col.key &&
                        (sortState.dir === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ))}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="p-6">
                    <TableSkeleton rows={5} cols={columns.length} />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState
                      title={emptyTitle || "No data found"}
                      description={emptyDescription || "There are no records to display."}
                    />
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {data.map((item, idx) => (
                    <motion.tr
                      key={keyExtractor(item)}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02, duration: 0.2 }}
                      className={cn(
                        "border-b border-border/40 transition-colors last:border-0",
                        onRowClick ? "cursor-pointer hover:bg-muted/30" : "hover:bg-muted/10",
                      )}
                      onClick={() => onRowClick?.(item)}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            "px-4 py-3.5 text-foreground/90",
                            col.hideOnMobile && "hidden md:table-cell",
                            col.className,
                          )}
                        >
                          {col.render(item)}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 7) }).map((_, i) => {
              let pageNum: number;
              const total = pagination.totalPages;
              const current = pagination.page;
              if (total <= 7) {
                pageNum = i + 1;
              } else if (current <= 4) {
                pageNum = i + 1;
              } else if (current >= total - 3) {
                pageNum = total - 6 + i;
              } else {
                pageNum = current - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={cn(
                    "flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-xs font-medium transition-colors",
                    pageNum === pagination.page
                      ? "bg-gold text-[var(--gold-foreground)]"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
