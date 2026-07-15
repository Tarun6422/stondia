import { createFileRoute } from "@tanstack/react-router";
import { Award } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PageHero, CTASection } from "@/components/page-parts";
import { CERTIFICATIONS } from "@/data/site";
import { factory04 } from "@/assets/media";
import { buildMeta, canonicalLink, jsonLdScript, breadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/_public/certifications")({
  head: () => ({
    meta: buildMeta({
      title: "Certifications — STONDIA",
      description:
        "ISO 9001, ISO 14001, CE Marking, SGS Verified and ethical labour certifications backing our export-grade natural stone quality standards.",
      path: "/certifications",
    }),
    links: [canonicalLink("/certifications")],
    scripts: [
      jsonLdScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Certifications", item: "/certifications" },
        ]),
      ),
    ],
  }),
  component: Certifications,
});

function Certifications() {
  return (
    <>
      <PageHero
        eyebrow="Certifications"
        title="Quality, verified and certified"
        intro="Independent accreditations that guarantee export-grade quality, environmental care and ethical practice."
        image={factory04}
      />
      <section className="py-20">
        <div className="container-lux grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CERTIFICATIONS.map((c, i) => (
            <Reveal key={c.name} delay={(i % 3) * 0.06}>
              <div className="hover-lift h-full rounded-lg border border-border bg-card p-8 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold">
                  <Award className="h-7 w-7" />
                </span>
                <h3 className="mt-5 font-serif text-xl text-foreground">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <CTASection />
    </>
  );
}
