/* ------------------------------------------------------------------ */
/*  Media Routes — Media Library CRUD, search, filter, usage tracking */
/* ------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { NotFoundError, AppError } from "../lib/errors.js";
import { deleteFileByUrl, getStorageUsage, formatStorageBytes } from "../lib/upload.js";

const router = Router();

/* ── Prisma Media runtime guard ── */
function getMediaModel() {
  if (!(prisma as any).media) {
    throw new AppError(
      "Media model is not available — run 'npx prisma generate' in the backend directory.",
      503,
    );
  }
  return (prisma as any).media;
}

/* ── Types for usage tracking ── */
type UsageLocation = {
  model: string;
  field: string;
  id: string;
  title: string;
};

async function findMediaUsage(url: string): Promise<UsageLocation[]> {
  const locations: UsageLocation[] = [];

  // Check categories
  const categories = await prisma.category.findMany({ where: { image: url } });
  categories.forEach((c) =>
    locations.push({ model: "Category", field: "image", id: c.id, title: c.name }),
  );

  // Check products (images array)
  const products = await prisma.product.findMany({ where: { images: { has: url } } });
  products.forEach((p) =>
    locations.push({ model: "Product", field: "images", id: p.id, title: p.name }),
  );

  // Check projects (gallery array)
  const projects = await prisma.project.findMany({ where: { gallery: { has: url } } });
  projects.forEach((p) =>
    locations.push({ model: "Project", field: "gallery", id: p.id, title: p.title }),
  );

  // Check blogs
  const blogs = await prisma.blog.findMany({ where: { cover: url } });
  blogs.forEach((b) => locations.push({ model: "Blog", field: "cover", id: b.id, title: b.title }));

  // Check videos
  const videos = await prisma.video.findMany({ where: { thumbnail: url } });
  videos.forEach((v) =>
    locations.push({ model: "Video", field: "thumbnail", id: v.id, title: v.title }),
  );

  // Check videos (videoUrl)
  const videos2 = await prisma.video.findMany({ where: { videoUrl: url } });
  videos2.forEach((v) =>
    locations.push({ model: "Video", field: "videoUrl", id: v.id, title: v.title }),
  );

  // Check testimonials
  const testimonials = await prisma.testimonial.findMany({ where: { photo: url } });
  testimonials.forEach((t) =>
    locations.push({ model: "Testimonial", field: "photo", id: t.id, title: t.client }),
  );

  // Check downloads
  const downloads = await prisma.download.findMany({ where: { coverImage: url } });
  downloads.forEach((d) =>
    locations.push({ model: "Download", field: "coverImage", id: d.id, title: d.title }),
  );

  // Check downloads (pdf)
  const downloads2 = await prisma.download.findMany({ where: { pdf: url } });
  downloads2.forEach((d) =>
    locations.push({ model: "Download", field: "pdf", id: d.id, title: d.title }),
  );

  // Check products (pdf)
  const products2 = await prisma.product.findMany({ where: { pdf: url } });
  products2.forEach((p) =>
    locations.push({ model: "Product", field: "pdf", id: p.id, title: p.name }),
  );

  // Check users (avatar)
  const users = await prisma.user.findMany({ where: { avatar: url } });
  users.forEach((u) => locations.push({ model: "User", field: "avatar", id: u.id, title: u.name }));

  return locations;
}

/* ══════════════════════════════════════════════════════════════════ */
/*  GET /api/media — list all media with search & filters           */
/* ══════════════════════════════════════════════════════════════════ */
router.get("/", async (req: Request, res: Response) => {
  const {
    page = "1",
    limit = "50",
    search,
    type,
    folder,
    sort = "newest",
  } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { originalName: { contains: search, mode: "insensitive" } },
      { alt: { contains: search, mode: "insensitive" } },
      { caption: { contains: search, mode: "insensitive" } },
      { tags: { has: search } },
    ];
  }

  if (type === "image") {
    where.mimeType = { startsWith: "image/" };
  } else if (type === "video") {
    where.mimeType = { startsWith: "video/" };
  } else if (type === "pdf") {
    where.mimeType = "application/pdf";
  }

  if (folder) {
    where.folder = folder;
  }

  const orderBy: Record<string, string> =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "name"
        ? { originalName: "asc" }
        : sort === "size"
          ? { size: "desc" }
          : { createdAt: "desc" };

  const media = getMediaModel();
  const [data, total] = await Promise.all([
    media.findMany({ where, orderBy, skip, take }),
    media.count({ where }),
  ]);

  const safeTake = take || 1;
  res.json({
    data,
    pagination: {
      page: parseInt(page),
      limit: take,
      total,
      totalPages: Math.ceil(total / safeTake),
    },
  });
});

/* ══════════════════════════════════════════════════════════════════ */
/*  GET /api/media/:id — single media item                           */
/* ══════════════════════════════════════════════════════════════════ */
router.get("/:id", async (req: Request, res: Response) => {
  const media = await getMediaModel().findUnique({ where: { id: req.params.id as string } });
  if (!media) throw new NotFoundError("Media");
  res.json(media);
});

/* ══════════════════════════════════════════════════════════════════ */
/*  POST /api/media — register an uploaded file in the media library */
/* ══════════════════════════════════════════════════════════════════ */
router.post("/", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const data = req.body;

  // Build tags array — add file hash if provided for duplicate detection
  const tags: string[] = data.tags || [];
  if (data.hash) {
    const hashTag = `hash:${data.hash}`;
    if (!tags.includes(hashTag)) {
      tags.push(hashTag);
    }
  }

  const media = await getMediaModel().create({
    data: {
      filename: data.filename,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      url: data.url,
      folder: data.folder || "uploads",
      alt: data.alt || null,
      caption: data.caption || null,
      tags,
      width: data.width || null,
      height: data.height || null,
      duration: data.duration || null,
    },
  });
  res.status(201).json(media);
});

/* ══════════════════════════════════════════════════════════════════ */
/*  PUT /api/media/:id — update media metadata (alt, caption, tags)  */
/* ══════════════════════════════════════════════════════════════════ */
router.put("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const m = getMediaModel();
  const media = await m.findUnique({ where: { id: req.params.id as string } });
  if (!media) throw new NotFoundError("Media");

  const { alt, caption, tags } = req.body;
  const updateData: Record<string, unknown> = {};
  if (alt !== undefined) updateData.alt = alt;
  if (caption !== undefined) updateData.caption = caption;
  if (tags !== undefined) updateData.tags = tags;

  const updated = await m.update({
    where: { id: req.params.id as string },
    data: updateData,
  });
  res.json(updated);
});

/* ══════════════════════════════════════════════════════════════════ */
/*  PUT /api/media/:id/rename — rename a media file                  */
/* ══════════════════════════════════════════════════════════════════ */
router.put(
  "/:id/rename",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const m = getMediaModel();
    const media = await m.findUnique({ where: { id: req.params.id as string } });
    if (!media) throw new NotFoundError("Media");

    const { originalName } = req.body;
    if (!originalName?.trim()) {
      return res.status(400).json({ message: "originalName is required" });
    }

    const updated = await m.update({
      where: { id: req.params.id as string },
      data: { originalName: originalName.trim() },
    });
    res.json(updated);
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  POST /api/media/check-duplicate — check if file hash exists      */
/* ══════════════════════════════════════════════════════════════════ */
router.post(
  "/check-duplicate",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const { hash } = req.body;
    if (!hash) {
      return res.status(400).json({ message: "hash is required" });
    }

    // Store hash in tags array for easy lookup
    const m = getMediaModel();
    const existing = await m.findFirst({
      where: { tags: { has: `hash:${hash}` } },
    });

    res.json({
      exists: !!existing,
      media: existing || null,
    });
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  PUT /api/media/:id/replace — replace the file while keeping ID   */
/* ══════════════════════════════════════════════════════════════════ */
router.put(
  "/:id/replace",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const m = getMediaModel();
    const media = await m.findUnique({ where: { id: req.params.id as string } });
    if (!media) throw new NotFoundError("Media");

    // Delete old file from storage
    if (media.url) {
      await deleteFileByUrl(media.url).catch(() => {});
    }

    const updated = await m.update({
      where: { id: req.params.id as string },
      data: {
        url: req.body.url,
        filename: req.body.filename,
        originalName: req.body.originalName,
        mimeType: req.body.mimeType,
        size: req.body.size,
        width: req.body.width || null,
        height: req.body.height || null,
        duration: req.body.duration || null,
      },
    });
    res.json(updated);
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  DELETE /api/media/:id — delete media with usage check            */
/* ══════════════════════════════════════════════════════════════════ */
router.delete("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const m = getMediaModel();
  const media = await m.findUnique({ where: { id: req.params.id as string } });
  if (!media) throw new NotFoundError("Media");

  // Check if the file is used anywhere
  const usage = await findMediaUsage(media.url);
  if (usage.length > 0) {
    return res.status(409).json({
      message: "This file is in use",
      usage,
    });
  }

  // Delete from storage
  if (media.url) {
    await deleteFileByUrl(media.url).catch(() => {});
  }

  await m.delete({ where: { id: req.params.id as string } });
  res.json({ message: "Media deleted" });
});

/* ══════════════════════════════════════════════════════════════════ */
/*  DELETE /api/media — bulk delete with usage check                 */
/* ══════════════════════════════════════════════════════════════════ */
router.delete("/", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "ids array is required" });
  }

  const results: { id: string; status: string; message?: string; usage?: UsageLocation[] }[] = [];

  const m = getMediaModel();

  for (const id of ids) {
    const media = await m.findUnique({ where: { id } });
    if (!media) {
      results.push({ id, status: "skipped", message: "Not found" });
      continue;
    }

    const usage = await findMediaUsage(media.url);
    if (usage.length > 0) {
      results.push({ id, status: "in-use", usage });
      continue;
    }

    await deleteFileByUrl(media.url).catch(() => {});
    await m.delete({ where: { id } });
    results.push({ id, status: "deleted" });
  }

  res.json({ results });
});

/* ══════════════════════════════════════════════════════════════════ */
/*  GET /api/media/:id/usage — check where a media file is used      */
/* ══════════════════════════════════════════════════════════════════ */
router.get("/:id/usage", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const media = await getMediaModel().findUnique({ where: { id: req.params.id as string } });
  if (!media) throw new NotFoundError("Media");

  const usage = await findMediaUsage(media.url);
  res.json({ usage });
});

/* ══════════════════════════════════════════════════════════════════ */
/*  GET /api/media/stats/summary — storage usage stats               */
/* ══════════════════════════════════════════════════════════════════ */
router.get(
  "/stats/summary",
  authenticate,
  authorize("ADMIN"),
  async (_req: Request, res: Response) => {
    const m = getMediaModel();
    const [totalFiles, totalSize, images, videos, pdfs] = await Promise.all([
      m.count(),
      m.aggregate({ _sum: { size: true } }),
      m.count({ where: { mimeType: { startsWith: "image/" } } }),
      m.count({ where: { mimeType: { startsWith: "video/" } } }),
      m.count({ where: { mimeType: "application/pdf" } }),
    ]);

    const storageBytes = (await getStorageUsage()) ?? 0;

    res.json({
      totalFiles,
      totalSize: totalSize?._sum?.size ?? 0,
      totalSizeFormatted: formatStorageBytes(totalSize?._sum?.size ?? 0),
      images,
      videos,
      pdfs,
      storageBytes,
      storageFormatted: formatStorageBytes(storageBytes),
    });
  },
);

export default router;
