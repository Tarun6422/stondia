import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, ChevronDown, ArrowUpRight, ChevronRight, LogIn, User, LayoutDashboard } from "lucide-react";
import { MEGA_MENU, COMPANY } from "@/data/site";
import type { MegaMenuItem } from "@/data/site";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchOverlay } from "@/components/search-overlay";
import { useAuth } from "@/lib/auth-context";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

/* ------------------------------------------------------------------ */
/*  Hover-aware mega menu opener — manages open/close with delay      */
/* ------------------------------------------------------------------ */
function useMegaMenu() {
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const open = (label: string) => {
    clearTimeout(timer.current);
    setOpenLabel(label);
  };

  const close = (delay = 100) => {
    timer.current = setTimeout(() => setOpenLabel(null), delay);
  };

  const cancelClose = () => clearTimeout(timer.current);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { openLabel, open, close, cancelClose };
}

/* ------------------------------------------------------------------ */
/*  Individual nav link (top-level bar item)                          */
/* ------------------------------------------------------------------ */
function NavLink({
  item,
  index,
  isActive,
  onOpen,
  onClose,
  onCancelClose,
  onFocus,
  focusIndex,
}: {
  item: MegaMenuItem;
  index: number;
  isActive: boolean;
  onOpen: () => void;
  onClose: () => void;
  onCancelClose: () => void;
  onFocus: () => void;
  focusIndex: number;
}) {
  const hasDropdown = !!item.groups;

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <Link
        to={item.to}
        role="menuitem"
        tabIndex={focusIndex === index ? 0 : focusIndex === -1 && index === 0 ? 0 : -1}
        activeOptions={{ exact: item.to === "/" }}            className={`group relative inline-flex items-center gap-1.5 rounded-md px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--charcoal)] ${
          isActive
            ? "text-white"
            : "text-white/65 hover:text-white"
        }`}
        activeProps={{ className: "text-white" }}
        onMouseEnter={onCancelClose}
        onFocus={onFocus}
        aria-haspopup={hasDropdown ? "menu" : undefined}
        aria-expanded={hasDropdown ? isActive : undefined}
      >
        {item.label}
        {/* Gold underline indicator */}
        <span
          className={`absolute inset-x-4 -bottom-px h-[2.5px] origin-left rounded-full bg-gold transition-all duration-300 ease-out ${
            isActive
              ? "scale-x-100 opacity-100 shadow-[0_0_6px_-1px_var(--gold)]"
              : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
          }`}
        />
        {hasDropdown && (
          <motion.span
            animate={{ rotate: isActive ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-3.5 w-3.5 text-white/60" />
          </motion.span>
        )}
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mega menu dropdown panel                                          */
/* ------------------------------------------------------------------ */
function MegaPanel({
  item,
  onClose,
}: {
  item: MegaMenuItem;
  onClose: () => void;
}) {
  const columns = item.groups?.length ?? 1;

  const colGridClasses: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };
  const gridClass = colGridClasses[columns] ?? "grid-cols-2 md:grid-cols-4";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      data-mega-panel
      role="menu"
      className="absolute left-0 top-full hidden w-screen lg:block"
      onMouseEnter={() => {}}
      onMouseLeave={onClose}
    >
      <div className="container-lux pt-2">
        <div      className="overflow-hidden rounded-2xl border border-gold/15 bg-background/95 backdrop-blur-2xl shadow-[0_24px_60px_-20px_oklch(0.3_0.05_65/0.45)]">
          <div
            className={`grid ${gridClass} ${
              item.featured ? "lg:grid-cols-[1fr_340px]" : ""
            }`}
          >

            {/* Link columns */}
            <div className={`grid ${gridClass} gap-6 p-8`}>
              {item.groups?.map((g) => (
                <div key={g.title}>
                  <p className="eyebrow mb-4 flex items-center gap-2">
                    <span className="h-px flex-1 bg-gold/25" />
                    {g.title}
                  </p>
                  <ul className="space-y-0.5">
                    {g.links.map((l) => (
                      <li key={l.label + l.to}>
                        <Link
                          to={l.to}
                          onClick={onClose}
                          className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-muted-foreground/80 transition-all duration-300 hover:bg-gold/[0.08] hover:text-foreground hover:pl-4"
                        >
                          {l.label}
                          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:opacity-50" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Featured card */}
            {item.featured && (
              <Link
                to={item.featured.to}
                params={item.featured.params as never}
                onClick={onClose}
                className="group relative hidden flex-col justify-end overflow-hidden lg:flex"
              >
                <img
                  src={item.featured.image}
                  alt={item.featured.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="relative p-8">
                  <p className="text-xs uppercase tracking-[0.18em] text-gold">
                    Featured
                  </p>
                  <h3 className="mt-2 font-serif text-xl text-white">
                    {item.featured.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                    {item.featured.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold transition-all group-hover:gap-2.5">
                    View Collection
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile accordion item                                             */
/* ------------------------------------------------------------------ */
function MobileAccordionItem({
  item,
  onClose,
}: {
  item: MegaMenuItem;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasGroups = !!item.groups && item.groups.length > 0;

  return (
    <div>
      {hasGroups ? (
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-lg px-4 py-4 text-base font-medium text-foreground/90 transition-colors hover:bg-muted/50 active:bg-muted/70"
          aria-expanded={open}
        >
          {item.label}
          <motion.span
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </motion.span>
        </button>
      ) : (
        <SheetClose asChild>
          <Link
            to={item.to}
            className="block rounded-lg px-4 py-4 text-base font-medium text-foreground/90 transition-colors hover:bg-muted/50"
            activeProps={{ className: "text-gold" }}
          >
            {item.label}
          </Link>
        </SheetClose>
      )}

      <AnimatePresence>
        {hasGroups && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-5 border-l border-border/50 pl-5 pb-2 space-y-0.5">
              {item.groups?.map((g) => (
                <div key={g.title} className="mt-4">
                  <p className="text-[0.6rem] uppercase tracking-[0.22em] text-gold font-semibold mb-1.5 px-2">
                    {g.title}
                  </p>
                  {g.links.map((l) => (
                    <SheetClose asChild key={l.label + l.to}>
                      <Link
                        to={l.to}
                        className="block rounded-lg px-3 py-3 text-sm text-muted-foreground/80 transition-colors hover:text-foreground hover:bg-muted/40"
                      >
                        {l.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile authenticated links — dashboard & profile for mobile drawer */
/* ------------------------------------------------------------------ */
function MobileAuthenticatedLinks() {
  const { user, loading } = useAuth();
  if (loading || !user) return null;
  return (
    <>
      <SheetClose asChild>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/50"
        >
          <LayoutDashboard className="h-4 w-4" />
          My Dashboard
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link
          to="/profile"
          className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/50"
        >
          <User className="h-4 w-4" />
          Profile
        </Link>
      </SheetClose>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile auth — sign in/out link for mobile drawer                  */
/* ------------------------------------------------------------------ */
function MobileAuth() {
  const { user, loading, logout } = useAuth();

  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gold/20 text-xs font-semibold text-gold">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground truncate max-w-[160px]">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[160px]">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <SheetClose asChild>
      <Link
        to="/login"
        className="flex items-center justify-center gap-2 rounded-lg border border-border/40 px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/50"
      >
        <LogIn className="h-4 w-4" />
        Sign In / Register
      </Link>
    </SheetClose>
  );
}

/* ------------------------------------------------------------------ */
/*  Header auth — login button / user avatar                          */
/* ------------------------------------------------------------------ */
function HeaderAuth() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (loading) return null;

  if (user) {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-full p-1.5 text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
          aria-label="Account menu"
          aria-expanded={open}
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-gold/20 text-xs font-semibold text-gold">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-border/50 bg-background shadow-elegant"
            >
              <div className="border-b border-border/50 px-4 py-3">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <div className="p-1.5 space-y-0.5">
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  My Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <div className="my-1 border-t border-border/40" />
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-red-500"
                >
                  Sign out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      to="/login"
      className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-white/60 transition-all duration-300 hover:border-gold/40 hover:text-white hover:bg-white/[0.08] hover:shadow-[0_0_12px_-4px_var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
    >
      <LogIn className="h-4 w-4" />
      Sign In
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  SiteHeader — main export                                          */
/* ------------------------------------------------------------------ */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { openLabel, open, close, cancelClose } = useMegaMenu();

  /* Keyboard navigation state */
  const navRef = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(-1);

  // Build a flat list of all top-level nav items
  const navItemLabels = MEGA_MENU.map((m) => m.label);

  const focusNavItem = (index: number) => {
    if (index < 0 || index >= navItemLabels.length) return;
    setFocusIndex(index);
    const items = navRef.current?.querySelectorAll<HTMLAnchorElement>(
      '[role="menuitem"]',
    );
    items?.[index]?.focus();
  };

  const handleNavKeyDown = (e: React.KeyboardEvent) => {
    const current = focusIndex >= 0 ? focusIndex : 0;

    switch (e.key) {
      case "ArrowRight": {
        e.preventDefault();
        focusNavItem((current + 1) % navItemLabels.length);
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        focusNavItem((current - 1 + navItemLabels.length) % navItemLabels.length);
        break;
      }
      case "ArrowDown": {
        e.preventDefault();
        const label = navItemLabels[current];
        const menuItem = MEGA_MENU.find((m) => m.label === label);
        if (menuItem?.groups) {
          open(label);
          setTimeout(() => {
            const panel = navRef.current?.querySelector<HTMLAnchorElement>(
              '[data-mega-panel] a',
            );
            panel?.focus();
          }, 100);
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (openLabel) close(0);
        break;
      }
      case "Home": {
        e.preventDefault();
        focusNavItem(0);
        break;
      }
      case "End": {
        e.preventDefault();
        focusNavItem(navItemLabels.length - 1);
        break;
      }
      case "Escape": {
        close(0);
        if (focusIndex >= 0) {
          const items = navRef.current?.querySelectorAll<HTMLAnchorElement>(
            '[role="menuitem"]',
          );
          items?.[focusIndex]?.focus();
        }
        break;
      }
    }
  };

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mount for animations
  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut for search
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

  // Close menu on outside click
  useEffect(() => {
    if (!openLabel) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("header")) close(0);
    };
    const t = setTimeout(() => document.addEventListener("click", onClick), 10);
    return () => {
      clearTimeout(t);
      document.removeEventListener("click", onClick);
    };
  }, [openLabel, close]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled              ? "border-b border-gold/20 bg-[var(--charcoal)]/92 backdrop-blur-2xl shadow-elegant h-[64px] sm:h-[68px] lg:h-[72px]"
          : "border-b border-gold/[0.08] bg-[var(--charcoal)]/85 backdrop-blur-xl h-[64px] sm:h-[68px] lg:h-[72px]"
      }`}
      onMouseLeave={() => close()}
    >
      <div className="container-lux flex h-full items-center justify-between gap-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={mounted ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0"
        >
          <Link
            to="/"
            className={`group flex items-center gap-3 transition-all duration-500 ${
              scrolled ? "scale-[0.95]" : "scale-100"
            }`}
          >
            {/* SH Monogram */}
            <span className="grid aspect-square w-[42px] place-items-center rounded-sm bg-gold text-[var(--gold-foreground)] font-serif text-lg leading-none transition-all duration-300 group-hover:scale-[1.05] group-hover:shadow-[0_0_28px_-4px_oklch(0.72_0.11_78/0.6)] sm:w-[48px] sm:text-xl lg:w-[54px] lg:text-2xl">
              SH
            </span>
            {/* Brand text */}
            <span className="flex flex-col leading-tight">
              <span className="font-serif text-base font-bold tracking-tight text-white transition-colors sm:text-xl lg:text-2xl">
                {COMPANY.brand}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold/90 sm:text-[0.625rem]">
                {COMPANY.subtitle}
              </span>
            </span>
          </Link>
        </motion.div>

        {/* Desktop nav */}
        <div
          ref={navRef}
          onKeyDown={handleNavKeyDown}
          className="hidden lg:flex lg:flex-1 lg:items-center"
        >
          <nav
            className="flex items-center gap-4"
            role="menubar"
            aria-label="Main navigation"
          >
            {MEGA_MENU.map((item, i) => (
              <NavLink
                key={item.label}
                item={item}
                index={i}
                isActive={openLabel === item.label}
                onOpen={() => open(item.label)}
                onClose={() => close()}
                onCancelClose={cancelClose}
                onFocus={() => setFocusIndex(i)}
                focusIndex={focusIndex}
              />
            ))}
          </nav>
        </div>

        {/* Right actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="flex items-center justify-center rounded-full p-2.5 text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
          >
            <Search className="h-5 w-5" />
          </button>
          <ThemeToggle />
          <HeaderAuth />
          <Button
            asChild
            variant="gold"
            className="bg-[var(--gradient-gold)] rounded-full min-w-[150px] h-10 px-5 py-2 text-sm font-semibold shadow-[var(--shadow-gold)] transition-all duration-300 hover:shadow-[0_0_0_1px_var(--gold),var(--shadow-gold)] hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]"
          >
            <Link to="/quote">Request Quote</Link>
          </Button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 lg:hidden">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="flex items-center justify-center rounded-full p-2.5 text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
          >
            <Search className="h-5 w-5" />
          </button>
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="flex items-center justify-center rounded-full p-2.5 text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] overflow-y-auto border-l border-gold/15 bg-[var(--charcoal)] sm:w-[380px] [&>button]:text-white/60 [&>button]:hover:text-white">
              <div className="mt-8 flex flex-col gap-1">
                {/* Mobile nav items */}
                {MEGA_MENU.map((item) => (
                  <MobileAccordionItem key={item.label} item={item} onClose={() => {}} />
                ))}

                {/* Mobile-only quick links */}
                <div className="mt-4 border-t border-border/40 pt-4">
                  <p className="text-[0.6rem] uppercase tracking-[0.22em] text-gold font-semibold mb-2 px-4">
                    Quick Links
                  </p>
                  <SheetClose asChild>
                    <Link
                      to="/about"
                      className="block rounded-lg px-4 py-3.5 text-base font-medium text-foreground/90 transition-colors hover:bg-muted/50"
                    >
                      About
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/catalog"
                      className="block rounded-lg px-4 py-3.5 text-base font-medium text-foreground/90 transition-colors hover:bg-muted/50"
                    >
                      Digital Catalog
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/contact"
                      className="block rounded-lg px-4 py-3.5 text-base font-medium text-foreground/90 transition-colors hover:bg-muted/50"
                    >
                      Contact
                    </Link>
                  </SheetClose>
                </div>

                {/* Quote button */}
                <div className="mt-4 px-4">
                  <SheetClose asChild>
                    <Button asChild variant="gold" className="w-full rounded-full py-3 text-sm font-semibold">
                      <Link to="/quote">Request Quote</Link>
                    </Button>
                  </SheetClose>
                </div>

                {/* Mobile dashboard & profile links for logged-in users */}
                <div className="mt-3 px-4 space-y-1">
                  <MobileAuthenticatedLinks />
                  <MobileAuth />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mega menu panels */}
      <AnimatePresence>
        {openLabel &&
          MEGA_MENU.map(
            (item) =>
              item.label === openLabel &&
              item.groups && (
                <MegaPanel key={item.label} item={item} onClose={() => close()} />
              ),
          )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
