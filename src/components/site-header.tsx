import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Search, ChevronDown, ArrowUpRight } from "lucide-react";
import { MEGA_MENU, COMPANY, PRODUCTS } from "@/data/site";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchOverlay } from "@/components/search-overlay";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const featured = PRODUCTS[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !/(input|textarea|select)/i.test((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-xl py-3 shadow-soft"
          : "py-5"
      }`}
      onMouseLeave={() => setOpenMenu(null)}
    >
      <div className="container-lux flex items-center justify-between gap-4">
        <Link to="/" className="group flex items-center gap-3 shrink-0">
          <span className="grid h-10 w-10 place-items-center rounded-sm bg-primary text-primary-foreground font-serif text-xl leading-none">
            S
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-lg tracking-tight text-foreground">
              {COMPANY.short}
            </span>
            <span className="text-[0.6rem] uppercase tracking-[0.22em] text-gold">
              Heritage
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {MEGA_MENU.map((item) => (
            <div key={item.label} onMouseEnter={() => setOpenMenu(item.groups ? item.label : null)}>
              <Link
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="inline-flex items-center gap-1 rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {item.label}
                {item.groups && <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
              </Link>
            </div>
          ))}
        </nav>

        <div className="hidden items-center gap-1 lg:flex">
          <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <Button asChild variant="gold" size="sm" className="ml-1">
            <Link to="/quote">Request Quote</Link>
          </Button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 lg:hidden">
          <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <div className="mt-6 flex flex-col gap-1">
                {MEGA_MENU.map((item) => (
                  <div key={item.label}>
                    <SheetClose asChild>
                      <Link
                        to={item.to}
                        className="block rounded-sm px-3 py-3 text-base font-medium text-foreground/90 transition-colors hover:bg-muted"
                        activeProps={{ className: "text-gold" }}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                    {item.groups && (
                      <div className="ml-3 flex flex-col border-l border-border pl-3">
                        {item.groups.flatMap((g) => g.links).map((l) => (
                          <SheetClose asChild key={l.label + l.to}>
                            <Link
                              to={l.to}
                              className="rounded-sm px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                              {l.label}
                            </Link>
                          </SheetClose>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <SheetClose asChild>
                  <Button asChild variant="gold" className="mt-4">
                    <Link to="/quote">Request Quote</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mega menu panel */}
      <AnimatePresence>
        {openMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-full hidden lg:block"
          >
            <div className="container-lux pt-2">
              <div className="overflow-hidden rounded-xl border border-border bg-popover shadow-elegant">
                <div className="grid grid-cols-[1.4fr_1fr]">
                  <div className="grid grid-cols-2 gap-8 p-8">
                    {MEGA_MENU.find((m) => m.label === openMenu)?.groups?.map((g) => (
                      <div key={g.title}>
                        <p className="eyebrow mb-3">{g.title}</p>
                        <ul className="space-y-1">
                          {g.links.map((l) => (
                            <li key={l.label + l.to}>
                              <Link
                                to={l.to}
                                onClick={() => setOpenMenu(null)}
                                className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              >
                                {l.label}
                                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/products/$slug"
                    params={{ slug: featured.slug }}
                    onClick={() => setOpenMenu(null)}
                    className="group relative flex flex-col justify-end overflow-hidden p-8 text-white"
                  >
                    <img
                      src={featured.image}
                      alt={featured.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="relative">
                      <p className="text-xs uppercase tracking-[0.15em] text-gold">Featured</p>
                      <h3 className="mt-1 font-serif text-2xl">{featured.name}</h3>
                      <p className="mt-1 text-sm text-white/75">{featured.tagline}</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
