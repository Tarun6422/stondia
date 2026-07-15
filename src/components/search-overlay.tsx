import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  Search,
  X,
  ArrowUpRight,
  Loader2,
  Clock,
  TrendingUp,
  AlertCircle,
  Package,
  Building2,
  Newspaper,
  Video,
  Download,
  FolderTree,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */

type SearchResultItem = {
  type: "product" | "project" | "blog" | "video" | "download" | "category";
  id: string;
  title: string;
  slug: string;
  image: string | null;
  subtitle: string | null;
  rank: number;
};

type SearchResponse = {
  results: SearchResultItem[];
  total: number;
  query: string;
};

type PageSuggestion = {
  label: string;
  to: string;
  description?: string;
  params?: Record<string, string>;
};

/* ── Static pages for quick suggestions ── */

const STATIC_PAGES: PageSuggestion[] = [
  { label: "All Products", to: "/products", description: "Browse our full catalog" },
  { label: "Digital Catalog", to: "/catalog", description: "Interactive product catalog" },
  { label: "Featured Projects", to: "/projects", description: "Completed installations" },
  { label: "Gallery", to: "/gallery", description: "Photo and video gallery" },
  { label: "Blog", to: "/blog", description: "Industry insights" },
  { label: "Videos", to: "/videos", description: "Product and process videos" },
  { label: "Download Center", to: "/downloads", description: "Brochures and specs" },
  { label: "Request a Quote", to: "/quote", description: "Get a project quotation" },
  { label: "Contact", to: "/contact", description: "Get in touch with our team" },
  { label: "About", to: "/about", description: "Our story and heritage" },
];

const GROUP_ICONS: Record<string, React.ReactNode> = {
  product: <Package className="h-3.5 w-3.5" />,
  project: <Building2 className="h-3.5 w-3.5" />,
  blog: <Newspaper className="h-3.5 w-3.5" />,
  video: <Video className="h-3.5 w-3.5" />,
  download: <Download className="h-3.5 w-3.5" />,
  category: <FolderTree className="h-3.5 w-3.5" />,
};

const GROUP_LABELS: Record<string, string> = {
  product: "Products",
  project: "Projects",
  blog: "Blogs",
  video: "Videos",
  download: "Downloads",
  category: "Categories",
};

const ROUTE_MAP: Record<string, { to: string; param: string }> = {
  product: { to: "/product/$slug", param: "slug" },
  project: { to: "/projects/$slug", param: "slug" },
  blog: { to: "/blog/$slug", param: "slug" },
  video: { to: "/videos", param: "" },
  download: { to: "/downloads", param: "" },
  category: { to: "/categories", param: "" },
};

/* ── Recent searches (localStorage) ── */

const RECENT_KEY = "stoneindia_recent_searches";
const MAX_RECENT = 10;

function getRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addRecent(query: string) {
  try {
    const recent = getRecent().filter((r) => r !== query);
    recent.unshift(query);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    /* ignore */
  }
}

function clearRecent() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    /* ignore */
  }
}

/* ── Highlight matched text ── */

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  // Escape special regex characters in query
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-gold/20 text-foreground rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/* ── Props ── */

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecent);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Reset & cleanup on open/close
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setTotal(0);
      setLoading(false);
      setError(false);
      setFocusedIndex(-1);
      return;
    }
    setRecentSearches(getRecent());
    inputRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(debounceRef.current);
    };
  }, [open, onClose]);

  // Debounced API search
  const handleInput = useCallback((value: string) => {
    setQuery(value);
    setFocusedIndex(-1);
    clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      setTotal(0);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    debounceRef.current = setTimeout(async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL ?? "";
        const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(value.trim())}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Search failed");

        const data: SearchResponse = await res.json();
        setResults(data.results || []);
        setTotal(data.total || 0);
        setError(false);
      } catch {
        setResults([]);
        setTotal(0);
        setError(true);
      } finally {
        setLoading(false);
      }
    }, 250);
  }, []);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResultItem[]> = {};
    for (const r of results) {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    }
    return groups;
  }, [results]);

  const groupEntries = useMemo(() => {
    return Object.entries(groupedResults).sort(([, a], [, b]) => b[0].rank - a[0].rank);
  }, [groupedResults]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = query.trim()
        ? results.length
        : recentSearches.length + (recentSearches.length > 0 ? 1 : 0);
      if (items === 0) return;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setFocusedIndex((prev) => (prev < items - 1 ? prev + 1 : 0));
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : items - 1));
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (focusedIndex >= 0) {
            // Trigger click on focused element
            const el = itemRefs.current[focusedIndex];
            el?.click();
          } else if (query.trim()) {
            // Submit search (navigate to first result)
            const first = results[0];
            if (first) {
              const route = ROUTE_MAP[first.type];
              if (route) {
                addRecent(query);
                // Navigate via browser — the Link click will handle it
                const el = itemRefs.current[0];
                el?.click();
              }
            }
          }
          break;
        }
      }
    },
    [query, results, focusedIndex, recentSearches],
  );

  // Handle result click -> save to recent
  const handleResultClick = useCallback(
    (searchQuery: string) => {
      if (searchQuery.trim()) addRecent(searchQuery);
      onClose();
    },
    [onClose],
  );

  // Handle recent search click
  const handleRecentClick = useCallback(
    (term: string) => {
      setQuery(term);
      setFocusedIndex(-1);
      handleInput(term);
    },
    [handleInput],
  );

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0) {
      const el = itemRefs.current[focusedIndex];
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [focusedIndex]);

  // Reset refs array length
  itemRefs.current = [];

  const setItemRef = useCallback(
    (index: number) => (el: HTMLAnchorElement | null) => {
      itemRefs.current[index] = el;
    },
    [],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex justify-center bg-black/60 px-4 pt-24 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="flex h-fit w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-popover shadow-elegant"
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
          >
            {/* ── Input ── */}
            <div className="flex items-center gap-3 border-b border-border px-5">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gold" />
              ) : (
                <Search className="h-4 w-4 text-muted-foreground" />
              )}
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => handleInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search products, projects, pages…"
                className="h-14 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Search query"
                autoComplete="off"
              />
              <button
                onClick={onClose}
                aria-label="Close search"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── Results ── */}
            <div className="max-h-[55vh] overflow-y-auto" onKeyDown={handleKeyDown}>
              {!query.trim() ? (
                /* ── Idle state: Popular + Recent ── */
                <div className="p-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <Clock className="h-3 w-3" /> Recent
                        </p>
                        <button
                          onClick={() => {
                            clearRecent();
                            setRecentSearches([]);
                          }}
                          className="text-[0.6rem] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((term, i) => (
                          <button
                            key={term}
                            onClick={() => handleRecentClick(term)}
                            className="rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular / Explore */}
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      <TrendingUp className="h-3 w-3" /> Explore
                    </p>
                    <div className="grid gap-0.5">
                      {STATIC_PAGES.map((page, i) => (
                        <Link
                          key={page.to}
                          to={page.to}
                          onClick={onClose}
                          className="group flex items-center justify-between rounded-md px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-muted"
                        >
                          <span>{page.label}</span>
                          <span className="text-xs text-muted-foreground">{page.description}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : error ? (
                /* ── Error state ── */
                <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
                  <AlertCircle className="h-8 w-8 text-destructive/60" />
                  <p className="text-sm text-muted-foreground">Search failed. Please try again.</p>
                </div>
              ) : loading && results.length === 0 ? (
                /* ── Loading skeleton ── */
                <div className="space-y-2 p-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-md px-3 py-3">
                      <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
                        <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted/60" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : results.length === 0 ? (
                /* ── Empty state ── */
                <div className="px-4 py-12 text-center">
                  <Search className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No results for "<span className="text-foreground font-medium">{query}</span>"
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    Try a different search term or browse our categories.
                  </p>
                </div>
              ) : (
                /* ── Results ── */
                <div className="p-2">
                  {/* Results count */}
                  <p className="px-3 pb-1 text-[0.6rem] uppercase tracking-wider text-muted-foreground/60">
                    {total} result{total !== 1 ? "s" : ""} for "{query}"
                  </p>

                  {/* Grouped results */}
                  {groupEntries.map(([type, items]) => (
                    <div key={type}>
                      <p className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>{GROUP_ICONS[type] || "•"}</span>
                        {GROUP_LABELS[type] || type}
                      </p>
                      {items.map((item, idx) => {
                        const route = ROUTE_MAP[type];
                        const globalIdx = results.indexOf(item);
                        return (
                          <Link
                            key={item.id}
                            ref={setItemRef(globalIdx)}
                            to={route?.to || "/"}
                            params={
                              route?.param ? ({ [route.param]: item.slug } as never) : undefined
                            }
                            onClick={() => handleResultClick(query)}
                            className={cn(
                              "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                              focusedIndex === globalIdx ? "bg-muted" : "hover:bg-muted/60",
                            )}
                          >
                            {/* Thumbnail */}
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="h-9 w-9 shrink-0 rounded-md object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-gold/70">
                                {GROUP_ICONS[type] || "•"}
                              </div>
                            )}

                            {/* Text */}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-foreground">
                                <HighlightText text={item.title} query={query} />
                              </p>
                              {item.subtitle && (
                                <p className="truncate text-xs text-muted-foreground">
                                  <HighlightText text={item.subtitle} query={query} />
                                </p>
                              )}
                            </div>

                            {/* Type badge + arrow */}
                            <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="hidden sm:inline">{GROUP_LABELS[type]}</span>
                              <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  ))}

                  {/* Static pages that match query (fuzzy) */}
                  {query.trim() && (
                    <>
                      {STATIC_PAGES.filter((p) =>
                        p.label.toLowerCase().includes(query.toLowerCase()),
                      ).length > 0 && (
                        <div className="mt-2 border-t border-border/40 pt-2">
                          <p className="px-3 py-1 text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                            Pages
                          </p>
                          {STATIC_PAGES.filter((p) =>
                            p.label.toLowerCase().includes(query.toLowerCase()),
                          ).map((page) => (
                            <Link
                              key={page.to}
                              to={page.to}
                              onClick={onClose}
                              className="group flex items-center justify-between rounded-md px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-muted"
                            >
                              <HighlightText text={page.label} query={query} />
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                Page
                                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Keyboard hint */}
              {query.trim() && results.length > 0 && (
                <div className="border-t border-border/40 px-4 py-2 text-[0.55rem] text-muted-foreground/50 flex items-center justify-center gap-4">
                  <span>↑↓ Navigate</span>
                  <span>↵ Open</span>
                  <span>Esc Close</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
