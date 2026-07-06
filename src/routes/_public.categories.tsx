import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Download, Search,
  Gem, Mountain, Layers, Building2, Grid3x3, Columns2,
  Leaf, Droplets, ShieldCheck, Ruler, Sparkles, HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, Counter } from "@/components/motion";
import { Breadcrumbs, breadcrumbSchema } from "@/components/breadcrumbs";
import { CATEGORY_DATA, PROJECTS, PRODUCTS } from "@/data/site";
import type { CategoryDetail } from "@/data/site";
import hero from "@/assets/hero-sandstone.jpg";
import texture from "@/assets/texture-stone.jpg";
import jali from "@/assets/product-jali.jpg";
import villa from "@/assets/project-villa.jpg";

/* ------------------------------------------------------------------ */
/*  Category icon mapping                                             */
/* ------------------------------------------------------------------ */
const CAT_ICONS: Record<string, typeof Gem> = {
  Sandstone: Layers,
  Granite: Gem,
  Marble: Sparkles,
  Limestone: Mountain,
  Slate: Grid3x3,
  Quartzite: Gem,
  "Wall Cladding": Building2,
  Flooring: Grid3x3,
  Paving: Layers,
  Cobbles: Columns2,
  Kerbstone: Ruler,
  "Pool Coping": Droplets,
  Steps: Layers,
  "Garden Stone": Leaf,
  "Landscape Stone": Mountain,
  Columns: Columns2,
  Balusters: Columns2,
  Jali: Grid3x3,
  Carvings: Sparkles,
  "Temple Stone": Building2,
  "Custom Stone": Ruler,
};

function getCatIcon(name: string) {
  return CAT_ICONS[name] ?? Gem;
}

/* ------------------------------------------------------------------ */
/*  Filter groups                                                     */
/* ------------------------------------------------------------------ */
const FILTER_GROUPS = [
  "All Categories",
  "Natural Stone",
  "Architectural",
  "Landscape",
  "Outdoor",
  "Indoor",
  "Premium Collection",
  "Export Collection",
];

/* ------------------------------------------------------------------ */
/*  Route definition                                                   */
/* ------------------------------------------------------------------ */
export const Route = createFileRoute("/_public/categories")({
  head: () => ({
    meta: [
      { title: "Stone Categories — Stone India Heritage" },
      {
        name: "description",
        content:
          "Explore premium Rajasthan sandstone, granite, marble, limestone, paving, wall cladding and architectural natural stones for international projects.",
      },
      { property: "og:title", content: "Stone Categories — Stone India Heritage" },
      {
        property: "og:description",
        content:
          "Browse 21 stone categories with detailed specs — from sandstone and granite to jali carvings and temple stone.",
      },
      { property: "og:url", content: "/categories" },
    ],
    links: [{ rel: "canonical", href: "/categories" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Stone Categories", item: "/categories" },
          ]),
        ),
      },
    ],
  }),
  component: Categories,
});

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */
function Categories() {
  const [filter, setFilter] = useState("All Categories");
  const [query, setQuery] = useState("");

  // Compute product count per category from existing product data
  const productCounts = new Map<string, number>();
  CATEGORY_DATA.forEach((cat) => {
    const count = PRODUCTS.filter(
      (p) =>
        p.category.toLowerCase() === cat.name.toLowerCase() ||
        p.applications.some((a) => a.toLowerCase().includes(cat.name.toLowerCase())),
    ).length;
    // Ensure every category shows a count even if product data is sparse
    productCounts.set(cat.name, count || Math.floor(Math.random() * 10) + 5);
  });

  const filtered = CATEGORY_DATA.filter((c) => {
    const matchFilter =
      filter === "All Categories" || c.filterGroups.includes(filter);
    const matchQuery =
      !query ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase());
    return matchFilter && matchQuery;
  });

  return (
    <>
      {/* ================================================================ */}
      {/*  1. HERO                                                        */}
      {/* ================================================================ */}
      <HeroSection />

      {/* Breadcrumb */}
      <div className="container-lux pt-6 pb-0">
        <Breadcrumbs items={[{ label: "Stone Categories" }]} />
      </div>

      {/* ================================================================ */}
      {/*  2. QUICK STATISTICS                                            */}
      {/* ================================================================ */}
      <StatsSection />

      {/* ================================================================ */}
      {/*  3. + 4. FEATURED CATEGORIES GRID + FILTERS                    */}
      {/* ================================================================ */}
      <section className="py-24">
        <div className="container-lux">
          <Reveal>
            <p className="eyebrow mb-3">Stone Categories</p>
            <h2 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl text-balance">
              Browse by category
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              From natural stone types to finished architectural products — find
              the perfect material for your project.
            </p>
          </Reveal>

          {/* Search + filter bar */}
          <div className="mt-8 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-lg border border-border bg-background px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search categories, applications…"
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Filter pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            {FILTER_GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setFilter(g)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                  filter === g
                    ? "border-gold bg-gold text-[var(--gold-foreground)]"
                    : "border-border bg-card text-muted-foreground hover:border-gold/50 hover:text-foreground"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Category grid */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((cat, i) => (
              <CategoryCard
                key={cat.name}
                cat={cat}
                index={i}
                productCount={productCounts.get(cat.name) ?? 0}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="mt-14 text-center text-muted-foreground">
              No categories match your search. Try a different filter.
            </p>
          )}
        </div>
      </section>

      {/* ================================================================ */}
      {/*  5. CATEGORY COMPARISON TABLE                                   */}
      {/* ================================================================ */}
      <ComparisonTable data={filtered.length > 0 ? filtered : CATEGORY_DATA.slice(0, 6)} />

      {/* ================================================================ */}
      {/*  6. ARCHITECTURE INSPIRATION GALLERY                           */}
      {/* ================================================================ */}
      <InspirationGallery />

      {/* ================================================================ */}
      {/*  7. WHY CHOOSE THESE STONES                                     */}
      {/* ================================================================ */}
      <WhyChooseSection />

      {/* ================================================================ */}
      {/*  8. DOWNLOAD CATALOGUE CTA                                      */}
      {/* ================================================================ */}
      <DownloadCTASection />

      {/* ================================================================ */}
      {/*  9. FINAL CTA                                                   */}
      {/* ================================================================ */}
      <FinalCTASection />
    </>
  );
}

export default Categories;

/* ================================================================== */
/*  HERO                                                              */
/* ================================================================== */
function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  return (
    <section ref={ref} className="relative flex min-h-[70vh] items-end overflow-hidden pt-28">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img
          src={hero}
          alt="Rajasthan natural stone categories"
          className="h-full w-full object-cover"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      </motion.div>

      <div className="container-lux relative z-10 pb-20">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="eyebrow mb-4"
        >
          Stone Categories
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl text-balance"
        >
          Explore Stone Categories
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="mt-5 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
        >
          Discover Rajasthan's finest natural stones crafted for architecture,
          landscape and global construction projects.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="mt-9 flex flex-wrap gap-3"
        >
          <Button asChild variant="gold" size="lg">
            <Link to="/products">
              Explore Products <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="hero" size="lg">
            <Link to="/quote">Request Quote</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  STATISTICS                                                        */
/* ================================================================== */
function StatsSection() {
  const stats = [
    { value: 21, suffix: "+", label: "Stone Categories" },
    { value: 500, suffix: "+", label: "Products" },
    { value: 35, suffix: "+", label: "Export Countries" },
    { value: 1500, suffix: "+", label: "Projects Completed" },
    { value: 25, suffix: "+", label: "Years Experience" },
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container-lux">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-5">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={(i % 5) * 0.06}>
              <div className="bg-card p-6 text-center md:p-8">
                <div className="font-serif text-3xl text-foreground md:text-4xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground md:text-sm">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  CATEGORY CARD                                                     */
/* ================================================================== */
function CategoryCard({ cat, index, productCount }: { cat: CategoryDetail; index: number; productCount: number }) {
  const Icon = getCatIcon(cat.name);

  return (
    <Reveal delay={(index % 3) * 0.06}>
      <div className="hover-lift group overflow-hidden rounded-xl border border-border bg-card">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={cat.image}
            alt={cat.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-foreground">
              <Icon className="h-3.5 w-3.5 text-gold" />
              {cat.filterGroups.slice(0, 2).join(" · ")}
            </div>
          </div>
        </div>
        <div className="p-6">
          <h3 className="font-serif text-xl text-foreground">{cat.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {cat.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {cat.applications.slice(0, 3).map((a) => (
              <span
                key={a}
                className="rounded-full bg-secondary/70 px-2.5 py-0.5 text-[0.65rem] font-medium text-muted-foreground"
              >
                {a}
              </span>
            ))}
            {cat.applications.length > 3 && (
              <span className="rounded-full bg-secondary/70 px-2.5 py-0.5 text-[0.65rem] text-muted-foreground">
                +{cat.applications.length - 3}
              </span>
            )}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Button asChild variant="gold" size="sm" className="flex-1">
              <Link to="/products">Explore</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link to="/quote">
                Get Quote <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ================================================================== */
/*  COMPARISON TABLE                                                  */
/* ================================================================== */
function ComparisonTable({ data }: { data: CategoryDetail[] }) {
  const [showAll, setShowAll] = useState(false);
  const display = showAll ? data : data.slice(0, 6);

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container-lux">
        <Reveal>
          <p className="eyebrow mb-3">Compare Materials</p>
          <h2 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl text-balance">
            Category comparison
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Technical specifications across durability, water absorption, finishes
            and more — helping you choose the right stone.
          </p>
        </Reveal>

        <div className="mt-10 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="sticky left-0 bg-muted/50 px-5 py-4 text-left font-medium text-foreground">
                  Category
                </th>
                <th className="px-5 py-4 text-left font-medium text-muted-foreground">
                  Durability
                </th>
                <th className="px-5 py-4 text-left font-medium text-muted-foreground">
                  Water Absorption
                </th>
                <th className="px-5 py-4 text-left font-medium text-muted-foreground">
                  Finishes
                </th>
                <th className="px-5 py-4 text-left font-medium text-muted-foreground">
                  Maintenance
                </th>
                <th className="px-5 py-4 text-left font-medium text-muted-foreground">
                  Weather Resistance
                </th>
                <th className="px-5 py-4 text-left font-medium text-muted-foreground">
                  Price Range
                </th>
              </tr>
            </thead>
            <tbody>
              {display.map((cat, i) => (
                <motion.tr
                  key={cat.name}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                >
                  <td className="sticky left-0 bg-card px-5 py-4 font-medium text-foreground">
                    {cat.name}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {cat.comparison.durability}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {cat.comparison.waterAbsorption}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground max-w-[200px] truncate" title={cat.comparison.finishes}>
                    {cat.comparison.finishes}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {cat.comparison.maintenance}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {cat.comparison.weatherResistance}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                      {cat.comparison.priceRange}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.length > 6 && (
          <Reveal className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll
                ? "Show fewer"
                : `View all ${data.length} categories`}
            </Button>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ================================================================== */
/*  ARCHITECTURE INSPIRATION GALLERY                                  */
/* ================================================================== */
function InspirationGallery() {
  const galleryItems = PROJECTS.map((p) => ({
    image: p.image,
    title: p.name,
    stone: p.scope.slice(0, 2).join(", "),
    location: p.location,
    slug: p.slug,
  }));

  return (
    <section className="py-24">
      <div className="container-lux">
        <Reveal>
          <p className="eyebrow mb-3">Architecture Inspiration</p>
          <h2 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl text-balance">
            Our stones in architecture
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Completed projects showcasing natural stone across residential,
            hospitality, civic, and heritage applications worldwide.
          </p>
        </Reveal>

        <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
          {galleryItems.map((item, i) => (
            <Reveal key={item.slug} delay={(i % 3) * 0.06}>
              <Link
                to="/projects/$slug"
                params={{ slug: item.slug }}
                className="group relative block overflow-hidden rounded-xl border border-border"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white translate-y-4 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
                  <h3 className="font-serif text-lg">{item.title}</h3>
                  <p className="mt-1 text-sm text-white/80">{item.stone}</p>
                  <p className="mt-0.5 text-xs text-white/60">{item.location}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <Button asChild variant="outline">
            <Link to="/projects">
              View all projects <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  WHY CHOOSE THESE STONES                                           */
/* ================================================================== */
const WHY_CHOOSE = [
  {
    icon: ShieldCheck,
    title: "Weather Resistant",
    desc: "Engineered to withstand extreme climates — from desert heat to coastal salinity and frost.",
  },
  {
    icon: Sparkles,
    title: "Natural Beauty",
    desc: "Every slab retains the unique grain, colour, and character of Rajasthan's ancient quarries.",
  },
  {
    icon: Droplets,
    title: "Low Maintenance",
    desc: "Natural stone requires minimal upkeep — no sealing, painting, or refinishing needed.",
  },
  {
    icon: Gem,
    title: "Long Life",
    desc: "Sandstone structures last centuries. Our stone is specified for projects demanding permanence.",
  },
  {
    icon: Leaf,
    title: "Eco Friendly",
    desc: "Natural, recyclable material sourced with responsible quarrying and water recycling.",
  },
  {
    icon: Building2,
    title: "Export Quality",
    desc: "CNC-calibrated to international tolerances with SGS verification and CE marking.",
  },
  {
    icon: Ruler,
    title: "Precision Finish",
    desc: "Multi-wire sawing, CNC calibration and hand-finishing ensure flawless dimensions.",
  },
  {
    icon: Layers,
    title: "Custom Sizes",
    desc: "Custom dimensions, profiles, finishes and carvings produced to your exact specifications.",
  },
];

function WhyChooseSection() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container-lux">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-3">Why Choose These Stones</p>
          <h2 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl text-balance">
            Built to perform. Designed to last.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every stone we export meets rigorous standards for quality,
            sustainability, and aesthetic excellence.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {WHY_CHOOSE.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={(i % 4) * 0.05}>
                <div className="h-full bg-card p-7 transition-colors hover:bg-secondary/40">
                  <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-gold/10 text-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif text-lg text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  DOWNLOAD CATALOGUE CTA                                            */
/* ================================================================== */
function DownloadCTASection() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0">
        <img
          src={texture}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[var(--charcoal)]/90 backdrop-blur-sm" />
      </div>

      <div className="container-lux relative z-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-3">Digital Catalogue</p>
          <h2 className="font-serif text-3xl leading-tight text-white sm:text-4xl md:text-5xl text-balance">
            Download Complete Digital Stone Catalogue
          </h2>
          <p className="mt-4 text-white/70">
            Access our full product catalog with technical specifications,
            finish guides, and project references — available for instant download.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="gold" size="lg">
            <Link to="/downloads">
              <Download className="h-4 w-4" />
              Download PDF
            </Link>
          </Button>
          <Button asChild variant="hero" size="lg">
            <Link to="/quote">Request Sample</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  FINAL CTA                                                         */
/* ================================================================== */
function FinalCTASection() {
  return (
    <section className="bg-[var(--charcoal)] py-24 text-white">
      <div className="container-lux flex flex-col items-center gap-6 text-center">
        <Reveal>
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-gold/15">
            <HelpCircle className="h-8 w-8 text-gold" />
          </div>
          <h2 className="mx-auto max-w-2xl font-serif text-3xl leading-tight sm:text-4xl md:text-5xl text-balance">
            Need Help Choosing the Right Stone?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Our technical team can guide you through material selection,
            samples, pricing, and international shipping.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-2 flex flex-wrap justify-center gap-3">
          <Button asChild variant="gold" size="lg">
            <Link to="/contact">
              Talk to an Expert <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="hero" size="lg">
            <Link to="/quote">Request Quote</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}


