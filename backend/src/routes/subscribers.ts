import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate, newsletterSchema } from "../lib/validation.js";
import { AppError } from "../lib/errors.js";
import { sendEmail, newsletterConfirmationEmail } from "../lib/email.js";

const router = Router();

// POST /api/subscribers — public subscribe
router.post("/", validate(newsletterSchema), async (req: Request, res: Response) => {
  const { email, name } = req.body;

  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing) {
    if (!existing.active) {
      await prisma.subscriber.update({ where: { email }, data: { active: true } });
      // Send welcome email on reactivation
      try {
        await sendEmail(
          email,
          "You're Subscribed — Stone India Heritage",
          newsletterConfirmationEmail(name, email),
        );
      } catch {
        /* ignore */
      }
      return res.json({ message: "Subscription reactivated" });
    }
    return res.json({ message: "Already subscribed" });
  }

  await prisma.subscriber.create({ data: { email } });

  // Send welcome email
  try {
    await sendEmail(
      email,
      "You're Subscribed — Stone India Heritage",
      newsletterConfirmationEmail(name, email),
    );
  } catch {
    /* ignore */
  }

  res.status(201).json({ message: "Subscribed successfully" });
});

// GET /api/subscribers — admin list
router.get("/", authenticate, authorize("ADMIN"), async (_req: Request, res: Response) => {
  const subscribers = await prisma.subscriber.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ data: subscribers, total: subscribers.length });
});

// DELETE /api/subscribers/:id — admin remove
router.delete("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  await prisma.subscriber.update({
    where: { id: req.params.id as string },
    data: { active: false },
  });
  res.json({ message: "Subscriber removed" });
});

export default router;
