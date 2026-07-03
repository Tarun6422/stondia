import { createFileRoute } from "@tanstack/react-router";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SuccessCheck } from "@/components/animations";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { PageHero } from "@/components/page-parts";
import { CATEGORIES } from "@/data/site";
import texture from "@/assets/texture-stone.jpg";

export const Route = createFileRoute("/_public/quote")({
  head: () => ({
    meta: [
      { title: "Request a Quote — Stone India Heritage" },
      { name: "description", content: "Request a detailed quote or samples for your natural stone project. Our export team replies within one business day." },
    ],
  }),
  component: Quote,
});

function Quote() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const name = String(data.name ?? "").trim();
    const email = String(data.email ?? "").trim();
    if (!name) return toast.error("Please enter your full name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast.error("Please enter a valid email address.");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast.success("Request received", { description: "Our export team will respond within one business day." });
    }, 1100);
  };
  return (
    <>
      <PageHero
        eyebrow="Request a Quote"
        title="Get a project quote or samples"
        intro="Share your specifications and our export team will prepare a tailored quote within one business day."
        image={texture}
      />
      <section className="py-20">
        <div className="container-lux max-w-3xl">
          {sent ? (
            <Reveal>
              <div className="rounded-lg border border-border bg-card p-12 text-center">
                <SuccessCheck />
                <h2 className="mt-5 font-serif text-3xl text-foreground">Request received</h2>
                <p className="mt-3 text-muted-foreground">Thank you — our export team will be in touch within one business day.</p>
                <Button variant="gold" className="mt-6" onClick={() => setSent(false)}>Submit another request</Button>
              </div>
            </Reveal>
          ) : (
            <Reveal>
              <form
                onSubmit={handleSubmit}
                className="rounded-lg border border-border bg-card p-8"
              >
                <h2 className="font-serif text-2xl text-foreground">Project details</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field name="name" label="Full name" placeholder="Jane Architect" required />
                  <Field label="Company" placeholder="Studio Name" />
                  <Field name="email" label="Email" type="email" placeholder="jane@studio.com" required />
                  <Field label="Phone" placeholder="+00 000 000 000" />
                  <Field label="Country" placeholder="United Kingdom" />
                  <div>
                    <label className="text-sm font-medium text-foreground">Product category</label>
                    <select className="mt-1.5 w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold">
                      <option value="">Select a category</option>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <Field label="Estimated quantity" placeholder="e.g. 500 m²" />
                  <Field label="Target date" type="date" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <input id="samples" type="checkbox" className="h-4 w-4 accent-[var(--gold)]" />
                  <label htmlFor="samples" className="text-sm text-muted-foreground">I'd also like to receive physical samples</label>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-foreground">Project description</label>
                  <textarea rows={5} placeholder="Describe your project, finishes and specifications…" className="mt-1.5 w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
                </div>
                <Button type="submit" variant="gold" size="lg" className="mt-6 w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {loading ? "Submitting…" : "Submit Request"}
                </Button>
              </form>
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}

function Field({ name, label, type = "text", placeholder, required }: { name?: string; label: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}{required && <span className="text-gold"> *</span>}</label>
      <input name={name} type={type} placeholder={placeholder} required={required} className="mt-1.5 w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold" />
    </div>
  );
}
