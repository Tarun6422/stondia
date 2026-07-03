import { createFileRoute } from "@tanstack/react-router";
import { Droplets, Recycle, Leaf, Timer, Sprout, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PageHero, SectionHeading, CTASection } from "@/components/page-parts";
import { SUSTAINABILITY_POINTS } from "@/data/site";
import sustainability from "@/assets/sustainability.jpg";

export const Route = createFileRoute("/_public/sustainability")({
  head: () => ({
    meta: [
      { title: "Sustainability — Stone India Heritage" },
      { name: "description", content: "Responsible quarrying, water recycling, waste reduction and eco-friendly manufacturing at Stone India Heritage." },
      { property: "og:title", content: "Sustainability — Stone India Heritage" },
      { property: "og:description", content: "Responsible, low-impact natural stone." },
    ],
  }),
  component: Sustainability,
});

const PILLARS = [
  { icon: Sprout, title: "Responsible Quarrying", desc: "Selective extraction that minimises land disturbance and preserves surrounding ecosystems." },
  { icon: Droplets, title: "Water Recycling", desc: "Closed-loop systems recover and reuse process water across cutting and finishing." },
  { icon: Recycle, title: "Waste Reduction", desc: "Off-cuts and slurry are repurposed, keeping material out of landfill." },
  { icon: Leaf, title: "Eco-Friendly Manufacturing", desc: "Energy-conscious operations and sustainable sourcing throughout." },
  { icon: Timer, title: "Long Product Lifespan", desc: "Natural stone lasts generations — the ultimate low-maintenance, durable material." },
  { icon: ShieldCheck, title: "Reduced Impact", desc: "A recyclable, natural material with a low lifecycle footprint." },
];

function Sustainability() {
  return (
    <>
      <PageHero
        eyebrow="Sustainability"
        title="Built to last, quarried with care"
        intro="Natural stone is inherently durable and recyclable. We go further, embedding sustainability into every stage of our operations."
        image={sustainability}
      />

      <section className="py-24">
        <div className="container-lux">
          <SectionHeading
            center
            eyebrow="Our Commitment"
            title="Six pillars of responsible stone"
            intro="Sustainability is not an afterthought — it shapes how we quarry, manufacture and ship."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 0.06}>
                <div className="hover-lift h-full rounded-lg border border-border bg-card p-8">
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-sm bg-gold/15 text-gold">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-xl text-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--charcoal)] py-24 text-white">
        <div className="container-lux">
          <SectionHeading center eyebrow="At a Glance" title="Our sustainability principles" />
          <Reveal delay={0.1}>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {SUSTAINABILITY_POINTS.map((p) => (
                <span key={p} className="glass rounded-full px-5 py-2 text-sm text-white/90">
                  {p}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection />
    </>
  );
}
