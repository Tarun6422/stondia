import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";

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
    prisma.rfq.count(),
    prisma.rfq.count({ where: { status: "Pending" } }),
    prisma.subscriber.count({ where: { active: true } }),
    prisma.rfq.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true, email: true } } } }),
    prisma.contact.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    prisma.rfq.findMany({ take: 5, orderBy: { createdAt: "desc" }, where: { status: "Pending" } }),
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
      select: { id: true, name: true, email: true, phone: true, role: true, isVerified: true, createdAt: true },
    }),
    prisma.user.count(),
  ]);
  res.json({ data: users, pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) } });
});

// PUT /api/admin/users/:id — update user role
router.put("/users/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const { role } = req.body;
  if (role && !["ADMIN", "DEALER", "ARCHITECT", "CUSTOMER"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { ...(role && { role }) },
    select: { id: true, name: true, email: true, role: true },
  });
  res.json(updated);
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "ADMIN") return res.status(403).json({ message: "Cannot delete admin users" });

  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: "User deleted" });
});

export default router;
