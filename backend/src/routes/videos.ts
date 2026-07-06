import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { NotFoundError } from "../lib/errors.js";
import { slugify } from "../lib/prisma-helpers.js";
import { deleteFileByUrl } from "../lib/upload.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { category, featured } = req.query as Record<string, string | undefined>;
  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (featured === "true") where.featured = true;

  const videos = await prisma.video.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  res.json({ data: videos });
});

router.get("/:slug", async (req: Request, res: Response) => {
  const video = await prisma.video.findUnique({ where: { slug: req.params.slug } });
  if (!video) throw new NotFoundError("Video");
  res.json(video);
});

router.post("/", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const data = req.body;
  const slug = data.slug || slugify(data.title);
  let finalSlug = slug;
  let counter = 1;
  while (await prisma.video.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${counter++}`;
  }
  const video = await prisma.video.create({ data: { ...data, slug: finalSlug } });
  res.status(201).json(video);
});

router.put("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const video = await prisma.video.findUnique({ where: { id: req.params.id } });
  if (!video) throw new NotFoundError("Video");
  const updated = await prisma.video.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
});

router.delete("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const video = await prisma.video.findUnique({ where: { id: req.params.id } });
  if (!video) throw new NotFoundError("Video");

  // Delete thumbnail from Supabase Storage
  if (video.thumbnail) {
    await deleteFileByUrl(video.thumbnail).catch(() => {});
  }

  await prisma.video.delete({ where: { id: req.params.id } });
  res.json({ message: "Video deleted" });
});

export default router;
