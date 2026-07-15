/* ------------------------------------------------------------------ */
/*  QR Code API Routes                                                 */
/*  /api/qr-codes — Generate and manage QR codes for catalogs        */
/* ------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import QRCode from "qrcode";
import { prisma } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { NotFoundError, AppError } from "../lib/errors.js";
import { CONFIG } from "../config.js";

const router = Router();

/* ── LIST QR codes for a catalog ── */
router.get("/catalog/:catalogId", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const codes = await prisma.qRCode.findMany({
    where: { catalogId: req.params.catalogId as string },
    orderBy: { createdAt: "desc" },
  });
  res.json({ data: codes });
});

/* ── GENERATE QR code for a catalog ── */
router.post("/generate/:catalogId", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const catalog = await prisma.generatedCatalog.findUnique({
    where: { id: req.params.catalogId as string },
  });
  if (!catalog) throw new NotFoundError("Catalog");

  const { label, customUrl } = req.body;
  // Build the URL: custom URL or default to catalog page
  const targetUrl = customUrl || `${CONFIG.FRONTEND_URL}/catalog/${catalog.slug}`;

  // Generate QR code as data URL
  let qrImageUrl: string | null = null;
  try {
    qrImageUrl = await QRCode.toDataURL(targetUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#2C2C2C", light: "#FFFFFF" },
    });
  } catch {
    // QR generation failed — still save the record without image
  }

  const qrCode = await prisma.qRCode.create({
    data: {
      catalogId: catalog.id,
      url: targetUrl,
      imageUrl: qrImageUrl,
      label: label || null,
    },
  });

  res.status(201).json(qrCode);
});

/* ── DOWNLOAD QR code as PNG (redirect to image URL) ── */
router.get("/:id/download", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const qrCode = await prisma.qRCode.findUnique({
    where: { id: req.params.id as string },
  });
  if (!qrCode) throw new NotFoundError("QR Code");
  if (!qrCode.imageUrl) throw new AppError("QR code image not available", 404);

  // Track scan
  await prisma.qRCode.update({
    where: { id: qrCode.id },
    data: { scanCount: { increment: 1 }, lastScannedAt: new Date() },
  });

  res.redirect(302, qrCode.imageUrl);
});

/* ── DELETE QR code ── */
router.delete("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const qrCode = await prisma.qRCode.findUnique({
    where: { id: req.params.id as string },
  });
  if (!qrCode) throw new NotFoundError("QR Code");

  await prisma.qRCode.delete({ where: { id: req.params.id as string } });
  res.json({ message: "QR Code deleted" });
});

/* ── BULK generate QR codes for multiple catalogs ── */
router.post("/bulk-generate", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const { catalogIds } = req.body;
  if (!Array.isArray(catalogIds) || catalogIds.length === 0) {
    throw new AppError("catalogIds array is required", 400);
  }

  const results: { catalogId: string; status: string; qrId?: string; error?: string }[] = [];

  for (const catalogId of catalogIds) {
    try {
      const catalog = await prisma.generatedCatalog.findUnique({ where: { id: catalogId } });
      if (!catalog) {
        results.push({ catalogId, status: "failed", error: "Catalog not found" });
        continue;
      }

      const targetUrl = `${CONFIG.FRONTEND_URL}/catalog/${catalog.slug}`;
      let qrImageUrl: string | null = null;
      try {
        qrImageUrl = await QRCode.toDataURL(targetUrl, {
          width: 300,
          margin: 2,
          color: { dark: "#2C2C2C", light: "#FFFFFF" },
        });
      } catch { /* skip */ }

      const qrCode = await prisma.qRCode.create({
        data: {
          catalogId: catalog.id,
          url: targetUrl,
          imageUrl: qrImageUrl,
          label: catalog.title,
        },
      });

      results.push({ catalogId, status: "generated", qrId: qrCode.id });
    } catch (err: any) {
      results.push({ catalogId, status: "failed", error: err.message });
    }
  }

  res.json({ results });
});

export default router;
