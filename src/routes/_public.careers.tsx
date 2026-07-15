import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { PageHero, CTASection } from "@/components/page-parts";
import { worksite08 } from "@/assets/media";
import { buildMeta, canonicalLink, jsonLdScript, breadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/_public/careers")({
  head: () => ({
    meta: buildMeta({
      title: "Careers — STONDIA",
      description:
        "Join a global stone brand blending heritage craftsmanship with modern manufacturing. Explore careers in sales, manufacturing, quality, logistics, and artisan crafts.",
      path: "/careers",
    }),
    links: [canonicalLink("/careers")],
    scripts: [
      jsonLdScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Careers", item: "/careers" },
        ]),
      ),
    ],
  }),
  component: Careers,
});

const ROLES = [
  { title: "Export Sales Manager", location: "Jodhpur, India", type: "Full-time", dept: "Sales" },
  {
    title: "CNC Machine Operator",
    location: "Jodhpur, India",
    type: "Full-time",
    dept: "Manufacturing",
  },
  {
    title: "Quality Assurance Engineer",
    location: "Jodhpur, India",
    type: "Full-time",
    dept: "Quality",
  },
  {
    title: "Master Stone Carver",
    location: "Jodhpur, India",
    type: "Full-time",
    dept: "Craftsmanship",
  },
  {
    title: "Logistics Coordinator",
    location: "Jodhpur, India",
    type: "Full-time",
    dept: "Operations",
  },
  { title: "Regional Sales Rep", location: "Dubai, UAE", type: "Full-time", dept: "Sales" },
];

function Careers() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Build a legacy in stone"
        intro="We bring together artisans, engineers and global thinkers to shape the future of heritage stone."
        image={worksite08}
      />
      <section className="py-20">
        <div className="container-lux">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="eyebrow mb-3">Open Positions</p>
            <h2 className="font-serif text-3xl text-foreground sm:text-4xl">Join our team</h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-4">
            {ROLES.map((r, i) => (
              <Reveal key={r.title} delay={(i % 3) * 0.05}>
                <div className="hover-lift group flex flex-col gap-4 rounded-lg border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-serif text-xl text-foreground">{r.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4 text-gold" /> {r.dept}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-gold" /> {r.location}
                      </span>
                      <span>{r.type}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="shrink-0">
                    Apply <ArrowRight className="h-4 w-4" />
                  </Button>
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
