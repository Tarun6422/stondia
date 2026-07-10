import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Download,
  FileText,
  FileArchive,
  Loader2,
  Search,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { PageHero, CTASection } from "@/components/page-parts";
import texture from "@/assets/texture-stone.jpg";
import { buildMeta, canonicalLink, jsonLdScript, breadcrumbSchema } from "@/lib/seo";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export const Route = createFileRoute("/_public/downloads")({
  head: () => ({
    meta: buildMeta({
      title: "Download Center — Stone India Heritage",
      description:
        "Download premium natural stone catalogs, technical specification sheets, finish guides, sustainability reports, and shipping documentation for architects and importers.",
      path: "/downloads",
    }),
    links: [canonicalLink("/downloads")],
    scripts: [
      jsonLdScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Download Center", item: "/downloads" },
        ]),
      ),
    ],
  }),
  component: Downloads,
});

/* ── Types ── */
type DownloadItem = {
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
};

const ICON_MAP: Record<string, typeof FileText> = {
  PDF: FileText,
  ZIP: FileArchive,
};

function Downloads() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDownloads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("limit", "50");

      const res = await fetch(`${API_BASE}/api/catalog?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch downloads");
      const data = await res.json();
      setItems(data.data || []);
    } catch {
      setError("Failed to load downloads");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => fetchDownloads(), 300);
    return () => clearTimeout(t);
  }, [searchQuery, fetchDownloads]);

  const handleDownload = async (item: DownloadItem) => {
    if (downloading) return;
    setDownloading(item.id);
    try {
      // Increment counter & log (fire-and-forget, no redirect follow)
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

      fetchDownloads();
    } catch {
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
        eyebrow="Download Center"
        title="Specs, catalogs & guides"
        intro="Everything you need to specify with confidence — technical sheets, catalogs and reports."
        image={texture}
      />
      <section className="py-20">
        <div className="container-lux">
          {/* Search */}
          <div className="mb-8 flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search downloads…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Error State */}
          {error && !loading && (
            <div className="mb-8 flex flex-col items-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-10 text-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <div>
                <h3 className="font-serif text-lg text-foreground">Failed to load downloads</h3>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" onClick={fetchDownloads} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-sm bg-muted animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                  <div className="h-11 w-11 rounded-full bg-muted animate-pulse" />
                </div>
              ))
            ) : !error && items.length === 0 ? (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                <p>No downloads available yet.</p>
              </div>
            ) : (
              !error &&
              items.map((item, i) => {
                const Icon = ICON_MAP[item.category || "PDF"] || FileText;
                return (
                  <Reveal key={item.id} delay={(i % 2) * 0.06}>
                    <div className="hover-lift flex items-center justify-between rounded-lg border border-border bg-card p-6">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-sm bg-gold/15 text-gold">
                          <Icon className="h-6 w-6" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-medium text-foreground truncate">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            PDF{item.fileSize ? ` · ${item.fileSize}` : ""}
                            {item.downloadCount > 0 ? ` · ${item.downloadCount} downloads` : ""}
                          </p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(item)}
                        disabled={downloading === item.id}
                        aria-label={`Download ${item.title}`}
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold hover:text-gold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloading === item.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Download className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </Reveal>
                );
              })
            )}
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
}
