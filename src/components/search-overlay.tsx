import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Search, X, ArrowUpRight } from "lucide-react";
import { PRODUCTS, PROJECTS, CATEGORIES } from "@/data/site";

type Result = { label: string; group: string; to: string; params?: Record<string, string> };

const PAGES: Result[] = [
  { label: "About", group: "Pages", to: "/about" },
  { label: "Heritage", group: "Pages", to: "/heritage" },
  { label: "Factory", group: "Pages", to: "/factory" },
  { label: "Manufacturing Process", group: "Pages", to: "/manufacturing" },
  { label: "Sustainability", group: "Pages", to: "/sustainability" },
  { label: "Digital Catalog", group: "Pages", to: "/catalog" },
  { label: "Gallery", group: "Pages", to: "/gallery" },
  { label: "Videos", group: "Pages", to: "/videos" },
  { label: "Download Center", group: "Pages", to: "/downloads" },
  { label: "Contact", group: "Pages", to: "/contact" },
];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const results = useMemo<Result[]>(() => {
    const all: Result[] = [
      ...PRODUCTS.map((p) => ({ label: p.name, group: "Products", to: "/products/$slug", params: { slug: p.slug } })),
      ...PROJECTS.map((p) => ({ label: p.name, group: "Projects", to: "/projects/$slug", params: { slug: p.slug } })),
      ...CATEGORIES.map((c) => ({ label: c, group: "Categories", to: "/categories" })),
      ...PAGES,
    ];
    const q = query.trim().toLowerCase();
    if (!q) return all.filter((r) => r.group === "Products").slice(0, 6);
    return all.filter((r) => r.label.toLowerCase().includes(q)).slice(0, 12);
  }, [query]);

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
            className="h-fit w-full max-w-xl overflow-hidden rounded-xl border border-border bg-popover shadow-elegant"
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
          >
            <div className="flex items-center gap-3 border-b border-border px-5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, projects, pages…"
                className="h-14 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button onClick={onClose} aria-label="Close search" className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No results for “{query}”.
                </p>
              ) : (
                results.map((r, i) => (
                  <Link
                    key={i}
                    to={r.to}
                    params={r.params as never}
                    onClick={onClose}
                    className="group flex items-center justify-between rounded-md px-4 py-2.5 text-sm transition-colors hover:bg-muted"
                  >
                    <span className="text-foreground">{r.label}</span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      {r.group}
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
