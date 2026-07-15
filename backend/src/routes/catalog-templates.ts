/* ------------------------------------------------------------------ */
/*  Catalog Templates API Routes                                       */
/*  /api/catalog-templates — CRUD for catalog template definitions    */
/* ------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { NotFoundError, AppError } from "../lib/errors.js";
import { slugify } from "../lib/prisma-helpers.js";

const router = Router();

/* ── LIST all templates ── */
router.get("/", authenticate, authorize("ADMIN"), async (_req: Request, res: Response) => {
  const templates = await prisma.catalogTemplate.findMany({
    orderBy: { name: "asc" },
  });
  res.json({ data: templates });
});

/* ── GET single template ── */
router.get("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const template = await prisma.catalogTemplate.findUnique({
    where: { id: req.params.id as string },
    include: { _count: { select: { catalogs: true } } },
  });
  if (!template) throw new NotFoundError("Template");
  res.json(template);
});

/* ── CREATE template ── */
router.post("/", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const { name, description, type, icon, defaultFields } = req.body;
  const slug = slugify(name);
  let finalSlug = slug;
  let counter = 1;
  while (await prisma.catalogTemplate.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${counter++}`;
  }

  const template = await prisma.catalogTemplate.create({
    data: { name, slug: finalSlug, description, type, icon, defaultFields },
  });
  res.status(201).json(template);
});

/* ── UPDATE template ── */
router.put("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const template = await prisma.catalogTemplate.findUnique({
    where: { id: req.params.id as string },
  });
  if (!template) throw new NotFoundError("Template");

  const { name, description, type, icon, defaultFields } = req.body;
  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (type !== undefined) data.type = type;
  if (icon !== undefined) data.icon = icon;
  if (defaultFields !== undefined) data.defaultFields = defaultFields;

  const updated = await prisma.catalogTemplate.update({
    where: { id: req.params.id as string },
    data,
  });
  res.json(updated);
});

/* ── DELETE template ── */
router.delete("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const template = await prisma.catalogTemplate.findUnique({
    where: { id: req.params.id as string },
  });
  if (!template) throw new NotFoundError("Template");

  // Check if template is in use
  const count = await prisma.generatedCatalog.count({ where: { templateId: template.id } });
  if (count > 0) {
    throw new AppError(`Cannot delete template used by ${count} catalog(s). Remove associations first.`, 409);
  }

  await prisma.catalogTemplate.delete({ where: { id: req.params.id as string } });
  res.json({ message: "Template deleted" });
});

export default router;
