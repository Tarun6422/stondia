import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/motion";
import { PageHero, CTASection } from "@/components/page-parts";
import { PROJECTS } from "@/data/site";
import { project11 } from "@/assets/media";
import { buildMeta, canonicalLink, jsonLdScript, breadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/_public/projects/")({
  head: () => ({
    meta: buildMeta({
      title: "Projects — Stone India Heritage",
      description:
        "Explore luxury villas, hotels, temples, and government projects delivered worldwide with premium Rajasthan sandstone from Stone India Heritage.",
      path: "/projects",
    }),
    links: [canonicalLink("/projects")],
    scripts: [
      jsonLdScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Projects", item: "/projects" },
        ]),
      ),
    ],
  }),
  component: Projects,
});

function Projects() {
  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="Stone that shapes landmarks"
        intro="From private villas to civic plazas, our sandstone brings architecture to life across the globe."
        image={project11}
      />

      <section className="py-20">
        <div className="container-lux grid gap-8 md:grid-cols-2">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 2) * 0.08}>
              <Link
                to="/projects/$slug"
                params={{ slug: p.slug }}
                className="group relative block overflow-hidden rounded-lg"
              >
                <div className="aspect-[16/11] overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute bottom-0 p-8 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold">{p.category}</p>
                  <h3 className="mt-1 font-serif text-2xl md:text-3xl">{p.name}</h3>
                  <p className="text-sm text-white/70">
                    {p.location} · {p.year}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <CTASection />
    </>
  );
}
