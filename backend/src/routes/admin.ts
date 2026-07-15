import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { NotFoundError } from "../lib/errors.js";
import { slugify } from "../lib/prisma-helpers.js";
import {
  deleteFileByUrl as deleteCatalogFile,
  getStorageUsage,
  formatStorageBytes,
} from "../lib/upload.js";
import { parseUserAgent } from "../lib/ua-parser.js";

const router = Router();

/**
 * Safely call a Prisma model method. Returns a default value if the model
 * is undefined (e.g., Prisma client not regenerated after schema changes).
 */
async function safeModelCall<T>(model: any, method: string, ...args: any[]): Promise<T | null> {
  if (!model || typeof model[method] !== "function") return null;
  try {
    return await model[method](...args);
  } catch {
    return null;
  }
}

function safeCount(model: any, where?: any): Promise<number> {
  return safeModelCall<number>(model, "count", where ? { where } : {}).then((r) => r ?? 0);
}

// GET /api/admin/dashboard — analytics (with per-query error isolation)
router.get("/dashboard", authenticate, authorize("ADMIN"), async (_req: Request, res: Response) => {
  async function safeQuery<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      console.error(`[ADMIN Dashboard] "${label}" query failed:`, err);
      return fallback;
    }
  }

  const [
    totalUsers,
    totalProducts,
    totalCategories,
    totalProjects,
    totalBlogs,
    totalVideos,
    totalDownloads,
    totalTestimonials,
    totalContacts,
    unreadContacts,
    totalRfqs,
    pendingRfqs,
    totalSubscribers,
    recentRfqs,
    recentContacts,
    recentOrders,
  ] = await Promise.all([
    safeQuery("users", () => prisma.user.count(), 0),
    safeQuery("products", () => prisma.product.count(), 0),
    safeQuery("categories", () => prisma.category.count(), 0),
    safeQuery("projects", () => prisma.project.count(), 0),
    safeQuery("blogs", () => prisma.blog.count(), 0),
    safeQuery("videos", () => prisma.video.count(), 0),
    safeQuery("downloads", () => prisma.download.count(), 0),
    safeQuery("testimonials", () => prisma.testimonial.count(), 0),
    safeQuery("contacts", () => prisma.contact.count(), 0),
    safeQuery("unreadContacts", () => prisma.contact.count({ where: { status: "Unread" } }), 0),
    safeQuery("rfqs", () => prisma.rFQ.count(), 0),
    safeQuery("pendingRfqs", () => prisma.rFQ.count({ where: { status: "Pending" } }), 0),
    safeQuery("subscribers", () => prisma.subscriber.count({ where: { active: true } }), 0),
    safeQuery("recentRfqs", () =>
      prisma.rFQ.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }), []),
    safeQuery("recentContacts", () =>
      prisma.contact.findMany({ take: 5, orderBy: { createdAt: "desc" } }), []),
    safeQuery("recentOrders", () =>
      prisma.rFQ.findMany({ take: 5, orderBy: { createdAt: "desc" }, where: { status: "Pending" } }), []),
  ]);

  res.json({
    stats: {
      users: totalUsers,
      products: totalProducts,
      categories: totalCategories,
      projects: totalProjects,
      blogs: totalBlogs,
      videos: totalVideos,
      downloads: totalDownloads,
      testimonials: totalTestimonials,
      contacts: { total: totalContacts, unread: unreadContacts },
      rfqs: { total: totalRfqs, pending: pendingRfqs },
      subscribers: totalSubscribers,
    },
    recent: {
      rfqs: recentRfqs,
      contacts: recentContacts,
      pendingOrders: recentOrders,
    },
  });
});

// GET /api/admin/users — list all users
router.get("/users", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const { page = "1", limit = "20" } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        avatar: true,
        address: true,
        company: true,
        designation: true,
        createdAt: true,
      },
    }),
    prisma.user.count(),
  ]);
  res.json({
    data: users,
    pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

// PUT /api/admin/users/:id — update user role
router.put("/users/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id as string } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const { role } = req.body;
  if (role && !["ADMIN", "DEALER", "ARCHITECT", "CUSTOMER"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const updated = await prisma.user.update({
    where: { id: req.params.id as string },
    data: { ...(role && { role }) },
    select: { id: true, name: true, email: true, role: true },
  });
  res.json(updated);
});

// DELETE /api/admin/users/:id
router.delete(
  "/users/:id",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id as string } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "ADMIN")
      return res.status(403).json({ message: "Cannot delete admin users" });

    await prisma.user.delete({ where: { id: req.params.id as string } });
    res.json({ message: "User deleted" });
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  CATALOG MANAGEMENT (Digital Stone Catalog)                       */
/* ══════════════════════════════════════════════════════════════════ */

// GET /api/admin/catalog — list all downloads (including unpublished)
router.get("/catalog", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const { page = "1", limit = "20", search } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ];
  }

  const [catalogs, total] = await Promise.all([
    prisma.download.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        _count: { select: { logs: true } },
      },
    }),
    prisma.download.count({ where }),
  ]);

  res.json({
    data: catalogs,
    pagination: {
      page: parseInt(page),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  });
});

// POST /api/admin/catalog — create a new catalog entry
router.post("/catalog", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const data = req.body;
  const slug = data.slug || slugify(data.title);
  let finalSlug = slug;
  let counter = 1;
  while (await prisma.download.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${counter++}`;
  }
  const catalog = await prisma.download.create({ data: { ...data, slug: finalSlug } });
  res.status(201).json(catalog);
});

// PUT /api/admin/catalog/:id — update a catalog entry
router.put(
  "/catalog/:id",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const catalog = await prisma.download.findUnique({ where: { id: req.params.id as string } });
    if (!catalog) throw new NotFoundError("Catalog");
    const updated = await prisma.download.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json(updated);
  },
);

// DELETE /api/admin/catalog/:id — delete a catalog entry and its PDF
router.delete(
  "/catalog/:id",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const catalog = await prisma.download.findUnique({ where: { id: req.params.id as string } });
    if (!catalog) throw new NotFoundError("Catalog");

    if (catalog.pdf) {
      await deleteCatalogFile(catalog.pdf).catch(() => {});
    }
    if (catalog.coverImage) {
      await deleteCatalogFile(catalog.coverImage).catch(() => {});
    }

    await prisma.download.delete({ where: { id: req.params.id as string } });
    res.json({ message: "Catalog deleted" });
  },
);

// PATCH /api/admin/catalog/:id/publish — toggle published status
router.patch(
  "/catalog/:id/publish",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const catalog = await prisma.download.findUnique({ where: { id: req.params.id as string } });
    if (!catalog) throw new NotFoundError("Catalog");

    const updated = await prisma.download.update({
      where: { id: req.params.id as string },
      data: { published: !catalog.published },
    });
    res.json(updated);
  },
);

// PATCH /api/admin/catalog/:id/feature — toggle featured status
router.patch(
  "/catalog/:id/feature",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const catalog = await prisma.download.findUnique({ where: { id: req.params.id as string } });
    if (!catalog) throw new NotFoundError("Catalog");

    const updated = await prisma.download.update({
      where: { id: req.params.id as string },
      data: { featured: !catalog.featured },
    });
    res.json(updated);
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  DOWNLOAD ANALYTICS                                               */
/* ══════════════════════════════════════════════════════════════════ */

// GET /api/admin/catalog/analytics — download analytics (with per-query error isolation)
router.get(
  "/catalog/analytics",
  authenticate,
  authorize("ADMIN"),
  async (_req: Request, res: Response) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    async function safeQ<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
      try {
        return await fn();
      } catch (err) {
        console.error(`[ADMIN Catalog Analytics] "${label}" query failed:`, err);
        return fallback;
      }
    }

    const [
      totalCatalogs,
      totalDownloadCount,
      mostDownloaded,
      recentLogs,
      todayDownloads,
      monthlyDownloads,
      featuredCatalogs,
      latestUpload,
      lastDownload,
      totalStorageBytes,
    ] = await Promise.all([
      safeQ("totalCatalogs", () => prisma.download.count(), 0),
      safeQ("totalDownloadCount", () => prisma.download.aggregate({ _sum: { downloadCount: true } }),
        { _sum: { downloadCount: null } }),
      safeQ("mostDownloaded", () => prisma.download.findFirst({
        orderBy: { downloadCount: "desc" },
        select: { id: true, title: true, downloadCount: true },
      }), null),
      safeQ("recentLogs", () => prisma.downloadLog.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { download: { select: { title: true, slug: true } } },
      }), []),
      safeQ("todayDownloads", () => prisma.downloadLog.count({
        where: { createdAt: { gte: startOfToday } },
      }), 0),
      safeQ("monthlyDownloads", () => prisma.downloadLog.count({
        where: { createdAt: { gte: startOfMonth } },
      }), 0),
      safeQ("featuredCatalogs", () => prisma.download.count({ where: { featured: true } }), 0),
      safeQ("latestUpload", () => prisma.download.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, createdAt: true },
      }), null),
      safeQ("lastDownload", () => prisma.downloadLog.findFirst({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }), null),
      safeQ("totalStorageBytes", () => getStorageUsage(), 0),
    ]);

    res.json({
      totalCatalogs: totalCatalogs ?? 0,
      totalDownloads: (totalDownloadCount?._sum?.downloadCount) ?? 0,
      todayDownloads: todayDownloads ?? 0,
      monthlyDownloads: monthlyDownloads ?? 0,
      featuredCatalogs: featuredCatalogs ?? 0,
      mostDownloaded: mostDownloaded ?? null,
      latestUpload: latestUpload ?? null,
      lastDownloadTime: lastDownload?.createdAt ?? null,
      totalStorageBytes: totalStorageBytes ?? 0,
      totalStorageFormatted: formatStorageBytes(totalStorageBytes ?? 0),
      recentDownloads: recentLogs ?? [],
    });
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  ENHANCED CATALOG ANALYTICS (GeneratedCatalog + CatalogView)      */
/* ══════════════════════════════════════════════════════════════════ */

// GET /api/admin/catalog/analytics/enhanced — comprehensive analytics
router.get(
  "/catalog/analytics/enhanced",
  authenticate,
  authorize("ADMIN"),
  async (_req: Request, res: Response) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    try {
      // Use safe model helpers to handle models that may not exist in Prisma client
      const gc = (prisma as any).generatedCatalog;
      const cv = (prisma as any).catalogView;
      const dl = (prisma as any).downloadLog;

      const [
        totalCatalogs,
        publishedCatalogs,
        totalDownloadCount,
        totalViewCount,
        todayViews,
        monthlyViews,
        todayDownloads,
        monthlyDownloads,
        featuredCatalogs,
        mostDownloaded,
      ] = await Promise.all([
        safeCount(gc),
        safeCount(gc, { status: "published" }),
        safeModelCall<any>(gc, "aggregate", { _sum: { downloadCount: true } }),
        safeCount(cv),
        safeCount(cv, { createdAt: { gte: startOfToday } }),
        safeCount(cv, { createdAt: { gte: startOfMonth } }),
        safeCount(dl, { createdAt: { gte: startOfToday } }),
        safeCount(dl, { createdAt: { gte: startOfMonth } }),
        safeCount(gc, { featured: true }),
        safeModelCall<any>(gc, "findFirst", {
          orderBy: { downloadCount: "desc" },
          select: { id: true, title: true, downloadCount: true, type: true },
        }),
      ]);

      // ── Download Trend (last 6 months) ──
      const downloadTrend: { month: string; downloads: number }[] = [];
      if (dl) {
        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
          const count = await safeCount(dl, {
            createdAt: { gte: monthStart, lt: monthEnd },
          });
          const label = monthStart.toLocaleString("en-US", { month: "short", year: "2-digit" });
          downloadTrend.push({ month: label, downloads: count });
        }
      }

      // ── View Trend (last 6 months) ──
      const viewTrend: { month: string; views: number }[] = [];
      if (cv) {
        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
          const count = await safeCount(cv, {
            createdAt: { gte: monthStart, lt: monthEnd },
          });
          const label = monthStart.toLocaleString("en-US", { month: "short", year: "2-digit" });
          viewTrend.push({ month: label, views: count });
        }
      }

      // ── Top Products (by product-linked catalog downloads) ──
      let topProducts: any[] = [];
      if (gc) {
        const topProductCatalogs = await safeModelCall<any[]>(gc, "findMany", {
          where: { productId: { not: null }, status: "published" },
          orderBy: { downloadCount: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            downloadCount: true,
            type: true,
            productId: true,
            categoryId: true,
          },
        });

        if (topProductCatalogs) {
          topProducts = await Promise.all(
            topProductCatalogs.map(async (c: any) => {
              let productName: string | null = null;
              if (c.productId) {
                const prod = await prisma.product.findUnique({
                  where: { id: c.productId },
                  select: { name: true },
                });
                if (prod) productName = prod.name;
              }
              return {
                id: c.id,
                title: c.title,
                productId: c.productId,
                productName,
                downloadCount: c.downloadCount,
                type: c.type,
              };
            }),
          );
        }
      }

      // ── Top Categories (by category-linked catalog downloads) ──
      let topCategoryCatalogs: any[] = [];
      if (gc) {
        const raw = await safeModelCall<any[]>(gc, "findMany", {
          where: { categoryId: { not: null }, status: "published" },
          orderBy: { downloadCount: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            downloadCount: true,
            categoryId: true,
          },
        });
        if (raw) topCategoryCatalogs = raw;
      }

      const categoryMap = new Map<string, { categoryId: string; categoryName: string; downloadCount: number }>();
      for (const c of topCategoryCatalogs) {
        if (!c.categoryId) continue;
        const existing = categoryMap.get(c.categoryId);
        if (existing) {
          existing.downloadCount += c.downloadCount;
        } else {
          try {
            const cat = await prisma.category.findUnique({
              where: { id: c.categoryId },
              select: { name: true },
            });
            categoryMap.set(c.categoryId, {
              categoryId: c.categoryId,
              categoryName: cat?.name || "Unknown",
              downloadCount: c.downloadCount,
            });
          } catch {
            categoryMap.set(c.categoryId, {
              categoryId: c.categoryId,
              categoryName: "Unknown",
              downloadCount: c.downloadCount,
            });
          }
        }
      }
      const topCategories = Array.from(categoryMap.values())
        .sort((a, b) => b.downloadCount - a.downloadCount)
        .slice(0, 10);

      // ── Popular PDFs ──
      let popularPDFs: any[] = [];
      if (gc) {
        const raw = await safeModelCall<any[]>(gc, "findMany", {
          where: { pdfUrl: { not: null }, status: "published" },
          orderBy: { downloadCount: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            slug: true,
            downloadCount: true,
            fileSize: true,
            type: true,
          },
        });
        if (raw) popularPDFs = raw;
      }

      // ── Recent Downloads with enriched data ──
      let recentDownloads: any[] = [];
      if (dl) {
        const recentLogs = await safeModelCall<any[]>(dl, "findMany", {
          take: 50,
          orderBy: { createdAt: "desc" },
          include: {
            download: { select: { title: true, slug: true } },
          },
        });
        if (recentLogs) {
          recentDownloads = recentLogs.map((l: any) => ({
            id: l.id,
            createdAt: l.createdAt,
            ip: l.ip,
            country: l.country,
            browser: l.browser,
            device: l.device,
            referrer: l.referrer,
            download: l.download,
          }));
        }
      }

      // ── Device Breakdown ──
      let deviceBreakdown: { name: string; value: number }[] = [];
      if (dl) {
        try {
          const deviceRaw = await dl.groupBy({
            by: ["device"],
            _count: { device: true },
            orderBy: { _count: { device: "desc" } },
          });
          if (deviceRaw) {
            deviceBreakdown = deviceRaw
              .filter((d: any) => d.device)
              .map((d: any) => ({ name: d.device!, value: d._count?.device ?? 0 }));
          }
        } catch { /* device breakdown not available */ }
      }

      // ── Browser Breakdown ──
      let browserBreakdown: { name: string; value: number }[] = [];
      if (dl) {
        try {
          const browserRaw = await dl.groupBy({
            by: ["browser"],
            _count: { browser: true },
            orderBy: { _count: { browser: "desc" } },
          });
          if (browserRaw) {
            browserBreakdown = browserRaw
              .filter((d: any) => d.browser)
              .map((d: any) => ({ name: d.browser!, value: d._count?.browser ?? 0 }));
          }
        } catch { /* browser breakdown not available */ }
      }

      // ── Country Breakdown ──
      let countryBreakdown: { name: string; value: number }[] = [];
      if (dl) {
        try {
          const countryRaw = await dl.groupBy({
            by: ["country"],
            _count: { country: true },
            orderBy: { _count: { country: "desc" } },
          });
          if (countryRaw) {
            countryBreakdown = countryRaw
              .filter((d: any) => d.country)
              .map((d: any) => ({ name: d.country!, value: d._count?.country ?? 0 }));
          }
        } catch { /* country breakdown not available */ }
      }

      res.json({
        summary: {
          totalCatalogs: totalCatalogs ?? 0,
          publishedCatalogs: publishedCatalogs ?? 0,
          totalDownloads: totalDownloadCount?._sum?.downloadCount ?? 0,
          totalViews: totalViewCount ?? 0,
          todayViews: todayViews ?? 0,
          monthlyViews: monthlyViews ?? 0,
          todayDownloads: todayDownloads ?? 0,
          monthlyDownloads: monthlyDownloads ?? 0,
          featuredCatalogs: featuredCatalogs ?? 0,
          mostDownloaded: mostDownloaded ?? null,
        },
        downloadTrend: downloadTrend ?? [],
        viewTrend: viewTrend ?? [],
        topProducts: topProducts ?? [],
        topCategories: topCategories ?? [],
        popularPDFs: popularPDFs ?? [],
        recentDownloads: recentDownloads ?? [],
        deviceBreakdown: deviceBreakdown ?? [],
        browserBreakdown: browserBreakdown ?? [],
        countryBreakdown: countryBreakdown ?? [],
      });
    } catch (err) {
      // Return a safe fallback if any unexpected error occurs
      console.error("[ADMIN] Enhanced analytics error:", err);
      res.json({
        summary: {
          totalCatalogs: 0,
          publishedCatalogs: 0,
          totalDownloads: 0,
          totalViews: 0,
          todayViews: 0,
          monthlyViews: 0,
          todayDownloads: 0,
          monthlyDownloads: 0,
          featuredCatalogs: 0,
          mostDownloaded: null,
        },
        downloadTrend: [],
        viewTrend: [],
        topProducts: [],
        topCategories: [],
        popularPDFs: [],
        recentDownloads: [],
        deviceBreakdown: [],
        browserBreakdown: [],
        countryBreakdown: [],
      });
    }
  },
);

// GET /api/admin/catalog/analytics/export/csv — download analytics as CSV
router.get(
  "/catalog/analytics/export/csv",
  authenticate,
  authorize("ADMIN"),
  async (_req: Request, res: Response) => {
    try {
      const logs = await prisma.downloadLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10000,
        include: {
          download: { select: { title: true, slug: true } },
        },
      });

      // Build CSV
      const header = "Date,Title,Slug,IP,Country,Browser,Device,Referrer\n";
      const rows = logs
        .map(
          (l) =>
            `"${l.createdAt.toISOString()}","${(l.download?.title || "").replace(/"/g, '""')}","${l.download?.slug || ""}","${l.ip || ""}","${l.country || ""}","${l.browser || ""}","${l.device || ""}","${l.referrer || ""}"`,
        )
        .join("\n");

      const csv = header + rows;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="catalog-analytics-${new Date().toISOString().slice(0, 10)}.csv"`);
      res.send(csv);
    } catch (err) {
      console.error("[ADMIN] CSV export error:", err);
      res.status(500).json({ message: "Failed to export CSV" });
    }
  },
);

export default router;
