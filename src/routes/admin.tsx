import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Building2,
  Newspaper,
  Video,
  Download,
  MessageSquare,
  FileText,
  Users,
  Settings,
  Mail,
  Star,
  LogOut,
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  Loader2,
  Images,
  FilePlus,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { DashboardOverview } from "@/components/admin/dashboard";
import {
  ProductsModule,
  CategoriesModule,
  ProjectsModule,
  BlogsModule,
  VideosModule,
  DownloadsModule,
  TestimonialsModule,
  ContactModule,
  RFQModule,
  SubscribersModule,
  UsersModule,
  SettingsModule,
  MediaLibraryModule,
  CatalogGeneratorModule,
} from "@/components/admin/modules";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Stone India Heritage" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

/* ── Sidebar Navigation Items ── */
const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, section: "dashboard" },
  { label: "Media Library", icon: Images, section: "media" },
  { label: "Catalog Generator", icon: FilePlus, section: "catalog-generator" },
  { label: "Products", icon: Package, section: "products" },
  { label: "Categories", icon: FolderTree, section: "categories" },
  { label: "Projects", icon: Building2, section: "projects" },
  { label: "Blogs", icon: Newspaper, section: "blogs" },
  { label: "Videos", icon: Video, section: "videos" },
  { label: "Downloads", icon: Download, section: "downloads" },
  { label: "Testimonials", icon: Star, section: "testimonials" },
  { label: "Contact Messages", icon: MessageSquare, section: "contacts" },
  { label: "RFQs", icon: FileText, section: "rfqs" },
  { label: "Subscribers", icon: Mail, section: "subscribers" },
  { label: "Users", icon: Users, section: "users" },
  { label: "Settings", icon: Settings, section: "settings" },
];

/* ── Section name map ── */
const SECTION_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  media: "Media Library",
  "catalog-generator": "Catalog Generator",
  products: "Products",
  categories: "Categories",
  projects: "Projects",
  blogs: "Blogs",
  videos: "Videos",
  downloads: "Downloads",
  testimonials: "Testimonials",
  contacts: "Contact Messages",
  rfqs: "RFQs",
  subscribers: "Subscribers",
  users: "Users",
  settings: "Settings",
};

/* ── Admin Layout ── */
function Admin() {
  const [section, setSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);

  // Handle click outside for profile dropdown
  useEffect(() => {
    if (!profileOpen) return;
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [profileOpen]);

  // Close sidebar on route change (section change)
  useEffect(() => {
    setSidebarOpen(false);
  }, [section]);

  // Search shortcut
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

  // Protect admin route
  if (!loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-sm text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 text-gold mx-auto">
            <LayoutDashboard className="h-8 w-8" />
          </div>
          <h2 className="font-serif text-2xl text-foreground">Access Restricted</h2>
          <p className="text-sm text-muted-foreground">
            Please sign in to access the admin dashboard.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-md bg-gold px-6 py-2.5 text-sm font-medium text-[var(--gold-foreground)] transition-all hover:brightness-105"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-secondary/40">
      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border/60 bg-[var(--charcoal)] text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-sm bg-gold text-[var(--gold-foreground)] font-serif text-lg leading-none">
              S
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-serif text-sm tracking-tight text-white">Stone India</span>
              <span className="text-[0.55rem] uppercase tracking-[0.25em] text-white/40">
                Admin
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-2 flex flex-col gap-0.5 px-3 pb-6 overflow-y-auto max-h-[calc(100vh-4rem-3rem)]">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.section}
              onClick={() => {
                setSection(item.section);
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-200 ${
                section === item.section
                  ? "bg-gold text-[var(--gold-foreground)] font-medium shadow-sm"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout at bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/50 transition-all hover:bg-white/5 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* ── Topbar ── */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/90 px-4 sm:px-8 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-serif text-lg sm:text-xl text-foreground">
              {SECTION_LABELS[section] || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 rounded-md border border-border/60 bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Search className="h-4 w-4" />
              <span>Search…</span>
              <kbd className="ml-4 rounded border border-border/40 bg-muted px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
                /
              </kbd>
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="sm:hidden p-2 text-muted-foreground hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold" />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-full p-1.5 text-muted-foreground transition-all hover:bg-muted/50"
                aria-expanded={profileOpen}
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gold/20 text-xs font-semibold text-gold">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </span>
                <span className="hidden sm:block text-sm text-foreground/80 max-w-[100px] truncate">
                  {user?.name}
                </span>
                <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-muted-foreground" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-border/50 bg-card shadow-elegant"
                  >
                    <div className="border-b border-border/40 px-4 py-3">
                      <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      <Badge className="mt-1.5 inline-block bg-gold/15 text-gold text-[0.6rem] border-0">
                        {user?.role}
                      </Badge>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-red-500"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="p-4 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {section === "dashboard" && <DashboardOverview />}
              {section === "media" && <MediaLibraryModule />}
              {section === "catalog-generator" && <CatalogGeneratorModule />}
              {section === "products" && <ProductsModule />}
              {section === "categories" && <CategoriesModule />}
              {section === "projects" && <ProjectsModule />}
              {section === "blogs" && <BlogsModule />}
              {section === "videos" && <VideosModule />}
              {section === "downloads" && <DownloadsModule />}
              {section === "testimonials" && <TestimonialsModule />}
              {section === "contacts" && <ContactModule />}
              {section === "rfqs" && <RFQModule />}
              {section === "subscribers" && <SubscribersModule />}
              {section === "users" && <UsersModule />}
              {section === "settings" && <SettingsModule />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ── Search Overlay ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-[15vh]"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elegant">
                <div className="flex items-center gap-3 border-b border-border/40 px-5 py-4">
                  <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type to search across all sections…"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <kbd className="rounded border border-border/40 bg-muted px-2 py-0.5 text-[0.6rem] text-muted-foreground">
                    ESC
                  </kbd>
                </div>
                <div className="px-5 py-4 text-center text-sm text-muted-foreground">
                  Search will query all products, projects, blogs, and categories.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Simple Badge component (inline to avoid circular deps) ── */
function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}
