import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate, blogSchema } from "../lib/validation.js";
import { NotFoundError } from "../lib/errors.js";
import { slugify, paginationParams } from "../lib/prisma-helpers.js";
import { deleteFileByUrl } from "../lib/upload.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { skip, take, page, limit } = paginationParams(req.query);
  const { search, category, published } = req.query as Record<string, string | undefined>;

  const where: Record<string, unknown> = {};
  if (search) where.OR = [
    { title: { contains: search, mode: "insensitive" } },
    { excerpt: { contains: search, mode: "insensitive" } },
  ];
  if (category) where.category = category;
  if (published === "true") where.published = true;

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    }),
    prisma.blog.count({ where }),
  ]);

  res.json({ data: blogs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

router.get("/:slug", async (req: Request, res: Response) => {
  const blog = await prisma.blog.findUnique({
    where: { slug: req.params.slug },
    include: { author: { select: { id: true, name: true } } },
  });
  if (!blog) throw new NotFoundError("Blog post");
  res.json(blog);
});

router.post("/", authenticate, authorize("ADMIN"), validate(blogSchema), async (req: Request, res: Response) => {
  const data = req.body;
  const slug = data.slug || slugify(data.title);
  let finalSlug = slug;
  let counter = 1;
  while (await prisma.blog.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${counter++}`;
  }
  const blog = await prisma.blog.create({
    data: { ...data, slug: finalSlug, authorId: req.user!.userId },
  });
  res.status(201).json(blog);
});

router.put("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const blog = await prisma.blog.findUnique({ where: { id: req.params.id } });
  if (!blog) throw new NotFoundError("Blog post");
  const updated = await prisma.blog.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
});

router.delete("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const blog = await prisma.blog.findUnique({ where: { id: req.params.id } });
  if (!blog) throw new NotFoundError("Blog post");

  // Delete cover image from Supabase Storage
  if (blog.cover) {
    await deleteFileByUrl(blog.cover).catch(() => {});
  }

  await prisma.blog.delete({ where: { id: req.params.id } });
  res.json({ message: "Blog post deleted" });
});

export default router;
