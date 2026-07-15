/* ------------------------------------------------------------------ */
/*  Catalog Routes — public APIs for the Digital Stone Catalog        */
/* ------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { NotFoundError } from "../lib/errors.js";
import { parseUserAgent } from "../lib/ua-parser.js";

const router = Router();

// GET /api/catalog — list published catalogs with search, filter, sort, pagination
router.get("/", async (req: Request, res: Response) => {
  const {
    search,
    category,
    featured,
    sort = "newest",
    page = "1",
    limit = "20",
  } = req.query as Record<string, string>;

  const where: any = { published: true };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category && category !== "All") {
    where.category = { equals: category, mode: "insensitive" };
  }

  if (featured === "true") {
    where.featured = true;
  }

  let orderBy: any = { createdAt: "desc" };
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
      orderBy = { createdAt: "desc" };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [catalogs, total] = await Promise.all([
    prisma.download.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        category: true,
        coverImage: true,
        pdf: true,
        fileSize: true,
        downloadCount: true,
        featured: true,
        createdAt: true,
        updatedAt: true,
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

// GET /api/catalog/categories — list distinct categories
router.get("/categories", async (_req: Request, res: Response) => {
  const categories = await prisma.download.findMany({
    where: { published: true, category: { not: null } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  res.json({ data: categories.map((c) => c.category).filter(Boolean) });
});

// GET /api/catalog/search — quick search
router.get("/search", async (req: Request, res: Response) => {
  const q = ((req.query.q as string) || "").trim();
  if (!q) {
    return res.json({ data: [], total: 0 });
  }

  const catalogs = await prisma.download.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { downloadCount: "desc" },
    take: 10,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      category: true,
      coverImage: true,
      fileSize: true,
      downloadCount: true,
      createdAt: true,
    },
  });

  res.json({ data: catalogs, total: catalogs.length });
});

// GET /api/catalog/:slug — single catalog detail
router.get("/:slug", async (req: Request, res: Response) => {
  const catalog = await prisma.download.findUnique({
    where: { slug: req.params.slug as string },
  });
  if (!catalog) throw new NotFoundError("Catalog");
  res.json(catalog);
});

// GET /api/catalog/:id/download — download PDF + increment counter
router.get("/:id/download", async (req: Request, res: Response) => {
  const catalog = await prisma.download.findUnique({
    where: { id: req.params.id as string },
  });
  if (!catalog) throw new NotFoundError("Catalog");
  if (!catalog.pdf) throw new NotFoundError("PDF file");

  // Increment download count
  await prisma.download.update({
    where: { id: req.params.id as string },
    data: { downloadCount: { increment: 1 } },
  });

  // Parse user agent for enriched analytics
  const ua = (req.headers["user-agent"] || "").slice(0, 255);
  const parsed = parseUserAgent(ua);

  // Log the download with enriched data
  await prisma.downloadLog
    .create({
      data: {
        downloadId: catalog.id,
        ip: (req.ip || req.socket.remoteAddress || "").slice(0, 45),
        userAgent: ua,
        country: (req.headers["cf-ipcountry"] as string) || 
                 (req.headers["x-vercel-ip-country"] as string) || 
                 (req.headers["x-forwarded-for"] ? "Detected" : null),
        browser: parsed.browser.slice(0, 50),
        device: parsed.device.slice(0, 50),
        referrer: (req.headers["referer"] || "").slice(0, 255) || null,
      },
    })
    .catch(() => {}); // fire-and-forget, don't block download

  // Redirect to the actual PDF URL
  res.redirect(302, catalog.pdf);
});

export default router;
