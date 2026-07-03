import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PageHero, CTASection } from "@/components/page-parts";
import { POSTS } from "@/data/site";
import villa from "@/assets/project-villa.jpg";

export const Route = createFileRoute("/_public/blog/")({
  head: () => ({
    meta: [
      { title: "Journal — Stone India Heritage" },
      { name: "description", content: "Insights on sandstone architecture, sustainable quarrying and heritage craftsmanship." },
    ],
  }),
  component: Blog,
});

function Blog() {
  const [feature, ...rest] = POSTS;
  return (
    <>
      <PageHero
        eyebrow="Journal"
        title="Notes on stone & architecture"
        intro="Guides, stories and insights from the world of heritage sandstone."
        image={villa}
      />
      <section className="py-20">
        <div className="container-lux">
          <Reveal>
            <Link to="/blog/$slug" params={{ slug: feature.slug }} className="group grid gap-8 overflow-hidden rounded-lg border border-border bg-card md:grid-cols-2">
              <div className="aspect-[16/11] overflow-hidden md:aspect-auto">
                <img src={feature.image} alt={feature.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="flex flex-col justify-center p-8">
                <p className="text-xs uppercase tracking-[0.15em] text-gold">{feature.category} · {feature.date}</p>
                <h2 className="mt-3 font-serif text-3xl text-foreground">{feature.title}</h2>
                <p className="mt-3 text-muted-foreground">{feature.excerpt}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-gold">Read article <ArrowUpRight className="h-3.5 w-3.5" /></span>
              </div>
            </Link>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.06}>
                <Link to="/blog/$slug" params={{ slug: p.slug }} className="hover-lift group block overflow-hidden rounded-lg border border-border bg-card">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-[0.15em] text-gold">{p.category} · {p.date}</p>
                    <h3 className="mt-2 font-serif text-xl text-foreground">{p.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
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
