import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PageHero, CTASection } from "@/components/page-parts";
import { FAQS } from "@/data/site";
import texture from "@/assets/texture-stone.jpg";
import { buildMeta, canonicalLink, jsonLdScript, faqSchema, breadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/_public/faq")({
  head: () => ({
    meta: buildMeta({
      title: "FAQ — Stone India Heritage",
      description:
        "Answers to common questions about ordering natural stone, shipping, custom work, samples, and technical documentation from India's premier sandstone exporter.",
      path: "/faq",
    }),
    links: [canonicalLink("/faq")],
    scripts: [
      jsonLdScript(faqSchema(FAQS.map((f) => ({ question: f.q, answer: f.a })))),
      jsonLdScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "FAQ", item: "/faq" },
        ]),
      ),
    ],
  }),
  component: FAQ,
});

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Questions, answered"
        intro="Everything importers, architects and builders ask about working with us."
        image={texture}
      />
      <section className="py-20">
        <div className="container-lux max-w-3xl">
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {FAQS.map((f, i) => (
              <Reveal key={f.q}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-medium text-foreground">{f.q}</span>
                  <span className="shrink-0 text-gold">
                    {open === i ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </span>
                </button>
                <div
                  className={`grid overflow-hidden px-6 transition-all duration-300 ${open === i ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"}`}
                >
                  <p className="min-h-0 text-muted-foreground">{f.a}</p>
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
