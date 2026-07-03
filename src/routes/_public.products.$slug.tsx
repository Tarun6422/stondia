import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Download, FileText, ArrowLeft, Check, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { CTASection } from "@/components/page-parts";
import { Breadcrumbs, breadcrumbSchema } from "@/components/breadcrumbs";
import { PRODUCTS } from "@/data/site";

export const Route = createFileRoute("/_public/products/$slug")({
  loader: ({ params }) => {
    const product = PRODUCTS.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData, params }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Stone India Heritage` },
          { name: "description", content: loaderData.product.tagline },
          { property: "og:title", content: loaderData.product.name },
          { property: "og:description", content: loaderData.product.tagline },
          { property: "og:type", content: "product" },
          { property: "og:image", content: loaderData.product.image },
          { property: "og:url", content: `/products/${params.slug}` },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:image", content: loaderData.product.image },
        ]
      : [{ title: "Product not found — Stone India Heritage" }, { name: "robots", content: "noindex" }],
    links: loaderData ? [{ rel: "canonical", href: `/products/${params.slug}` }] : [],
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: loaderData.product.name,
              description: loaderData.product.tagline,
              image: loaderData.product.image,
              category: loaderData.product.category,
              brand: { "@type": "Brand", name: "Stone India Heritage" },
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

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const related = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 3);
  const gallery = [product.image, product.image, product.image, product.image];

  const [activeImg, setActiveImg] = useState(0);
  const [finish, setFinish] = useState(product.finishes[0]);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });

  const downloadPdf = () =>
    toast.success("Preparing your download", {
      description: `${product.name} technical sheet (PDF) — this is a demo placeholder.`,
    });

  return (
    <>
      <section className="pt-28">
        <div className="container-lux">
          <Breadcrumbs
            items={[{ label: "Products", to: "/products" }, { label: product.name }]}
            className="mb-6"
          />
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> All products
          </Link>

          <div className="mt-8 grid gap-12 lg:grid-cols-2">
            <Reveal>
              <div
                className="relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-lg border border-border"
                onMouseEnter={() => setZoom((z) => ({ ...z, active: true }))}
                onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setZoom({
                    active: true,
                    x: ((e.clientX - r.left) / r.width) * 100,
                    y: ((e.clientY - r.top) / r.height) * 100,
                  });
                }}
              >
                <img
                  src={gallery[activeImg]}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-200"
                  style={{
                    transform: zoom.active ? "scale(1.8)" : "scale(1)",
                    transformOrigin: `${zoom.x}% ${zoom.y}%`,
                  }}
                />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`overflow-hidden rounded-md border-2 transition-all ${
                      i === activeImg ? "border-gold" : "border-border opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            </Reveal>

            <div>
              <p className="eyebrow mb-2">{product.category}</p>
              <h1 className="font-serif text-4xl text-foreground md:text-5xl">{product.name}</h1>
              <p className="mt-4 text-lg text-muted-foreground">{product.tagline}</p>

              <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
                <SpecCell label="Dimensions" value={product.dimensions} />
                <SpecCell label="Thickness" value={product.thickness} />
                <SpecCell label="Weight" value={product.weight} />
                <SpecCell label="Selected Finish" value={finish} />
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-foreground">Select a finish</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.finishes.map((f: string) => (
                    <button
                      key={f}
                      onClick={() => setFinish(f)}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                        finish === f
                          ? "border-gold bg-gold text-[var(--gold-foreground)]"
                          : "border-border bg-secondary/50 text-foreground hover:border-gold"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-foreground">Applications</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {product.applications.map((a: string) => (
                    <span key={a} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-gold" /> {a}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild variant="gold" size="lg">
                  <Link to="/quote">Request Quote</Link>
                </Button>
                <Button variant="outline" size="lg" onClick={downloadPdf}>
                  <Download className="h-4 w-4" /> Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-lux grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl text-foreground">Technical Specifications</h2>
            <div className="mt-6 overflow-hidden rounded-lg border border-border">
              {product.specs.map((s: { label: string; value: string }, i: number) => (
                <div
                  key={s.label}
                  className={`flex items-center justify-between px-6 py-4 text-sm ${i % 2 ? "bg-card" : "bg-secondary/40"}`}
                >
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-foreground">Documentation</h2>
            <div className="mt-6 space-y-3">
              {["Technical Specification Sheet", "Finish & Colour Guide", "Installation Guidelines"].map((d) => (
                <button
                  key={d}
                  onClick={downloadPdf}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-6 py-4 text-left transition-colors hover:border-gold"
                >
                  <span className="flex items-center gap-3 text-sm text-foreground">
                    <FileText className="h-4 w-4 text-gold" /> {d}
                  </span>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-lux">
          <h2 className="font-serif text-3xl text-foreground">Related products</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.06}>
                <Link
                  to="/products/$slug"
                  params={{ slug: p.slug }}
                  className="hover-lift group block overflow-hidden rounded-lg border border-border bg-card"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-[0.15em] text-gold">{p.category}</p>
                    <h3 className="mt-1 font-serif text-xl text-foreground">{p.name}</h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-gold">
                      View details <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}

function SpecCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
