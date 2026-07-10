import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate } from "../middleware/auth.js";
import { NotFoundError } from "../lib/errors.js";

const router = Router();

// GET /api/users/:id — public profile
router.get("/:id", async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id as string },
    select: { id: true, name: true, role: true, avatar: true, createdAt: true },
  });
  if (!user) throw new NotFoundError("User");
  res.json(user);
});

export default router;
