import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PageHero, CTASection } from "@/components/page-parts";
import { ProductGridSkeleton } from "@/components/skeleton-cards";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { fetchProducts, fetchCategories } from "@/lib/products";
import type { ApiProduct } from "@/lib/products";
import { product20 } from "@/assets/media";
import { buildMeta, canonicalLink, jsonLdScript, breadcrumbSchema } from "@/lib/seo";

type SortKey = "latest" | "popular" | "az";

export const Route = createFileRoute("/_public/products/")({
  head: () => ({
    meta: buildMeta({
      title: "Products — STONDIA",
      description:
        "Explore our full range of premium Rajasthan sandstone products — wall cladding, flooring, cobbles, jali screens, columns, carvings, paving, and architectural stone for global projects.",
      path: "/products",
    }),
    links: [canonicalLink("/products")],
    scripts: [
      jsonLdScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Products", item: "/products" },
        ]),
      ),
    ],
  }),
  loader: async () => {
    const [productsRes, categoriesRes] = await Promise.all([
      fetchProducts({ limit: 50 }).catch(() => ({ products: [], total: 0, totalPages: 0 })),
      fetchCategories().catch(() => []),
    ]);
    return { products: productsRes.products, apiCategories: categoriesRes };
  },
  component: Products,
});

function Products() {
  const { products: initialProducts, apiCategories } = Route.useLoaderData();
  const [products, setProducts] = useState<ApiProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Map API categories to the active filter
  const categoryNames = apiCategories.map((c: any) => c.name);
  const activeCategoryName = active === "All" ? undefined : active;

  // Fetch products when filter changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProducts({
      category: activeCategoryName ? apiCategories.find((c: any) => c.name === active)?.id : undefined,
      sort: sort === "az" ? "name_asc" : "newest",
      limit: 50,
    })
      .then((res) => {
        if (!cancelled) {
          setProducts(res.products);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load products");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [active, sort, activeCategoryName, apiCategories]);

  // Client-side sort for "latest" and "az" since we can do it locally
  const filtered = [...products].sort((a, b) => {
    if (sort === "az") return a.name.localeCompare(b.name);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // latest
  });

  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Architectural stone, engineered to specification"
        intro="Raw and finished stones across every architectural application — from precision cladding to hand-carved ornamentation."
        image={product20}
      />

      <section className="py-16">
        <div className="container-lux">
          <Breadcrumbs items={[{ label: "Products" }]} className="mb-8" />
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActive("All")}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  active === "All"
                    ? "border-gold bg-gold text-[var(--gold-foreground)]"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {categoryNames.map((c: string) => (
                <Link
                  key={c}
                  to="/products/$category"
                  params={{ category: c.toLowerCase().replace(/\s+/g, "-").replace(/s$/, "") }}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    active === c
                      ? "border-gold bg-gold text-[var(--gold-foreground)]"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort products"
              className="h-9 shrink-0 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-gold"
            >
              <option value="latest">Latest</option>
              <option value="popular">Popular</option>
              <option value="az">A–Z</option>
            </select>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full">
                <ProductGridSkeleton count={6} />
              </div>
            ) : error ? (
              <div className="col-span-full flex flex-col items-center gap-4 py-20 text-center">
                <AlertCircle className="h-10 w-10 text-destructive/60" />
                <p className="text-muted-foreground">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 text-sm text-gold hover:underline"
                >
                  <RefreshCw className="h-4 w-4" /> Try again
                </button>
              </div>
            ) : (
              filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((p, i) => (
                <Reveal key={p.slug} delay={(i % 3) * 0.06}>
                  <Link
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    className="hover-lift group block overflow-hidden rounded-lg border border-border bg-card"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={p.mainImage || p.images?.[0] || "/placeholder.svg"}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
                        {p.category?.name || "Products"}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="font-serif text-xl text-foreground">{p.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{p.metadata?.tagline || p.tagline || p.description?.slice(0, 100) || ""}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold">
                        View details <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))
            )}
          </div>
          {!loading && !error && filtered.length === 0 && (
            <p className="mt-10 text-center text-muted-foreground">
              No products in this category yet — contact us for custom solutions.
            </p>
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
}
