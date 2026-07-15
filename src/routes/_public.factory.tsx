import { createFileRoute } from "@tanstack/react-router";
import { Reveal, Counter } from "@/components/motion";
import { PageHero, SectionHeading, CTASection } from "@/components/page-parts";
import { factory01, block03 } from "@/assets/media";
import { buildMeta, canonicalLink, jsonLdScript, breadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/_public/factory")({
  head: () => ({
    meta: buildMeta({
      title: "Factory — STONDIA",
      description:
        "Inside our precision stone manufacturing facility in Jodhpur — 250,000 ft² with multi-wire sawing, CNC finishing, hand carving studio, and quality control lab.",
      path: "/factory",
    }),
    links: [canonicalLink("/factory")],
    scripts: [
      jsonLdScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Factory", item: "/factory" },
        ]),
      ),
    ],
  }),
  component: Factory,
});

const CAPABILITIES = [
  {
    title: "Multi-Wire Sawing",
    desc: "High-throughput block cutting to precise slab thicknesses.",
  },
  { title: "CNC Finishing", desc: "Computer-controlled edging, profiling and calibration." },
  { title: "Carving Studio", desc: "Dedicated artisan wing for hand-carved products." },
  {
    title: "Surface Finishing",
    desc: "Honing, polishing, brushing, sandblasting and flaming lines.",
  },
  { title: "Quality Lab", desc: "Strength, absorption and dimensional testing." },
  { title: "Packaging Bay", desc: "Seaworthy crating engineered for export." },
];

const FSTATS = [
  { value: 250000, suffix: " ft²", label: "Facility Area" },
  { value: 500, suffix: "+", label: "Skilled Workforce" },
  { value: 40, suffix: "", label: "Machines" },
  { value: 6, suffix: " days", label: "Weekly Output Cycle" },
];

function Factory() {
  return (
    <>
      <PageHero
        eyebrow="Factory"
        title="Precision at industrial scale"
        intro="A modern manufacturing facility engineered to deliver export-quality stone with consistency and speed."
        image={factory01}
      />

      <section className="py-24">
        <div className="container-lux">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4">
            {FSTATS.map((s) => (
              <Reveal key={s.label}>
                <div className="bg-card p-8 text-center">
                  <div className="font-serif text-3xl text-foreground md:text-4xl">
                    <Counter value={s.value} suffix={s.suffix} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/50 py-24">
        <div className="container-lux">
          <SectionHeading center eyebrow="Capabilities" title="Everything under one roof" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((c, i) => (
              <Reveal key={c.title} delay={(i % 3) * 0.06}>
                <div className="hover-lift h-full rounded-lg border border-border bg-card p-8">
                  <h3 className="font-serif text-xl text-foreground">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container-lux grid gap-14 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="overflow-hidden rounded-lg">
              <img
                src={block03}
                alt="Stone material"
                loading="lazy"
                className="w-full object-cover"
              />
            </div>
          </Reveal>
          <SectionHeading
            eyebrow="Quality First"
            title="Consistency you can build on"
            intro="From block selection to final packaging, every stage is monitored to guarantee colour matching, dimensional accuracy and structural integrity across every shipment."
          />
        </div>
      </section>

      <CTASection />
    </>
  );
}
