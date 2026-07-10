/* ------------------------------------------------------------------ */
/*  PDF Catalog Generator — Professional Stone Industry Catalogs      */
/*  Generates Master Company, Category, and Product PDFs using PDFKit */
/* ------------------------------------------------------------------ */
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { prisma } from "../db.js";
import { uploadFile, formatStorageBytes } from "../lib/supabase-storage.js";
import { CONFIG } from "../config.js";
import type { StorageFolder } from "../lib/supabase-storage.js";

/* ─── Color palette / brand constants ─── */
const BRAND = {
  gold: "#C5A55A",
  charcoal: "#2C2C2C",
  white: "#FFFFFF",
  text: "#3A3A3A",
  textLight: "#8A8A8A",
  border: "#D4CFC5",
};

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

/* ─── Helper: hex to RGB ─── */
function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

/* ─── Helper: draw footer with page number on the CURRENT page ─── */
function addFooter(doc: PDFKit.PDFDocument, pageNum: number) {
  doc.save();
  doc
    .moveTo(MARGIN, PAGE_HEIGHT - 35)
    .lineTo(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 35)
    .strokeColor(BRAND.border)
    .lineWidth(0.5)
    .stroke();
  doc.fontSize(8).fillColor(BRAND.textLight);
  doc.text(`${pageNum}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 25, { align: "center" });
  doc.restore();
}

/* ─── Helper: draw section heading ─── */
function addSectionHeading(doc: PDFKit.PDFDocument, y: number, title: string): number {
  doc.save();
  doc
    .moveTo(MARGIN, y)
    .lineTo(MARGIN + 40, y)
    .strokeColor(BRAND.gold)
    .lineWidth(2)
    .stroke();
  doc.fontSize(16).fillColor(BRAND.charcoal).font("Helvetica-Bold");
  doc.text(title, MARGIN, y + 8);
  doc.restore();
  return y + 36;
}

/* ─── Helper: draw text paragraph with auto-page-break ─── */
function addParagraph(doc: PDFKit.PDFDocument, y: number, text: string, fontSize = 10): number {
  doc.save();
  doc.fontSize(fontSize).fillColor(BRAND.text).font("Helvetica");
  const opts = { width: CONTENT_WIDTH, align: "left" as const, lineGap: 4 };
  const h = doc.heightOfString(text, opts);
  if (y + h > PAGE_HEIGHT - 60) {
    const currentPage = doc.bufferedPageRange().count + 1;
    doc.addPage();
    addFooter(doc, currentPage);
    y = MARGIN;
  }
  doc.text(text, MARGIN, y, opts);
  doc.restore();
  return y + h + 12;
}

/* ─── Helper: start a new content page, returning y and new pageNum ─── */
function newContentPage(doc: PDFKit.PDFDocument, pageNum: number): { y: number; pageNum: number } {
  doc.addPage();
  const p = ++pageNum;
  addFooter(doc, p);
  return { y: MARGIN, pageNum: p };
}

/* ─── Helper: generate QR code as data URL ─── */
async function generateQRDataURL(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: { dark: BRAND.charcoal, light: "#FFFFFF" },
    });
  } catch {
    return "";
  }
}

/* ══════════════════════════════════════════════════════════════════ */
/*  COVER PAGE                                                       */
/* ══════════════════════════════════════════════════════════════════ */
async function drawCoverPage(
  doc: PDFKit.PDFDocument,
  data: {
    title: string;
    subtitle?: string;
    coverImage?: string;
    tagline?: string;
  },
) {
  // Dark header stripe
  doc.save();
  doc.rect(0, 0, PAGE_WIDTH, 280).fill(BRAND.charcoal);
  doc.restore();

  // Gold accent bar
  doc.save();
  doc.rect(0, 280, PAGE_WIDTH, 4).fill(BRAND.gold);
  doc.restore();

  // Company name
  doc.save();
  doc.fontSize(30).fillColor(BRAND.white).font("Helvetica-Bold");
  doc.text("STONE INDIA", MARGIN, 70, { width: CONTENT_WIDTH });
  doc.fontSize(15).fillColor(BRAND.gold).font("Helvetica");
  doc.text("HERITAGE", MARGIN, 106, { width: CONTENT_WIDTH });

  doc.fontSize(8).fillColor(BRAND.white).font("Helvetica");
  doc.text("PREMIUM NATURAL SANDSTONE", MARGIN, 148, { width: CONTENT_WIDTH });
  doc.restore();

  // Cover image
  if (data.coverImage) {
    try {
      doc.save();
      doc.image(data.coverImage, MARGIN, 210, {
        width: CONTENT_WIDTH,
        height: 230,
        fit: [CONTENT_WIDTH, 230],
        align: "center",
        valign: "center",
      });
      doc.restore();
    } catch {
      /* skip */
    }
  }

  // Catalog title
  const titleY = data.coverImage ? 470 : 330;
  doc.save();
  doc.fontSize(24).fillColor(BRAND.charcoal).font("Helvetica-Bold");
  doc.text(data.title, MARGIN, titleY, { width: CONTENT_WIDTH, align: "center" });
  doc.restore();

  // Gold divider
  doc.save();
  doc.rect(PAGE_WIDTH / 2 - 25, titleY + 42, 50, 2).fill(BRAND.gold);
  doc.restore();

  // Subtitle
  if (data.subtitle) {
    doc.save();
    doc.fontSize(11).fillColor(BRAND.charcoal).font("Helvetica");
    doc.text(data.subtitle, MARGIN, titleY + 56, { width: CONTENT_WIDTH, align: "center" });
    doc.restore();
  }

  // Tagline at bottom
  if (data.tagline) {
    doc.save();
    doc.fontSize(9).fillColor(BRAND.textLight).font("Helvetica");
    doc.text(data.tagline, MARGIN, PAGE_HEIGHT - 70, { width: CONTENT_WIDTH, align: "center" });
    doc.restore();
  }

  // Bottom gold line
  doc.save();
  doc.rect(0, PAGE_HEIGHT - 4, PAGE_WIDTH, 4).fill(BRAND.gold);
  doc.restore();
}

/* ================================================================== */
/*  MASTER COMPANY CATALOG                                             */
/* ================================================================== */
export async function generateMasterCatalog(): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: MARGIN,
        info: { Title: "Stone India Heritage – Company Profile", Author: "Stone India Heritage" },
      });

      const buffers: Buffer[] = [];
      doc.on("data", (c: Buffer) => buffers.push(c));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const settingsArr = await prisma.setting.findMany();
      const settings: Record<string, string> = {};
      settingsArr.forEach((s) => {
        settings[s.key] = s.value;
      });

      const [categories, products, projects] = await Promise.all([
        prisma.category.findMany({ orderBy: { order: "asc" } }),
        prisma.product.findMany({
          where: { featured: true },
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { category: { select: { name: true } } },
        }),
        prisma.project.findMany({
          where: { featured: true },
          take: 8,
          orderBy: { createdAt: "desc" },
        }),
      ]);

      const companyName = settings.site_name || "Stone India Heritage";
      const companyDesc =
        settings.site_description || "Premium Natural Sandstone from Rajasthan, India";
      const contactEmail = settings.contact_email || "exports@stoneindiaheritage.com";
      const contactPhone = settings.contact_phone || "+91 98290 00000";
      const address = settings.address || "Jodhpur, Rajasthan, India";
      const socialFacebook = settings.social_facebook || "";
      const socialInstagram = settings.social_instagram || "";
      const socialLinkedin = settings.social_linkedin || "";
      const socialYoutube = settings.social_youtube || "";

      /* ── Cover (no page number) ── */
      await drawCoverPage(doc, {
        title: "Company Profile",
        subtitle: companyDesc,
        tagline: "Timeless Stone · Modern Craftsmanship",
      });

      let pageNum = 0; // content pages start after cover

      /* ── About Us ── */
      let { y, pageNum: pn } = newContentPage(doc, pageNum);
      pageNum = pn;
      y = addSectionHeading(doc, y, "About Us");
      y = addParagraph(doc, y, companyDesc);
      y = addParagraph(
        doc,
        y,
        "Our state-of-the-art manufacturing facility spans over 100,000 sq ft and is equipped with modern gang-saws, CNC routers, and precision calibration lines. We combine traditional craftsmanship with cutting-edge technology to produce stone products that meet international quality standards.",
      );

      /* ── Vision & Mission ── */
      y += 8;
      y = addSectionHeading(doc, y, "Our Vision");
      y = addParagraph(
        doc,
        y,
        "To be the global benchmark for Indian natural stone — recognized for uncompromising quality, sustainable quarrying practices, and exceptional customer partnerships.",
      );
      y += 4;
      y = addSectionHeading(doc, y, "Our Mission");
      y = addParagraph(
        doc,
        y,
        "• Deliver consistent quality across every shipment\n• Innovate in stone processing and finishing techniques\n• Practice responsible quarrying with environmental stewardship\n• Build lasting relationships with architects, builders, and dealers worldwide\n• Empower local artisans and preserve traditional craftsmanship",
      );

      /* ── Infrastructure ── */
      ({ y, pageNum } = newContentPage(doc, pageNum));
      y = addSectionHeading(doc, y, "Infrastructure");
      y = addParagraph(
        doc,
        y,
        "• 100,000+ sq ft modern manufacturing facility in Jodhpur\n• Multiple quarry sites across Rajasthan with abundant reserves\n• Advanced gang-saw cutting lines with 20+ blades\n• CNC router machines for precision carving and profiling\n• Automatic calibration lines for accurate thickness\n• Computerized drying and stacking systems\n• In-house quality control laboratory\n• Dedicated packaging and export handling area",
      );

      y += 4;
      y = addSectionHeading(doc, y, "Manufacturing Process");
      y = addParagraph(
        doc,
        y,
        "1. Quarry Extraction — Selective mining of premium sandstone blocks\n2. Block Cutting — Gang-saw cutting into slabs\n3. Calibration — Precision thickness calibration within ±1mm\n4. Finishing — Natural cleft, honed, brushed, sandblasted\n5. Edge Profiling — Custom edge details\n6. Quality Control — Dimensional, color, strength verification\n7. Packaging — Export-grade wooden crates with steel straps\n8. Loading — Container stuffing with documentation",
      );

      /* ── Quality Control ── */
      ({ y, pageNum } = newContentPage(doc, pageNum));
      y = addSectionHeading(doc, y, "Quality Control");
      y = addParagraph(
        doc,
        y,
        "Every batch undergoes rigorous quality checks before shipment:\n\n• Dimensional tolerance verification (±1mm)\n• Color consistency matching across production lots\n• Water absorption testing\n• Compressive strength testing\n• Flexural strength testing\n• Surface finish uniformity\n• Edge and chamfer precision\n• Packaging integrity inspection",
      );

      y += 4;
      y = addSectionHeading(doc, y, "Product Categories");
      const cats =
        categories.length > 0
          ? categories.map((c) => `• ${c.name}`).join("\n")
          : "• Sandstone · Marble · Granite · Limestone\n• Slate · Quartzite · Wall Cladding · Jali\n• Carving · Landscape & Garden Products\n• Cobbles · Paving · Kerbstones · Pool Coping";
      y = addParagraph(doc, y, cats);

      /* ── Best Selling Products ── */
      if (products.length > 0) {
        ({ y, pageNum } = newContentPage(doc, pageNum));
        y = addSectionHeading(doc, y, "Best Selling Products");
        for (const p of products) {
          const line = `• ${p.name}${p.category?.name ? ` — ${p.category.name}` : ""}${p.finish ? ` (${p.finish})` : ""}`;
          if (y > PAGE_HEIGHT - 80) {
            ({ y, pageNum } = newContentPage(doc, pageNum));
          }
          y = addParagraph(doc, y, line, 11);
        }
      }

      /* ── Major Projects ── */
      if (projects.length > 0) {
        ({ y, pageNum } = newContentPage(doc, pageNum));
        y = addSectionHeading(doc, y, "Major Projects");
        for (const proj of projects) {
          if (y > PAGE_HEIGHT - 80) {
            ({ y, pageNum } = newContentPage(doc, pageNum));
          }
          const line = `• ${proj.title}${proj.location ? ` — ${proj.location}` : ""}${proj.year ? ` (${proj.year})` : ""}`;
          y = addParagraph(doc, y, line, 11);
        }
      }

      /* ── Global Presence ── */
      ({ y, pageNum } = newContentPage(doc, pageNum));
      y = addSectionHeading(doc, y, "Global Presence");
      y = addParagraph(
        doc,
        y,
        "We export to 35+ countries across:\n\n• North America — USA, Canada, Mexico\n• Europe — UK, Germany, France, Italy, Netherlands, Belgium\n• Middle East — UAE, Saudi Arabia, Qatar, Kuwait, Oman, Bahrain\n• Asia Pacific — Australia, New Zealand, Singapore, Malaysia\n• Africa — South Africa, Nigeria, Kenya\n• South America — Brazil, Chile",
      );

      y += 4;
      y = addSectionHeading(doc, y, "Certifications & Standards");
      y = addParagraph(
        doc,
        y,
        "• ASTM C616 / C503 compliant\n• ISO 9001:2015 Quality Management\n• CE Marking for European markets\n• Indian Stone Industry export certified\n• Environmental Management System compliant\n• Ethical quarrying practices certified",
      );

      /* ── Contact & QR ── */
      ({ y, pageNum } = newContentPage(doc, pageNum));
      y = addSectionHeading(doc, y, "Contact Us");
      let contactInfo = `${companyName}\n${address}\n\nPhone: ${contactPhone}\nEmail: ${contactEmail}\nWebsite: ${CONFIG.FRONTEND_URL || "https://stoneindiaheritage.com"}`;
      const socialLinks = [socialFacebook, socialInstagram, socialLinkedin, socialYoutube].filter(
        Boolean,
      );
      if (socialLinks.length > 0) {
        contactInfo += `\n\nFollow Us:`;
        if (socialFacebook) contactInfo += `\nFacebook: ${socialFacebook}`;
        if (socialInstagram) contactInfo += `\nInstagram: ${socialInstagram}`;
        if (socialLinkedin) contactInfo += `\nLinkedIn: ${socialLinkedin}`;
        if (socialYoutube) contactInfo += `\nYouTube: ${socialYoutube}`;
      }
      y = addParagraph(doc, y, contactInfo);

      const qrUrl = CONFIG.FRONTEND_URL || "https://stoneindiaheritage.com";
      const qrData = await generateQRDataURL(qrUrl);
      if (qrData) {
        try {
          doc.image(qrData, PAGE_WIDTH / 2 - 50, y + 30, { width: 100, height: 100 });
        } catch {
          /* skip */
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/* ================================================================== */
/*  CATEGORY CATALOG                                                   */
/* ================================================================== */
export async function generateCategoryCatalog(categoryId: string): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { products: { orderBy: { name: "asc" } } },
      });
      if (!category) throw new Error("Category not found");

      const doc = new PDFDocument({
        size: "A4",
        margin: MARGIN,
        info: {
          Title: `${category.name} Catalog — Stone India Heritage`,
          Author: "Stone India Heritage",
        },
      });

      const buffers: Buffer[] = [];
      doc.on("data", (c: Buffer) => buffers.push(c));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      /* ── Cover ── */
      await drawCoverPage(doc, {
        title: category.name,
        subtitle: `Premium ${category.name} from Rajasthan, India`,
        coverImage: category.image || undefined,
        tagline: "Timeless Stone · Modern Craftsmanship",
      });

      let pageNum = 0;
      const products = category.products;

      if (products.length === 0) {
        const { y: yy } = newContentPage(doc, pageNum);
        addSectionHeading(doc, yy, "Products");
        addParagraph(doc, yy + 40, "No products available in this category yet.");
      } else {
        for (const product of products) {
          const { y, pageNum: pn } = newContentPage(doc, pageNum);
          pageNum = pn;
          let curY = y;

          // Product name
          doc.save();
          doc.fontSize(20).fillColor(BRAND.charcoal).font("Helvetica-Bold");
          doc.text(product.name, MARGIN, curY, { width: CONTENT_WIDTH });
          curY += 28;

          if (product.productCode) {
            doc.fontSize(9).fillColor(BRAND.textLight).font("Helvetica");
            doc.text(`Product Code: ${product.productCode}`, MARGIN, curY);
            curY += 16;
          }

          doc.rect(MARGIN, curY, 40, 2).fill(BRAND.gold);
          curY += 12;
          doc.restore();

          // Cover image
          if (product.images?.length > 0) {
            try {
              doc.image(product.images[0], MARGIN, curY, {
                width: CONTENT_WIDTH,
                height: 190,
                fit: [CONTENT_WIDTH, 190],
                align: "center",
                valign: "center",
              });
              curY += 200;
            } catch {
              /* skip */
            }
          }

          // Description
          if (product.description) {
            curY = addParagraph(doc, curY, product.description.substring(0, 500));
          }

          // Specs
          const specs: string[] = [];
          if (product.size) specs.push(`Size: ${product.size}`);
          if (product.thickness) specs.push(`Thickness: ${product.thickness}`);
          if (product.finish) specs.push(`Finish: ${product.finish}`);
          if (product.origin) specs.push(`Origin: ${product.origin}`);
          if (specs.length > 0) {
            curY += 4;
            curY = addSectionHeading(doc, curY, "Specifications");
            curY = addParagraph(doc, curY, specs.join("\n"), 10);
          }

          // Applications
          if (product.applications) {
            curY = y + 400; // force next page roughly
            let { y: ny, pageNum: np } = newContentPage(doc, pageNum);
            pageNum = np;
            ny = addSectionHeading(doc, ny, "Applications");
            addParagraph(doc, ny, product.applications);
            curY = ny + 200;
          }

          // Technical specs from JSON
          if (product.specs) {
            const sd = product.specs as Record<string, any>;
            if (Object.keys(sd).length > 0) {
              let { y: ny, pageNum: np } = newContentPage(doc, pageNum);
              pageNum = np;
              ny = addSectionHeading(doc, ny, "Technical Specifications");
              const lines = Object.entries(sd)
                .map(([k, v]) => `• ${k}: ${v}`)
                .join("\n");
              addParagraph(doc, ny, lines);
            }
          }

          // Packing
          if (product.packingDetails) {
            let { y: ny, pageNum: np } = newContentPage(doc, pageNum);
            pageNum = np;
            ny = addSectionHeading(doc, ny, "Packing Details");
            addParagraph(doc, ny, product.packingDetails);
          }
        }
      }

      // QR Code on last page
      const qrUrl = `${CONFIG.FRONTEND_URL}/products/${category.slug}`;
      const qrData = await generateQRDataURL(qrUrl);
      if (qrData) {
        try {
          doc.image(qrData, PAGE_WIDTH / 2 - 40, PAGE_HEIGHT - 140, { width: 80, height: 80 });
          doc.save();
          doc.fontSize(7).fillColor(BRAND.textLight).font("Helvetica");
          doc.text("Scan to view online", PAGE_WIDTH / 2 - 35, PAGE_HEIGHT - 55, {
            width: 80,
            align: "center",
          });
          doc.restore();
        } catch {
          /* skip */
        }
      }
      addFooter(doc, pageNum + 1); // ensure last page has footer

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/* ================================================================== */
/*  PRODUCT CATALOG (single product)                                   */
/* ================================================================== */
export async function generateProductCatalog(productId: string): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { category: { select: { id: true, name: true, slug: true } } },
      });
      if (!product) throw new Error("Product not found");

      const doc = new PDFDocument({
        size: "A4",
        margin: MARGIN,
        info: { Title: `${product.name} — Stone India Heritage`, Author: "Stone India Heritage" },
      });

      const buffers: Buffer[] = [];
      doc.on("data", (c: Buffer) => buffers.push(c));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      let pageNum = 0;

      /* PAGE 1 — Cover */
      await drawCoverPage(doc, {
        title: product.name,
        subtitle: product.category?.name || "Natural Stone Product",
        coverImage: product.images?.[0] || undefined,
        tagline: `Product Code: ${product.productCode || "—"}`,
      });

      /* PAGE 2 — Introduction */
      let { y, pageNum: pn } = newContentPage(doc, pageNum);
      pageNum = pn;
      y = addSectionHeading(doc, y, "Introduction");
      y = addParagraph(
        doc,
        y,
        product.description ||
          "Premium quality natural stone product from the quarries of Rajasthan, India.",
      );

      if (product.applications) {
        y += 4;
        y = addSectionHeading(doc, y, "Applications");
        y = addParagraph(doc, y, product.applications);
      }

      /* PAGE 3 — Options */
      ({ y, pageNum } = newContentPage(doc, pageNum));
      y = addSectionHeading(doc, y, "Available Options");
      const opts: string[] = [];
      if (product.size) opts.push(`Available Sizes: ${product.size}`);
      if (product.thickness) opts.push(`Available Thickness: ${product.thickness}`);
      if (product.finish) opts.push(`Available Finish: ${product.finish}`);
      y = addParagraph(
        doc,
        y,
        opts.length > 0
          ? opts.join("\n\n")
          : "Please contact us for available sizes, thickness, and finish options.",
        11,
      );

      /* PAGE 4 — Technical Specs */
      ({ y, pageNum } = newContentPage(doc, pageNum));
      y = addSectionHeading(doc, y, "Technical Specifications");
      const specs = product.specs as Record<string, any> | null;
      if (specs && Object.keys(specs).length > 0) {
        const lines = Object.entries(specs)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n");
        y = addParagraph(doc, y, lines, 11);
      } else {
        y = addParagraph(
          doc,
          y,
          "• Density: 2,400 – 2,600 kg/m³\n• Water Absorption: < 3%\n• Hardness: 6–7 Mohs Scale\n• Compressive Strength: 80–120 MPa\n• Flexural Strength: 8–15 MPa\n\nContact us for detailed technical data sheets.",
          11,
        );
      }

      /* PAGE 5 — Gallery */
      if (product.images && product.images.length > 1) {
        ({ y, pageNum } = newContentPage(doc, pageNum));
        y = addSectionHeading(doc, y, "Product Gallery");
        const imgs = product.images.slice(0, 6);
        for (let i = 0; i < imgs.length; i++) {
          try {
            const ix = MARGIN + (i % 2) * (CONTENT_WIDTH / 2 + 5);
            const iy = y + Math.floor(i / 2) * 200;
            doc.image(imgs[i], ix, iy, {
              width: CONTENT_WIDTH / 2 - 5,
              height: 185,
              fit: [CONTENT_WIDTH / 2 - 5, 185],
              align: "center",
              valign: "center",
            });
          } catch {
            /* skip */
          }
        }
      }

      /* PAGE 6 — Packing & Shipping */
      ({ y, pageNum } = newContentPage(doc, pageNum));
      y = addSectionHeading(doc, y, "Packing Details");
      y = addParagraph(
        doc,
        y,
        product.packingDetails ||
          "• Export-grade wooden crates with steel strapping\n• Protective foam interlayers\n• Shrink-wrapped bundles for moisture protection\n• Custom packing available on request",
        11,
      );
      y += 4;
      y = addSectionHeading(doc, y, "Container Capacity");
      y = addParagraph(
        doc,
        y,
        "• 20ft Container: Approx. 22–26 tons\n• 40ft Container: Approx. 26–28 tons\n• FCL and LCL shipping available",
        11,
      );
      y += 4;
      y = addSectionHeading(doc, y, "Shipping");
      y = addParagraph(
        doc,
        y,
        "We ship worldwide via major ports:\n• Mundra Port (Gujarat)\n• Nhava Sheva (Mumbai)\n• Jebel Ali (Dubai) for Middle East consolidation\n\nLead time: 2–4 weeks depending on order volume and finish.",
        11,
      );

      /* PAGE 7 — Contact */
      ({ y, pageNum } = newContentPage(doc, pageNum));
      y = addSectionHeading(doc, y, "Contact Us");
      const productUrl = `${CONFIG.FRONTEND_URL}/products/${product.slug}`;
      y = addParagraph(
        doc,
        y,
        `Stone India Heritage\nJodhpur, Rajasthan, India\n\nPhone: ${CONFIG.COMPANY_PHONE || "+91 98290 00000"}\nEmail: exports@stoneindiaheritage.com\nWebsite: ${CONFIG.FRONTEND_URL || "https://stoneindiaheritage.com"}\n\nProduct Page: ${productUrl}`,
        11,
      );

      const qrData = await generateQRDataURL(productUrl);
      if (qrData) {
        try {
          doc.image(qrData, PAGE_WIDTH / 2 - 50, y + 20, { width: 100, height: 100 });
          doc.save();
          doc.fontSize(7).fillColor(BRAND.textLight).font("Helvetica");
          doc.text("Scan to view product online", PAGE_WIDTH / 2 - 45, y + 125, {
            width: 100,
            align: "center",
          });
          doc.restore();
        } catch {
          /* skip */
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/* ================================================================== */
/*  Upload generated PDF to Supabase Storage                          */
/* ================================================================== */
export async function uploadGeneratedPDF(buffer: Buffer, filename: string): Promise<string> {
  return await uploadFile(buffer, "catalogs" as StorageFolder, filename, "application/pdf");
}

/* ================================================================== */
/*  Generate and save catalog, return URL from DB                     */
/* ================================================================== */
export async function generateAndSaveCatalog(
  type: "master" | "category" | "product",
  referenceId?: string,
): Promise<{ pdfUrl: string; catalogId: string; version: number }> {
  let buffer: Buffer;
  let title: string;
  let slug: string;
  let description: string | undefined;
  let coverImage: string | undefined;
  let categoryId: string | undefined;
  let productId: string | undefined;
  let existing: any;

  if (type === "master") {
    existing = await prisma.generatedCatalog.findFirst({
      where: { type: "master" },
      orderBy: { version: "desc" },
    });
  } else if (type === "category" && referenceId) {
    existing = await prisma.generatedCatalog.findFirst({
      where: { type: "category", categoryId: referenceId },
      orderBy: { version: "desc" },
    });
  } else if (type === "product" && referenceId) {
    existing = await prisma.generatedCatalog.findFirst({
      where: { type: "product", productId: referenceId },
      orderBy: { version: "desc" },
    });
  }

  const nextVersion = existing ? existing.version + 1 : 1;

  if (type === "master") {
    buffer = await generateMasterCatalog();
    title = "Stone India Heritage – Company Profile";
    slug = "company-profile";
    description = "Complete company profile including products, projects, and capabilities.";
    const sa = await prisma.setting.findMany();
    const s: Record<string, string> = {};
    sa.forEach((x) => {
      s[x.key] = x.value;
    });
    coverImage = s.site_logo || undefined;
  } else if (type === "category" && referenceId) {
    const cat = await prisma.category.findUnique({ where: { id: referenceId } });
    if (!cat) throw new Error("Category not found");
    buffer = await generateCategoryCatalog(referenceId);
    title = `${cat.name} Catalog`;
    slug = `${cat.slug}-catalog`;
    description = `Complete product catalog for ${cat.name}`;
    coverImage = cat.image || undefined;
    categoryId = cat.id;
  } else if (type === "product" && referenceId) {
    const prod = await prisma.product.findUnique({ where: { id: referenceId } });
    if (!prod) throw new Error("Product not found");
    buffer = await generateProductCatalog(referenceId);
    title = `${prod.name} – Product Specification`;
    slug = `${prod.slug}-catalog`;
    description = `Technical specification and product details for ${prod.name}`;
    coverImage = prod.images?.[0] || undefined;
    productId = prod.id;
  } else {
    throw new Error("Invalid catalog generation parameters");
  }

  const filename = `${slug}-v${nextVersion}.pdf`.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  const pdfUrl = await uploadGeneratedPDF(buffer, filename);
  const fileSize = formatStorageBytes(buffer.length);

  if (existing) {
    await prisma.catalogVersion.create({
      data: {
        catalogId: existing.id,
        version: existing.version,
        pdfUrl: existing.pdfUrl,
        fileSize: existing.fileSize,
      },
    });
    const updated = await prisma.generatedCatalog.update({
      where: { id: existing.id },
      data: { pdfUrl, fileSize, version: nextVersion, status: "draft", updatedAt: new Date() },
    });
    return { pdfUrl, catalogId: updated.id, version: nextVersion };
  }

  const created = await prisma.generatedCatalog.create({
    data: {
      type,
      title,
      slug,
      description,
      pdfUrl,
      coverImage,
      categoryId,
      productId,
      status: "draft",
      version: nextVersion,
      fileSize,
    },
  });
  return { pdfUrl, catalogId: created.id, version: nextVersion };
}
