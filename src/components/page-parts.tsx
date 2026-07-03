import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  center,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={`${center ? "mx-auto text-center" : ""} max-w-2xl ${className ?? ""}`}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl text-balance">
        {title}
      </h2>
      {intro && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {intro}
        </p>
      )}
    </Reveal>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  image,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
}) {
  return (
    <section className="relative flex min-h-[54vh] items-end overflow-hidden pt-28">
      <div className="absolute inset-0">
        <img src={image} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      </div>
      <div className="container-lux relative z-10 pb-16">
        <Reveal>
          <p className="eyebrow mb-4">{eyebrow}</p>
          <h1 className="max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl text-balance">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
            {intro}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="bg-[var(--charcoal)] py-20 text-white">
      <div className="container-lux flex flex-col items-center gap-6 text-center">
        <Reveal>
          <p className="eyebrow mb-3">Let's Build Something Timeless</p>
          <h2 className="mx-auto max-w-2xl font-serif text-3xl leading-tight sm:text-4xl md:text-5xl text-balance">
            Request a quote or a sample of Rajasthan's finest sandstone
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Share your project specifications and our export team will respond
            within one business day.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-2 flex flex-wrap justify-center gap-3">
          <Button asChild variant="gold" size="lg">
            <Link to="/quote">Request Quote</Link>
          </Button>
          <Button asChild variant="hero" size="lg">
            <Link to="/catalog">Explore Catalog</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
