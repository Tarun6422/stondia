import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download, ArrowUpRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { PageHero, CTASection } from "@/components/page-parts";
import { PRODUCTS, CATEGORIES } from "@/data/site";
import hero from "@/assets/hero-sandstone.jpg";

export const Route = createFileRoute("/_public/catalog")({
  head: () => ({
    meta: [
      { title: "Digital Stone Catalog — Stone India Heritage" },
      { name: "description", content: "Browse our premium digital catalog of raw and finished Rajasthan sandstone with technical specifications and downloadable sheets." },
      { property: "og:title", content: "Digital Stone Catalog — Stone India Heritage" },
      { property: "og:description", content: "Raw and finished stone catalog with technical specs." },
    ],
  }),
  component: Catalog,
});

function Catalog() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = PRODUCTS.filter((p) => {
    const matchCat = cat === "All" || p.category === cat;
    const matchQuery =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

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
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-md border border-border bg-background px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stones, categories…"
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Button variant="gold">
              <Download className="h-4 w-4" /> Download Full Catalog
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {["All", ...CATEGORIES].map((c) => (
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

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.05}>
                <div className="hover-lift group overflow-hidden rounded-lg border border-border bg-card">
                  <Link to="/products/$slug" params={{ slug: p.slug }} className="block aspect-[4/3] overflow-hidden">
                    <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </Link>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-[0.15em] text-gold">{p.category}</p>
                    <h3 className="mt-1 font-serif text-xl text-foreground">{p.name}</h3>
                    <dl className="mt-4 space-y-1.5 text-sm">
                      <div className="flex justify-between"><dt className="text-muted-foreground">Thickness</dt><dd className="text-foreground">{p.thickness}</dd></div>
                      <div className="flex justify-between"><dt className="text-muted-foreground">Weight</dt><dd className="text-foreground">{p.weight}</dd></div>
                    </dl>
                    <div className="mt-5 flex items-center gap-3">
                      <Button asChild variant="gold" size="sm" className="flex-1">
                        <Link to="/quote">Request Quote</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link to="/products/$slug" params={{ slug: p.slug }}>
                          Details <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="mt-12 text-center text-muted-foreground">No stones match your search.</p>
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
}
