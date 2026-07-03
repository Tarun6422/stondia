import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { PageHero, SectionHeading, CTASection } from "@/components/page-parts";
import { COMPANY } from "@/data/site";
import factory from "@/assets/factory.jpg";
import texture from "@/assets/texture-stone.jpg";

export const Route = createFileRoute("/_public/about")({
  head: () => ({
    meta: [
      { title: "About — Stone India Heritage" },
      { name: "description", content: "Learn about Stone India Heritage — our vision, mission and values as a premium Rajasthan sandstone exporter." },
      { property: "og:title", content: "About — Stone India Heritage" },
      { property: "og:description", content: "Our vision, mission and values." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Custodians of Rajasthan's stone legacy"
        intro="A premium manufacturer and global exporter uniting generations of craftsmanship with modern precision manufacturing."
        image={texture}
      />

      <section className="py-24">
        <div className="container-lux grid gap-14 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="overflow-hidden rounded-lg">
              <img src={factory} alt="Our facility" loading="lazy" className="w-full object-cover" />
            </div>
          </Reveal>
          <div>
            <SectionHeading
              eyebrow="Our Story"
              title="From heritage quarries to global architecture"
              intro="Stone India Heritage delivers high-quality stone solutions for architects, builders, developers, landscape designers and international importers. We combine traditional Indian craftsmanship with modern manufacturing technology to serve projects across the globe."
            />
          </div>
        </div>
      </section>

      <section className="bg-secondary/50 py-24">
        <div className="container-lux grid gap-10 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-lg border border-border bg-card p-10">
              <p className="eyebrow mb-3">Our Vision</p>
              <p className="font-serif text-2xl leading-snug text-foreground md:text-3xl">
                {COMPANY.vision}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h-full rounded-lg border border-border bg-card p-10">
              <p className="eyebrow mb-3">Our Mission</p>
              <p className="text-lg leading-relaxed text-foreground/80">
                {COMPANY.mission}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-24">
        <div className="container-lux">
          <SectionHeading center eyebrow="Core Values" title="The principles we build on" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COMPANY.values.map((v, i) => (
              <Reveal key={v} delay={(i % 4) * 0.06}>
                <div className="rounded-lg border border-border bg-card p-8 text-center hover-lift">
                  <span className="font-serif text-4xl text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-3 font-serif text-xl text-foreground">{v}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild variant="gold" size="lg">
              <Link to="/heritage">Explore our heritage</Link>
            </Button>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
