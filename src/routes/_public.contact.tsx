import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { PageHero } from "@/components/page-parts";
import { COMPANY } from "@/data/site";
import factory from "@/assets/factory.jpg";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(1, "Message is required").max(1000),
});

export const Route = createFileRoute("/_public/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Stone India Heritage" },
      { name: "description", content: "Get in touch with our global export team for quotes, samples and partnership enquiries." },
    ],
  }),
  component: Contact,
});

const OFFICES = [
  { city: "Jodhpur, India", role: "Head Office & Factory", detail: COMPANY.address },
  { city: "Dubai, UAE", role: "Middle East Sales", detail: "Sheikh Zayed Road, Dubai" },
  { city: "London, UK", role: "Europe Liaison", detail: "Mayfair, London W1" },
];

function Contact() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      form.reset();
      toast.success("Message sent", { description: "Our export team will reply within one business day." });
    }, 1100);
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk stone"
        intro="Our export team responds within one business day, wherever you are in the world."
        image={factory}
      />
      <section className="py-20">
        <div className="container-lux grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <div className="space-y-8">
              <div className="space-y-4">
                <ContactRow icon={Mail} label="Email" value={COMPANY.email} />
                <ContactRow icon={Phone} label="Phone" value={COMPANY.phone} />
                <ContactRow icon={MapPin} label="Head Office" value={COMPANY.address} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {OFFICES.map((o) => (
                  <div key={o.city} className="rounded-lg border border-border bg-card p-5">
                    <p className="font-serif text-lg text-foreground">{o.city}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-gold">{o.role}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{o.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-8">
              <h2 className="font-serif text-2xl text-foreground">Send us a message</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field name="name" label="Full name" placeholder="Jane Architect" />
                <Field name="company" label="Company" placeholder="Studio Name" />
                <Field name="email" label="Email" type="email" placeholder="jane@studio.com" />
                <Field name="country" label="Country" placeholder="United Kingdom" />
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-foreground">Message</label>
                <textarea name="message" rows={5} placeholder="Tell us about your project…" className="mt-1.5 w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
              </div>
              <Button type="submit" variant="gold" size="lg" className="mt-6 w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {loading ? "Sending…" : "Send Message"}
              </Button>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function ContactRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-gold/15 text-gold">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-foreground">{value}</p>
      </div>
    </div>
  );
}

function Field({ name, label, type = "text", placeholder }: { name?: string; label: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input name={name} type={type} placeholder={placeholder} className="mt-1.5 w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold" />
    </div>
  );
}
