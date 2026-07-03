import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Linkedin, Instagram, Facebook } from "lucide-react";
import { COMPANY, FOOTER_LINKS } from "@/data/site";

export function SiteFooter() {
  return (
    <footer className="bg-[var(--charcoal)] text-[oklch(0.9_0.01_85)]">
      <div className="container-lux py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-sm bg-gold text-[var(--gold-foreground)] font-serif text-xl">
                S
              </span>
              <span className="font-serif text-xl">{COMPANY.name}</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[oklch(0.75_0.01_85)]">
              Premium manufacturer and global exporter of Rajasthan Sandstone
              and architectural natural stones — where heritage craftsmanship
              meets modern precision.
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
