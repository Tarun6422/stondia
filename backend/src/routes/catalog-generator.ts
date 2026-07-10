/* ------------------------------------------------------------------ */
/*  Catalog Generator API Routes                                       */
/*  /api/catalog-generator — Admin generates catalogs, public views   */
/* ------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { NotFoundError } from "../lib/errors.js";
import { slugify } from "../lib/prisma-helpers.js";
import { generateAndSaveCatalog } from "../services/pdf-generator.js";

const router = Router();

/* ══════════════════════════════════════════════════════════════════ */
/*  ADMIN: LIST all generated catalogs                               */
/* ══════════════════════════════════════════════════════════════════ */

router.get("/", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const {
    page = "1",
    limit = "20",
    type,
    search,
    status,
  } = req.query as Record<string, string | undefined>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [catalogs, total] = await Promise.all([
    prisma.generatedCatalog.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take,
    }),
    prisma.generatedCatalog.count({ where }),
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

/* ══════════════════════════════════════════════════════════════════ */
/*  ADMIN: GET single catalog                                        */
/* ══════════════════════════════════════════════════════════════════ */

router.get("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const catalog = await prisma.generatedCatalog.findUnique({
    where: { id: req.params.id as string },
  });
  if (!catalog) throw new NotFoundError("Catalog");

  // Get version history
  const versions = await prisma.catalogVersion.findMany({
    where: { catalogId: catalog.id },
    orderBy: { version: "desc" },
  });

  res.json({ ...catalog, versions });
});

/* ══════════════════════════════════════════════════════════════════ */
/*  ADMIN: UPDATE catalog metadata (title, description, status)      */
/* ══════════════════════════════════════════════════════════════════ */

router.put("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const catalog = await prisma.generatedCatalog.findUnique({
    where: { id: req.params.id as string },
  });
  if (!catalog) throw new NotFoundError("Catalog");

  const { title, description, status } = req.body;
  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (status !== undefined) data.status = status;

  const updated = await prisma.generatedCatalog.update({
    where: { id: req.params.id as string },
    data,
  });
  res.json(updated);
});

/* ══════════════════════════════════════════════════════════════════ */
/*  ADMIN: DELETE catalog (and its PDF from storage)                 */
/* ══════════════════════════════════════════════════════════════════ */

router.delete("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const catalog = await prisma.generatedCatalog.findUnique({
    where: { id: req.params.id as string },
  });
  if (!catalog) throw new NotFoundError("Catalog");

  // Delete PDF from storage
  if (catalog.pdfUrl) {
    const { deleteFileByUrl } = await import("../lib/upload.js");
    await deleteFileByUrl(catalog.pdfUrl).catch(() => {});
  }

  // Delete version history PDFs
  const versions = await prisma.catalogVersion.findMany({
    where: { catalogId: catalog.id },
  });
  const { deleteFileByUrl: delFile } = await import("../lib/upload.js");
  for (const v of versions) {
    if (v.pdfUrl) await delFile(v.pdfUrl).catch(() => {});
  }

  await prisma.generatedCatalog.delete({ where: { id: req.params.id as string } });
  res.json({ message: "Catalog deleted" });
});

/* ══════════════════════════════════════════════════════════════════ */
/*  ADMIN: GENERATE Master Company Catalog                           */
/* ══════════════════════════════════════════════════════════════════ */

router.post(
  "/generate/master",
  authenticate,
  authorize("ADMIN"),
  async (_req: Request, res: Response) => {
    try {
      const result = await generateAndSaveCatalog("master");
      res.json({
        message: "Master catalog generated successfully",
        ...result,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to generate master catalog" });
    }
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  ADMIN: GENERATE Category Catalog for a specific category        */
/* ══════════════════════════════════════════════════════════════════ */

router.post(
  "/generate/category/:categoryId",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const category = await prisma.category.findUnique({
        where: { id: req.params.categoryId as string },
      });
      if (!category) throw new NotFoundError("Category");

      const result = await generateAndSaveCatalog("category", req.params.categoryId as string);
      res.json({
        message: `Category catalog "${category.name}" generated successfully`,
        ...result,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to generate category catalog" });
    }
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  ADMIN: GENERATE Product Catalog for a specific product          */
/* ══════════════════════════════════════════════════════════════════ */

router.post(
  "/generate/product/:productId",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: req.params.productId as string },
      });
      if (!product) throw new NotFoundError("Product");

      const result = await generateAndSaveCatalog("product", req.params.productId as string);
      res.json({
        message: `Product catalog "${product.name}" generated successfully`,
        ...result,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to generate product catalog" });
    }
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  ADMIN: REGENERATE (increment version)                           */
/* ══════════════════════════════════════════════════════════════════ */

router.post(
  "/regenerate/:id",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const catalog = await prisma.generatedCatalog.findUnique({
        where: { id: req.params.id as string },
      });
      if (!catalog) throw new NotFoundError("Catalog");

      const refId = catalog.categoryId || catalog.productId;
      const result = await generateAndSaveCatalog(
        catalog.type as "master" | "category" | "product",
        refId || undefined,
      );
      res.json({
        message: `Catalog regenerated (version ${result.version})`,
        ...result,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to regenerate catalog" });
    }
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  ADMIN: PUBLISH / UNPUBLISH catalog                               */
/* ══════════════════════════════════════════════════════════════════ */

router.patch(
  "/:id/publish",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const catalog = await prisma.generatedCatalog.findUnique({
      where: { id: req.params.id as string },
    });
    if (!catalog) throw new NotFoundError("Catalog");

    const updated = await prisma.generatedCatalog.update({
      where: { id: req.params.id as string },
      data: { status: catalog.status === "published" ? "draft" : "published" },
    });
    res.json(updated);
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  PUBLIC: LIST published catalogs                                  */
/* ══════════════════════════════════════════════════════════════════ */

router.get("/public", async (req: Request, res: Response) => {
  const { page = "1", limit = "20", type } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where: Record<string, unknown> = { status: "published" };
  if (type) where.type = type;

  const [catalogs, total] = await Promise.all([
    prisma.generatedCatalog.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        type: true,
        title: true,
        slug: true,
        description: true,
        pdfUrl: true,
        coverImage: true,
        downloadCount: true,
        fileSize: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.generatedCatalog.count({ where }),
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

/* ══════════════════════════════════════════════════════════════════ */
/*  PUBLIC: GET single published catalog (tracks download)           */
/* ══════════════════════════════════════════════════════════════════ */

router.get("/public/:slug", async (req: Request, res: Response) => {
  const catalog = await prisma.generatedCatalog.findUnique({
    where: { slug: req.params.slug as string },
  });

  if (!catalog || catalog.status !== "published") {
    throw new NotFoundError("Catalog");
  }

  res.json(catalog);
});

/* ══════════════════════════════════════════════════════════════════ */
/*  PUBLIC: DOWNLOAD catalog PDF (increments counter)               */
/* ══════════════════════════════════════════════════════════════════ */

router.get("/public/:slug/download", async (req: Request, res: Response) => {
  const catalog = await prisma.generatedCatalog.findUnique({
    where: { slug: req.params.slug as string },
  });

  if (!catalog || !catalog.pdfUrl) {
    throw new NotFoundError("Catalog PDF not found");
  }

  // Increment download count and track timestamp
  await prisma.generatedCatalog.update({
    where: { id: catalog.id },
    data: { downloadCount: { increment: 1 }, lastDownloadAt: new Date() },
  });

  // Redirect to the PDF URL
  res.redirect(302, catalog.pdfUrl);
});

/* ══════════════════════════════════════════════════════════════════ */
/*  PUBLIC: GET analytics summary (for admin dashboard)              */
/* ══════════════════════════════════════════════════════════════════ */

router.get(
  "/analytics/summary",
  authenticate,
  authorize("ADMIN"),
  async (_req: Request, res: Response) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCatalogs,
      publishedCatalogs,
      totalDownloads,
      masterCount,
      categoryCount,
      productCount,
      mostDownloaded,
    ] = await Promise.all([
      prisma.generatedCatalog.count(),
      prisma.generatedCatalog.count({ where: { status: "published" } }),
      prisma.generatedCatalog.aggregate({ _sum: { downloadCount: true } }),
      prisma.generatedCatalog.count({ where: { type: "master" } }),
      prisma.generatedCatalog.count({ where: { type: "category" } }),
      prisma.generatedCatalog.count({ where: { type: "product" } }),
      prisma.generatedCatalog.findFirst({
        orderBy: { downloadCount: "desc" },
        select: { id: true, title: true, downloadCount: true, type: true },
      }),
    ]);

    res.json({
      totalCatalogs,
      publishedCatalogs,
      totalDownloads: totalDownloads._sum.downloadCount || 0,
      masterCount,
      categoryCount,
      productCount,
      mostDownloaded,
    });
  },
);

export default router;
