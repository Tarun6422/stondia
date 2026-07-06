import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize, optionalAuth } from "../middleware/auth.js";
import { validate, productSchema } from "../lib/validation.js";
import { NotFoundError } from "../lib/errors.js";
import { slugify, paginationParams, buildSearchFilter } from "../lib/prisma-helpers.js";
import { deleteFilesByUrls } from "../lib/upload.js";

const router = Router();

// GET /api/products — public list with filters
router.get("/", optionalAuth, async (req: Request, res: Response) => {
  const { skip, take, page, limit } = paginationParams(req.query);
  const { search, category, featured, sort } = req.query as Record<string, string | undefined>;

  const where: Record<string, unknown> = {};

  if (search) Object.assign(where, buildSearchFilter(search, ["name", "description", "tags"]));
  if (category) where.categoryId = category;
  if (featured === "true") where.featured = true;

  const orderBy: Record<string, unknown> = {};
  switch (sort) {
    case "name_asc": orderBy.name = "asc"; break;
    case "name_desc": orderBy.name = "desc"; break;
    case "newest": orderBy.createdAt = "desc"; break;
    case "oldest": orderBy.createdAt = "asc"; break;
    default: orderBy.createdAt = "desc";
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    data: products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/products/featured — featured products
router.get("/featured", async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    where: { featured: true },
    take: 6,
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ data: products });
});

// GET /api/products/related/:id
router.get("/related/:id", async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    select: { categoryId: true },
  });
  if (!product) throw new NotFoundError("Product");

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: req.params.id } },
    take: 4,
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ data: related });
});

// GET /api/products/:slug — single product by slug
router.get("/:slug", async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  if (!product) throw new NotFoundError("Product");
  res.json(product);
});

// POST /api/products — admin create
router.post("/", authenticate, authorize("ADMIN"), validate(productSchema), async (req: Request, res: Response) => {
  const data = req.body;
  const slug = data.slug || slugify(data.name);

  // Ensure unique slug
  let finalSlug = slug;
  let counter = 1;
  while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  const product = await prisma.product.create({
    data: { ...data, slug: finalSlug },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  res.status(201).json(product);
});

// PUT /api/products/:id — admin update
router.put("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) throw new NotFoundError("Product");

  const data = req.body;
  if (data.slug && data.slug !== product.slug) {
    const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existing) data.slug = `${data.slug}-${Date.now()}`;
  }

  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data,
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  res.json(updated);
});

// DELETE /api/products/:id — admin delete
router.delete("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) throw new NotFoundError("Product");

  // Delete associated images from Supabase Storage
  if (product.images && product.images.length > 0) {
    await deleteFilesByUrls(product.images).catch(() => {});
  }

  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ message: "Product deleted" });
});

export default router;
