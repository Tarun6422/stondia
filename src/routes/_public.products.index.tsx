import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PageHero, CTASection } from "@/components/page-parts";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PRODUCTS, CATEGORIES } from "@/data/site";
import texture from "@/assets/texture-stone.jpg";

type SortKey = "latest" | "popular" | "az";

export const Route = createFileRoute("/_public/products/")({
  head: () => ({
    meta: [
      { title: "Products — Stone India Heritage" },
      { name: "description", content: "Explore our full range of Rajasthan sandstone products — cladding, flooring, cobbles, jali, columns, carvings and more." },
      { property: "og:title", content: "Products — Stone India Heritage" },
      { property: "og:description", content: "Premium sandstone products for architecture and landscaping." },
    ],
  }),
  component: Products,
});

function Products() {
  const [active, setActive] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("latest");

  const filtered = (active === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === active))
    .map((p, i) => ({ p, i }))
    .sort((a, b) => {
      if (sort === "az") return a.p.name.localeCompare(b.p.name);
      if (sort === "latest") return b.i - a.i;
      return a.i - b.i; // popular = curated order
    })
    .map((x) => x.p);

  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Architectural stone, engineered to specification"
        intro="Raw and finished stones across every architectural application — from precision cladding to hand-carved ornamentation."
        image={texture}
      />

      <section className="py-16">
        <div className="container-lux">
          <Breadcrumbs items={[{ label: "Products" }]} className="mb-8" />
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-wrap gap-2">
            {["All", ...CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  active === c
                    ? "border-gold bg-gold text-[var(--gold-foreground)]"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
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
            {filtered.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.06}>
                <Link
                  to="/products/$slug"
                  params={{ slug: p.slug }}
                  className="hover-lift group block overflow-hidden rounded-lg border border-border bg-card"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
                      {p.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl text-foreground">{p.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold">
                      View details <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          {filtered.length === 0 && (
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
