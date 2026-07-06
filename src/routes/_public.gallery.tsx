import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Expand } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PageHero, CTASection } from "@/components/page-parts";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Lightbox } from "@/components/lightbox";
import { PRODUCTS, PROJECTS } from "@/data/site";
import texture from "@/assets/texture-stone.jpg";
import { buildMeta, canonicalLink, jsonLdScript, breadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/_public/gallery")({
  head: () => ({
    meta: buildMeta({
      title: "Gallery — Stone India Heritage",
      description: "A visual gallery of premium Rajasthan sandstone products, finishes, textures, and completed architectural projects across luxury villas, resorts, temples, and civic spaces.",
      path: "/gallery",
    }),
    links: [canonicalLink("/gallery")],
    scripts: [
      jsonLdScript(breadcrumbSchema([
        { name: "Home", item: "/" },
        { name: "Gallery", item: "/gallery" },
      ])),
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const images = [
    ...PRODUCTS.map((p) => ({ src: p.image, label: p.name })),
    ...PROJECTS.map((p) => ({ src: p.image, label: p.name })),
  ];
  const [active, setActive] = useState<number | null>(null);

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="A portrait of stone in motion"
        intro="Textures, finishes and finished architecture — the character of Rajasthan sandstone up close."
        image={texture}
      />
      <section className="py-16">
        <div className="container-lux">
          <Breadcrumbs items={[{ label: "Gallery" }]} className="mb-8" />
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
            {images.map((img, i) => (
              <Reveal key={i} delay={(i % 3) * 0.05}>
                <button
                  onClick={() => setActive(i)}
                  aria-label={`Open ${img.label}`}
                  className="group relative block w-full overflow-hidden rounded-lg border border-border"
                >
                  <img
                    src={img.src}
                    alt={img.label}
                    loading="lazy"
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-black/0 transition-colors group-hover:bg-black/30">
                    <Expand className="h-7 w-7 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-left text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {img.label}
                  </figcaption>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Lightbox images={images} index={active} onClose={() => setActive(null)} onIndexChange={setActive} />

      <CTASection />
    </>
  );
}
