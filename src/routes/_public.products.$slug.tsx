import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Download,
  FileText,
  ArrowLeft,
  Check,
  ArrowUpRight,
  Share2,
  Printer,
  Heart,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Building,
  Layout,
  Grid3x3,
  Waypoints,
  Mountain,
  Sprout,
  Layers,
  Waves,
  Church,
  Building2,
  Home,
  Gem,
  Award,
  Sun,
  Shield,
  Leaf,
  Hammer,
  Ruler,
  Clock,
  Star,
  Phone,
  MessageCircle,
  BookOpen,
  Eye,
  GitCompare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { TiltCard } from "@/components/animations";
import { Breadcrumbs, breadcrumbSchema } from "@/components/breadcrumbs";
import { Lightbox } from "@/components/lightbox";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PRODUCTS, PROJECTS, COMPARISON_DATA, APPLICATION_ICONS } from "@/data/site";
import type { Product, Variant, ProductSize, StoneFeature, DownloadItem } from "@/data/site";

export const Route = createFileRoute("/_public/products/$slug")({
  loader: ({ params }) => {
    const product = PRODUCTS.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData, params }) => ({
    meta: loaderData
      ? [
          {
            title: `${loaderData.product.name} — Premium ${loaderData.product.category} | Stone India Heritage`,
          },
          { name: "description", content: loaderData.product.shortDescription.slice(0, 160) },
          {
            property: "og:title",
            content: `${loaderData.product.name} — Premium ${loaderData.product.category}`,
          },
          { property: "og:description", content: loaderData.product.tagline },
          { property: "og:type", content: "product" },
          { property: "og:image", content: loaderData.product.image },
          { property: "og:url", content: `/products/${params.slug}` },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:image", content: loaderData.product.image },
          { name: "twitter:title", content: loaderData.product.name },
          { name: "twitter:description", content: loaderData.product.tagline },
        ]
      : [
          { title: "Product not found — Stone India Heritage" },
          { name: "robots", content: "noindex" },
        ],
    links: loaderData ? [{ rel: "canonical", href: `/products/${params.slug}` }] : [],
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: loaderData.product.name,
              description: loaderData.product.shortDescription,
              image: loaderData.product.gallery,
              category: loaderData.product.category,
              brand: { "@type": "Brand", name: "Stone India Heritage" },
              offers: {
                "@type": "Offer",
                availability:
                  loaderData.product.availability === "In Stock"
                    ? "https://schema.org/InStock"
                    : "https://schema.org/MadeToOrder",
                itemCondition: "https://schema.org/NewCondition",
              },
              material: loaderData.product.category,
              countryOfOrigin: loaderData.product.origin,
              color: loaderData.product.color,
            }),
          },
          {
            type: "application/ld+json",
            children: JSON.stringify(
              breadcrumbSchema([
                { name: "Home", item: "/" },
                { name: "Products", item: "/products" },
                { name: loaderData.product.name, item: `/products/${params.slug}` },
              ]),
            ),
          },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="container-lux py-40 text-center">
      <h1 className="font-serif text-3xl">Product not found</h1>
      <Button asChild variant="gold" className="mt-6">
        <Link to="/products">Back to products</Link>
      </Button>
    </div>
  ),
  component: ProductDetail,
});

/* ======================================================================
   SECTION 1 — PREMIUM PRODUCT GALLERY
   ====================================================================== */

function ProductGallery({
  images,
  productName,
  activeVariant,
}: {
  images: string[];
  productName: string;
  activeVariant: Variant | null;
}) {
  const galleryImages = activeVariant
    ? [activeVariant.image, ...images.filter((img) => img !== activeVariant.image)]
    : images;

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
  const [fullZoom, setFullZoom] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [scale, setScale] = useState(1);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation for thumbnails
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxOpen) return;
      if (e.key === "ArrowLeft")
        setActiveIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
      if (e.key === "ArrowRight") setActiveIndex((i) => (i + 1) % galleryImages.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [galleryImages.length, lightboxOpen]);

  // Touch/swipe support for mobile
  const touchStart = useRef<number>(0);
  const touchPinchDist = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchPinchDist.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const newScale = Math.max(1, Math.min(3, scale * (dist / touchPinchDist.current)));
      if (Math.abs(dist - touchPinchDist.current) > 10) {
        setScale(newScale);
        touchPinchDist.current = dist;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1 && touchPinchDist.current === 0) {
      const diff = touchStart.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) setActiveIndex((i) => (i + 1) % galleryImages.length);
        else setActiveIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
      }
    }
    if (e.touches.length < 2) touchPinchDist.current = 0;
  };

  const handleDoubleClick = () => {
    setFullZoom((prev) => !prev);
    setScale(fullZoom ? 1 : 2.2);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxImages = galleryImages.map((src) => ({ src, label: productName }));

  const heroZoomStyle = fullZoom
    ? { transform: "scale(2.2)", cursor: "zoom-out" }
    : zoom.active && !fullZoom
      ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
      : scale > 1
        ? { transform: `scale(${scale})`, cursor: "zoom-out" }
        : undefined;

  return (
    <div ref={galleryRef} className="space-y-4">
      {/* Hero image */}
      <div
        className={`relative aspect-[4/3] overflow-hidden rounded-xl border border-border/60 bg-card ${
          fullZoom || scale > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
        onMouseEnter={() => {
          setIsHovering(true);
          setZoom((z) => ({ ...z, active: true }));
        }}
        onMouseLeave={() => {
          setIsHovering(false);
          setZoom((z) => ({ ...z, active: false }));
          setFullZoom(false);
          setScale(1);
        }}
        onMouseMove={(e) => {
          if (fullZoom || scale > 1) return;
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({
            active: true,
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
          });
        }}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="img"
        aria-label={`${productName} — image ${activeIndex + 1} of ${galleryImages.length}`}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            src={galleryImages[activeIndex]}
            alt={`${productName} — view ${activeIndex + 1}`}
            className="h-full w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={heroZoomStyle}
            draggable={false}
          />
        </AnimatePresence>

        {/* Image counter */}
        <div className="absolute bottom-4 left-4 rounded-full bg-background/80 backdrop-blur-sm px-3 py-1 text-xs font-medium tabular-nums">
          {String(activeIndex + 1).padStart(2, "0")} /{" "}
          {String(galleryImages.length).padStart(2, "0")}
        </div>

        {/* Fullscreen button */}
        <button
          onClick={() => openLightbox(activeIndex)}
          aria-label="Open fullscreen gallery"
          className="absolute bottom-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur-sm text-foreground transition-all hover:bg-background hover:scale-105"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Navigation arrows on hover */}
        {isHovering && (
          <>
            <button
              onClick={() =>
                setActiveIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)
              }
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-background/60 backdrop-blur-sm text-foreground transition-all hover:bg-background/90 opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveIndex((i) => (i + 1) % galleryImages.length)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-background/60 backdrop-blur-sm text-foreground transition-all hover:bg-background/90 opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      <div
        className="gallery-scroll flex gap-3 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        role="tablist"
        aria-label="Product image thumbnails"
      >
        {galleryImages.map((img, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveIndex(i);
              setFullZoom(false);
              setScale(1);
            }}
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`View image ${i + 1}`}
            className={`shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
              i === activeIndex
                ? "border-gold ring-1 ring-gold/30 shadow-gold"
                : "border-border/60 opacity-70 hover:opacity-100 hover:border-border"
            }`}
          >
            <img
              src={img}
              alt=""
              loading="lazy"
              className="h-20 w-20 object-cover md:h-24 md:w-24"
              draggable={false}
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <Lightbox
        images={lightboxImages}
        index={lightboxOpen ? lightboxIndex : null}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
      />
    </div>
  );
}

/* ======================================================================
   SECTION 2 — PRODUCT INFORMATION
   ====================================================================== */

const BADGE_STYLES: Record<string, string> = {
  "Export Ready": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "Best Seller": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Sustainability: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
};

const BADGE_ICONS: Record<string, ReactNode> = {
  "Export Ready": <ArrowUpRight className="h-3 w-3" />,
  "Best Seller": <Star className="h-3 w-3" />,
  Sustainability: <Leaf className="h-3 w-3" />,
};

function ProductInfo({ product, activeFinish }: { product: Product; activeFinish: string }) {
  const downloadFile = (name: string) => {
    toast.success("Preparing your download", {
      description: `${name} — your download will start shortly.`,
    });
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, text: product.tagline, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const printProduct = () => window.print();

  const saveForLater = () => {
    toast.success("Saved for later", {
      description: `${product.name} has been saved to your wishlist.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Category + badges */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="eyebrow">{product.category}</span>
        <span className="h-3.5 w-px bg-border" aria-hidden />
        <span className="text-xs text-muted-foreground">{product.origin}</span>
      </div>

      {/* Title */}
      <h1 className="font-serif text-3xl leading-tight text-foreground md:text-4xl lg:text-5xl">
        {product.name}
      </h1>

      {/* Badges */}
      <div className="flex flex-wrap gap-2" aria-label="Product badges">
        {product.badges.map((badge) => (
          <span
            key={badge}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${BADGE_STYLES[badge] ?? "bg-muted text-muted-foreground border-border"}`}
          >
            {BADGE_ICONS[badge]}
            {badge}
          </span>
        ))}
      </div>

      {/* Key details */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60">
        <InfoCell label="Category" value={product.category} />
        <InfoCell label="Origin" value={product.origin} />
        <InfoCell label="Color" value={product.color} />
        <InfoCell label="Availability" value={product.availability} />
        <InfoCell label="Stock Status" value={product.stockStatus} />
        <InfoCell label="Selected Finish" value={activeFinish} />
      </div>

      {/* Description */}
      <p className="text-base leading-relaxed text-muted-foreground">{product.shortDescription}</p>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="gold" size="lg" className="group">
          <Link to="/quote">
            Request Quote
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" onClick={() => downloadFile("Catalogue")}>
          <Download className="h-4 w-4" /> Download Catalogue
        </Button>
        <Button variant="outline" size="lg" onClick={() => downloadFile("Technical Datasheet")}>
          <FileText className="h-4 w-4" /> Technical Sheet
        </Button>
        <Button variant="ghost" size="icon" aria-label="Share product" onClick={shareProduct}>
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Print product details"
          onClick={printProduct}
        >
          <Printer className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Save for later" onClick={saveForLater}>
          <Heart className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-4 py-3.5">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

/* ======================================================================
   SECTION 3 — STONE VARIANTS
   ====================================================================== */

function VariantSelector({
  variants,
  active,
  onChange,
}: {
  variants: Product["variants"];
  active: string;
  onChange: (v: Variant) => void;
}) {
  return (
    <div>
      <h3 className="font-serif text-xl text-foreground">Stone Variants</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Select a finish to see how it transforms the stone&apos;s appearance.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {variants.map((v) => {
          const isActive = active === v.name;
          return (
            <button
              key={v.name}
              onClick={() => onChange(v)}
              aria-label={`Select ${v.label} finish`}
              aria-pressed={isActive}
              className={`group relative overflow-hidden rounded-xl border-2 text-left transition-all duration-300 ${
                isActive
                  ? "border-gold ring-1 ring-gold/30 shadow-gold"
                  : "border-border/60 hover:border-border hover:shadow-soft"
              }`}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={v.image}
                  alt={v.label}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {isActive && <div className="absolute inset-0 border-2 border-gold/20" />}
              </div>
              <div className="p-3">
                <p
                  className={`text-sm font-semibold ${isActive ? "text-gold" : "text-foreground"}`}
                >
                  {v.label}
                </p>
                <p className="mt-0.5 text-[0.65rem] leading-tight text-muted-foreground line-clamp-2">
                  {v.description}
                </p>
              </div>
              {isActive && (
                <motion.div
                  layoutId="variant-indicator"
                  className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <Check className="h-3 w-3 text-[var(--gold-foreground)]" />
                </motion.div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ======================================================================
   SECTION 4 — AVAILABLE SIZES
   ====================================================================== */

function SizeSelector({
  sizes,
  activeSize,
  activeThickness,
  onSizeChange,
  onThicknessChange,
}: {
  sizes: ProductSize[];
  activeSize: string;
  activeThickness: string;
  onSizeChange: (size: string) => void;
  onThicknessChange: (thickness: string) => void;
}) {
  const currentSize = sizes.find((s) => s.label === activeSize) ?? sizes[0];

  return (
    <div>
      <h3 className="font-serif text-xl text-foreground">Available Sizes</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Select dimensions and thickness for your project requirements.
      </p>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {sizes.map((s) => {
          const isActive = activeSize === s.label;
          return (
            <button
              key={s.label}
              onClick={() => {
                onSizeChange(s.label);
                onThicknessChange(s.thickness[0]);
              }}
              aria-label={`Select size ${s.label}`}
              aria-pressed={isActive}
              className={`rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "border-gold bg-gold/5 text-gold shadow-sm"
                  : "border-border/60 bg-card text-muted-foreground hover:border-border hover:text-foreground hover:shadow-soft"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Thickness selector */}
      {currentSize.thickness.length > 0 && currentSize.thickness[0] !== "Per specification" && (
        <div className="mt-5">
          <p className="text-sm font-medium text-foreground">Thickness</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {currentSize.thickness.map((t) => {
              const isActive = activeThickness === t;
              return (
                <button
                  key={t}
                  onClick={() => onThicknessChange(t)}
                  aria-label={`Select thickness ${t}`}
                  aria-pressed={isActive}
                  className={`rounded-md border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "border-gold bg-gold text-[var(--gold-foreground)]"
                      : "border-border/60 bg-card text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ======================================================================
   SECTION 5 — APPLICATIONS
   ====================================================================== */

const ICON_MAP: Record<string, React.ElementType> = {
  Building,
  Layout,
  Grid3x3,
  Waypoints,
  Mountain,
  Sprout,
  Layers,
  Waves,
  Church,
  Building2,
  Home,
};

function ApplicationGrid({ applications }: { applications: string[] }) {
  return (
    <div>
      <h3 className="font-serif text-xl text-foreground">Applications</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Ideal applications for this stone product.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {applications.map((app) => {
          const iconKey = APPLICATION_ICONS[app] ?? "Building";
          const Icon = ICON_MAP[iconKey] ?? Building;
          return (
            <div
              key={app}
              className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 transition-all duration-200 hover:border-gold/30 hover:shadow-soft hover:-translate-y-0.5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold transition-colors group-hover:bg-gold/20">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-foreground">{app}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ======================================================================
   SECTION 6 — TECHNICAL SPECIFICATIONS
   ====================================================================== */

function TechnicalSpecs({ specs }: { specs: Product["technicalSpecs"] }) {
  return (
    <div>
      <h3 className="font-serif text-xl text-foreground">Technical Specifications</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Performance data tested to international standards.
      </p>
      <div className="mt-5 overflow-hidden rounded-xl border border-border/60">
        <table className="w-full">
          <tbody>
            {specs.map((spec, i) => (
              <tr
                key={spec.label}
                className={`transition-colors hover:bg-muted/40 ${i % 2 === 0 ? "bg-card" : "bg-muted/20"}`}
              >
                <td className="px-5 py-3.5">
                  <span className="text-sm font-medium text-foreground">{spec.label}</span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className="text-sm text-muted-foreground">{spec.value}</span>
                  {spec.note && (
                    <span className="ml-2 text-[0.65rem] uppercase tracking-wider text-gold/70">
                      {spec.note}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======================================================================
   SECTION 7 — STONE FEATURES
   ====================================================================== */

const FEATURE_ICONS: Record<string, React.ElementType> = {
  Gem,
  Award,
  Sun,
  Shield,
  Leaf,
  Hammer,
  Ruler,
  Clock,
};

function StoneFeatures({ features }: { features: StoneFeature[] }) {
  return (
    <div>
      <h3 className="font-serif text-xl text-foreground">Stone Features</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        What makes this stone the right choice for your project.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, i) => {
          const Icon = FEATURE_ICONS[feature.icon] ?? Gem;
          return (
            <Reveal key={feature.title} delay={i * 0.03}>
              <TiltCard className="group h-full rounded-xl border border-border/60 bg-card p-5 transition-all duration-300 hover:border-gold/30 hover:shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold transition-colors group-hover:bg-gold/20">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="mt-4 font-serif text-lg text-foreground">{feature.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

/* ======================================================================
   SECTION 8 — PROJECT SHOWCASE
   ====================================================================== */

function ProjectShowcase({
  productName,
  projectSlugs,
}: {
  productName: string;
  projectSlugs: string[];
}) {
  const projects = PROJECTS.filter((p) => projectSlugs.includes(p.slug));

  if (projects.length === 0) return null;

  return (
    <div>
      <h3 className="font-serif text-xl text-foreground">Project Showcase</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        See how this stone has been specified in completed projects.
      </p>
      <div className="mt-5 -mx-1.5 overflow-x-auto pb-2">
        <div className="flex gap-5 px-1.5" style={{ scrollbarWidth: "none" }}>
          {projects.map((project, i) => (
            <Reveal key={project.slug} delay={i * 0.06}>
              <Link
                to="/projects/$slug"
                params={{ slug: project.slug }}
                className="group block w-[300px] shrink-0 overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 md:w-[340px]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold">{project.category}</p>
                  <h4 className="mt-1.5 font-serif text-lg text-foreground">{project.name}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{project.location}</p>
                  {project.architect && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Architect: {project.architect}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Stone: {project.stoneUsed ?? productName}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-gold transition-all group-hover:gap-2">
                    View Project <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ======================================================================
   SECTION 9 — RELATED PRODUCTS
   ====================================================================== */

function RelatedProducts({
  currentSlug,
  onQuickView,
}: {
  currentSlug: string;
  onQuickView: (slug: string) => void;
}) {
  const related = PRODUCTS.filter((p) => p.slug !== currentSlug).slice(0, 8);

  return (
    <div>
      <h3 className="font-serif text-xl text-foreground">Related Products</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Explore other products from our collection.
      </p>
      <div className="mt-5">
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent className="-ml-4">
            {related.map((p) => (
              <CarouselItem
                key={p.slug}
                className="basis-[85%] pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <div className="group overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-300 hover:shadow-soft">
                  <Link to="/products/$slug" params={{ slug: p.slug }} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-background/80 backdrop-blur-sm px-2.5 py-0.5 text-[0.65rem] font-medium text-foreground">
                        {p.category}
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-serif text-base text-foreground">{p.name}</h4>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {p.tagline}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1 border-t border-border/40 px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        onQuickView(p.slug);
                      }}
                      aria-label={`Quick view ${p.name}`}
                    >
                      <Eye className="h-3 w-3 mr-1" /> Quick View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      aria-label={`Compare ${p.name}`}
                    >
                      <GitCompare className="h-3 w-3 mr-1" /> Compare
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs ml-auto">
                      <Link to="/quote">Quote</Link>
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-5 flex items-center justify-center gap-3">
            <CarouselPrevious className="static translate-y-0 border-border/60 bg-card hover:bg-muted" />
            <CarouselNext className="static translate-y-0 border-border/60 bg-card hover:bg-muted" />
          </div>
        </Carousel>
      </div>
    </div>
  );
}

/* ======================================================================
   SECTION 10 — STONE COMPARISON
   ====================================================================== */

function StoneComparison({ productCategory }: { productCategory: string }) {
  const allStones = ["Sandstone", "Granite", "Marble", "Limestone", "Slate", "Quartzite"];
  const currentStone = allStones.includes(productCategory) ? productCategory : "Sandstone";

  return (
    <div>
      <h3 className="font-serif text-xl text-foreground">Stone Comparison</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        How {productCategory} compares to other natural stone types.
      </p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[600px] overflow-hidden rounded-xl border border-border/60">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">
                Property
              </th>
              {allStones.map((stone) => (
                <th
                  key={stone}
                  className={`px-5 py-4 text-center text-sm font-medium ${
                    stone === currentStone ? "text-gold" : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`${stone === currentStone ? "border-b-2 border-gold pb-0.5" : ""}`}
                  >
                    {stone}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_DATA.map((row, i) => (
              <tr
                key={row.property}
                className={`transition-colors hover:bg-muted/30 ${i % 2 === 0 ? "bg-card" : "bg-muted/10"}`}
              >
                <td className="px-5 py-3.5 text-sm font-medium text-foreground">{row.property}</td>
                {allStones.map((stone) => {
                  const val = row.values[stone] ?? "—";
                  const isCurrent = stone === currentStone;
                  return (
                    <td
                      key={stone}
                      className={`px-5 py-3.5 text-center text-sm ${
                        isCurrent ? "text-gold font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======================================================================
   SECTION 11 — DOWNLOADS
   ====================================================================== */

function Downloads({ downloads }: { downloads: DownloadItem[] }) {
  const downloadFile = (name: string, type: string) => {
    toast.success(`Preparing download`, {
      description: `${name} (${type}) — your download will start shortly.`,
    });
  };

  return (
    <div>
      <h3 className="font-serif text-xl text-foreground">Downloads</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Technical documentation and resources for this product.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {downloads.map((d, i) => (
          <Reveal key={d.name} delay={i * 0.04}>
            <button
              onClick={() => downloadFile(d.name, d.type)}
              className="group flex w-full items-start gap-4 rounded-xl border border-border/60 bg-card p-5 text-left transition-all duration-200 hover:border-gold/30 hover:shadow-soft hover:-translate-y-0.5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold transition-colors group-hover:bg-gold/20">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{d.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{d.description}</p>
                <p className="mt-1.5 text-[0.6rem] uppercase tracking-wider text-gold/70">
                  {d.type} &middot; {d.size}
                </p>
              </div>
              <Download className="mt-2 h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:text-gold group-hover:translate-y-0.5" />
            </button>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ======================================================================
   SECTION 12 — CUSTOMER CTA
   ====================================================================== */

function ExpertCTA() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-[var(--charcoal)] via-[var(--charcoal)] to-[var(--charcoal)]/90">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gold/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-gold/5 blur-3xl" />

      <div className="relative flex flex-col items-center gap-6 px-8 py-16 text-center md:py-20">
        <Reveal>
          <p className="eyebrow">Expert Guidance</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl leading-tight text-white md:text-4xl">
            Need Expert Advice?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/60">
            Our team of stone specialists can help you select the perfect finish, dimensions, and
            quantity for your project — from concept to installation.
          </p>
        </Reveal>
        <Reveal delay={0.08} className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="gold" size="lg" className="group">
            <Link to="/contact">
              Talk to Stone Expert
              <MessageCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
            </Link>
          </Button>
          <Button
            asChild
            variant="hero"
            size="lg"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Link to="/quote">
              Request Sample
              <BookOpen className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="hero"
            size="lg"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Link to="/quote">
              Request Quote
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

/* ======================================================================
   SIDEBAR
   ====================================================================== */

function Sidebar({ product, activeVariant }: { product: Product; activeVariant: Variant | null }) {
  const downloadFile = (name: string) => {
    toast.success("Preparing your download", {
      description: `${name} — your download will start shortly.`,
    });
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, text: product.tagline, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="xl:sticky xl:top-28 xl:col-start-2 xl:row-span-2 xl:self-start">
      <div className="space-y-5 rounded-xl border border-border/60 bg-card p-6 shadow-soft">
        {/* Quick specs */}
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gold font-semibold">Quick Specs</p>
          <div className="mt-3 space-y-2.5">
            <SidebarSpec label="Category" value={product.category} />
            <SidebarSpec label="Finish" value={activeVariant?.label ?? product.finishes[0]} />
            <SidebarSpec label="Color" value={product.color.split("/")[0].trim()} />
            <SidebarSpec label="Origin" value="Rajasthan, India" />
            <SidebarSpec label="Availability" value={product.availability} />
          </div>
        </div>

        <div className="h-px bg-border/60" />

        {/* Actions */}
        <div className="space-y-2.5">
          <Button asChild variant="gold" className="w-full group">
            <Link to="/quote">
              Request Quote
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => downloadFile("Technical Datasheet")}
          >
            <FileText className="h-4 w-4" /> Download PDF
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={shareProduct}>
            <Share2 className="h-4 w-4" /> Share Product
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link to="/contact">
              <MessageCircle className="h-4 w-4" /> Contact Expert
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Phone className="h-4 w-4" /> WhatsApp
          </Button>
        </div>

        {/* Trust badges */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-xs font-medium text-foreground">Why Stone India Heritage?</p>
          <ul className="mt-2 space-y-1.5">
            {[
              "35+ Countries Served",
              "ISO & CE Certified",
              "Direct from Quarry",
              "Global Shipping",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="h-3 w-3 text-gold shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SidebarSpec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}

/* ======================================================================
   MAIN PRODUCT DETAIL PAGE
   ====================================================================== */

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const [activeVariantName, setActiveVariantName] = useState(product.variants[0]?.name ?? "");
  const [activeSize, setActiveSize] = useState(product.sizes[0]?.label ?? "");
  const [activeThickness, setActiveThickness] = useState(product.sizes[0]?.thickness[0] ?? "");

  const activeVariant = product.variants.find((v) => v.name === activeVariantName) ?? null;

  const handleVariantChange = (v: Variant) => {
    setActiveVariantName(v.name);
    toast.success(`Finish changed to ${v.label}`, {
      description: v.description,
      duration: 2000,
    });
  };

  return (
    <>
      {/* Top bar */}
      <section className="pt-28">
        <div className="container-lux">
          <Breadcrumbs
            items={[{ label: "Products", to: "/products" }, { label: product.name }]}
            className="mb-4"
          />
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> All products
          </Link>
        </div>
      </section>

      {/* Main content: Gallery + Info + Sidebar */}
      <section className="py-8">
        <div className="container-lux">
          <div className="xl:grid xl:grid-cols-[1fr_360px] xl:gap-12">
            {/* Left column */}
            <div className="space-y-16">
              {/* Row: Gallery + Info */}
              <div className="grid gap-10 lg:grid-cols-2">
                <Reveal>
                  <ProductGallery
                    images={product.gallery}
                    productName={product.name}
                    activeVariant={activeVariant}
                  />
                </Reveal>
                <Reveal delay={0.06}>
                  <ProductInfo
                    product={product}
                    activeFinish={activeVariant?.label ?? product.finishes[0]}
                  />
                </Reveal>
              </div>

              {/* Section 3 — Stone Variants */}
              <Reveal>
                <VariantSelector
                  variants={product.variants}
                  active={activeVariantName}
                  onChange={handleVariantChange}
                />
              </Reveal>

              {/* Section 4 — Available Sizes */}
              <Reveal>
                <SizeSelector
                  sizes={product.sizes}
                  activeSize={activeSize}
                  activeThickness={activeThickness}
                  onSizeChange={setActiveSize}
                  onThicknessChange={setActiveThickness}
                />
              </Reveal>

              {/* Section 5 — Applications */}
              <Reveal>
                <ApplicationGrid applications={product.applications} />
              </Reveal>

              {/* Section 6 — Technical Specs */}
              <Reveal>
                <TechnicalSpecs specs={product.technicalSpecs} />
              </Reveal>

              {/* Section 7 — Stone Features */}
              <Reveal>
                <StoneFeatures features={product.features} />
              </Reveal>

              {/* Section 8 — Project Showcase */}
              <Reveal>
                <ProjectShowcase projectSlugs={product.projectSlugs} productName={product.name} />
              </Reveal>

              {/* Section 9 — Related Products */}
              <Reveal>
                <RelatedProducts
                  currentSlug={product.slug}
                  onQuickView={(slug) => {
                    const p = PRODUCTS.find((pr) => pr.slug === slug);
                    if (p) toast.info(p.name, { description: p.tagline });
                  }}
                />
              </Reveal>

              {/* Section 10 — Stone Comparison */}
              <Reveal>
                <StoneComparison productCategory={product.category} />
              </Reveal>

              {/* Section 11 — Downloads */}
              <Reveal>
                <Downloads downloads={product.downloads} />
              </Reveal>
            </div>

            {/* Sidebar */}
            <Sidebar product={product} activeVariant={activeVariant} />
          </div>
        </div>
      </section>

      {/* Section 12 — Expert CTA */}
      <section className="pb-24">
        <div className="container-lux">
          <Reveal>
            <ExpertCTA />
          </Reveal>
        </div>
      </section>

      {/* Print-only styles */}
      <style>{`
        @media print {
          header, footer, .no-print { display: none !important; }
          body { padding-top: 0 !important; }
        }
        /* Hide scrollbar for Webkit browsers (thumbnails, project showcase) */
        .gallery-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
