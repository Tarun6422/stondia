import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, Package, FolderTree, BookOpen, Building2, Images,
  Award, Download, Newspaper, Users, FileText, ShoppingCart, UserCog,
  Shield, BarChart3, Settings, Library, TrendingUp, TrendingDown,
  ArrowUpRight, Search, Bell, Menu, X,
} from "lucide-react";
import { motion } from "framer-motion";
import { PRODUCTS, PROJECTS, COMPANY } from "@/data/site";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Stone India Heritage" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Products", icon: Package },
  { label: "Categories", icon: FolderTree },
  { label: "Digital Catalog", icon: BookOpen },
  { label: "Projects", icon: Building2 },
  { label: "Gallery", icon: Images },
  { label: "Certificates", icon: Award },
  { label: "Downloads", icon: Download },
  { label: "Blogs", icon: Newspaper },
  { label: "Customers", icon: Users },
  { label: "RFQs", icon: FileText },
  { label: "Orders", icon: ShoppingCart },
  { label: "Users", icon: UserCog },
  { label: "Roles", icon: Shield },
  { label: "Analytics", icon: BarChart3 },
  { label: "Settings", icon: Settings },
  { label: "Media Library", icon: Library },
];

const STATS = [
  { label: "Total Revenue", value: "$2.84M", change: "+12.4%", up: true },
  { label: "Open RFQs", value: "38", change: "+6", up: true },
  { label: "Active Orders", value: "142", change: "+18.2%", up: true },
  { label: "Products Listed", value: String(PRODUCTS.length * 14), change: "-2", up: false },
];

const RFQS = [
  { id: "RFQ-04821", customer: "Whitmore Studio", country: "United Kingdom", product: "Wall Cladding", status: "New" },
  { id: "RFQ-04820", customer: "Meridian Developers", country: "UAE", product: "Sandstone Cobbles", status: "Quoted" },
  { id: "RFQ-04819", customer: "Bali Resort Group", country: "Indonesia", product: "Paving + Steps", status: "Won" },
  { id: "RFQ-04818", customer: "Heritage Trust", country: "India", product: "Jali + Carvings", status: "Review" },
  { id: "RFQ-04817", customer: "Southbank Council", country: "Australia", product: "Landscape Stone", status: "Quoted" },
];

const STATUS_STYLES: Record<string, string> = {
  New: "bg-blue-500/15 text-blue-600",
  Quoted: "bg-amber-500/15 text-amber-600",
  Won: "bg-emerald-500/15 text-emerald-600",
  Review: "bg-purple-500/15 text-purple-600",
};

function Admin() {
  const [active, setActive] = useState("Dashboard");
  const [openNav, setOpenNav] = useState(false);

  return (
    <div className="min-h-screen bg-secondary/40">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-[var(--charcoal)] text-white transition-transform lg:translate-x-0 ${openNav ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between px-6">
          <Link to="/" className="font-serif text-lg tracking-tight text-white">
            Stone India
          </Link>
          <button onClick={() => setOpenNav(false)} className="lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <nav className="mt-2 flex flex-col gap-0.5 px-3 pb-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {NAV.map((n) => (
            <button
              key={n.label}
              onClick={() => { setActive(n.label); setOpenNav(false); }}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                active === n.label ? "bg-gold text-[var(--gold-foreground)]" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpenNav(true)} className="lg:hidden"><Menu className="h-5 w-5" /></button>
            <h1 className="font-serif text-xl text-foreground">{active}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 sm:flex">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input placeholder="Search…" className="h-9 w-40 bg-transparent text-sm outline-none" />
            </div>
            <button className="relative text-muted-foreground"><Bell className="h-5 w-5" /><span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-gold" /></button>
            <div className="h-9 w-9 rounded-full bg-gold/20 grid place-items-center font-medium text-gold">SA</div>
          </div>
        </header>

        <main className="p-6">
          {active === "Dashboard" ? <Dashboard /> : <GenericSection title={active} />}
        </main>
      </div>

      {openNav && <div onClick={() => setOpenNav(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />}
    </div>
  );
}

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-lg border border-border bg-card p-5"
          >
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-serif text-3xl text-foreground">{s.value}</p>
            <p className={`mt-2 inline-flex items-center gap-1 text-sm ${s.up ? "text-emerald-600" : "text-red-500"}`}>
              {s.up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />} {s.change}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-foreground">Export Revenue</h2>
            <span className="text-sm text-muted-foreground">Last 12 months</span>
          </div>
          <div className="mt-6 flex h-56 items-end gap-2">
            {[42, 55, 48, 62, 70, 58, 75, 82, 68, 90, 78, 95].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.04, duration: 0.5 }}
                className="flex-1 rounded-t bg-gradient-to-t from-gold/40 to-gold"
              />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-serif text-xl text-foreground">Top Categories</h2>
          <div className="mt-5 space-y-4">
            {[
              { label: "Wall Cladding", pct: 84 },
              { label: "Paving & Cobbles", pct: 71 },
              { label: "Jali & Carvings", pct: 58 },
              { label: "Flooring", pct: 46 },
              { label: "Columns", pct: 33 },
            ].map((c) => (
              <div key={c.label}>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">{c.label}</span>
                  <span className="text-muted-foreground">{c.pct}%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-secondary">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full bg-gold" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="font-serif text-xl text-foreground">Recent RFQs</h2>
          <button className="inline-flex items-center gap-1 text-sm text-gold">View all <ArrowUpRight className="h-3.5 w-3.5" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium">Reference</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Country</th>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {RFQS.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-4 font-medium text-foreground">{r.id}</td>
                  <td className="px-6 py-4 text-foreground">{r.customer}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.country}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.product}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function GenericSection({ title }: { title: string }) {
  const rows =
    title === "Projects"
      ? PROJECTS.map((p) => ({ a: p.name, b: p.location, c: p.category, d: p.year }))
      : PRODUCTS.map((p) => ({ a: p.name, b: p.category, c: p.thickness, d: p.weight }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground">Manage {title.toLowerCase()} for {COMPANY.short}.</p>
        <button className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-[var(--gold-foreground)]">+ Add New</button>
      </div>
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Detail</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Info</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-6 py-4 font-medium text-foreground">{r.a}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.b}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.c}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.d}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3 text-sm">
                      <button className="text-gold">Edit</button>
                      <button className="text-muted-foreground hover:text-red-500">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
