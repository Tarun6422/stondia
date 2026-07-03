import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download, FileText, FileArchive } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PageHero, CTASection } from "@/components/page-parts";
import { DOWNLOADS } from "@/data/site";
import texture from "@/assets/texture-stone.jpg";

export const Route = createFileRoute("/_public/downloads")({
  head: () => ({
    meta: [
      { title: "Download Center — Stone India Heritage" },
      { name: "description", content: "Download catalogs, technical specification sheets, finish guides and our sustainability report." },
    ],
  }),
  component: Downloads,
});

function Downloads() {
  return (
    <>
      <PageHero
        eyebrow="Download Center"
        title="Specs, catalogs & guides"
        intro="Everything you need to specify with confidence — technical sheets, catalogs and reports."
        image={texture}
      />
      <section className="py-20">
        <div className="container-lux grid gap-5 sm:grid-cols-2">
          {DOWNLOADS.map((d, i) => (
            <Reveal key={d.name} delay={(i % 2) * 0.06}>
              <div className="hover-lift flex items-center justify-between rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-sm bg-gold/15 text-gold">
                    {d.type === "ZIP" ? <FileArchive className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                  </span>
                  <div>
                    <h3 className="font-medium text-foreground">{d.name}</h3>
                    <p className="text-sm text-muted-foreground">{d.type} · {d.size}</p>
                  </div>
                </div>
                <button
                  onClick={() => toast.success("Preparing your download", { description: `${d.name} (${d.type}) — demo placeholder.` })}
                  aria-label={`Download ${d.name}`}
                  className="grid h-11 w-11 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold hover:text-gold">

                  <Download className="h-5 w-5" />
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <CTASection />
    </>
  );
}
