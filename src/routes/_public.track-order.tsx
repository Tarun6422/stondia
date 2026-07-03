import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Package, Ship, Truck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { PageHero } from "@/components/page-parts";
import texture from "@/assets/texture-stone.jpg";

export const Route = createFileRoute("/_public/track-order")({
  head: () => ({
    meta: [
      { title: "Track Order — Stone India Heritage" },
      { name: "description", content: "Track the status of your natural stone shipment from factory to destination port." },
    ],
  }),
  component: TrackOrder,
});

const STAGES = [
  { icon: CheckCircle2, label: "Order Confirmed", done: true },
  { icon: Package, label: "In Production", done: true },
  { icon: Package, label: "Packed & Crated", done: true },
  { icon: Ship, label: "In Transit", done: false },
  { icon: Truck, label: "Delivered", done: false },
];

function TrackOrder() {
  const [show, setShow] = useState(false);
  return (
    <>
      <PageHero
        eyebrow="Track Order"
        title="Follow your shipment"
        intro="Enter your order reference to view real-time status from factory to port."
        image={texture}
      />
      <section className="py-20">
        <div className="container-lux max-w-2xl">
          <Reveal>
            <form onSubmit={(e) => { e.preventDefault(); setShow(true); }} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6 sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-md border border-border bg-background px-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input placeholder="e.g. SIH-2026-04821" className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              </div>
              <Button type="submit" variant="gold">Track</Button>
            </form>
          </Reveal>

          {show && (
            <Reveal>
              <div className="mt-8 rounded-lg border border-border bg-card p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Order</p>
                    <p className="font-serif text-xl text-foreground">SIH-2026-04821</p>
                  </div>
                  <span className="rounded-full bg-gold/15 px-4 py-1.5 text-sm font-medium text-gold">In Transit</span>
                </div>
                <div className="mt-10 space-y-0">
                  {STAGES.map((s, i) => (
                    <div key={s.label} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className={`grid h-10 w-10 place-items-center rounded-full ${s.done ? "bg-gold text-[var(--gold-foreground)]" : "border border-border bg-background text-muted-foreground"}`}>
                          <s.icon className="h-5 w-5" />
                        </span>
                        {i < STAGES.length - 1 && <span className={`h-10 w-px ${s.done ? "bg-gold" : "bg-border"}`} />}
                      </div>
                      <div className="pt-2">
                        <p className={`font-medium ${s.done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
