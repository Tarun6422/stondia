import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { NotFoundError } from "../lib/errors.js";
import { slugify, paginationParams } from "../lib/prisma-helpers.js";
import { deleteFilesByUrls } from "../lib/upload.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { skip, take, page, limit } = paginationParams(req.query);
  const { search, featured } = req.query as Record<string, string | undefined>;

  const where: Record<string, unknown> = {};
  if (search) where.OR = [
    { title: { contains: search, mode: "insensitive" } },
    { location: { contains: search, mode: "insensitive" } },
  ];
  if (featured === "true") where.featured = true;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.project.count({ where }),
  ]);

  res.json({ data: projects, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

router.get("/featured", async (_req: Request, res: Response) => {
  const projects = await prisma.project.findMany({
    where: { featured: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
  res.json({ data: projects });
});

router.get("/:slug", async (req: Request, res: Response) => {
  const project = await prisma.project.findUnique({ where: { slug: req.params.slug } });
  if (!project) throw new NotFoundError("Project");
  res.json(project);
});

router.post("/", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const data = req.body;
  const slug = data.slug || slugify(data.title);
  let finalSlug = slug;
  let counter = 1;
  while (await prisma.project.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${counter++}`;
  }
  const project = await prisma.project.create({ data: { ...data, slug: finalSlug } });
  res.status(201).json(project);
});

router.put("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) throw new NotFoundError("Project");
  const updated = await prisma.project.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
});

router.delete("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) throw new NotFoundError("Project");

  // Delete associated gallery images from Supabase Storage
  if (project.gallery && project.gallery.length > 0) {
    await deleteFilesByUrls(project.gallery).catch(() => {});
  }

  await prisma.project.delete({ where: { id: req.params.id } });
  res.json({ message: "Project deleted" });
});

export default router;
