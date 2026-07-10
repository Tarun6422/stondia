import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Linkedin, Instagram, Facebook, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { COMPANY, FOOTER_LINKS } from "@/data/site";
import { api, ApiError } from "@/lib/api";

export function SiteFooter() {
  return (
    <footer className="bg-[var(--charcoal)] text-[oklch(0.9_0.01_85)]">
      <div className="container-lux py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            {/* Newsletter subscription */}
            <div className="mb-8">
              <h4 className="font-serif text-lg text-white">Stay in touch</h4>
              <p className="mt-1 text-sm text-[oklch(0.72_0.01_85)]">
                Receive project inspiration, new arrivals, and industry insights.
              </p>
              <NewsletterForm />
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-sm bg-gold text-[var(--gold-foreground)] font-serif text-xl">
                S
              </span>
              <span className="font-serif text-xl">{COMPANY.name}</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[oklch(0.75_0.01_85)]">
              Premium manufacturer and global exporter of Rajasthan Sandstone and architectural
              natural stones — where heritage craftsmanship meets modern precision.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[oklch(0.8_0.01_85)]">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                {COMPANY.address}
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                {COMPANY.phone}
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-gold" />
                {COMPANY.email}
              </li>
            </ul>
            <div className="mt-6 flex gap-3">
              {[Linkedin, Instagram, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-sm border border-white/15 text-[oklch(0.85_0.01_85)] transition-colors hover:border-gold hover:text-gold"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-serif text-lg text-white">{title}</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-[oklch(0.78_0.01_85)] transition-colors hover:text-gold"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-lux flex flex-col items-center justify-between gap-3 py-6 text-xs text-[oklch(0.65_0.01_85)] sm:flex-row">
          <p>
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>
          <p>{COMPANY.tagline}</p>
        </div>
      </div>
    </footer>
  );
}

/* ── Newsletter Form ── */
function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/subscribers", { email: email.trim() });
      setSubscribed(true);
      setEmail("");
      toast.success("Subscribed!", {
        description: "You'll receive updates from Stone India Heritage.",
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Subscription failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        disabled={subscribed}
        className="h-9 flex-1 rounded-md border border-white/20 bg-white/5 px-3 text-xs text-white outline-none placeholder:text-white/40 focus:border-gold/50 focus:ring-1 focus:ring-gold/30 disabled:opacity-50"
        aria-label="Email for newsletter"
      />
      <button
        type="submit"
        disabled={loading || subscribed}
        className="flex h-9 items-center gap-1.5 rounded-md bg-gold px-3 text-xs font-medium text-[var(--gold-foreground)] transition-all hover:opacity-90 disabled:opacity-50 shrink-0"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : subscribed ? (
          "✓"
        ) : (
          "Subscribe"
        )}
      </button>
    </form>
  );
}
