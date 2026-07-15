/* ------------------------------------------------------------------ */
/*  Dashboard — overview with stat cards, charts, and recent activity  */
/* ------------------------------------------------------------------ */
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Package,
  FolderTree,
  Building2,
  Newspaper,
  Video,
  Download,
  MessageSquare,
  FileText,
  Users,
  Mail,
  UserCheck,
  AlertCircle,
  Star,
  Clock,
  BookOpen,
  QrCode,
  Eye,
  Monitor,
  Globe,
  BarChart3,
} from "lucide-react";
import { useDashboard, useCategories, useCatalogGeneratorAnalytics, useEnhancedCatalogAnalytics } from "./admin-hooks";
import { StatCard, StatCardSkeleton, AnimatedCount } from "./data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "@tanstack/react-router";

const STATUS_STYLES: Record<string, string> = {
  New: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Unread: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Read: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Quoted: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  Won: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Review: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  Completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

const PIE_COLORS = ["#b8860b", "#d4a843", "#e8c46a", "#a0750a", "#8a6508", "#6b4f06"];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="text-xs">
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

/* ── Dashboard Overview ── */
export function DashboardOverview({ onNavigate }: { onNavigate?: (section: string) => void }) {
  const { data, isLoading, isError } = useDashboard();
  const { data: catData } = useCategories();
  const { data: catalogAnalytics } = useCatalogGeneratorAnalytics();

  const categoryChartData = useMemo(() => {
    if (!catData?.data?.length) return [];
    return catData.data
      .filter((c) => (c._count?.products ?? 0) > 0)
      .slice(0, 8)
      .map((c, i) => ({
        name: c.name,
        value: c._count?.products ?? 0,
        color: PIE_COLORS[i % PIE_COLORS.length],
      }));
  }, [catData]);

  const recentRfqChartData = useMemo(() => {
    if (!data?.recent?.rfqs?.length) return [];
    const grouped: Record<string, number> = {};
    data.recent.rfqs.forEach((r: any) => {
      const month = format(new Date(r.createdAt), "MMM");
      grouped[month] = (grouped[month] || 0) + 1;
    });
    return Object.entries(grouped).map(([month, rfqs]) => ({ month, rfqs }));
  }, [data]);

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h3 className="font-serif text-xl text-foreground">Failed to load dashboard</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Could not connect to the backend. Make sure the API server is running.
          </p>
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Products"
              value={<AnimatedCount value={stats?.products ?? 0} />}
              icon={<Package className="h-5 w-5" />}
            />
            <StatCard
              label="Categories"
              value={<AnimatedCount value={stats?.categories ?? 0} />}
              icon={<FolderTree className="h-5 w-5" />}
            />
            <StatCard
              label="Projects"
              value={<AnimatedCount value={stats?.projects ?? 0} />}
              icon={<Building2 className="h-5 w-5" />}
            />
            <StatCard
              label="Blog Posts"
              value={<AnimatedCount value={stats?.blogs ?? 0} />}
              icon={<Newspaper className="h-5 w-5" />}
            />
            <StatCard
              label="Videos"
              value={<AnimatedCount value={stats?.videos ?? 0} />}
              icon={<Video className="h-5 w-5" />}
            />
            <StatCard
              label="Downloads"
              value={<AnimatedCount value={stats?.downloads ?? 0} />}
              icon={<Download className="h-5 w-5" />}
            />
            <StatCard
              label="Catalogs"
              value={<AnimatedCount value={catalogAnalytics?.totalCatalogs ?? 0} />}
              icon={<BookOpen className="h-5 w-5" />}
              trend={`${catalogAnalytics?.publishedCatalogs ?? 0} published`}
              trendUp
            />
            <StatCard
              label="Catalog Downloads"
              value={<AnimatedCount value={catalogAnalytics?.totalDownloads ?? 0} />}
              icon={<Download className="h-5 w-5" />}
            />
            <StatCard
              label="Featured Catalogs"
              value={<AnimatedCount value={catalogAnalytics?.featuredCatalogs ?? 0} />}
              icon={<QrCode className="h-5 w-5" />}
            />
            <StatCard
              label="RFQs"
              value={<AnimatedCount value={stats?.rfqs?.total ?? 0} />}
              trend={`${stats?.rfqs?.pending ?? 0} pending`}
              trendUp
              icon={<FileText className="h-5 w-5" />}
            />
            <StatCard
              label="Contacts"
              value={<AnimatedCount value={stats?.contacts?.total ?? 0} />}
              trend={`${stats?.contacts?.unread ?? 0} unread`}
              trendUp
              icon={<MessageSquare className="h-5 w-5" />}
            />
            <StatCard
              label="Subscribers"
              value={<AnimatedCount value={stats?.subscribers ?? 0} />}
              icon={<Mail className="h-5 w-5" />}
            />
            <StatCard
              label="Users"
              value={<AnimatedCount value={stats?.users ?? 0} />}
              icon={<Users className="h-5 w-5" />}
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {/* Recent RFQs by Month */}
        <ChartCard title="Recent RFQs by Month">
          {recentRfqChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={recentRfqChartData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rfqs" fill="var(--gold)" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
              {isLoading ? "Loading…" : "No RFQ data yet"}
            </div>
          )}
        </ChartCard>

        {/* Products by Category */}
        <ChartCard title="Products by Category">
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {categoryChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
              {isLoading ? "Loading…" : "No category data"}
            </div>
          )}
        </ChartCard>

        {/* Quick Stats */}
        <ChartCard title="Activity Overview">
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-3.5 w-3.5 text-gold" /> Testimonials
              </span>
              <span className="font-serif text-lg text-foreground">
                {isLoading ? (
                  <Skeleton className="inline-block h-5 w-8" />
                ) : (
                  (stats?.testimonials ?? 0)
                )}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-gold" /> Pending RFQs
              </span>
              <span className="font-serif text-lg text-foreground">
                {isLoading ? (
                  <Skeleton className="inline-block h-5 w-8" />
                ) : (
                  (stats?.rfqs?.pending ?? 0)
                )}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserCheck className="h-3.5 w-3.5 text-gold" /> Unread Contacts
              </span>
              <span className="font-serif text-lg text-foreground">
                {isLoading ? (
                  <Skeleton className="inline-block h-5 w-8" />
                ) : (
                  (stats?.contacts?.unread ?? 0)
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-gold" /> Active Subs
              </span>
              <span className="font-serif text-lg text-foreground">
                {isLoading ? (
                  <Skeleton className="inline-block h-5 w-8" />
                ) : (
                  (stats?.subscribers ?? 0)
                )}
              </span>
            </div>
          </div>
        </ChartCard>

        {/* Quick Links */}
        <ChartCard title="Quick Actions">
          <div className="space-y-2 pt-2">
            <button
              onClick={() => onNavigate?.("products")}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <Package className="h-4 w-4 text-gold" /> Manage Products
            </button>
            <button
              onClick={() => onNavigate?.("projects")}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <Building2 className="h-4 w-4 text-gold" /> Manage Projects
            </button>
            <button
              onClick={() => onNavigate?.("blogs")}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <Newspaper className="h-4 w-4 text-gold" /> Manage Blogs
            </button>
            <button
              onClick={() => onNavigate?.("rfqs")}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <FileText className="h-4 w-4 text-gold" /> View RFQs
            </button>
          </div>
        </ChartCard>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Latest RFQs */}
        <div className="rounded-xl border border-border/60 bg-card">
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
            <h3 className="font-serif text-lg text-foreground">Recent RFQs</h3>
            <span className="text-xs text-muted-foreground">Latest 5</span>
          </div>
          <div className="divide-y divide-border/40">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : data?.recent?.rfqs?.length ? (
              data.recent.rfqs.map((rfq: any) => (
                <div
                  key={rfq.id}
                  className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-xs font-semibold text-gold">
                      {rfq.user?.name?.charAt(0) || rfq.email?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {rfq.user?.name || rfq.email || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rfq.country || "—"} ·{" "}
                        {rfq.createdAt ? format(new Date(rfq.createdAt), "MMM d, yyyy") : ""}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`${STATUS_STYLES[rfq.status] || ""} shrink-0`}
                    variant="outline"
                  >
                    {rfq.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">No recent RFQs</p>
            )}
          </div>
        </div>

        {/* Latest Messages */}
        <div className="rounded-xl border border-border/60 bg-card">
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
            <h3 className="font-serif text-lg text-foreground">Latest Messages</h3>
            <span className="text-xs text-muted-foreground">Latest 5</span>
          </div>
          <div className="divide-y divide-border/40">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : data?.recent?.contacts?.length ? (
              data.recent.contacts.map((c: any) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-muted/20"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-xs font-semibold text-gold">
                      {c.name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.email} · {c.createdAt ? format(new Date(c.createdAt), "MMM d") : ""}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`${STATUS_STYLES[c.status] || ""} shrink-0 ml-2`}
                    variant="outline"
                  >
                    {c.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">No messages yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  ENHANCED CATALOG ANALYTICS WIDGETS                         */}
      {/* ════════════════════════════════════════════════════════════ */}
      <CatalogAnalyticsSection />
    </div>
  );
}

/* ── Catalog Analytics Section ── */
function CatalogAnalyticsSection() {
  const { data: enhanced, isLoading } = useEnhancedCatalogAnalytics();

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-5">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!enhanced) return null;

  const downloadTrendData = enhanced.downloadTrend || [];
  const viewTrendData = enhanced.viewTrend || [];

  return (
    <>
      {/* Section title */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-3">
        <BarChart3 className="h-5 w-5 text-gold" />
        <h2 className="font-serif text-xl text-foreground">Catalog Analytics</h2>
        <a
          href="/api/admin/catalog/analytics/export/csv"
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gold/30 px-3 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-gold/10"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </a>
      </div>

      {/* Summary stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Views"
          value={<AnimatedCount value={enhanced.summary?.totalViews ?? 0} />}
          icon={<Eye className="h-5 w-5" />}
          trend={`${enhanced.summary?.todayViews ?? 0} today`}
          trendUp
        />
        <StatCard
          label="Total Downloads"
          value={<AnimatedCount value={enhanced.summary?.totalDownloads ?? 0} />}
          icon={<Download className="h-5 w-5" />}
        />
        <StatCard
          label="Published Catalogs"
          value={<AnimatedCount value={enhanced.summary?.publishedCatalogs ?? 0} />}
          icon={<BookOpen className="h-5 w-5" />}
        />
        <StatCard
          label="Featured"
          value={<AnimatedCount value={enhanced.summary?.featuredCatalogs ?? 0} />}
          icon={<Star className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Download Trend */}
        <ChartCard title="Downloads by Month">
          {downloadTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={downloadTrendData}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="downloads" fill="var(--gold)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              No download data yet
            </div>
          )}
        </ChartCard>

        {/* View Trend */}
        <ChartCard title="Views by Month">
          {viewTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={viewTrendData}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="views" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              No view data yet
            </div>
          )}
        </ChartCard>

        {/* Device Breakdown */}
        <ChartCard title="Device Breakdown">
          {enhanced.deviceBreakdown?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={enhanced.deviceBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={3}
                >
                  {enhanced.deviceBreakdown.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              No device data yet
            </div>
          )}
        </ChartCard>

        {/* Browser Breakdown */}
        <ChartCard title="Browser Breakdown">
          {enhanced.browserBreakdown?.length > 0 ? (
            <div className="space-y-2">
              {enhanced.browserBreakdown.slice(0, 6).map((b: any, i: number) => {
                const total = enhanced.browserBreakdown.reduce((s: number, x: any) => s + x.value, 0);
                const pct = total > 0 ? Math.round((b.value / total) * 100) : 0;
                return (
                  <div key={b.name} className="flex items-center gap-3">
                    <Monitor className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground flex-1">{b.name}</span>
                    <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              No browser data yet
            </div>
          )}
        </ChartCard>

        {/* Country Breakdown */}
        <ChartCard title="Country Breakdown">
          {enhanced.countryBreakdown?.length > 0 ? (
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {enhanced.countryBreakdown.slice(0, 10).map((c: any, i: number) => (
                <div key={c.name} className="flex items-center gap-3">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground flex-1">{c.name}</span>
                  <span className="text-xs font-medium text-foreground">
                    {c.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              No country data yet
            </div>
          )}
        </ChartCard>

        {/* Top Products */}
        <ChartCard title="Top Products by Downloads">
          {enhanced.topProducts?.length > 0 ? (
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {enhanced.topProducts.slice(0, 5).map((p: any, i: number) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {p.productName || p.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.type} catalog</p>
                  </div>
                  <span className="text-xs font-medium text-gold ml-2">
                    {p.downloadCount} DLs
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              No product data yet
            </div>
          )}
        </ChartCard>
      </div>

      {/* Popular PDFs & Recent Downloads Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Popular PDFs */}
        <div className="rounded-xl border border-border/60 bg-card">
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
            <h3 className="font-serif text-base text-foreground">Popular PDFs</h3>
            <span className="text-xs text-muted-foreground">Top 10</span>
          </div>
          <div className="divide-y divide-border/40">
            {enhanced.popularPDFs?.length > 0 ? (
              enhanced.popularPDFs.slice(0, 8).map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-muted/20"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.type} · {p.fileSize || "—"}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 ml-2">
                    {p.downloadCount} DLs
                  </Badge>
                </div>
              ))
            ) : (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                No popular PDFs yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border/60 bg-card">
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
            <h3 className="font-serif text-base text-foreground">Recent Downloads</h3>
            <span className="text-xs text-muted-foreground">Latest 50</span>
          </div>
          <div className="divide-y divide-border/40 max-h-[400px] overflow-y-auto">
            {enhanced.recentDownloads?.length > 0 ? (
              enhanced.recentDownloads.slice(0, 15).map((r: any) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-6 py-2.5 transition-colors hover:bg-muted/20"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">
                      {r.download?.title || "Unknown"}
                    </p>
                    <p className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      {r.createdAt && (
                        <span>{format(new Date(r.createdAt), "MMM d, HH:mm")}</span>
                      )}
                      {r.device && <span>· {r.device}</span>}
                      {r.browser && <span>· {r.browser}</span>}
                      {r.country && <span>· {r.country}</span>}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                No download activity yet
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Chart Card Wrapper ── */
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/60 bg-card p-5"
    >
      <h3 className="mb-4 font-serif text-base text-foreground">{title}</h3>
      {children}
    </motion.div>
  );
}
