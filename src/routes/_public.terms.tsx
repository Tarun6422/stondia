import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "./_public.privacy";

export const Route = createFileRoute("/_public/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Stone India Heritage" },
      { name: "description", content: "The terms governing use of our website and the sale of our natural stone products." },
    ],
  }),
  component: Terms,
});

const SECTIONS = [
  { h: "Acceptance of Terms", p: "By accessing this website and placing orders, you agree to be bound by these terms and conditions." },
  { h: "Products & Specifications", p: "Natural stone is a product of nature; variations in colour, texture and veining are inherent and not defects. Samples are indicative of range, not exact match." },
  { h: "Quotations & Orders", p: "Quotations are valid for 30 days unless stated otherwise. Orders are confirmed upon receipt of agreed deposit." },
  { h: "Pricing & Payment", p: "Prices are quoted on the agreed Incoterms basis. Payment terms are specified in each proforma invoice." },
  { h: "Shipping & Delivery", p: "Lead times are estimates. We package to international seaworthy standards but are not liable for carrier delays beyond our control." },
  { h: "Warranty & Liability", p: "We warrant products meet the agreed specifications at dispatch. Liability is limited to the value of the supplied goods." },
  { h: "Intellectual Property", p: "All website content, imagery and designs remain the property of Stone India Heritage." },
  { h: "Governing Law", p: "These terms are governed by the laws of India, with jurisdiction in the courts of Jodhpur, Rajasthan." },
];

function Terms() {
  return <LegalPage title="Terms & Conditions" sections={SECTIONS} />;
}
