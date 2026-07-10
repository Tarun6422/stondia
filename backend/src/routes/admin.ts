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

const router = Router();

// GET /api/admin/dashboard — analytics
router.get("/dashboard", authenticate, authorize("ADMIN"), async (_req: Request, res: Response) => {
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
    prisma.user.count(),
    prisma.product.count(),
    prisma.category.count(),
    prisma.project.count(),
    prisma.blog.count(),
    prisma.video.count(),
    prisma.download.count(),
    prisma.testimonial.count(),
    prisma.contact.count(),
    prisma.contact.count({ where: { status: "Unread" } }),
    prisma.rFQ.count(),
    prisma.rFQ.count({ where: { status: "Pending" } }),
    prisma.subscriber.count({ where: { active: true } }),
    prisma.rFQ.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.contact.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    prisma.rFQ.findMany({ take: 5, orderBy: { createdAt: "desc" }, where: { status: "Pending" } }),
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

// GET /api/admin/catalog/analytics — download analytics
router.get(
  "/catalog/analytics",
  authenticate,
  authorize("ADMIN"),
  async (_req: Request, res: Response) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

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
      prisma.download.count(),
      prisma.download.aggregate({ _sum: { downloadCount: true } }),
      prisma.download.findFirst({
        orderBy: { downloadCount: "desc" },
        select: { id: true, title: true, downloadCount: true },
      }),
      prisma.downloadLog.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          download: { select: { title: true, slug: true } },
        },
      }),
      prisma.downloadLog.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      prisma.downloadLog.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.download.count({
        where: { featured: true },
      }),
      prisma.download.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, createdAt: true },
      }),
      prisma.downloadLog.findFirst({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      getStorageUsage(),
    ]);

    res.json({
      totalCatalogs,
      totalDownloads: totalDownloadCount._sum.downloadCount || 0,
      todayDownloads,
      monthlyDownloads,
      featuredCatalogs,
      mostDownloaded,
      latestUpload,
      lastDownloadTime: lastDownload?.createdAt || null,
      totalStorageBytes,
      totalStorageFormatted: formatStorageBytes(totalStorageBytes),
      recentDownloads: recentLogs,
    });
  },
);

export default router;
