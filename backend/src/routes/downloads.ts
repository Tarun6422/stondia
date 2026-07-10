import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { NotFoundError } from "../lib/errors.js";
import { slugify } from "../lib/prisma-helpers.js";
import { deleteFileByUrl } from "../lib/upload.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const downloads = await prisma.download.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ data: downloads });
});

router.get("/:slug", async (req: Request, res: Response) => {
  const download = await prisma.download.findUnique({ where: { slug: req.params.slug as string } });
  if (!download) throw new NotFoundError("Download");
  res.json(download);
});

router.post("/", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const data = req.body;
  const slug = data.slug || slugify(data.title);
  let finalSlug = slug;
  let counter = 1;
  while (await prisma.download.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${counter++}`;
  }
  const download = await prisma.download.create({ data: { ...data, slug: finalSlug } });
  res.status(201).json(download);
});

router.put("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const download = await prisma.download.findUnique({ where: { id: req.params.id as string } });
  if (!download) throw new NotFoundError("Download");
  const updated = await prisma.download.update({
    where: { id: req.params.id as string },
    data: req.body,
  });
  res.json(updated);
});

router.delete("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const download = await prisma.download.findUnique({ where: { id: req.params.id as string } });
  if (!download) throw new NotFoundError("Download");

  // Delete PDF from Supabase Storage
  if (download.pdf) {
    await deleteFileByUrl(download.pdf).catch(() => {});
  }

  await prisma.download.delete({ where: { id: req.params.id as string } });
  res.json({ message: "Download deleted" });
});

export default router;
