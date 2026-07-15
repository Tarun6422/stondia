import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize, optionalAuth } from "../middleware/auth.js";
import { validate, productSchema } from "../lib/validation.js";
import { NotFoundError } from "../lib/errors.js";
import { slugify, paginationParams, buildSearchFilter } from "../lib/prisma-helpers.js";
import { deleteFilesByUrls } from "../lib/upload.js";

const router = Router();

/* ── Include config for public product queries (includes metadata + category + structuredImages) ── */
const PUBLIC_INCLUDE = {
  category: { select: { id: true, name: true, slug: true } },
  structuredImages: {
    orderBy: [{ imageType: 'asc' as const }, { sortOrder: 'asc' as const }],
  },
};

/* ── Category prefix map for auto-generating product codes ── */
const CATEGORY_CODE_PREFIX: Record<string, string> = {
  sandstone: "SAN",
  granite: "GRA",
  marble: "MAR",
  limestone: "LMS",
  slate: "SLA",
  quartzite: "QUA",
  "wall cladding": "WCL",
  flooring: "FLR",
  paving: "PAV",
  cobbles: "COB",
  kerbstone: "KRB",
  "pool coping": "PCP",
  steps: "STP",
  "garden stone": "GDS",
  "landscape stone": "LDS",
  columns: "COL",
  balusters: "BAL",
  jali: "JAL",
  carvings: "CAR",
  "temple stone": "TMP",
  "custom stone": "CST",
};

/** Auto-generate a product code based on category name */
async function generateProductCode(categoryId: string): Promise<string> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new NotFoundError("Category");

  const prefix = CATEGORY_CODE_PREFIX[category.name.toLowerCase()] || category.name.slice(0, 3).toUpperCase();
  
  // Find the highest existing code with this prefix
  const existing = await prisma.product.findMany({
    where: { productCode: { startsWith: prefix } },
    orderBy: { productCode: "desc" },
    take: 1,
  });

  let nextNum = 1;
  if (existing.length > 0 && existing[0].productCode) {
    const match = existing[0].productCode.match(/-(\d+)$/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  return `${prefix}-${String(nextNum).padStart(3, "0")}`;
}

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
    case "name_asc":
      orderBy.name = "asc";
      break;
    case "name_desc":
      orderBy.name = "desc";
      break;
    case "newest":
      orderBy.createdAt = "desc";
      break;
    case "oldest":
      orderBy.createdAt = "asc";
      break;
    default:
      orderBy.createdAt = "desc";
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy,
      include: PUBLIC_INCLUDE,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    data: products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/products/featured — featured products (also returns if none explicitly featured, latest 6)
router.get("/featured", async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    where: { featured: true },
    take: 6,
    include: PUBLIC_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  // If no featured products, return latest 6
  if (products.length === 0) {
    const latest = await prisma.product.findMany({
      take: 6,
      include: PUBLIC_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return res.json({ data: latest });
  }
  res.json({ data: products });
});

// GET /api/products/related/:id
router.get("/related/:id", async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id as string },
    select: { categoryId: true },
  });
  if (!product) throw new NotFoundError("Product");

  let related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: req.params.id as string } },
    take: 4,
    include: PUBLIC_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  
  // If not enough same-category products, fill with others
  if (related.length < 4) {
    const others = await prisma.product.findMany({
      where: { id: { not: req.params.id as string }, categoryId: { not: product.categoryId } },
      take: 8 - related.length,
      include: PUBLIC_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    related = [...related, ...others];
  }
  
  res.json({ data: related });
});

// GET /api/products/:slug — single product by slug (with structured images)
router.get("/:slug", async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug as string },
    include: PUBLIC_INCLUDE,
  });
  if (!product) throw new NotFoundError("Product");
  res.json(product);
});

// POST /api/products — admin create
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(productSchema),
  async (req: Request, res: Response) => {
    const data = req.body;
    const slug = data.slug || slugify(data.name);

    // Ensure unique slug
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // Auto-generate productCode if not provided
    let finalProductCode = data.productCode;
    if (!finalProductCode && data.categoryId) {
      finalProductCode = await generateProductCode(data.categoryId);
    }

    const product = await prisma.product.create({
      data: { ...data, slug: finalSlug, productCode: finalProductCode || null },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    res.status(201).json(product);
  },
);

// POST /api/products/regenerate-codes — admin: regenerate missing product codes
// Also populates productCode on existing StructuredImage records
router.post(
  "/regenerate-codes",
  authenticate,
  authorize("ADMIN"),
  async (_req: Request, res: Response) => {
    const products = await prisma.product.findMany({
      where: { productCode: null },
      include: { category: true },
    });

    let updated = 0;
    let imagesUpdated = 0;
    for (const product of products) {
      const code = await generateProductCode(product.categoryId);
      await prisma.product.update({
        where: { id: product.id },
        data: { productCode: code },
      });
      updated++;

      // Also update productCode on existing StructuredImage records for this product
      const result = await prisma.structuredImage.updateMany({
        where: { productId: product.id, productCode: null },
        data: { productCode: code },
      });
      imagesUpdated += result.count;
    }

    res.json({ message: `${updated} product codes generated, ${imagesUpdated} image records updated` });
  },
);

// PUT /api/products/:id — admin update
router.put("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id as string } });
  if (!product) throw new NotFoundError("Product");

  const data = req.body;
  if (data.slug && data.slug !== product.slug) {
    const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existing) data.slug = `${data.slug}-${Date.now()}`;
  }

  // Auto-generate productCode if not set yet
  if (!product.productCode && !data.productCode && data.categoryId) {
    data.productCode = await generateProductCode(data.categoryId);
  }

  const updated = await prisma.product.update({
    where: { id: req.params.id as string },
    data,
    include: PUBLIC_INCLUDE,
  });
  res.json(updated);
});

// DELETE /api/products/:id — admin delete
router.delete("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id as string } });
  if (!product) throw new NotFoundError("Product");

  // Delete associated images from Supabase Storage
  if (product.images && product.images.length > 0) {
    await deleteFilesByUrls(product.images).catch(() => {});
  }

  await prisma.product.delete({ where: { id: req.params.id as string } });
  res.json({ message: "Product deleted" });
});

export default router;
