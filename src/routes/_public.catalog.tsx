import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Search,
  Loader2,
  FileText,
  AlertCircle,
  RefreshCw,
  Grid3X3,
  List,
  BookOpen,
  Package,
  FolderTree,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion";
import { PageHero, CTASection } from "@/components/page-parts";
import { hero } from "@/assets/media";
import { buildMeta, canonicalLink, jsonLdScript, breadcrumbSchema } from "@/lib/seo";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export const Route = createFileRoute("/_public/catalog")({
  head: () => ({
    meta: buildMeta({
      title: "Digital Stone Catalog — STONDIA",
      description:
        "Browse our premium digital catalog of raw and finished Rajasthan sandstone with technical specifications, finishes, dimensions, and downloadable sheets for architects and importers.",
      path: "/catalog",
    }),
    links: [canonicalLink("/catalog")],
    scripts: [
      jsonLdScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Digital Catalog", item: "/catalog" },
        ]),
      ),
    ],
  }),
  component: Catalog,
});

/* ── Types ── */
type CatalogItem = {
  id: string;
  type: string;
  title: string;
  slug: string;
  description?: string;
  pdfUrl?: string;
  coverImage?: string;
  fileSize?: string;
  downloadCount: number;
  featured: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Most Downloaded", value: "popular" },
  { label: "Alphabetical", value: "alphabetical" },
];

const TYPE_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "Company", value: "master" },
  { label: "Category", value: "category" },
  { label: "Product", value: "product" },
];

type ViewMode = "grid" | "list";

/* ── Type Badge ── */
function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; color: string }> = {
    master: { label: "Company", color: "bg-purple-500/15 text-purple-600" },
    category: { label: "Category", color: "bg-blue-500/15 text-blue-600" },
    product: { label: "Product", color: "bg-gold/20 text-gold" },
  };
  const c = config[type] || { label: type, color: "bg-muted text-muted-foreground" };
  return <Badge className={`${c.color} border-0`}>{c.label}</Badge>;
}

/* ── Format file size ── */
function formatFileSize(bytes?: string | number): string {
  if (!bytes) return "";
  const num = typeof bytes === "string" ? parseFloat(bytes) : bytes;
  if (isNaN(num)) return String(bytes);
  if (num < 1024) return `${num} B`;
  return `${(num / 1024).toFixed(1)} KB`;
}

function Catalog() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catalogs, setCatalogs] = useState<CatalogItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [downloading, setDownloading] = useState<string | null>(null);
  const limit = 12;

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, typeFilter, sort]);

  // Fetch catalogs
  const fetchCatalogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (debouncedQuery) params.set("search", debouncedQuery);
      if (typeFilter) params.set("type", typeFilter);

      // Map sort to what the API expects
      const sortMap: Record<string, string> = {
        newest: "newest",
        oldest: "oldest",
        popular: "popular",
        alphabetical: "alphabetical",
      };
      params.set("sort", sortMap[sort] || "newest");

      // Use the public catalog-generator API
      const res = await fetch(
        `${API_BASE}/api/catalog-generator/public?${params.toString()}`,
      );
      if (!res.ok) throw new Error("Failed to fetch catalog");
      const data = await res.json();
      setCatalogs(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      console.error("Catalog fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load catalog");
      setCatalogs([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, typeFilter, sort, page]);

  // Refetch when filters change
  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  // Handle download
  const handleDownload = async (item: CatalogItem) => {
    if (downloading || !item.pdfUrl) return;
    setDownloading(item.id);
    try {
      // Increment counter (fire-and-forget)
      fetch(`${API_BASE}/api/catalog-generator/public/${item.slug}/download`, {
        method: "GET",
        redirect: "manual",
      }).catch(() => {});

      // Download the PDF directly
      const response = await fetch(item.pdfUrl);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.slug || item.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Download started", {
        description: `"${item.title}" is downloading.`,
      });

      fetchCatalogs();
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Download failed", {
        description: "Could not download the file. Please try again.",
      });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Digital Stone Catalog"
        title="Every stone, at your fingertips"
        intro="A premium digital catalog of raw and finished stones — complete with dimensions, finishes, technical specs and instant downloads."
        image={hero}
      />

      <section className="py-16">
        <div className="container-lux">
          {/* Search & Controls */}
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-md border border-border bg-background px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search catalogs…"
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="flex items-center gap-1 rounded-md border border-border p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "rounded p-1 transition-colors",
                    viewMode === "grid"
                      ? "bg-gold/10 text-gold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "rounded p-1 transition-colors",
                    viewMode === "list"
                      ? "bg-gold/10 text-gold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-11 rounded-md border border-border bg-background px-3 text-sm outline-none text-muted-foreground"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type Filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors",
                  typeFilter === opt.value
                    ? "border-gold bg-gold text-[var(--gold-foreground)]"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.value === "master" && <BookOpen className="h-3.5 w-3.5" />}
                {opt.value === "category" && <FolderTree className="h-3.5 w-3.5" />}
                {opt.value === "product" && <Package className="h-3.5 w-3.5" />}
                {opt.label}
              </button>
            ))}
          </div>

          {/* Results count */}
          {!loading && !error && (
            <p className="mt-4 text-xs text-muted-foreground">
              {total} catalog{total !== 1 ? "s" : ""} found
            </p>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-10 text-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <div>
                <h3 className="font-serif text-lg text-foreground">
                  Failed to load catalog
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
              <Button
                variant="outline"
                onClick={fetchCatalogs}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}

          {/* Loading / Empty / Content */}
          {loading ? (
            <div
              className={cn(
                "mt-10 grid gap-6",
                viewMode === "grid"
                  ? "sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1",
              )}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "overflow-hidden rounded-lg border border-border bg-card",
                    viewMode === "list" && "flex gap-4 p-4",
                  )}
                >
                  <div
                    className={cn(
                      "bg-muted animate-pulse",
                      viewMode === "grid"
                        ? "aspect-[4/3]"
                        : "h-24 w-24 shrink-0 rounded-md",
                    )}
                  />
                  <div
                    className={cn(
                      viewMode === "grid" ? "p-6 space-y-3" : "flex-1 space-y-2",
                    )}
                  >
                    <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                    <div className="h-5 w-40 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                    <div className="h-9 w-full rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : !error && catalogs.length === 0 ? (
            <div className="col-span-full mt-20 flex flex-col items-center gap-4 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg font-medium text-foreground">
                No catalogs found
              </p>
              <p className="text-sm text-muted-foreground">
                No catalogs match your current filters. Try adjusting your search
                criteria.
              </p>
            </div>
          ) : (
            !error && (
              <>
                {/* Grid / List Content */}
                <div
                  className={cn(
                    "mt-8 gap-6",
                    viewMode === "grid"
                      ? "grid sm:grid-cols-2 lg:grid-cols-3"
                      : "space-y-4",
                  )}
                >
                  {catalogs.map((item, i) => (
                    <Reveal key={item.id} delay={(i % 6) * 0.03}>
                      <div
                        className={cn(
                          "group overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:shadow-md",
                          viewMode === "list" ? "flex gap-4 p-4" : "flex flex-col",
                        )}
                      >
                        {/* Cover Image */}
                        <div
                          className={cn(
                            "overflow-hidden bg-muted",
                            viewMode === "grid"
                              ? "aspect-[4/3]"
                              : "h-28 w-28 shrink-0 rounded-md",
                          )}
                        >
                          {item.coverImage ? (
                            <img
                              src={item.coverImage}
                              alt={item.title}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <FileText className="h-10 w-10 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div
                          className={cn(
                            "flex flex-col",
                            viewMode === "grid"
                              ? "p-6"
                              : "flex-1 min-w-0 justify-center",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <TypeBadge type={item.type} />
                            {item.featured && (
                              <Badge className="bg-gold/20 text-gold border-0 text-[0.55rem] px-1.5 py-0">
                                Featured
                              </Badge>
                            )}
                          </div>

                          <h3
                            className={cn(
                              "mt-1.5 font-serif text-foreground line-clamp-1",
                              viewMode === "grid" ? "text-xl" : "text-base",
                            )}
                          >
                            {item.title}
                          </h3>

                          {item.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          <div
                            className={cn(
                              "mt-auto flex items-center gap-3 text-xs text-muted-foreground",
                              viewMode === "grid" ? "pt-4" : "pt-2",
                            )}
                          >
                            {item.fileSize && (
                              <span>{item.fileSize}</span>
                            )}
                            <span>{item.downloadCount ?? 0} downloads</span>
                            <span>
                              {format(
                                new Date(item.updatedAt || item.createdAt),
                                "MMM d, yyyy",
                              )}
                            </span>
                          </div>

                          <div className={cn("mt-3 flex items-center gap-2", viewMode === "list" && "mt-2")}>
                            {item.pdfUrl && (
                              <>
                                <Button
                                  variant="gold"
                                  size="sm"
                                  onClick={() => handleDownload(item)}
                                  disabled={downloading === item.id}
                                  className={viewMode === "list" ? "h-8 text-xs" : ""}
                                >
                                  {downloading === item.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Download className="h-3.5 w-3.5" />
                                  )}
                                  {downloading === item.id
                                    ? "Downloading…"
                                    : "Download"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    window.open(item.pdfUrl, "_blank")
                                  }
                                  className={viewMode === "list" ? "h-8 text-xs" : ""}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  {viewMode === "grid" ? "" : "View"}
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">
                      Page {page} of {totalPages} ({total} catalogs)
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }).map(
                        (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={cn(
                                "flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-xs font-medium transition-colors",
                                pageNum === page
                                  ? "bg-gold text-[var(--gold-foreground)]"
                                  : "text-muted-foreground hover:bg-muted",
                              )}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}
                      <button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page >= totalPages}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
}
