import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { CTASection } from "@/components/page-parts";
import { PROJECTS } from "@/data/site";

export const Route = createFileRoute("/_public/projects/$slug")({
  loader: ({ params }) => {
    const project = PROJECTS.find((p) => p.slug === params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.project.name} — Stone India Heritage` },
          { name: "description", content: loaderData.project.summary },
          { property: "og:title", content: loaderData.project.name },
          { property: "og:description", content: loaderData.project.summary },
          { property: "og:image", content: loaderData.project.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="container-lux py-40 text-center">
      <h1 className="font-serif text-3xl">Project not found</h1>
      <Button asChild variant="gold" className="mt-6">
        <Link to="/projects">Back to projects</Link>
      </Button>
    </div>
  ),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { project } = Route.useLoaderData();
  const related = PROJECTS.filter((p) => p.slug !== project.slug).slice(0, 3);

  return (
    <>
      <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
        <img src={project.image} alt={project.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />
        <div className="container-lux absolute inset-x-0 bottom-0 pb-14 text-white">
          <Reveal>
            <Link to="/projects" className="mb-4 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> All projects
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">{project.category}</p>
            <h1 className="mt-2 max-w-3xl font-serif text-4xl md:text-6xl">{project.name}</h1>
            <div className="mt-4 flex flex-wrap gap-6 text-sm text-white/85">
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> {project.location}</span>
              <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-gold" /> {project.year}</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20">
        <div className="container-lux grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <Reveal>
            <div>
              <h2 className="font-serif text-3xl text-foreground">Project Overview</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{project.summary}</p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Every element was engineered to export-grade tolerances and packaged to international
                standards, ensuring flawless installation on site. Our team collaborated closely with
                the architects to honour the design intent while guaranteeing durability and weather
                resistance for decades to come.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-lg border border-border bg-card p-8">
              <h3 className="font-serif text-xl text-foreground">Scope of Supply</h3>
              <ul className="mt-5 space-y-3">
                {project.scope.map((s: string) => (
                  <li key={s} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-gold" /> {s}
                  </li>
                ))}
              </ul>
              <Button asChild variant="gold" className="mt-8 w-full">
                <Link to="/quote">Start a similar project</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-secondary/50 py-20">
        <div className="container-lux">
          <h2 className="font-serif text-3xl text-foreground">More Projects</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.slug}
                to="/projects/$slug"
                params={{ slug: p.slug }}
                className="hover-lift group relative block overflow-hidden rounded-lg"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 p-5 text-white">
                  <p className="text-xs uppercase tracking-[0.15em] text-gold">{p.category}</p>
                  <h3 className="mt-1 font-serif text-lg">{p.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
