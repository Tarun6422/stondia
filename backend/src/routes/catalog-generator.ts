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
import { parseUserAgent } from "../lib/ua-parser.js";

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
/*  ADMIN: UPDATE catalog metadata (title, description, status,      */
/*  tags, coverImage, categoryId, productId)                         */
/* ══════════════════════════════════════════════════════════════════ */

router.put("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const catalog = await prisma.generatedCatalog.findUnique({
    where: { id: req.params.id as string },
  });
  if (!catalog) throw new NotFoundError("Catalog");

  const { title, description, status, tags, coverImage, categoryId, productId, fileSize } = req.body;
  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (status !== undefined) data.status = status;
  if (tags !== undefined) data.tags = tags;
  if (coverImage !== undefined) data.coverImage = coverImage;
  if (categoryId !== undefined) data.categoryId = categoryId;
  if (productId !== undefined) data.productId = productId;
  if (fileSize !== undefined) data.fileSize = fileSize;

  const updated = await prisma.generatedCatalog.update({
    where: { id: req.params.id as string },
    data,
  });
  res.json(updated);
});

/* ══════════════════════════════════════════════════════════════════ */
/*  ADMIN: UPLOAD PDF — create a catalog entry from an uploaded PDF  */
/*  Body: { title, type, pdfUrl, coverImage?, tags?, description?,   */
/*          categoryId?, productId?, fileSize?, featured? }           */
/* ══════════════════════════════════════════════════════════════════ */

router.post(
  "/upload",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const {
      title,
      type = "master",
      pdfUrl,
      coverImage,
      tags,
      description,
      categoryId,
      productId,
      fileSize,
      featured,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "title is required" });
    }
    if (!pdfUrl) {
      return res.status(400).json({ message: "pdfUrl is required" });
    }

    // Validate type
    const validTypes = ["master", "category", "product"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: `type must be one of: ${validTypes.join(", ")}`,
      });
    }

    // Auto-generate slug
    let slug = slugify(title);
    let counter = 1;
    while (await prisma.generatedCatalog.findUnique({ where: { slug } })) {
      slug = `${slugify(title)}-${counter++}`;
    }

    // Validate categoryId if provided
    if (categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!cat) return res.status(400).json({ message: "Category not found" });
    }

    // Validate productId if provided
    if (productId) {
      const prod = await prisma.product.findUnique({ where: { id: productId } });
      if (!prod) return res.status(400).json({ message: "Product not found" });
    }

    const catalog = await prisma.generatedCatalog.create({
      data: {
        type,
        title,
        slug,
        description: description || null,
        pdfUrl,
        coverImage: coverImage || null,
        tags: tags || [],
        categoryId: categoryId || null,
        productId: productId || null,
        fileSize: fileSize || null,
        featured: featured || false,
        status: "draft",
        version: 1,
        metadata: { source: "manual_upload" },
      },
    });

    res.status(201).json(catalog);
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  ADMIN: RESOLVE ASSIGNMENTS — resolve categoryId/productId IDs   */
/*  to display names (must be before any /:id routes)                */
/* ══════════════════════════════════════════════════════════════════ */

router.post(
  "/resolve-assignments",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const { categoryId, productId } = req.body;

    let categoryName: string | null = null;
    let productName: string | null = null;
    let productCode: string | null = null;

    if (categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: categoryId as string } });
      if (cat) categoryName = cat.name;
    }

    if (productId) {
      const prod = await prisma.product.findUnique({ where: { id: productId as string } });
      if (prod) {
        productName = prod.name;
        productCode = prod.productCode;
      }
    }

    res.json({ categoryName, productName, productCode });
  },
);

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
  async (req: Request, res: Response) => {
    try {
      const { theme, language, templateId } = req.body;
      const result = await generateAndSaveCatalog("master", undefined, {
        theme,
        language,
        templateId,
      });
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

      const { theme, language, templateId } = req.body;
      const result = await generateAndSaveCatalog(
        "category",
        req.params.categoryId as string,
        { theme, language, templateId },
      );
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

      const { theme, language, templateId } = req.body;
      const result = await generateAndSaveCatalog(
        "product",
        req.params.productId as string,
        { theme, language, templateId },
      );
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

      const { theme, language, templateId } = req.body;
      const refId = catalog.categoryId || catalog.productId;
      const result = await generateAndSaveCatalog(
        catalog.type as "master" | "category" | "product",
        refId || undefined,
        {
          theme: theme || (catalog.metadata as any)?.theme || undefined,
          language: language || (catalog.metadata as any)?.language || undefined,
          templateId: templateId || catalog.templateId || undefined,
        },
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
/*  ADMIN: PUBLISH / UNPUBLISH / ARCHIVE catalog                     */
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
/*  ADMIN: FEATURE / UNFEATURE catalog                               */
/* ══════════════════════════════════════════════════════════════════ */

router.patch(
  "/:id/feature",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const catalog = await prisma.generatedCatalog.findUnique({
      where: { id: req.params.id as string },
    });
    if (!catalog) throw new NotFoundError("Catalog");

    const updated = await prisma.generatedCatalog.update({
      where: { id: req.params.id as string },
      data: { featured: !catalog.featured },
    });
    res.json(updated);
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  ADMIN: ARCHIVE / UNARCHIVE catalog                               */
/* ══════════════════════════════════════════════════════════════════ */

router.patch(
  "/:id/archive",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const catalog = await prisma.generatedCatalog.findUnique({
      where: { id: req.params.id as string },
    });
    if (!catalog) throw new NotFoundError("Catalog");

    const newStatus = catalog.status === "archived" ? "draft" : "archived";
    const updated = await prisma.generatedCatalog.update({
      where: { id: req.params.id as string },
      data: { status: newStatus },
    });
    res.json(updated);
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  ADMIN: DUPLICATE catalog (deep copy with new slug)               */
/* ══════════════════════════════════════════════════════════════════ */

router.post(
  "/:id/duplicate",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const catalog = await prisma.generatedCatalog.findUnique({
      where: { id: req.params.id as string },
    });
    if (!catalog) throw new NotFoundError("Catalog");

    let newSlug = `${catalog.slug}-copy`;
    let counter = 1;
    while (await prisma.generatedCatalog.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${catalog.slug}-copy-${counter++}`;
    }

    const dup = await prisma.generatedCatalog.create({
      data: {
        type: catalog.type,
        title: `${catalog.title} (Copy)`,
        slug: newSlug,
        description: catalog.description,
        pdfUrl: catalog.pdfUrl,
        coverImage: catalog.coverImage,
        categoryId: catalog.categoryId,
        productId: catalog.productId,
        status: "draft",
        displayOrder: 0,
        version: 1,
        fileSize: catalog.fileSize,
        metadata: catalog.metadata as any,
        templateId: catalog.templateId,
      },
    });

    res.status(201).json(dup);
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  ADMIN: RESTORE version (rollback to a previous version)         */
/* ══════════════════════════════════════════════════════════════════ */

router.post(
  "/:id/restore/:versionId",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const catalog = await prisma.generatedCatalog.findUnique({
      where: { id: req.params.id as string },
    });
    if (!catalog) throw new NotFoundError("Catalog");

    const version = await prisma.catalogVersion.findUnique({
      where: { id: req.params.versionId as string },
    });
    if (!version || version.catalogId !== catalog.id) {
      throw new NotFoundError("Version");
    }

    // Current version becomes a new history entry
    await prisma.catalogVersion.create({
      data: {
        catalogId: catalog.id,
        version: catalog.version,
        pdfUrl: catalog.pdfUrl,
        fileSize: catalog.fileSize,
        metadata: catalog.metadata as any,
      },
    });

    // Restore the version's PDF and metadata
    const updated = await prisma.generatedCatalog.update({
      where: { id: catalog.id },
      data: {
        pdfUrl: version.pdfUrl,
        fileSize: version.fileSize,
        version: catalog.version + 1,
        metadata: version.metadata as any,
      },
    });

    res.json({ message: `Restored to version ${version.version}`, catalog: updated });
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  ADMIN: BULK DELETE catalogs                                      */
/* ══════════════════════════════════════════════════════════════════ */

router.post(
  "/bulk-delete",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "ids array is required" });
    }

    const results: { id: string; status: string; message?: string }[] = [];

    for (const id of ids) {
      try {
        const catalog = await prisma.generatedCatalog.findUnique({ where: { id } });
        if (!catalog) {
          results.push({ id, status: "skipped", message: "Not found" });
          continue;
        }

        // Delete PDF from storage if exists
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

        await prisma.generatedCatalog.delete({ where: { id } });
        results.push({ id, status: "deleted" });
      } catch (err: any) {
        results.push({ id, status: "error", message: err.message });
      }
    }

    res.json({ results });
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  ADMIN: BULK UPDATE (set status, featured, template, etc.)       */
/* ══════════════════════════════════════════════════════════════════ */

router.post(
  "/bulk-update",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const { ids, data } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "ids array is required" });
    }
    if (!data || typeof data !== "object") {
      return res.status(400).json({ message: "data object is required" });
    }

    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.templateId !== undefined) updateData.templateId = data.templateId;
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const result = await prisma.generatedCatalog.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    });

    res.json({ message: `Updated ${result.count} catalog(s)` });
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  PUBLIC: LIST published catalogs                                  */
/* ══════════════════════════════════════════════════════════════════ */

router.get("/public", async (req: Request, res: Response) => {
  const {
    page = "1",
    limit = "20",
    type,
    search,
    sort = "newest",
  } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where: Record<string, unknown> = { status: "published" };
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  let orderBy: Record<string, string> = { updatedAt: "desc" };
  switch (sort) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "popular":
      orderBy = { downloadCount: "desc" };
      break;
    case "alphabetical":
      orderBy = { title: "asc" };
      break;
    default:
      orderBy = { updatedAt: "desc" };
  }

  const [catalogs, total] = await Promise.all([
    prisma.generatedCatalog.findMany({
      where,
      orderBy,
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
        featured: true,
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
/*  PUBLIC: GET single published catalog (with view tracking)        */
/* ══════════════════════════════════════════════════════════════════ */

router.get("/public/:slug", async (req: Request, res: Response) => {
  const catalog = await prisma.generatedCatalog.findUnique({
    where: { slug: req.params.slug as string },
  });

  if (!catalog || catalog.status !== "published") {
    throw new NotFoundError("Catalog");
  }

  // Track view
  const ua = (req.headers["user-agent"] || "").slice(0, 255);
  const parsed = parseUserAgent(ua);

  prisma.catalogView
    .create({
      data: {
        catalogId: catalog.id,
        ip: (req.ip || req.socket.remoteAddress || "").slice(0, 45),
        userAgent: ua,
        country: (req.headers["cf-ipcountry"] as string) ||
                 (req.headers["x-vercel-ip-country"] as string) ||
                 null,
        browser: parsed.browser.slice(0, 50),
        device: parsed.device.slice(0, 50),
        referrer: (req.headers["referer"] || "").slice(0, 255) || null,
      },
    })
    .catch(() => {}); // fire-and-forget

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

  // Track download with enriched data
  const ua = (req.headers["user-agent"] || "").slice(0, 255);
  const parsed = parseUserAgent(ua);

  prisma.downloadLog
    .create({
      data: {
        downloadId: catalog.id,
        ip: (req.ip || req.socket.remoteAddress || "").slice(0, 45),
        userAgent: ua,
        country: (req.headers["cf-ipcountry"] as string) ||
                 (req.headers["x-vercel-ip-country"] as string) ||
                 null,
        browser: parsed.browser.slice(0, 50),
        device: parsed.device.slice(0, 50),
        referrer: (req.headers["referer"] || "").slice(0, 255) || null,
      },
    })
    .catch(() => {}); // fire-and-forget

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
    async function safeQ<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
      try {
        return await fn();
      } catch (err) {
        console.error(`[Catalog Generator Analytics] "${label}" failed:`, err);
        return fallback;
      }
    }

    const gc = (prisma as any).generatedCatalog;

    const [
      totalCatalogs,
      publishedCatalogs,
      featuredCatalogs,
      archivedCatalogs,
      totalDownloads,
      masterCount,
      categoryCount,
      productCount,
      mostDownloaded,
    ] = await Promise.all([
      safeQ("totalCatalogs", () => prisma.generatedCatalog.count(), 0),
      safeQ("publishedCatalogs", () => prisma.generatedCatalog.count({ where: { status: "published" } }), 0),
      safeQ("featuredCatalogs", () => prisma.generatedCatalog.count({ where: { featured: true } }), 0),
      safeQ("archivedCatalogs", () => prisma.generatedCatalog.count({ where: { status: "archived" } }), 0),
      safeQ("totalDownloads", () => gc?.aggregate({ _sum: { downloadCount: true } }) ?? { _sum: { downloadCount: null } },
        { _sum: { downloadCount: null } }),
      safeQ("masterCount", () => prisma.generatedCatalog.count({ where: { type: "master" } }), 0),
      safeQ("categoryCount", () => prisma.generatedCatalog.count({ where: { type: "category" } }), 0),
      safeQ("productCount", () => prisma.generatedCatalog.count({ where: { type: "product" } }), 0),
      safeQ("mostDownloaded", () => prisma.generatedCatalog.findFirst({
        orderBy: { downloadCount: "desc" },
        select: { id: true, title: true, downloadCount: true, type: true },
      }), null),
    ]);

    res.json({
      totalCatalogs: totalCatalogs ?? 0,
      publishedCatalogs: publishedCatalogs ?? 0,
      featuredCatalogs: featuredCatalogs ?? 0,
      archivedCatalogs: archivedCatalogs ?? 0,
      totalDownloads: totalDownloads?._sum?.downloadCount ?? 0,
      masterCount: masterCount ?? 0,
      categoryCount: categoryCount ?? 0,
      productCount: productCount ?? 0,
      mostDownloaded: mostDownloaded ?? null,
    });
  },
);

export default router;
