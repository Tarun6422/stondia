import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/motion";
import { COMPANY } from "@/data/site";

import { buildMeta, canonicalLink, jsonLdScript, breadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/_public/privacy")({
  head: () => ({
    meta: buildMeta({
      title: "Privacy Policy — Stone India Heritage",
      description:
        "How Stone India Heritage collects, uses and protects your personal information when you request quotes, download resources or contact our export team.",
      path: "/privacy",
    }),
    links: [canonicalLink("/privacy")],
    scripts: [
      jsonLdScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Privacy Policy", item: "/privacy" },
        ]),
      ),
    ],
  }),
  component: Privacy,
});

const SECTIONS = [
  {
    h: "Information We Collect",
    p: "We collect information you provide directly — such as your name, company, email and project details — when you request a quote, download resources or contact us.",
  },
  {
    h: "How We Use Information",
    p: "Your information is used to respond to enquiries, prepare quotes, process orders and improve our services. We do not sell your personal data to third parties.",
  },
  {
    h: "Data Security",
    p: "We implement industry-standard measures to protect your information against unauthorised access, alteration or disclosure.",
  },
  {
    h: "Cookies",
    p: "Our website uses cookies to enhance your browsing experience and analyse site traffic. You can control cookies through your browser settings.",
  },
  {
    h: "Third-Party Services",
    p: "We may use trusted third-party providers for analytics and logistics. These providers are bound by confidentiality obligations.",
  },
  {
    h: "Your Rights",
    p: "You may request access to, correction of, or deletion of your personal data at any time by contacting us.",
  },
  { h: "Contact", p: `For privacy enquiries, email ${COMPANY.email}.` },
];

function Privacy() {
  return <LegalPage title="Privacy Policy" sections={SECTIONS} />;
}

export function LegalPage({
  title,
  sections,
}: {
  title: string;
  sections: { h: string; p: string }[];
}) {
  return (
    <section className="pt-36 pb-24">
      <div className="container-lux max-w-3xl">
        <Reveal>
          <p className="eyebrow mb-3">Legal</p>
          <h1 className="font-serif text-4xl text-foreground md:text-5xl">{title}</h1>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: January 2026</p>
        </Reveal>
        <div className="mt-12 space-y-10">
          {sections.map((s, i) => (
            <Reveal key={s.h} delay={(i % 4) * 0.04}>
              <div>
                <h2 className="font-serif text-2xl text-foreground">{s.h}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{s.p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
