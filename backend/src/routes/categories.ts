import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { NotFoundError } from "../lib/errors.js";
import { slugify } from "../lib/prisma-helpers.js";
import { deleteFileByUrl } from "../lib/upload.js";

const router = Router();

// GET /api/categories — public list
router.get("/", async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  res.json({ data: categories });
});

// GET /api/categories/:slug — single with products
router.get("/:slug", async (req: Request, res: Response) => {
  const category = await prisma.category.findUnique({
    where: { slug: req.params.slug },
    include: {
      products: { take: 12, orderBy: { createdAt: "desc" } },
      _count: { select: { products: true } },
    },
  });
  if (!category) throw new NotFoundError("Category");
  res.json(category);
});

// POST /api/categories — admin create
router.post("/", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const { name, image, featured, order } = req.body;
  if (!name) throw new NotFoundError("Name is required");

  const slug = slugify(name);
  const category = await prisma.category.create({
    data: { name, slug, image, featured: featured ?? false, order: order ?? 0 },
  });
  res.status(201).json(category);
});

// PUT /api/categories/:id — admin update
router.put("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const category = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!category) throw new NotFoundError("Category");

  const data = req.body;
  if (data.name && data.name !== category.name) {
    data.slug = slugify(data.name);
  }

  const updated = await prisma.category.update({
    where: { id: req.params.id },
    data,
  });
  res.json(updated);
});

// DELETE /api/categories/:id — admin delete
router.delete("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const category = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!category) throw new NotFoundError("Category");

  // Delete associated image from Supabase Storage
  if (category.image) {
    await deleteFileByUrl(category.image).catch(() => {});
  }

  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ message: "Category deleted" });
});

export default router;
