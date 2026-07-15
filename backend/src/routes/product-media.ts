/* ------------------------------------------------------------------ */
/*  Product Media Routes — per-product media management               */
/*  /api/products/:id/media — Add, Remove, Reorder, Set Main Image    */
/*  Uses StructuredImage model for type-organized storage             */
/*  Each product manages its own media — no cross-product effects     */
/* ------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { NotFoundError, AppError } from "../lib/errors.js";
import { deleteFileByUrl } from "../lib/upload.js";

const router = Router();

/* ─── Supported image types for products ─── */
export const PRODUCT_IMAGE_TYPES = [
  "main",        // Primary product image
  "gallery",     // Gallery images (draggable order)
  "thumbnail",   // Small preview thumbnail
  "video",       // Video gallery (MP4/WebM URLs)
  "360",         // 360-degree spin images
  "project",     // Architectural/installation project photos
  "application", // Application/usage example images
  "texture",     // Stone texture close-ups
] as const;

export type ProductImageType = (typeof PRODUCT_IMAGE_TYPES)[number];

/* ─── Helpers ─── */

/** Generate alt text based on image type and product name */
function generateAltText(imageType: string, productName?: string): string {
  const labels: Record<string, string> = {
    main: "Main Product Image",
    gallery: "Gallery Image",
    thumbnail: "Thumbnail",
    video: "Product Video",
    "360": "360° View",
    project: "Project Image",
    application: "Application Image",
    texture: "Texture Close-up",
  };
  const label = labels[imageType] || imageType;
  return productName ? `${productName} — ${label}` : label;
}

/** Validate image type */
function isValidImageType(type: string): type is ProductImageType {
  return PRODUCT_IMAGE_TYPES.includes(type as ProductImageType);
}

/* ══════════════════════════════════════════════════════════════════ */
/*  GET /api/products/:id/media — get all media for a product        */
/*  Returns images grouped by type for easy frontend rendering       */
/* ══════════════════════════════════════════════════════════════════ */
router.get(
  "/:id/media",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id as string },
    });
    if (!product) throw new NotFoundError("Product");

    // Fetch all structured images linked to this product
    const structuredImages = await prisma.structuredImage.findMany({
      where: { productId: product.id },
      orderBy: [{ imageType: "asc" }, { sortOrder: "asc" }],
    });

    // Group by image type for easier frontend consumption
    const grouped: Record<string, typeof structuredImages> = {};
    for (const img of structuredImages) {
      const key = img.imageType;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(img);
    }

    res.json({
      productId: product.id,
      productCode: product.productCode,
      productName: product.name,
      mainImage: product.mainImage, // legacy convenience field
      images: product.images,       // legacy gallery array
      structured: grouped,
      all: structuredImages,
    });
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  POST /api/products/:id/media — add a media item to a product     */
/*  Body: { url, imageType, altText?, sortOrder?, width?, height? }  */
/*  For "main" type, also updates product.mainImage automatically    */
/* ══════════════════════════════════════════════════════════════════ */
router.post(
  "/:id/media",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id as string },
    });
    if (!product) throw new NotFoundError("Product");

    const { url, imageType, altText, sortOrder, width, height } = req.body;
    if (!url) throw new AppError("url is required", 400);
    if (!imageType || !isValidImageType(imageType)) {
      throw new AppError(
        `Invalid imageType. Must be one of: ${PRODUCT_IMAGE_TYPES.join(", ")}`,
        400,
      );
    }

    // Determine sortOrder: append to end of this type by default
    let finalSortOrder = sortOrder ?? 0;
    if (finalSortOrder === 0) {
      const lastImage = await prisma.structuredImage.findFirst({
        where: { productId: product.id, imageType },
        orderBy: { sortOrder: "desc" },
      });
      finalSortOrder = (lastImage?.sortOrder ?? -1) + 1;
    }

    // Generate fileName from product code + image type + sort order
    const identifier = product.productCode || product.slug;
    const fileName = `${identifier}-${imageType}-${finalSortOrder}`
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-");

    const image = await prisma.structuredImage.create({
      data: {
        fileName,
        displayName: `${product.name} — ${imageType}`,
        url,
        imageType,
        productCode: product.productCode || null,
        productId: product.id,
        altText: altText || generateAltText(imageType, product.name),
        sortOrder: finalSortOrder,
        width: width || null,
        height: height || null,
      },
    });

    // Auto-update product.mainImage when "main" type is added
    if (imageType === "main" && url !== product.mainImage) {
      await prisma.product.update({
        where: { id: product.id },
        data: { mainImage: url },
      });
    }

    // Auto-update product.images legacy array for gallery type
    if (imageType === "gallery") {
      const existingGallery = product.images || [];
      if (!existingGallery.includes(url)) {
        await prisma.product.update({
          where: { id: product.id },
          data: { images: [...existingGallery, url] },
        });
      }
    }

    // Auto-update applicationImages for application type
    if (imageType === "application") {
      const existingApps = product.applicationImages || [];
      if (!existingApps.includes(url)) {
        await prisma.product.update({
          where: { id: product.id },
          data: { applicationImages: [...existingApps, url] },
        });
      }
    }

    res.status(201).json(image);
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  PUT /api/products/:id/media/:mediaId — update a media item      */
/*  Supports: altText, sortOrder, imageType                          */
/* ══════════════════════════════════════════════════════════════════ */
router.put(
  "/:id/media/:mediaId",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id as string },
    });
    if (!product) throw new NotFoundError("Product");

    const image = await prisma.structuredImage.findFirst({
      where: { id: req.params.mediaId as string, productId: product.id },
    });
    if (!image) throw new NotFoundError("Product image");

    const { altText, sortOrder, imageType, displayName } = req.body;
    const data: Record<string, unknown> = {};

    if (altText !== undefined) data.altText = altText;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;
    if (displayName !== undefined) data.displayName = displayName;

    if (imageType !== undefined) {
      if (!isValidImageType(imageType)) {
        throw new AppError(
          `Invalid imageType. Must be one of: ${PRODUCT_IMAGE_TYPES.join(", ")}`,
          400,
        );
      }
      data.imageType = imageType;

      // Auto-update product.mainImage if type changed to "main"
      if (imageType === "main" && image.url !== product.mainImage) {
        await prisma.product.update({
          where: { id: product.id },
          data: { mainImage: image.url },
        });
      }
    }

    const updated = await prisma.structuredImage.update({
      where: { id: image.id },
      data,
    });

    res.json(updated);
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  DELETE /api/products/:id/media/:mediaId — remove a media item   */
/*  Deletes the file from storage and cleans up product fields      */
/* ══════════════════════════════════════════════════════════════════ */
router.delete(
  "/:id/media/:mediaId",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id as string },
    });
    if (!product) throw new NotFoundError("Product");

    const image = await prisma.structuredImage.findFirst({
      where: { id: req.params.mediaId as string, productId: product.id },
    });
    if (!image) throw new NotFoundError("Product image");

    // Delete the file from storage
    if (image.url) {
      await deleteFileByUrl(image.url).catch(() => {});
    }

    // Remove from legacy arrays if present
    const updates: Record<string, unknown> = {};
    if (product.mainImage === image.url) {
      updates.mainImage = null;
    }
    if (product.images?.includes(image.url)) {
      updates.images = product.images.filter((u) => u !== image.url);
    }
    if (product.applicationImages?.includes(image.url)) {
      updates.applicationImages = product.applicationImages.filter((u) => u !== image.url);
    }
    if (Object.keys(updates).length > 0) {
      await prisma.product.update({ where: { id: product.id }, data: updates });
    }

    await prisma.structuredImage.delete({ where: { id: image.id } });

    res.json({ message: "Image deleted", imageType: image.imageType });
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  PUT /api/products/:id/media/reorder — reorder gallery images    */
/*  Body: { imageType: "gallery", order: ["id1", "id2", ...] }      */
/*  Updates sortOrder for each image based on array position         */
/* ══════════════════════════════════════════════════════════════════ */
router.put(
  "/:id/media/reorder",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id as string },
    });
    if (!product) throw new NotFoundError("Product");

    const { imageType, order } = req.body;
    if (!imageType) throw new AppError("imageType is required", 400);
    if (!Array.isArray(order)) throw new AppError("order array is required", 400);

    // Update sortOrder for each image based on position in the array
    const updates = order.map((id: string, index: number) =>
      prisma.structuredImage.updateMany({
        where: { id, productId: product.id, imageType },
        data: { sortOrder: index },
      }),
    );

    await Promise.all(updates);

    // Also update the legacy images array for gallery type
    if (imageType === "gallery") {
      const orderedImages = await prisma.structuredImage.findMany({
        where: { productId: product.id, imageType: "gallery" },
        orderBy: { sortOrder: "asc" },
        select: { url: true },
      });
      await prisma.product.update({
        where: { id: product.id },
        data: { images: orderedImages.map((i) => i.url) },
      });
    }

    res.json({ message: `${order.length} image(s) reordered` });
  },
);

/* ══════════════════════════════════════════════════════════════════ */
/*  PUT /api/products/:id/media/set-main/:mediaId                   */
/*  Sets a gallery/project/application image as the main image       */
/*  Reverts the previous main image back to gallery type             */
/* ══════════════════════════════════════════════════════════════════ */
router.put(
  "/:id/media/set-main/:mediaId",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id as string },
    });
    if (!product) throw new NotFoundError("Product");

    const image = await prisma.structuredImage.findFirst({
      where: { id: req.params.mediaId as string, productId: product.id },
    });
    if (!image) throw new NotFoundError("Product image");

    // Revert any existing main image back to gallery type
    await prisma.structuredImage.updateMany({
      where: { productId: product.id, imageType: "main", id: { not: image.id } },
      data: { imageType: "gallery" },
    });

    // Update the target image's type to "main"
    await prisma.structuredImage.update({
      where: { id: image.id },
      data: { imageType: "main" },
    });

    // Update the product's mainImage field
    await prisma.product.update({
      where: { id: product.id },
      data: { mainImage: image.url },
    });

    res.json({
      message: "Main image updated",
      url: image.url,
    });
  },
);

export default router;
