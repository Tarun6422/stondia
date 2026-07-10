import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate, contactSchema } from "../lib/validation.js";
import { NotFoundError } from "../lib/errors.js";
import { sendEmail, contactConfirmationEmail, adminNotificationEmail } from "../lib/email.js";
import { CONFIG } from "../config.js";

const router = Router();

// POST /api/contact — public form submission with spam protection
router.post("/", validate(contactSchema), async (req: Request, res: Response) => {
  const data = req.body;

  const contact = await prisma.contact.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      message: data.message,
    },
  });

  // Send confirmation to submitter
  try {
    await sendEmail(data.email, "Thank you for contacting us", contactConfirmationEmail(data.name));
  } catch {
    /* ignore */
  }

  // Notify admin
  try {
    await sendEmail(
      CONFIG.EMAIL_TO,
      "New Contact Enquiry — Stone India Heritage",
      adminNotificationEmail("Contact Enquiry", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        message: data.message.slice(0, 200),
      }),
    );
  } catch {
    /* ignore */
  }

  res.status(201).json({ message: "Message sent successfully", id: contact.id });
});

// GET /api/contact — admin list with pagination and status filter
router.get("/", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const {
    status,
    page: pageStr,
    limit: limitStr,
  } = req.query as Record<string, string | undefined>;
  const page = Math.max(1, parseInt(pageStr || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(limitStr || "20", 10)));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.contact.count({ where }),
  ]);

  const unread = await prisma.contact.count({ where: { status: "Unread" } });
  const archived = await prisma.contact.count({ where: { status: "Archived" } });

  res.json({
    data: contacts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    meta: { total, unread, archived },
  });
});

// PUT /api/contact/:id — admin update status (New / Read / Archived)
router.put("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const contact = await prisma.contact.findUnique({ where: { id: req.params.id as string } });
  if (!contact) throw new NotFoundError("Contact");
  const allowedStatuses = ["Unread", "Read", "Archived"];
  const status = allowedStatuses.includes(req.body.status) ? req.body.status : "Read";
  const updated = await prisma.contact.update({
    where: { id: req.params.id as string },
    data: { status },
  });
  res.json(updated);
});

// DELETE /api/contact/:id — admin delete
router.delete("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const contact = await prisma.contact.findUnique({ where: { id: req.params.id as string } });
  if (!contact) throw new NotFoundError("Contact");
  await prisma.contact.delete({ where: { id: req.params.id as string } });
  res.json({ message: "Contact deleted" });
});

export default router;
