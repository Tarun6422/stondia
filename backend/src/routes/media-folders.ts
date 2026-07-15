/* ------------------------------------------------------------------ */
/*  Media Folders API Routes                                           */
/*  /api/media/folders — CRUD for organizing media into folders       */
/* ------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { NotFoundError, AppError } from "../lib/errors.js";
import { slugify } from "../lib/prisma-helpers.js";

const router = Router();

/* ── LIST all folders (flat or nested) ── */
router.get("/", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const { parent } = req.query as Record<string, string | undefined>;
  const where: Record<string, unknown> = {};
  if (parent === "root") {
    where.parentId = null;
  } else if (parent) {
    where.parentId = parent;
  }

  const folders = await prisma.mediaFolder.findMany({
    where: parent ? where : {},
    orderBy: { name: "asc" },
    include: {
      _count: { select: { media: true, children: true } },
    },
  });
  res.json({ data: folders });
});

/* ── GET single folder with contents ── */
router.get("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const folder = await prisma.mediaFolder.findUnique({
    where: { id: req.params.id as string },
    include: {
      _count: { select: { media: true, children: true } },
      children: { orderBy: { name: "asc" } },
    },
  });
  if (!folder) throw new NotFoundError("Folder");
  res.json(folder);
});

/* ── CREATE folder ── */
router.post("/", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const { name, parentId } = req.body;
  if (!name?.trim()) throw new AppError("Folder name is required", 400);

  const slug = slugify(name);
  let finalSlug = slug;
  let counter = 1;
  while (await prisma.mediaFolder.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${counter++}`;
  }

  // Validate parent exists if provided
  if (parentId) {
    const parent = await prisma.mediaFolder.findUnique({ where: { id: parentId } });
    if (!parent) throw new NotFoundError("Parent folder");
  }

  const folder = await prisma.mediaFolder.create({
    data: { name, slug: finalSlug, parentId: parentId || null },
  });
  res.status(201).json(folder);
});

/* ── UPDATE folder ── */
router.put("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const folder = await prisma.mediaFolder.findUnique({
    where: { id: req.params.id as string },
  });
  if (!folder) throw new NotFoundError("Folder");

  const { name, parentId } = req.body;
  const data: Record<string, unknown> = {};

  if (name !== undefined) {
    data.name = name;
    const slug = slugify(name);
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.mediaFolder.findUnique({ where: { slug: finalSlug, NOT: { id: folder.id } } })) {
      finalSlug = `${slug}-${counter++}`;
    }
    data.slug = finalSlug;
  }

  // Validate parent if changing
  if (parentId !== undefined) {
    if (parentId === folder.id) throw new AppError("Folder cannot be its own parent", 400);
    if (parentId) {
      const parent = await prisma.mediaFolder.findUnique({ where: { id: parentId } });
      if (!parent) throw new NotFoundError("Parent folder");
    }
    data.parentId = parentId || null;
  }

  const updated = await prisma.mediaFolder.update({
    where: { id: req.params.id as string },
    data,
  });
  res.json(updated);
});

/* ── DELETE folder ── */
router.delete("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const folder = await prisma.mediaFolder.findUnique({
    where: { id: req.params.id as string },
    include: { _count: { select: { media: true, children: true } } },
  });
  if (!folder) throw new NotFoundError("Folder");

  const mediaCount = folder._count?.media ?? 0;
  const childrenCount = folder._count?.children ?? 0;
  if (mediaCount > 0) {
    throw new AppError(
      `Folder contains ${mediaCount} file(s). Move or delete them first.`,
      409,
    );
  }
  if (childrenCount > 0) {
    throw new AppError(
      `Folder has ${childrenCount} subfolder(s). Delete them first.`,
      409,
    );
  }

  await prisma.mediaFolder.delete({ where: { id: req.params.id as string } });
  res.json({ message: "Folder deleted" });
});

export default router;
