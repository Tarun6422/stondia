import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Download, Search, Loader2, FileText, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { PageHero, CTASection } from "@/components/page-parts";
import { hero } from "@/assets/media";
import { buildMeta, canonicalLink, jsonLdScript, breadcrumbSchema } from "@/lib/seo";
import { toast } from "sonner";
import { format } from "date-fns";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export const Route = createFileRoute("/_public/catalog")({
  head: () => ({
    meta: buildMeta({
      title: "Digital Stone Catalog — Stone India Heritage",
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
  title: string;
  slug: string;
  description?: string;
  category?: string;
  coverImage?: string;
  pdf: string;
  fileSize?: string;
  downloadCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Most Downloaded", value: "popular" },
  { label: "Alphabetical", value: "alphabetical" },
];

function Catalog() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catalogs, setCatalogs] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch catalogs
  const fetchCatalogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("search", debouncedQuery);
      if (cat !== "All") params.set("category", cat);
      params.set("sort", sort);
      params.set("limit", "50");

      const res = await fetch(`${API_BASE}/api/catalog?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch catalog");
      const data = await res.json();
      setCatalogs(data.data || []);
    } catch (err) {
      console.error("Catalog fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load catalog");
      setCatalogs([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, cat, sort]);

  // Fetch categories
  useEffect(() => {
    fetch(`${API_BASE}/api/catalog/categories`)
      .then((r) => r.json())
      .then((data) => setCategories(data.data || []))
      .catch(() => {});
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  // Handle download
  const handleDownload = async (item: CatalogItem) => {
    if (downloading) return;
    setDownloading(item.id);
    try {
      // Increment counter & log (fire-and-forget with no redirect follow to avoid double fetch)
      fetch(`${API_BASE}/api/catalog/${item.id}/download`, {
        method: "GET",
        redirect: "manual",
      }).catch(() => {});

      // Download the PDF directly
      const response = await fetch(item.pdf);
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

      // Refresh to update download count
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

          {/* Category Filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setCat("All")}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                cat === "All"
                  ? "border-gold bg-gold text-[var(--gold-foreground)]"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  cat === c
                    ? "border-gold bg-gold text-[var(--gold-foreground)]"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Error State */}
          {error && !loading && (
            <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-10 text-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <div>
                <h3 className="font-serif text-lg text-foreground">Failed to load catalog</h3>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" onClick={fetchCatalogs} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}

          {/* Catalog Grid */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-border bg-card">
                  <div className="aspect-[4/3] bg-muted animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                    <div className="h-5 w-40 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                    <div className="h-9 w-full rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))
            ) : !error && catalogs.length === 0 ? (
              <div className="col-span-full mt-12 text-center">
                <p className="text-muted-foreground">No catalogs found matching your criteria.</p>
              </div>
            ) : (
              !error &&
              catalogs.map((item, i) => (
                <Reveal key={item.id} delay={(i % 3) * 0.05}>
                  <div className="hover-lift group overflow-hidden rounded-lg border border-border bg-card flex flex-col">
                    {/* Cover Image */}
                    <div className="aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center">
                      {item.coverImage ? (
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <FileText className="h-16 w-16 text-muted-foreground/40" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex flex-1 flex-col p-6">
                      {item.category && (
                        <p className="text-xs uppercase tracking-[0.15em] text-gold">
                          {item.category}
                        </p>
                      )}
                      <h3 className="mt-1 font-serif text-xl text-foreground line-clamp-2">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <dl className="mt-auto pt-4 space-y-1.5 text-sm">
                        {item.fileSize && (
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">File Size</dt>
                            <dd className="text-foreground">{item.fileSize}</dd>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Downloads</dt>
                          <dd className="text-foreground">{item.downloadCount ?? 0}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Updated</dt>
                          <dd className="text-foreground">
                            {format(new Date(item.updatedAt || item.createdAt), "MMM d, yyyy")}
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-5">
                        <Button
                          variant="gold"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDownload(item)}
                          disabled={downloading === item.id}
                        >
                          {downloading === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          {downloading === item.id ? "Downloading…" : "Download PDF"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
