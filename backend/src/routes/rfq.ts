import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize, optionalAuth } from "../middleware/auth.js";
import { validate, rfqSchema } from "../lib/validation.js";
import { NotFoundError } from "../lib/errors.js";
import {
  sendEmail,
  rfqConfirmationEmail,
  adminNotificationEmail,
  rfqCompletedEmail,
  rfqCancelledEmail,
} from "../lib/email.js";
import { CONFIG } from "../config.js";

const router = Router();

// POST /api/rfq — submit quote request with optional file attachment URLs
router.post("/", optionalAuth, validate(rfqSchema), async (req: Request, res: Response) => {
  const data = req.body;

  const rfq = await prisma.rFQ.create({
    data: {
      userId: req.user?.userId || null,
      company: data.company || null,
      phone: data.phone || null,
      email: data.email,
      country: data.country || null,
      message: data.message,
      products: data.products || [],
      attachments: data.attachments || [],
    },
  });

  // Send confirmation
  try {
    await sendEmail(
      data.email,
      "Quote Request Received — Stone India Heritage",
      rfqConfirmationEmail(data.name),
    );
  } catch {
    /* ignore */
  }

  // Notify admin
  try {
    await sendEmail(
      CONFIG.EMAIL_TO,
      "New Quote Request — Stone India Heritage",
      adminNotificationEmail("Quote Request", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        country: data.country,
        message: data.message.slice(0, 300),
        products: data.products,
        attachments: data.attachments,
      }),
    );
  } catch {
    /* ignore */
  }

  res.status(201).json({ message: "Quote request submitted", id: rfq.id });
});

// GET /api/rfq — admin list with pagination and status filter
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

  const [rfqs, total] = await Promise.all([
    prisma.rFQ.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.rFQ.count({ where }),
  ]);

  const pending = await prisma.rFQ.count({ where: { status: "Pending" } });

  res.json({
    data: rfqs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    meta: { total, pending },
  });
});

// PUT /api/rfq/:id — admin update status and/or reply with quotation
router.put("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const rfq = await prisma.rFQ.findUnique({
    where: { id: req.params.id as string },
    include: { user: { select: { name: true } } },
  });
  if (!rfq) throw new NotFoundError("Quote request");

  const allowedStatuses = ["Pending", "Quoted", "Negotiation", "Completed", "Cancelled"];
  const updateData: Record<string, unknown> = {};

  if (req.body.status && allowedStatuses.includes(req.body.status)) {
    updateData.status = req.body.status;
  }

  if (req.body.adminReply !== undefined) {
    updateData.adminReply = req.body.adminReply;
    updateData.repliedAt = new Date();
  }

  const updated = await prisma.rFQ.update({
    where: { id: req.params.id as string },
    data: updateData,
  });

  // Send email notification based on status change
  if (rfq.email) {
    const statusChanged = req.body.status && req.body.status !== rfq.status;
    const newStatus = updated.status;

    if (req.body.adminReply) {
      // Admin wrote a reply — send the reply email (covers all statuses including Completed/Cancelled)
      try {
        await sendEmail(
          rfq.email,
          `Quote Update — Stone India Heritage (${newStatus})`,
          rfqReplyEmail(req.body.adminReply, newStatus),
        );
      } catch {
        /* ignore */
      }
    } else if (statusChanged && newStatus === "Completed") {
      // Status changed to Completed without a reply
      try {
        await sendEmail(
          rfq.email,
          "Quote Completed — Stone India Heritage",
          rfqCompletedEmail(rfq.user?.name || rfq.email, rfq.company || undefined),
        );
      } catch {
        /* ignore */
      }
    } else if (statusChanged && newStatus === "Cancelled") {
      // Status changed to Cancelled without a reply
      try {
        await sendEmail(
          rfq.email,
          "Quote Cancelled — Stone India Heritage",
          rfqCancelledEmail(rfq.user?.name || rfq.email, req.body.adminReply || undefined),
        );
      } catch {
        /* ignore */
      }
    }
  }

  res.json(updated);
});

// DELETE /api/rfq/:id — admin delete
router.delete("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const rfq = await prisma.rFQ.findUnique({ where: { id: req.params.id as string } });
  if (!rfq) throw new NotFoundError("Quote request");
  await prisma.rFQ.delete({ where: { id: req.params.id as string } });
  res.json({ message: "Quote request deleted" });
});

// ── Email template for admin reply ──
function rfqReplyEmail(reply: string, status: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f2ed;font-family:Georgia,serif">
<div style="max-width:600px;margin:0 auto;padding:40px 24px">
  <div style="text-align:center;margin-bottom:32px">
    <div style="width:56px;height:56px;margin:0 auto 12px;background:#c9a84c;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#2c2416;font-size:20px;font-weight:700">SH</div>
    <h1 style="color:#2c2416;font-size:28px;margin:0">Stone India Heritage</h1>
  </div>
  <div style="background:#fff;border-radius:8px;padding:32px">
    <h2 style="color:#2c2416;font-size:22px;margin:0 0 8px">Quote Status: ${status}</h2>
    <p style="color:#5c5248;font-size:15px;line-height:1.7;margin:0 0 16px">Our team has reviewed your quote request. Here is our response:</p>
    <div style="background:#f5f2ed;border-left:3px solid #c9a84c;padding:16px 20px;border-radius:4px;font-size:14px;color:#2c2416;line-height:1.7;white-space:pre-wrap">${reply}</div>
    <p style="color:#5c5248;font-size:14px;line-height:1.7;margin-top:20px">
      If you have any questions regarding this quotation, simply reply to this email or contact our export team at <a href="mailto:${CONFIG.EMAIL_TO}" style="color:#c9a84c;text-decoration:none">${CONFIG.EMAIL_TO}</a>.
    </p>
  </div>
  <p style="color:#8c8278;font-size:12px;text-align:center;margin-top:24px">Stone India Heritage — Premium Sandstone &amp; Architecture</p>
</div>
</body></html>`;
}

export default router;
