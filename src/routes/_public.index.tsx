import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  
  Leaf,
  ShieldCheck,
  Globe2,
  Gem,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, Counter } from "@/components/motion";
import { ExportMap, TiltCard, TestimonialCarousel } from "@/components/animations";
import { SectionHeading, CTASection } from "@/components/page-parts";
import {
  COMPANY,
  USPS,
  PRODUCTS,
  PROJECTS,
  STATS,
  TESTIMONIALS,
  POSTS,
  COUNTRIES,
  SUSTAINABILITY_POINTS,
} from "@/data/site";
import hero from "@/assets/hero-sandstone.jpg";
import factory from "@/assets/factory.jpg";
import sustainability from "@/assets/sustainability.jpg";

export const Route = createFileRoute("/_public/")({
  component: Home,
});

function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <>
      {/* HERO */}
      <section ref={heroRef} className="relative flex min-h-screen items-center overflow-hidden">
        <motion.div style={{ y, scale }} className="absolute inset-0">
          <img
            src={hero}
            alt="Rajasthan sandstone palace facade at golden hour"
            className="h-full w-full object-cover"
            width={1920}
            height={1280}
          />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        </motion.div>

        <div className="container-lux relative z-10 pt-24">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="eyebrow mb-5"
          >
            {COMPANY.tagline}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl font-serif text-5xl leading-[1.02] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl text-balance"
          >
            Rajasthan Sandstone, crafted for the world.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/85"
          >
            Premium manufacturer and global exporter of heritage sandstone and
            architectural natural stone — uniting timeless craftsmanship with
            modern precision.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Button asChild variant="gold" size="xl">
              <Link to="/catalog">
                Explore Digital Catalog <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="hero" size="xl">
              <Link to="/quote">Request a Quote</Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[0.65rem] uppercase tracking-[0.3em] text-white/60"
        >
          Scroll to discover
        </motion.div>
      </section>

      {/* INTRO + STATS */}
      <section className="py-24">
        <div className="container-lux grid gap-12 lg:grid-cols-2 lg:items-center">
          <SectionHeading
            eyebrow="Company Introduction"
            title="A heritage of stone, engineered for a global future"
            intro="Stone India Heritage combines traditional Indian craftsmanship with modern manufacturing technology to deliver high-quality stone solutions for architects, builders, developers, landscape designers and international importers."
          />
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
              {STATS.map((s) => (
                <div key={s.label} className="bg-card p-8">
                  <div className="font-serif text-4xl text-foreground md:text-5xl">
                    <Counter value={s.value} suffix={s.suffix} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURED HERITAGE SANDSTONES */}
      <section className="bg-secondary/50 py-24">
        <div className="container-lux">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Featured Heritage Sandstones"
              title="Signature stones & architectural products"
            />
            <Reveal delay={0.1}>
              <Button asChild variant="outline">
                <Link to="/products">
                  View all products <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.slice(0, 6).map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.08}>
                <Link
                  to="/products/$slug"
                  params={{ slug: p.slug }}
                  className="hover-lift group block overflow-hidden rounded-lg border border-border bg-card"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
                      {p.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl text-foreground">{p.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold">
                      View details <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHY STONE INDIA */}
      <section className="py-24">
        <div className="container-lux">
          <SectionHeading
            center
            eyebrow="Why Stone India"
            title="Uncompromising quality, from quarry to site"
            intro="Every slab reflects our commitment to heritage, precision and global excellence."
          />
          <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {USPS.map((u, i) => {
              const Icon = [Gem, Leaf, ShieldCheck, Globe2, Gem, Globe2][i % 6];
              return (
                <Reveal key={u.title} delay={(i % 3) * 0.06}>
                  <div className="h-full bg-card p-8 transition-colors hover:bg-secondary/50">
                    <div className="mb-4 grid h-11 w-11 place-items-center rounded-sm bg-gold/15 text-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-serif text-xl text-foreground">{u.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {u.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* MANUFACTURING EXCELLENCE */}
      <section className="relative overflow-hidden bg-[var(--charcoal)] py-24 text-white">
        <div className="container-lux grid gap-14 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="overflow-hidden rounded-lg">
              <img
                src={factory}
                alt="Precision stone manufacturing facility"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <div>
            <p className="eyebrow mb-3">Manufacturing Excellence</p>
            <h2 className="font-serif text-3xl leading-tight sm:text-4xl md:text-5xl text-balance">
              Modern technology meets the hand of the artisan
            </h2>
            <p className="mt-5 text-white/70">
              Our facility blends multi-wire sawing, CNC finishing and
              time-honoured hand carving — all under one roof, calibrated to
              export tolerances and verified by rigorous quality assurance.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Precision CNC & multi-wire calibration",
                "Master artisan hand-carving studio",
                "In-house quality assurance & testing",
                "International seaworthy packaging",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/85">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild variant="gold" className="mt-9">
              <Link to="/manufacturing">
                See our process <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SUSTAINABILITY */}
      <section className="py-24">
        <div className="container-lux grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Sustainability"
              title="Responsible stone for a lasting planet"
              intro="Natural stone is inherently durable, recyclable and low-maintenance. We go further — with water recycling, waste reduction and eco-friendly manufacturing."
            />
            <div className="mt-8 flex flex-wrap gap-2">
              {SUSTAINABILITY_POINTS.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-foreground/80"
                >
                  {p}
                </span>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-9">
              <Link to="/sustainability">Our commitment</Link>
            </Button>
          </div>
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-lg">
              <img
                src={sustainability}
                alt="Sustainable sandstone quarry"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* EXPORT COUNTRIES */}
      <section className="bg-secondary/50 py-24">
        <div className="container-lux">
          <SectionHeading
            center
            eyebrow="Global Reach"
            title="Trusted across 35+ countries"
            intro="From private estates to government projects, our stone travels the world in export-grade packaging."
          />
          <ExportMap />
          <Reveal delay={0.2}>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {COUNTRIES.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium text-foreground/80"
                >
                  {c}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="py-24">
        <div className="container-lux">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Featured Projects" title="Where our stone lives" />
            <Reveal delay={0.1}>
              <Button asChild variant="outline">
                <Link to="/projects">
                  All projects <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Reveal>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {PROJECTS.slice(0, 4).map((p, i) => (
              <Reveal key={p.slug} delay={(i % 2) * 0.08}>
                <TiltCard>
                  <Link
                    to="/projects/$slug"
                    params={{ slug: p.slug }}
                    className="group relative block overflow-hidden rounded-lg glow-gold"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div
                      className="absolute bottom-0 p-7 text-white"
                      style={{ transform: "translateZ(40px)" }}
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-gold">
                        {p.category}
                      </p>
                      <h3 className="mt-1 font-serif text-2xl">{p.name}</h3>
                      <p className="text-sm text-white/70">{p.location} · {p.year}</p>
                    </div>
                  </Link>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[var(--charcoal)] py-24 text-white">
        <div className="container-lux">
          <SectionHeading center eyebrow="Testimonials" title="Words from our partners" />
          <TestimonialCarousel items={TESTIMONIALS} />

        </div>
      </section>

      {/* LATEST ARTICLES */}
      <section className="py-24">
        <div className="container-lux">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Latest Articles" title="From the journal" />
            <Reveal delay={0.1}>
              <Button asChild variant="outline">
                <Link to="/blog">
                  Read the blog <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Reveal>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {POSTS.map((post, i) => (
              <Reveal key={post.slug} delay={i * 0.08}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="hover-lift group block overflow-hidden rounded-lg border border-border bg-card"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-gold">
                      {post.category} · {post.date}
                    </p>
                    <h3 className="mt-2 font-serif text-xl text-foreground">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
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
