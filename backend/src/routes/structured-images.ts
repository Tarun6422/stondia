/* ------------------------------------------------------------------ */
/*  Structured Images API Routes                                       */
/*  /api/structured-images — CRUD for entity-linked images            */
/*  Also provides /api/structured-images/by-category/:id              */
/*  and /api/structured-images/by-product/:id                        */
/* ------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { NotFoundError } from "../lib/errors.js";

const router = Router();

/* ─── IMAGE TYPES ─── */
export const IMAGE_TYPES = [
  "cover",
  "banner",
  "thumbnail",
  "gallery",
  "texture",
  "project",
  "application",
  "catalogue_cover",
  "seo",
] as const;

export type ImageType = (typeof IMAGE_TYPES)[number];

/* ─── HELPERS ─── */

/** Generate alt text automatically from entity name + image type */
function generateAltText(
  imageType: string,
  entityName?: string,
  fallback?: string,
): string {
  const typeLabels: Record<string, string> = {
    cover: "Cover Image",
    banner: "Banner Image",
    thumbnail: "Thumbnail",
    gallery: "Gallery Image",
    texture: "Texture Image",
    project: "Project Image",
    application: "Application Image",
    catalogue_cover: "Catalogue Cover",
    seo: "SEO Image",
  };
  const typeLabel = typeLabels[imageType] || imageType;
  if (entityName) return `${entityName} — ${typeLabel}`;
  return fallback || typeLabel;
}

/** Generate a descriptive filename from product code + image type + index */
export function generateImageFilename(
  identifier: string,
  imageType: string,
  index?: number,
): string {
  const suffix = index !== undefined ? `-${index + 1}` : "";
  return `${identifier}-${imageType}${suffix}.jpg`
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-");
}

/* ══════════════════════════════════════════════════════════════════ */
/*  GET /api/structured-images — list all (+ optional filters)       */
/* ══════════════════════════════════════════════════════════════════ */

router.get("/", async (req: Request, res: Response) => {
  const {
    page = "1",
    limit = "50",
    imageType,
    categoryId,
    productId,
    projectId,
    productCode,
    search,
    sort = "newest",
  } = req.query as Record<string, string>;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where: Record<string, unknown> = {};
  if (imageType) where.imageType = imageType;
  if (categoryId) where.categoryId = categoryId;
  if (productId) where.productId = productId;
  if (projectId) where.projectId = projectId;
  if (productCode) where.productCode = productCode;
  
  // Search by productCode across product and category names
  if (search) {
    where.OR = [
      { productCode: { contains: search, mode: "insensitive" } },
      { fileName: { contains: search, mode: "insensitive" } },
      { altText: { contains: search, mode: "insensitive" } },
      { displayName: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: Record<string, string> =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "type"
        ? { imageType: "asc" }
        : { createdAt: "desc" };

  const [data, total] = await Promise.all([
    prisma.structuredImage.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        product: { select: { id: true, name: true, slug: true, productCode: true } },
      },
    }),
    prisma.structuredImage.count({ where }),
  ]);

  res.json({
    data,
    pagination: {
      page: parseInt(page),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  });
});

/* ══════════════════════════════════════════════════════════════════ */
/*  GET /api/structured-images/by-category/:id                       */
/*  Returns all structured images for a category, grouped by type     */
/* ══════════════════════════════════════════════════════════════════ */

router.get("/by-category/:id", async (req: Request, res: Response) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id as string },
  });
  if (!category) throw new NotFoundError("Category");

  const images = await prisma.structuredImage.findMany({
    where: { categoryId: category.id },
    orderBy: [{ imageType: "asc" }, { sortOrder: "asc" }],
  });

  // Group by type
  const grouped: Record<string, typeof images> = {};
  for (const img of images) {
    if (!grouped[img.imageType]) grouped[img.imageType] = [];
    grouped[img.imageType].push(img);
  }

  return res.json({
    category: { id: category.id, name: category.name, slug: category.slug },
    images,
    grouped,
  });
});

/* ══════════════════════════════════════════════════════════════════ */
/*  GET /api/structured-images/by-product/:id                        */
/*  Returns all structured images for a product, grouped by type      */
/* ══════════════════════════════════════════════════════════════════ */

router.get("/by-product/:id", async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id as string },
  });
  if (!product) throw new NotFoundError("Product");

  const images = await prisma.structuredImage.findMany({
    where: { productId: product.id },
    orderBy: [{ imageType: "asc" }, { sortOrder: "asc" }],
  });

  const grouped: Record<string, typeof images> = {};
  for (const img of images) {
    if (!grouped[img.imageType]) grouped[img.imageType] = [];
    grouped[img.imageType].push(img);
  }

  return res.json({
    product: { id: product.id, name: product.name, slug: product.slug, productCode: product.productCode },
    images,
    grouped,
  });
});

/* ══════════════════════════════════════════════════════════════════ */
/*  GET /api/structured-images/by-slug/:slug                         */
/*  Find structured images by entity slug (auto-detects category vs product) */
/* ══════════════════════════════════════════════════════════════════ */

router.get("/by-slug/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;

  const category = await prisma.category.findUnique({ where: { slug } });
  if (category) {
    const images = await prisma.structuredImage.findMany({
      where: { categoryId: category.id },
      orderBy: [{ imageType: "asc" }, { sortOrder: "asc" }],
    });
    const grouped: Record<string, typeof images> = {};
    for (const img of images) {
      if (!grouped[img.imageType]) grouped[img.imageType] = [];
      grouped[img.imageType].push(img);
    }
    return res.json({ entity: "category", data: { ...category, images, grouped } });
  }

  const product = await prisma.product.findUnique({ where: { slug } });
  if (product) {
    const images = await prisma.structuredImage.findMany({
      where: { productId: product.id },
      orderBy: [{ imageType: "asc" }, { sortOrder: "asc" }],
    });
    const grouped: Record<string, typeof images> = {};
    for (const img of images) {
      if (!grouped[img.imageType]) grouped[img.imageType] = [];
      grouped[img.imageType].push(img);
    }
    return res.json({ entity: "product", data: { ...product, images, grouped } });
  }

  throw new NotFoundError("Entity not found by slug");
});

/* ══════════════════════════════════════════════════════════════════ */
/*  GET /api/structured-images/by-productCode/:productCode          */
/*  Find structured images by product code                           */
/* ══════════════════════════════════════════════════════════════════ */

router.get("/by-productCode/:productCode", async (req: Request, res: Response) => {
  const { productCode } = req.params;

  const images = await prisma.structuredImage.findMany({
    where: { productCode },
    orderBy: [{ imageType: "asc" }, { sortOrder: "asc" }],
    include: {
      product: { select: { id: true, name: true, slug: true, productCode: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  const grouped: Record<string, typeof images> = {};
  for (const img of images) {
    if (!grouped[img.imageType]) grouped[img.imageType] = [];
    grouped[img.imageType].push(img);
  }

  return res.json({
    productCode,
    images,
    grouped,
  });
});

/* ══════════════════════════════════════════════════════════════════ */
/*  POST /api/structured-images — create a new structured image      */
/* ══════════════════════════════════════════════════════════════════ */

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const {
      fileName,
      displayName,
      url,
      imageType,
      categoryId,
      productId,
      projectId,
      productCode,
      altText,
      sortOrder,
      width,
      height,
    } = req.body;

    if (!url || !imageType) {
      return res.status(400).json({ message: "url and imageType are required" });
    }

    if (!IMAGE_TYPES.includes(imageType)) {
      return res.status(400).json({
        message: `Invalid imageType. Must be one of: ${IMAGE_TYPES.join(", ")}`,
      });
    }

    // Auto-generate alt text if not provided
    let finalAlt = altText;
    if (!finalAlt) {
      let entityName: string | undefined;
      if (categoryId) {
        const cat = await prisma.category.findUnique({ where: { id: categoryId } });
        entityName = cat?.name;
      } else if (productId) {
        const prod = await prisma.product.findUnique({ where: { id: productId } });
        entityName = prod?.name;
      }
      finalAlt = generateAltText(imageType, entityName);
    }

    // Resolve productCode from product if not provided
    let finalProductCode = productCode;
    if (!finalProductCode && productId) {
      const prod = await prisma.product.findUnique({ where: { id: productId } });
      if (prod?.productCode) finalProductCode = prod.productCode;
    } else if (!finalProductCode && categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: categoryId } });
      if (cat) finalProductCode = cat.slug.toUpperCase().replace(/-/g, "_");
    }

    // Auto-generate fileName if not provided — use productCode as primary identifier
    let finalFileName = fileName;
    if (!finalFileName) {
      let identifier = "image";
      if (finalProductCode) {
        identifier = finalProductCode.toLowerCase();
      } else if (productId) {
        const prod = await prisma.product.findUnique({ where: { id: productId } });
        if (prod) identifier = prod.slug;
      } else if (categoryId) {
        const cat = await prisma.category.findUnique({ where: { id: categoryId } });
        if (cat) identifier = cat.slug;
      }
      // Get existing count for ordering
      const existing = await prisma.structuredImage.count({
        where: { imageType, categoryId: categoryId || undefined, productId: productId || undefined },
      });
      finalFileName = generateImageFilename(identifier, imageType, existing);
    }

    const image = await prisma.structuredImage.create({
      data: {
        fileName: finalFileName,
        displayName: displayName || finalFileName,
        url,
        imageType,
        productCode: finalProductCode,
        categoryId: categoryId || null,
        productId: productId || null,
        projectId: projectId || null,
        altText: finalAlt,
        sortOrder: sortOrder ?? 0,
        width: width || null,
        height: height || null,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        product: { select: { id: true, name: true, slug: true, productCode: true } },
      },
    });

    res.status(201).json(image);
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  PUT /api/structured-images/:id — update image metadata          */
/* ══════════════════════════════════════════════════════════════════ */

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const existing = await prisma.structuredImage.findUnique({
      where: { id: req.params.id as string },
    });
    if (!existing) throw new NotFoundError("StructuredImage");

    const { displayName, altText, sortOrder, imageType, productCode } = req.body;
    const data: Record<string, unknown> = {};
    if (displayName !== undefined) data.displayName = displayName;
    if (altText !== undefined) data.altText = altText;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;
    if (productCode !== undefined) data.productCode = productCode;
    if (imageType !== undefined) {
      if (!IMAGE_TYPES.includes(imageType)) {
        return res.status(400).json({
          message: `Invalid imageType. Must be one of: ${IMAGE_TYPES.join(", ")}`,
        });
      }
      data.imageType = imageType;
    }

    const updated = await prisma.structuredImage.update({
      where: { id: req.params.id as string },
      data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        product: { select: { id: true, name: true, slug: true, productCode: true } },
      },
    });

    res.json(updated);
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  DELETE /api/structured-images/:id                                */
/* ══════════════════════════════════════════════════════════════════ */

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const existing = await prisma.structuredImage.findUnique({
      where: { id: req.params.id as string },
    });
    if (!existing) throw new NotFoundError("StructuredImage");

    // Delete the file from storage
    if (existing.url) {
      const { deleteFileByUrl } = await import("../lib/upload.js");
      await deleteFileByUrl(existing.url).catch(() => {});
    }

    await prisma.structuredImage.delete({
      where: { id: req.params.id as string },
    });

    res.json({ message: "Image deleted" });
  },
);

export default router;
