import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { NotFoundError } from "../lib/errors.js";
import { deleteFileByUrl } from "../lib/upload.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { featured } = req.query as Record<string, string | undefined>;
  const where: Record<string, unknown> = {};
  if (featured === "true") where.featured = true;

  const testimonials = await prisma.testimonial.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true } } },
  });
  res.json({ data: testimonials });
});

router.post("/", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const data = req.body;
  const testimonial = await prisma.testimonial.create({
    data: { ...data, authorId: req.user!.userId },
  });
  res.status(201).json(testimonial);
});

router.put("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const testimonial = await prisma.testimonial.findUnique({ where: { id: req.params.id } });
  if (!testimonial) throw new NotFoundError("Testimonial");
  const updated = await prisma.testimonial.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
});

router.delete("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const testimonial = await prisma.testimonial.findUnique({ where: { id: req.params.id } });
  if (!testimonial) throw new NotFoundError("Testimonial");

  // Delete photo from Supabase Storage
  if (testimonial.photo) {
    await deleteFileByUrl(testimonial.photo).catch(() => {});
  }

  await prisma.testimonial.delete({ where: { id: req.params.id } });
  res.json({ message: "Testimonial deleted" });
});

export default router;
