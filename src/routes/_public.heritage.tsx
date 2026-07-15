import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/motion";
import { PageHero, SectionHeading, CTASection } from "@/components/page-parts";
import { hero, carving01 } from "@/assets/media";
import { buildMeta, canonicalLink, jsonLdScript, breadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/_public/heritage")({
  head: () => ({
    meta: buildMeta({
      title: "Our Heritage — STONDIA",
      description:
        "The living craft of Rajasthani stone — centuries of carving tradition preserved and evolved by master artisans in Jodhpur, India.",
      path: "/heritage",
    }),
    links: [canonicalLink("/heritage")],
    scripts: [
      jsonLdScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Our Heritage", item: "/heritage" },
        ]),
      ),
    ],
  }),
  component: Heritage,
});

const TIMELINE = [
  {
    year: "Origins",
    title: "A carving tradition",
    desc: "Rajasthan's artisans have shaped sandstone into palaces, temples and havelis for centuries.",
  },
  {
    year: "Foundation",
    title: "A family of stone",
    desc: "Our founders formalised heritage quarrying and hand-carving into a dedicated workshop.",
  },
  {
    year: "Modernisation",
    title: "Precision manufacturing",
    desc: "Multi-wire saws and CNC finishing joined the artisan's chisel under one roof.",
  },
  {
    year: "Today",
    title: "Global exporter",
    desc: "Export-grade stone shipped to 35+ countries, backed by international standards.",
  },
];

function Heritage() {
  return (
    <>
      <PageHero
        eyebrow="Our Heritage"
        title="The living craft of Rajasthani stone"
        intro="Where centuries-old carving tradition meets a modern global standard of quality and consistency."
        image={hero}
      />

      <section className="py-24">
        <div className="container-lux grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Craftsmanship"
              title="Every chisel mark tells a story"
              intro="Our master artisans carry forward techniques passed through generations — hand-carving jali screens, columns and ornamentation with a precision no machine can replicate. This heritage is the soul of every product we ship."
            />
          </div>
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-lg">
              <img
                src={carving01}
                alt="Hand carved jali"
                loading="lazy"
                className="w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-secondary/50 py-24">
        <div className="container-lux">
          <SectionHeading center eyebrow="Our Journey" title="A legacy in stone" />
          <div className="mx-auto mt-14 max-w-3xl">
            {TIMELINE.map((t, i) => (
              <Reveal key={t.title} delay={i * 0.08}>
                <div className="flex gap-6 pb-10 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold text-sm font-semibold text-[var(--gold-foreground)]">
                      {i + 1}
                    </span>
                    {i < TIMELINE.length - 1 && <span className="mt-2 w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-2">
                    <p className="eyebrow mb-1">{t.year}</p>
                    <h3 className="font-serif text-2xl text-foreground">{t.title}</h3>
                    <p className="mt-2 text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
