import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Download,
  Star,
  Gem,
  Layers,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CATEGORIES, CATEGORY_DATA, PRODUCTS } from "@/data/site";
import type { Product } from "@/data/site";
import { buildMeta, canonicalLink } from "@/lib/seo";
import { carveDetail03 } from "@/assets/media";

type SortKey = "latest" | "popular" | "az" | "price-low" | "price-high";

const ITEMS_PER_PAGE = 12;



// Finishes used as filter options
const ALL_FINISHES = [
  "Natural",
  "Honed",
  "Polished",
  "Brushed",
  "Sandblasted",
  "Tumbled",
  "Hand-Carved",
  "Leather",
  "Flamed",
  "Antique",
];

// Match category name flexibly (e.g., "Jali" matches "Jali", "Carvings" matches "Carving")
// Also maps common variations like "Landscaping" -> "Landscape Stone"
const CATEGORY_ALIASES: Record<string, string> = {
  landscaping: "landscape stone",
};

function matchCategory(name: string, target: string): boolean {
  const a = name.toLowerCase().replace(/s$/, "");
  const b = target.toLowerCase().replace(/s$/, "");
  // Check direct match first
  if (a === b) return true;
  // Check aliases
  const aliasA = CATEGORY_ALIASES[a] || a;
  const aliasB = CATEGORY_ALIASES[b] || b;
  return aliasA === aliasB;
}

export const Route = createFileRoute("/_public/products/$category")({
  loader: ({ params }) => {
    const category = params.category;
    // Find matching products
    const products = PRODUCTS.filter((p) => matchCategory(p.category, category));
    const catData = CATEGORY_DATA.find((c) => matchCategory(c.name, category));
    if (products.length === 0 && !catData) {
      // Try to find a matching category even without products
      const catExists = CATEGORIES.some((c) => matchCategory(c, category));
      if (!catExists) throw notFound();
    }
    return {
      category,
      products,
      categoryInfo: catData || null,
    };
  },
  head: ({ params }) => {
    const catName = params.category;
    return {
      meta: buildMeta({
        title: `${catName} — Premium Natural Stone | STONDIA`,
        description: `Explore our premium collection of ${catName.toLowerCase()} in natural sandstone from Rajasthan, India. High-quality architectural stone for luxury projects worldwide.`,
        path: `/products/${params.category}`,
      }),
      links: [canonicalLink(`/products/${params.category}`)],
    };
  },
  notFoundComponent: () => (
    <div className="container-lux py-40 text-center">
      <h1 className="font-serif text-3xl">Category not found</h1>
      <p className="mt-2 text-muted-foreground">
        We don't have this category yet — explore our full catalog.
      </p>
      <Button asChild variant="gold" className="mt-6">
        <Link to="/products">All Products</Link>
      </Button>
    </div>
  ),
  component: CategoryPage,
});

/* ======================================================================
   MAIN CATEGORY PAGE
   ====================================================================== */

function CategoryPage() {
  const { category, products, categoryInfo } = Route.useLoaderData();

  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("latest");
  const [finishFilter, setFinishFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.productCode.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q),
      );
    }

    // Finish filter
    if (finishFilter) {
      result = result.filter((p) =>
        p.finishes.some((f) => f.toLowerCase().includes(finishFilter.toLowerCase())),
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case "az":
          return a.name.localeCompare(b.name);
        case "popular":
          return (b.badges?.length || 0) - (a.badges?.length || 0);
        case "price-low":
          return (a.priceLabel?.length || 0) - (b.priceLabel?.length || 0);
        case "price-high":
          return (b.priceLabel?.length || 0) - (a.priceLabel?.length || 0);
        case "latest":
        default:
          return 0; // keep original order
      }
    });

    return result;
  }, [products, searchQuery, finishFilter, sort]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Reset page when filters change
  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleFinishFilter = (finish: string | null) => {
    setFinishFilter(finish);
    setCurrentPage(1);
  };

  const displayName = categoryInfo?.name || category;

  return (
    <>
      {/* ================================================================ */}
      {/*  HERO SECTION                                                    */}
      {/* ================================================================ */}
      <HeroSection category={category} categoryInfo={categoryInfo} />

      {/* Breadcrumbs */}
      <div className="container-lux pt-6 pb-0">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Products", to: "/products" },
            { label: displayName },
          ]}
        />
      </div>

      {/* ================================================================ */}
      {/*  PRODUCTS SECTION                                                */}
      {/* ================================================================ */}
      <section className="py-12">
        <div className="container-lux">
          {/* Stats bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{filteredProducts.length}</span>{" "}
                {filteredProducts.length === 1 ? "product" : "products"} in{" "}
                <span className="font-medium text-foreground">{displayName}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {(searchQuery || finishFilter) && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[0.6rem] font-bold text-[var(--gold-foreground)]">
                    {(searchQuery ? 1 : 0) + (finishFilter ? 1 : 0)}
                  </span>
                )}
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort products"
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-gold"
              >
                <option value="latest">Latest</option>
                <option value="popular">Popular</option>
                <option value="az">A–Z</option>
                <option value="price-low">Price: Low</option>
                <option value="price-high">Price: High</option>
              </select>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="rounded-xl border border-border bg-card p-6 space-y-5">
                {/* Search */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Search</p>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-4">
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search by name, code, or description…"
                      className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    {searchQuery && (
                      <button onClick={() => handleSearch("")} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Finish filter */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Finish</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleFinishFilter(null)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                        !finishFilter
                          ? "border-gold bg-gold text-[var(--gold-foreground)]"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All Finishes
                    </button>
                    {ALL_FINISHES.map((f) => {
                      const hasProducts = products.some((p) =>
                        p.finishes.some((pf) => pf.toLowerCase() === f.toLowerCase()),
                      );
                      return (
                        <button
                          key={f}
                          onClick={() => handleFinishFilter(finishFilter === f ? null : f)}
                          disabled={!hasProducts}
                          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                            finishFilter === f
                              ? "border-gold bg-gold text-[var(--gold-foreground)]"
                              : hasProducts
                                ? "border-border bg-background text-muted-foreground hover:text-foreground"
                                : "border-border/40 bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                          }`}
                        >
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clear filters */}
                {(searchQuery || finishFilter) && (
                  <div className="pt-2 border-t border-border">
                    <button
                      onClick={() => {
                        handleSearch("");
                        handleFinishFilter(null);
                      }}
                      className="text-sm text-gold hover:text-gold/80 transition-colors"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Product grid */}
          {paginatedProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedProducts.map((product, i) => (
                <Reveal key={product.slug} delay={(i % 4) * 0.05}>
                  <ProductCard product={product} index={i} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-muted">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl text-foreground">No products found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  handleSearch("");
                  handleFinishFilter(null);
                }}
              >
                Clear filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                    page === currentPage
                      ? "bg-gold text-[var(--gold-foreground)]"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================ */}
      {/*  CTA SECTION                                                     */}
      {/* ================================================================ */}
      <section className="pb-24">
        <div className="container-lux">
          <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-[var(--charcoal)] via-[var(--charcoal)] to-[var(--charcoal)]/90 px-8 py-16 text-center">
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gold/5 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-gold/5 blur-3xl" />
            <div className="relative">
              <Reveal>
                <p className="eyebrow">Need Assistance?</p>
                <h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl leading-tight text-white md:text-4xl">
                  Looking for Something Specific?
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/60">
                  Our team of stone specialists can help you find the perfect product, discuss
                  custom requirements, or provide a detailed quotation.
                </p>
              </Reveal>
              <Reveal delay={0.08} className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild variant="gold" size="lg">
                  <Link to="/quote">
                    Request a Quote
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="hero"
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Link to="/contact">
                    <MessageCircle className="h-4 w-4" />
                    Talk to Expert
                  </Link>
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ======================================================================
   HERO SECTION
   ====================================================================== */

function HeroSection({
  category,
  categoryInfo,
}: {
  category: string;
  categoryInfo: typeof CATEGORY_DATA[0] | null;
}) {
  const heroImage = categoryInfo?.image || carveDetail03;

  return (
    <section className="relative flex min-h-[50vh] items-end overflow-hidden pt-28">
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <img
          src={heroImage}
          alt={categoryInfo?.name || category}
          className="h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.2 0.012 55 / 0.3) 0%, oklch(0.2 0.012 55 / 0.65) 55%, oklch(0.16 0.012 55 / 0.9) 100%)",
          }}
        />
      </motion.div>

      <div className="container-lux relative z-10 pb-16">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="eyebrow mb-3"
        >
          {categoryInfo?.filterGroups?.[0] || "Natural Stone"}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl text-balance"
        >
          {categoryInfo?.name || category}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="mt-4 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
        >
          {categoryInfo?.description ||
            `Premium ${category.toLowerCase()} crafted from the finest Rajasthan sandstone.`}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Button asChild variant="gold">
            <Link to="/quote">
              Request Quote <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="hero" className="border-white/20 text-white hover:bg-white/10">
            <Link to="/catalog">
              <Download className="h-4 w-4" /> Digital Catalog
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

/* ======================================================================
   PRODUCT CARD
   ====================================================================== */

function ProductCard({ product, index }: { product: Product; index: number }) {
  const isPremium = product.qualityGrade?.toLowerCase().includes("premium") ||
    product.badges?.includes("Export Ready") ||
    product.badges?.includes("Best Seller");

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-elegant hover:-translate-y-1">
      {/* Image (clickable) */}
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading={index < 4 ? "eager" : "lazy"}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.badges?.includes("Best Seller") && (
              <span className="rounded-full bg-amber-500/90 backdrop-blur-sm px-2.5 py-0.5 text-[0.6rem] font-semibold text-white flex items-center gap-1">
                <Star className="h-2.5 w-2.5" /> Best Seller
              </span>
            )}
            {isPremium && (
              <span className="rounded-full bg-gold/90 backdrop-blur-sm px-2.5 py-0.5 text-[0.6rem] font-semibold text-[var(--gold-foreground)] flex items-center gap-1">
                <Award className="h-2.5 w-2.5" /> Premium Quality
              </span>
            )}
          </div>

          {/* Category tag */}
          <span className="absolute right-3 top-3 rounded-full bg-background/80 backdrop-blur-sm px-2.5 py-0.5 text-[0.6rem] font-medium text-foreground">
            {product.category}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Product code */}
        {product.productCode && (
          <p className="text-[0.6rem] uppercase tracking-[0.15em] text-gold font-semibold mb-1">
            {product.productCode}
          </p>
        )}

        {/* Title (clickable) */}
        <Link to="/product/$slug" params={{ slug: product.slug }}>
          <h3 className="font-serif text-lg leading-snug text-foreground hover:text-gold transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Quick specs */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {product.material && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Gem className="h-3 w-3" />
              {product.material}
            </span>
          )}
          {product.finishes?.[0] && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Layers className="h-3 w-3" />
              {product.finishes[0]}
            </span>
          )}
        </div>

        {/* Price */}
        {product.priceLabel && (
          <p className="mt-2 text-xs text-muted-foreground">{product.priceLabel}</p>
        )}

        {/* View details link */}
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold hover:gap-2 transition-all"
        >
          View Details <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-1 border-t border-border/40 px-5 py-3">
        <Button asChild variant="ghost" size="sm" className="h-8 flex-1 text-xs">
          <Link to="/quote">Request Quote</Link>
        </Button>
        <a
          href={`https://wa.me/919829000000?text=Hello%2C%20I%27m%20interested%20in%20${encodeURIComponent(product.name)}%20(${product.productCode})`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors"
          aria-label="Contact on WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
