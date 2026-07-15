import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "./_public.privacy";

import { buildMeta, canonicalLink, jsonLdScript, breadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/_public/terms")({
  head: () => ({
    meta: buildMeta({
      title: "Terms & Conditions — STONDIA",
      description:
        "The terms governing use of our website and the sale of our natural stone products, including quotations, pricing, shipping, and warranty.",
      path: "/terms",
    }),
    links: [canonicalLink("/terms")],
    scripts: [
      jsonLdScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Terms & Conditions", item: "/terms" },
        ]),
      ),
    ],
  }),
  component: Terms,
});

const SECTIONS = [
  {
    h: "Acceptance of Terms",
    p: "By accessing this website and placing orders, you agree to be bound by these terms and conditions.",
  },
  {
    h: "Products & Specifications",
    p: "Natural stone is a product of nature; variations in colour, texture and veining are inherent and not defects. Samples are indicative of range, not exact match.",
  },
  {
    h: "Quotations & Orders",
    p: "Quotations are valid for 30 days unless stated otherwise. Orders are confirmed upon receipt of agreed deposit.",
  },
  {
    h: "Pricing & Payment",
    p: "Prices are quoted on the agreed Incoterms basis. Payment terms are specified in each proforma invoice.",
  },
  {
    h: "Shipping & Delivery",
    p: "Lead times are estimates. We package to international seaworthy standards but are not liable for carrier delays beyond our control.",
  },
  {
    h: "Warranty & Liability",
    p: "We warrant products meet the agreed specifications at dispatch. Liability is limited to the value of the supplied goods.",
  },
  {
    h: "Intellectual Property",
    p: "All website content, imagery and designs remain the property of STONDIA.",
  },
  {
    h: "Governing Law",
    p: "These terms are governed by the laws of India, with jurisdiction in the courts of Jodhpur, Rajasthan.",
  },
];

function Terms() {
  return <LegalPage title="Terms & Conditions" sections={SECTIONS} />;
}
