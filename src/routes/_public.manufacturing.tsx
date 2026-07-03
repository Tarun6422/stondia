import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/motion";
import { PageHero, CTASection } from "@/components/page-parts";
import { PROCESS_STEPS } from "@/data/site";
import factory from "@/assets/factory.jpg";

export const Route = createFileRoute("/_public/manufacturing")({
  head: () => ({
    meta: [
      { title: "Manufacturing Process — Stone India Heritage" },
      { name: "description", content: "From responsible quarrying to global export — our seven-stage stone manufacturing process." },
      { property: "og:title", content: "Manufacturing Process — Stone India Heritage" },
      { property: "og:description", content: "Our seven-stage stone manufacturing process." },
    ],
  }),
  component: Manufacturing,
});

function Manufacturing() {
  return (
    <>
      <PageHero
        eyebrow="Manufacturing Process"
        title="From quarry to your site, in seven stages"
        intro="A meticulous journey that transforms raw heritage blocks into export-ready architectural stone."
        image={factory}
      />

      <section className="py-24">
        <div className="container-lux">
          <div className="mx-auto max-w-4xl">
            {PROCESS_STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.05}>
                <div className="group grid gap-6 border-b border-border py-10 last:border-0 sm:grid-cols-[auto_1fr] sm:items-start">
                  <span className="font-serif text-5xl text-gold/40 transition-colors group-hover:text-gold sm:text-6xl">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl text-foreground md:text-3xl">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-muted-foreground">{step.desc}</p>
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
