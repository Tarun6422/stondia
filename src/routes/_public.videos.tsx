import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PageHero, CTASection } from "@/components/page-parts";
import { Breadcrumbs } from "@/components/breadcrumbs";
import factory from "@/assets/factory.jpg";
import villa from "@/assets/project-villa.jpg";
import sustainability from "@/assets/sustainability.jpg";
import texture from "@/assets/texture-stone.jpg";

export const Route = createFileRoute("/_public/videos")({
  head: () => ({
    meta: [
      { title: "Videos — Stone India Heritage" },
      { name: "description", content: "Watch our quarrying, manufacturing and craftsmanship stories in motion." },
      { property: "og:title", content: "Videos — Stone India Heritage" },
      { property: "og:url", content: "/videos" },
    ],
    links: [{ rel: "canonical", href: "/videos" }],
  }),
  component: Videos,
});

const VIDEOS = [
  { title: "Inside Our Quarries", duration: "3:42", image: sustainability, cat: "Sustainability", embed: "https://www.youtube.com/embed/ScMzIvxBSi4" },
  { title: "Precision Manufacturing Tour", duration: "5:18", image: factory, cat: "Factory", embed: "https://www.youtube.com/embed/aqz-KE-bpKQ" },
  { title: "The Art of Hand Carving", duration: "4:05", image: texture, cat: "Heritage", embed: "https://www.youtube.com/embed/ScMzIvxBSi4" },
  { title: "Project Spotlight: Desert Villa", duration: "2:56", image: villa, cat: "Projects", embed: "https://www.youtube.com/embed/aqz-KE-bpKQ" },
];

function Videos() {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  const current = active !== null ? VIDEOS[active] : null;

  return (
    <>
      <PageHero
        eyebrow="Videos"
        title="Our craft, in motion"
        intro="Go behind the scenes across our quarries, factory floor and finished landmarks."
        image={factory}
      />
      <section className="py-16">
        <div className="container-lux">
          <Breadcrumbs items={[{ label: "Videos" }]} className="mb-8" />
          <div className="grid gap-8 md:grid-cols-2">
            {VIDEOS.map((v, i) => (
              <Reveal key={v.title} delay={(i % 2) * 0.08}>
                <button
                  onClick={() => setActive(i)}
                  aria-label={`Play ${v.title}`}
                  className="group relative block w-full overflow-hidden rounded-lg border border-border text-left"
                >
                  <div className="aspect-video overflow-hidden">
                    <img src={v.image} alt={v.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="absolute inset-0 grid place-items-center bg-black/30 transition-colors group-hover:bg-black/45">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-gold text-[var(--gold-foreground)] shadow-lg transition-transform group-hover:scale-110">
                      <Play className="h-6 w-6 translate-x-0.5 fill-current" />
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/85 to-transparent p-5 text-white">
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-gold">{v.cat}</p>
                      <h3 className="mt-1 font-serif text-xl">{v.title}</h3>
                    </div>
                    <span className="text-sm text-white/80">{v.duration}</span>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label={current.title}
          >
            <button
              onClick={() => setActive(null)}
              aria-label="Close video"
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              className="w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video bg-black">
                <iframe
                  src={`${current.embed}?autoplay=1&rel=0`}
                  title={current.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="flex items-center justify-between bg-card px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-gold">{current.cat}</p>
                  <h3 className="mt-0.5 font-serif text-lg text-foreground">{current.title}</h3>
                </div>
                <span className="text-sm text-muted-foreground">{current.duration}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CTASection />
    </>
  );
}
