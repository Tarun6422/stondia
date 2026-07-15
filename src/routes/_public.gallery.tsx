import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Expand, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/motion";
import { PageHero, CTASection } from "@/components/page-parts";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Lightbox } from "@/components/lightbox";
import { buildMeta, canonicalLink, jsonLdScript, breadcrumbSchema } from "@/lib/seo";

import {
  /* Assets images */
  hero,
  texture01,
  factory01,
  carving01,
  carving03,
  cobble01,
  product04,
  paving01,
  project01,
  /* img images */
  texture02,
  texture03,
  product01,
  product02,
  product06,
  product08,
  carving06,
  carving09,
  factory02,
  factory04,
  factory07,
  block01,
  block03,
  block05,
  block08,
  finish01,
  finish03,
  finish06,
  cobble03,
  cobble05,
  cobble07,
  paving03,
  paving05,
  paving08,
  slab01,
  slab03,
  slab05,
  site01,
  site03,
  arch01,
  arch03,
  arch05,
  arch07,
  arch09,
  arch11,
  quarry01,
  quarry03,
  quarry05,
  quarry07,
  process01,
  process03,
  process05,
  process08,
  process12,
  product20,
  product23,
  product25,
  product28,
  project03,
  project05,
  project08,
  project11,
  project13,
  worksite01,
  worksite04,
  worksite08,
  worksite12,
  premium01,
  premium03,
  premium05,
  premium08,
  premium11,
  gallery01,
  gallery03,
  gallery05,
  gallery08,
  gallery12,
  carveDetail01,
  carveDetail03,
  carveDetail06,
  carveDetail10,
  carveDetail14,
  carveDetail18,
  carveDetail22,
  export01,
  export03,
  export06,
  export10,
  export14,
  export17,
  install01,
  detail01,
  detail02,
} from "@/assets/media";

export const Route = createFileRoute("/_public/gallery")({
  head: () => ({
    meta: buildMeta({
      title: "Gallery — STONDIA",
      description:
        "A visual gallery of premium Rajasthan sandstone products, finishes, textures, and completed architectural projects across luxury villas, resorts, temples, and civic spaces.",
      path: "/gallery",
    }),
    links: [canonicalLink("/gallery")],
    scripts: [
      jsonLdScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Gallery", item: "/gallery" },
        ]),
      ),
    ],
  }),
  component: Gallery,
});

/* ── Curated gallery data ── */
type GalleryEntry = { src: string; label: string; category: string };

const GALLERY_DATA: GalleryEntry[] = [
  /* ── Textures & Surfaces ── */
  { src: texture01, label: "Warm Sandstone Texture", category: "Textures" },
  { src: texture02, label: "Detailed Grain Closeup", category: "Textures" },
  { src: texture03, label: "Sandstone Surface Detail", category: "Textures" },
  { src: detail01, label: "Stone Surface Macro", category: "Textures" },
  { src: detail02, label: "Texture Macro Shot", category: "Textures" },
  { src: finish01, label: "Honed Stone Surface", category: "Textures" },
  { src: finish03, label: "Natural Riven Finish", category: "Textures" },
  { src: finish06, label: "Brushed Texture", category: "Textures" },

  /* ── Products & Stone Displays ── */
  { src: product01, label: "Premium Stone Finish", category: "Products" },
  { src: product02, label: "Stone Surface Detail", category: "Products" },
  { src: product04, label: "Carved Stone Column", category: "Products" },
  { src: product06, label: "Natural Daylight Stone", category: "Products" },
  { src: product08, label: "HDR Stone Detail", category: "Products" },
  { src: product20, label: "Finished Stone Product", category: "Products" },
  { src: product23, label: "Stone Selection Display", category: "Products" },
  { src: product25, label: "Premium Stone Display", category: "Products" },
  { src: product28, label: "Architectural Stone", category: "Products" },

  /* ── Cobbles & Paving ── */
  { src: cobble01, label: "Tumbled Sandstone Cobbles", category: "Products" },
  { src: cobble03, label: "Laid Cobblestone Pathway", category: "Products" },
  { src: cobble05, label: "Cobble Closeup Detail", category: "Products" },
  { src: cobble07, label: "Finished Cobble Installation", category: "Products" },
  { src: paving01, label: "Stone Paving Installation", category: "Products" },
  { src: paving03, label: "Paving Detail", category: "Products" },
  { src: paving05, label: "Patio Paving", category: "Products" },
  { src: paving08, label: "Finished Patio Space", category: "Products" },

  /* ── Carvings & Jali ── */
  { src: carving01, label: "Heritage Jali Panel", category: "Carvings" },
  { src: carving03, label: "Intricate Jali Ornamentation", category: "Carvings" },
  { src: carving06, label: "Artisan Carving in Progress", category: "Carvings" },
  { src: carving09, label: "Finished Carved Piece", category: "Carvings" },
  { src: carveDetail01, label: "Intricate Pattern Detail", category: "Carvings" },
  { src: carveDetail03, label: "Floral Carving Closeup", category: "Carvings" },
  { src: carveDetail06, label: "Geometric Motif", category: "Carvings" },
  { src: carveDetail10, label: "Hand-Carved Texture", category: "Carvings" },
  { src: carveDetail14, label: "Artisan Detail", category: "Carvings" },
  { src: carveDetail18, label: "Chisel Work Closeup", category: "Carvings" },
  { src: carveDetail22, label: "Finished Carving Art", category: "Carvings" },

  /* ── Factory & Manufacturing ── */
  { src: factory01, label: "Manufacturing Facility", category: "Factory" },
  { src: factory02, label: "Machinery Overview", category: "Factory" },
  { src: factory04, label: "Cutting Operation", category: "Factory" },
  { src: factory07, label: "Workshop Interior", category: "Factory" },
  { src: block01, label: "Raw Stone Blocks", category: "Factory" },
  { src: block03, label: "Stacked Sandstone Blocks", category: "Factory" },
  { src: block05, label: "Block Detail", category: "Factory" },
  { src: block08, label: "Quarry Block Selection", category: "Factory" },
  { src: slab01, label: "Large Cut Slab", category: "Factory" },
  { src: slab03, label: "Slab Stacking", category: "Factory" },
  { src: slab05, label: "Polished Slab Surface", category: "Factory" },

  /* ── Processing & Cutting ── */
  { src: process01, label: "Gang Saw Cutting", category: "Factory" },
  { src: process03, label: "Multi-Wire Saw Operation", category: "Factory" },
  { src: process05, label: "Block Cutting", category: "Factory" },
  { src: process08, label: "Edge Calibration", category: "Factory" },
  { src: process12, label: "Finishing Line", category: "Factory" },

  /* ── Architecture & Stone Buildings ── */
  { src: arch01, label: "Stone Building Facade", category: "Architecture" },
  { src: arch03, label: "Architectural Stone Detail", category: "Architecture" },
  { src: arch05, label: "Heritage Stone Structure", category: "Architecture" },
  { src: arch07, label: "Carved Architectural Element", category: "Architecture" },
  { src: arch09, label: "Stone Column Detail", category: "Architecture" },
  { src: arch11, label: "Decorative Stonework", category: "Architecture" },
  { src: premium05, label: "Exclusive Stone Surface", category: "Architecture" },
  { src: premium08, label: "Premium Architectural Stone", category: "Architecture" },
  { src: premium11, label: "High Detail Stone Closeup", category: "Architecture" },

  /* ── Quarry & Outdoor ── */
  { src: quarry01, label: "Wide Quarry View", category: "Quarry" },
  { src: quarry03, label: "Quarry Wall Detail", category: "Quarry" },
  { src: quarry05, label: "Outdoor Processing Area", category: "Quarry" },
  { src: quarry07, label: "Natural Outdoor Setting", category: "Quarry" },
  { src: site01, label: "Location Overview", category: "Quarry" },
  { src: site03, label: "Quarry Site Wide Shot", category: "Quarry" },

  /* ── Projects & Applications ── */
  { src: project01, label: "Desert Luxury Villa", category: "Projects" },
  { src: project03, label: "Landscape Stone Application", category: "Projects" },
  { src: project05, label: "Facade Installation", category: "Projects" },
  { src: project08, label: "Construction Site", category: "Projects" },
  { src: project11, label: "Completed Structure", category: "Projects" },
  { src: project13, label: "Interior Stone Work", category: "Projects" },
  { src: install01, label: "Stone Being Installed", category: "Projects" },
  { src: worksite01, label: "Active Stone Installation", category: "Projects" },
  { src: worksite04, label: "Stone Laying in Progress", category: "Projects" },
  { src: worksite08, label: "Team at Work", category: "Projects" },
  { src: worksite12, label: "Final Adjustments", category: "Projects" },

  /* ── Gallery & Lifestyle ── */
  { src: gallery01, label: "Stone in Architectural Context", category: "Gallery" },
  { src: gallery03, label: "Architectural Setting", category: "Gallery" },
  { src: gallery05, label: "Lifestyle Stone Application", category: "Gallery" },
  { src: gallery08, label: "Design Inspiration", category: "Gallery" },
  { src: gallery12, label: "Premium Lifestyle", category: "Gallery" },
  { src: premium01, label: "High-End Stone Finish", category: "Gallery" },
  { src: premium03, label: "Luxury Stone Product", category: "Gallery" },

  /* ── Export & Packaging ── */
  { src: export01, label: "Crated Stone for Shipping", category: "Exports" },
  { src: export03, label: "Container Loading", category: "Exports" },
  { src: export06, label: "Packaging Process", category: "Exports" },
  { src: export10, label: "Finished Packages", category: "Exports" },
  { src: export14, label: "Export-Ready Products", category: "Exports" },
  { src: export17, label: "Shipping Preparation", category: "Exports" },
];

const CATEGORIES = [
  "All",
  "Textures",
  "Products",
  "Carvings",
  "Factory",
  "Architecture",
  "Quarry",
  "Projects",
  "Gallery",
  "Exports",
] as const;

function Gallery() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? GALLERY_DATA
        : GALLERY_DATA.filter((img) => img.category === activeCategory),
    [activeCategory],
  );

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="A portrait of stone in motion"
        intro="Textures, finishes and finished architecture — the character of Rajasthan sandstone up close."
        image={gallery05}
      />
      <section className="py-16">
        <div className="container-lux">
          <Breadcrumbs items={[{ label: "Gallery" }]} className="mb-8" />

          {/* Filter buttons */}
          <Reveal className="mb-10">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="mr-1 h-4 w-4 text-muted-foreground" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? "border-gold bg-gold text-[var(--gold-foreground)]"
                      : "border-border bg-card text-muted-foreground hover:border-gold/50 hover:text-foreground"
                  }`}
                >
                  {cat}
                  {cat !== "All" && (
                    <span className="ml-1.5 text-xs opacity-60">
                      ({GALLERY_DATA.filter((img) => img.category === cat).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Masonry grid */}
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
            <AnimatePresence>
              {filtered.map((img, i) => (
                <motion.div
                  key={img.src}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: (i % 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    onClick={() => setLightboxIndex(GALLERY_DATA.indexOf(img))}
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
                    <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-wider text-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                      {img.category}
                    </span>
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-left text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {img.label}
                    </figcaption>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <p className="py-20 text-center text-muted-foreground">
              No images found in this category.
            </p>
          )}

          {filtered.length > 0 && (
            <Reveal className="mt-10 text-center">
              <p className="text-sm text-muted-foreground">
                Showing {filtered.length} of {GALLERY_DATA.length} images
              </p>
            </Reveal>
          )}
        </div>
      </section>

      <Lightbox
        images={GALLERY_DATA}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />

      <CTASection />
    </>
  );
}
