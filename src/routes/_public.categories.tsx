import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PageHero, CTASection } from "@/components/page-parts";
import { Breadcrumbs, breadcrumbSchema } from "@/components/breadcrumbs";
import { CATEGORIES, PRODUCTS } from "@/data/site";
import texture from "@/assets/texture-stone.jpg";
import cobbles from "@/assets/product-cobbles.jpg";
import jali from "@/assets/product-jali.jpg";
import column from "@/assets/product-column.jpg";

const FALLBACKS = [texture, cobbles, jali, column];

export const Route = createFileRoute("/_public/categories")({
  head: () => ({
    meta: [
      { title: "Stone Categories — Stone India Heritage" },
      { name: "description", content: "Browse Rajasthan sandstone by category — cladding, flooring, cobbles, jali, columns, carvings, landscape stones and more." },
      { property: "og:title", content: "Stone Categories — Stone India Heritage" },
      { property: "og:description", content: "Browse our full range of natural stone categories." },
      { property: "og:url", content: "/categories" },
    ],
    links: [{ rel: "canonical", href: "/categories" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Categories", item: "/categories" },
          ]),
        ),
      },
    ],
  }),
  component: Categories,
});

function Categories() {
  const cats = CATEGORIES.map((c, i) => {
    const items = PRODUCTS.filter((p) => p.category === c);
    return {
      name: c,
      count: items.length,
      image: items[0]?.image ?? FALLBACKS[i % FALLBACKS.length],
    };
  });

  return (
    <>
      <PageHero
        eyebrow="Categories"
        title="Explore stone by category"
        intro="From precision-calibrated cladding to hand-carved ornamentation — navigate our complete architectural stone range."
        image={texture}
      />

      <section className="py-16">
        <div className="container-lux">
          <Breadcrumbs items={[{ label: "Categories" }]} className="mb-8" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cats.map((c, i) => (
              <Reveal key={c.name} delay={(i % 3) * 0.05}>
                <Link
                  to="/products"
                  className="hover-lift group relative block aspect-[4/3] overflow-hidden rounded-lg border border-border"
                >
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                    <div>
                      <h3 className="font-serif text-xl">{c.name}</h3>
                      <p className="mt-0.5 text-xs text-white/70">
                        {c.count > 0 ? `${c.count} product${c.count > 1 ? "s" : ""}` : "Custom made to order"}
                      </p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 translate-y-1 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
