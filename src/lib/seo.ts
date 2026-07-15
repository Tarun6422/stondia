/* ------------------------------------------------------------------ */
/*  SEO helpers — JSON-LD schemas, meta builders, social tags        */
/* ------------------------------------------------------------------ */

import type { MetaDescriptor, LinkDescriptor, ScriptDescriptor } from "@tanstack/react-router";

/* ------------------------------------------------------------------ */
/*  Shared config                                                      */
/* ------------------------------------------------------------------ */
const SITE_URL = "https://stondia.com";
const SITE_NAME = "STONDIA";
const SITE_DESC =
  "Premium manufacturer and global exporter of Rajasthan Sandstone and architectural natural stone. Heritage craftsmanship, sustainable quarrying and export-quality precision.";
const OG_IMAGE = "/og-image.jpg";
const TWITTER_HANDLE = "@Stondia";

/* ------------------------------------------------------------------ */
/*  JSON-LD schemas                                                    */
/* ------------------------------------------------------------------ */

/** Organization + LocalBusiness merged schema */
export function orgSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    name: SITE_NAME,
    alternateName: "STONDIA",
    description: SITE_DESC,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}${OG_IMAGE}`,
    email: "exports@stondia.com",
    telephone: "+91 98290 00000",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jodhpur",
      addressRegion: "Rajasthan",
      postalCode: "342001",
      addressCountry: "IN",
    },
    sameAs: [
      "https://facebook.com/stondia",
      "https://instagram.com/stondia",
      "https://linkedin.com/company/stondia",
      "https://youtube.com/@stondia",
    ],
    foundingDate: "1986",
    numberOfEmployees: { "@type": "QuantitativeValue", minValue: 200, maxValue: 500 },
  };
}

/** WebSite schema with SearchAction (for Google Sitelinks Search Box) */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESC,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** BreadcrumbList schema from an array of { name, item } */
export function breadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.item}`,
    })),
  };
}

/** Product schema */
export function productSchema(data: {
  name: string;
  description: string;
  image: string[];
  category: string;
  availability: string;
  origin: string;
  color: string;
  sku?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.name,
    description: data.description,
    image: data.image.map((i) => (i.startsWith("http") ? i : `${SITE_URL}${i}`)),
    category: data.category,
    sku: data.sku ?? data.name.toLowerCase().replace(/\s+/g, "-"),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      availability:
        data.availability === "In Stock"
          ? "https://schema.org/InStock"
          : "https://schema.org/MadeToOrder",
      itemCondition: "https://schema.org/NewCondition",
    },
    material: data.category,
    countryOfOrigin: data.origin,
    color: data.color,
  };
}

/** Article schema for blog posts */
export function articleSchema(data: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  category?: string;
  path?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.headline,
    description: data.description,
    image: data.image.startsWith("http") ? data.image : `${SITE_URL}${data.image}`,
    datePublished: data.datePublished,
    dateModified: data.dateModified ?? data.datePublished,
    author: {
      "@type": "Organization",
      name: data.author ?? SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: `${SITE_URL}/logo.png`,
    },
    articleSection: data.category,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${data.path ?? "/blog"}`,
    },
  };
}

/** FAQPage schema */
export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/* ------------------------------------------------------------------ */
/*  Meta / link / script builders                                      */
/* ------------------------------------------------------------------ */

type MetaInput = {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
};

/**
 * Build a complete set of meta descriptors for any page.
 * Handles title, description, OG, Twitter, keywords, and robots.
 */
export function buildMeta(input: MetaInput): MetaDescriptor[] {
  const { title, description, path = "", ogImage, ogType = "website", noindex } = input;
  const url = path ? `${SITE_URL}${path}` : SITE_URL;
  const image = ogImage ?? OG_IMAGE;
  const fullImageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  const meta: MetaDescriptor[] = [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: buildKeywords(title) },
    { property: "og:title", content: title },
    { property: "og:description", content: description.slice(0, 160) },
    { property: "og:type", content: ogType },
    { property: "og:url", content: url },
    { property: "og:image", content: fullImageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:site_name", content: SITE_NAME },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: TWITTER_HANDLE },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description.slice(0, 160) },
    { name: "twitter:image", content: fullImageUrl },
  ];

  if (noindex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }

  return meta;
}

/** Generate a canonical link descriptor */
export function canonicalLink(path: string): LinkDescriptor {
  return { rel: "canonical", href: path };
}

/** Generate a JSON-LD script descriptor */
export function jsonLdScript(data: Record<string, unknown>): ScriptDescriptor {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data),
  };
}

/* ------------------------------------------------------------------ */
/*  Helper: derive keywords from page title                            */
/* ------------------------------------------------------------------ */
function buildKeywords(title: string): string {
  const base = [
    "Rajasthan sandstone",
    "natural stone",
    "stone manufacturer",
    "sandstone exporter",
    "architectural stone",
    "heritage stone",
    "stondia",
  ];
  const words = title
    .replace(/[—–-]/g, " ")
    .replace(/[|]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["the", "and", "for", "our", "your"].includes(w.toLowerCase()))
    .slice(0, 4)
    .join(" ");
  if (words) base.unshift(words.toLowerCase());
  return [...new Set(base)].join(", ");
}

/* ------------------------------------------------------------------ */
/*  Social preview helpers                                             */
/* ------------------------------------------------------------------ */
export const SOCIAL_PREVIEW = {
  ogImage: OG_IMAGE,
  twitterImage: OG_IMAGE,
  facebook: { title: SITE_NAME, description: SITE_DESC, image: OG_IMAGE },
  linkedin: { title: SITE_NAME, description: SITE_DESC, image: OG_IMAGE },
};
