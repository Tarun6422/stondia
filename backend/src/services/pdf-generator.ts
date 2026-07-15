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

/* ─── Theme definitions ─── */
const THEMES = {
  corporate: {
    name: "Corporate",
    primary: "#1A3A5C",
    accent: "#2E6EA6",
    bg: "#FFFFFF",
    text: "#2C2C2C",
    textLight: "#8A8A8A",
    border: "#D0D0D0",
    headerBg: "#1A3A5C",
    footerBg: "#F5F5F5",
    highlight: "#E8F0F8",
  },
  premium: {
    name: "Premium",
    primary: "#1A1A2E",
    accent: "#C5A55A",
    bg: "#FEFEFE",
    text: "#2A2A2A",
    textLight: "#7A7A7A",
    border: "#C5A55A",
    headerBg: "#1A1A2E",
    footerBg: "#F8F6F0",
    highlight: "#F5F0E0",
  },
  luxury: {
    name: "Luxury",
    primary: "#0D0D0D",
    accent: "#D4AF37",
    bg: "#FAFAF8",
    text: "#1A1A1A",
    textLight: "#6A6A6A",
    border: "#D4AF37",
    headerBg: "#0D0D0D",
    footerBg: "#F0EDE5",
    highlight: "#F5ECD0",
  },
  construction: {
    name: "Construction",
    primary: "#2D5016",
    accent: "#E8751A",
    bg: "#FFFFFF",
    text: "#2B2B2B",
    textLight: "#7A7A7A",
    border: "#C0C0C0",
    headerBg: "#2D5016",
    footerBg: "#F4F4F0",
    highlight: "#F0F5EA",
  },
  architecture: {
    name: "Architecture",
    primary: "#2C2C2C",
    accent: "#8B8B8B",
    bg: "#FFFFFF",
    text: "#1A1A1A",
    textLight: "#6A6A6A",
    border: "#B0B0B0",
    headerBg: "#2C2C2C",
    footerBg: "#F2F2F2",
    highlight: "#F0F0F0",
  },
  export: {
    name: "Export",
    primary: "#0B3D60",
    accent: "#D84315",
    bg: "#FFFFFF",
    text: "#2C2C2C",
    textLight: "#7A7A7A",
    border: "#BDBDBD",
    headerBg: "#0B3D60",
    footerBg: "#F2F5F7",
    highlight: "#E3F0F7",
  },
  modern: {
    name: "Modern",
    primary: "#1A1A2E",
    accent: "#E94560",
    bg: "#FFFFFF",
    text: "#1A1A1A",
    textLight: "#6A6A6A",
    border: "#E0E0E0",
    headerBg: "#1A1A2E",
    footerBg: "#F5F5F5",
    highlight: "#FDE8EA",
  },
  minimal: {
    name: "Minimal",
    primary: "#333333",
    accent: "#666666",
    bg: "#FFFFFF",
    text: "#2A2A2A",
    textLight: "#888888",
    border: "#CCCCCC",
    headerBg: "#333333",
    footerBg: "#FAFAFA",
    highlight: "#F5F5F5",
  },
};

/* ─── Language translations ─── */
const LANGUAGES: Record<string, Record<string, string>> = {
  en: {
    company_profile: "Company Profile",
    about_us: "About Us",
    our_vision: "Our Vision",
    our_mission: "Our Mission",
    infrastructure: "Infrastructure",
    manufacturing_process: "Manufacturing Process",
    quality_control: "Quality Control",
    product_categories: "Product Categories",
    best_selling_products: "Best Selling Products",
    major_projects: "Major Projects",
    global_presence: "Global Presence",
    certifications: "Certifications & Standards",
    contact_us: "Contact Us",
    specifications: "Specifications",
    applications: "Applications",
    technical_specifications: "Technical Specifications",
    packing_details: "Packing Details",
    available_options: "Available Options",
    product_gallery: "Product Gallery",
    container_capacity: "Container Capacity",
    shipping: "Shipping",
    introduction: "Introduction",
    scan_to_view: "Scan to view online",
    scan_to_view_product: "Scan to view product online",
    timeless_stone: "Timeless Stone · Modern Craftsmanship",
    no_products: "No products available in this category yet.",
    contact_phone: "Phone",
    contact_email: "Email",
    website: "Website",
    follow_us: "Follow Us",
    product_code: "Product Code",
    available_sizes: "Available Sizes",
    available_thickness: "Available Thickness",
    available_finish: "Available Finish",
    product_page: "Product Page",
    visit_website: "Visit our website",
    company_intro: "Company Introduction",
    product_details: "Product Details",
  },
  fr: {
    company_profile: "Profil de l'Entreprise",
    about_us: "À Propos de Nous",
    our_vision: "Notre Vision",
    our_mission: "Notre Mission",
    infrastructure: "Infrastructure",
    manufacturing_process: "Processus de Fabrication",
    quality_control: "Contrôle Qualité",
    product_categories: "Catégories de Produits",
    best_selling_products: "Meilleures Ventes",
    major_projects: "Projets Majeurs",
    global_presence: "Présence Mondiale",
    certifications: "Certifications et Normes",
    contact_us: "Nous Contacter",
    specifications: "Spécifications",
    applications: "Applications",
    technical_specifications: "Spécifications Techniques",
    packing_details: "Détails d'Emballage",
    available_options: "Options Disponibles",
    product_gallery: "Galerie de Produits",
    container_capacity: "Capacité du Conteneur",
    shipping: "Expédition",
    introduction: "Introduction",
    scan_to_view: "Scannez pour voir en ligne",
    scan_to_view_product: "Scannez pour voir le produit en ligne",
    timeless_stone: "Pierre Intemporelle · Artisanat Moderne",
    no_products: "Aucun produit disponible dans cette catégorie.",
    contact_phone: "Téléphone",
    contact_email: "E-mail",
    website: "Site Web",
    follow_us: "Suivez-Nous",
    product_code: "Code Produit",
    available_sizes: "Tailles Disponibles",
    available_thickness: "Épaisseurs Disponibles",
    available_finish: "Finitions Disponibles",
    product_page: "Page Produit",
    visit_website: "Visitez notre site web",
    company_intro: "Présentation de l'Entreprise",
    product_details: "Détails du Produit",
  },
  es: {
    company_profile: "Perfil de la Empresa",
    about_us: "Sobre Nosotros",
    our_vision: "Nuestra Visión",
    our_mission: "Nuestra Misión",
    infrastructure: "Infraestructura",
    manufacturing_process: "Proceso de Fabricación",
    quality_control: "Control de Calidad",
    product_categories: "Categorías de Productos",
    best_selling_products: "Productos Más Vendidos",
    major_projects: "Proyectos Importantes",
    global_presence: "Presencia Global",
    certifications: "Certificaciones y Estándares",
    contact_us: "Contáctenos",
    specifications: "Especificaciones",
    applications: "Aplicaciones",
    technical_specifications: "Especificaciones Técnicas",
    packing_details: "Detalles de Empaque",
    available_options: "Opciones Disponibles",
    product_gallery: "Galería de Productos",
    container_capacity: "Capacidad del Contenedor",
    shipping: "Envío",
    introduction: "Introducción",
    scan_to_view: "Escanee para ver en línea",
    scan_to_view_product: "Escanee para ver el producto en línea",
    timeless_stone: "Piedra Atemporal · Artesanía Moderna",
    no_products: "No hay productos disponibles en esta categoría.",
    contact_phone: "Teléfono",
    contact_email: "Correo Electrónico",
    website: "Sitio Web",
    follow_us: "Síganos",
    product_code: "Código de Producto",
    available_sizes: "Tamaños Disponibles",
    available_thickness: "Grosor Disponible",
    available_finish: "Acabado Disponible",
    product_page: "Página del Producto",
    visit_website: "Visite nuestro sitio web",
    company_intro: "Introducción de la Empresa",
    product_details: "Detalles del Producto",
  },
  ar: {
    company_profile: "ملف الشركة",
    about_us: "من نحن",
    our_vision: "رؤيتنا",
    our_mission: "مهمتنا",
    infrastructure: "البنية التحتية",
    manufacturing_process: "عملية التصنيع",
    quality_control: "مراقبة الجودة",
    product_categories: "فئات المنتجات",
    best_selling_products: "المنتجات الأكثر مبيعاً",
    major_projects: "المشاريع الكبرى",
    global_presence: "الوجود العالمي",
    certifications: "الشهادات والمعايير",
    contact_us: "اتصل بنا",
    specifications: "المواصفات",
    applications: "التطبيقات",
    technical_specifications: "المواصفات الفنية",
    packing_details: "تفاصيل التعبئة",
    available_options: "الخيارات المتاحة",
    product_gallery: "معرض المنتجات",
    container_capacity: "سعة الحاوية",
    shipping: "الشحن",
    introduction: "مقدمة",
    scan_to_view: "امسح للعرض عبر الإنترنت",
    scan_to_view_product: "امسح لعرض المنتج عبر الإنترنت",
    timeless_stone: "حجر خالد · حرفية عصرية",
    no_products: "لا توجد منتجات متاحة في هذه الفئة بعد.",
    contact_phone: "هاتف",
    contact_email: "البريد الإلكتروني",
    website: "الموقع الإلكتروني",
    follow_us: "تابعنا",
    product_code: "رمز المنتج",
    available_sizes: "الأحجام المتاحة",
    available_thickness: "السماكة المتاحة",
    available_finish: "التشطيب المتاح",
    product_page: "صفحة المنتج",
    visit_website: "قم بزيارة موقعنا",
    company_intro: "مقدمة الشركة",
    product_details: "تفاصيل المنتج",
  },
};

/* ─── Default theme (legacy fallback) ─── */
function getTheme(themeName: string = "premium") {
  return (THEMES as any)[themeName] || THEMES.premium;
}

function getLang(language: string = "en") {
  return (LANGUAGES as any)[language] || LANGUAGES.en;
}

/* ─── Color palette / brand constants (kept for backward compat) ─── */
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
function addFooter(doc: PDFKit.PDFDocument, pageNum: number, theme = THEMES.premium) {
  doc.save();
  doc
    .moveTo(MARGIN, PAGE_HEIGHT - 35)
    .lineTo(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 35)
    .strokeColor(theme.border)
    .lineWidth(0.5)
    .stroke();
  doc.fontSize(8).fillColor(theme.textLight);
  doc.text(`${pageNum}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 25, { align: "center" });
  doc.restore();
}

/* ─── Helper: draw section heading ─── */
function addSectionHeading(doc: PDFKit.PDFDocument, y: number, title: string, theme = THEMES.premium): number {
  doc.save();
  doc
    .moveTo(MARGIN, y)
    .lineTo(MARGIN + 40, y)
    .strokeColor(theme.accent)
    .lineWidth(2)
    .stroke();
  doc.fontSize(16).fillColor(theme.primary).font("Helvetica-Bold");
  doc.text(title, MARGIN, y + 8);
  doc.restore();
  return y + 36;
}

/* ─── Helper: draw text paragraph with auto-page-break ─── */
function addParagraph(doc: PDFKit.PDFDocument, y: number, text: string, fontSize = 10, theme = THEMES.premium): number {
  doc.save();
  doc.fontSize(fontSize).fillColor(theme.text).font("Helvetica");
  const opts = { width: CONTENT_WIDTH, align: "left" as const, lineGap: 4 };
  const h = doc.heightOfString(text, opts);
  if (y + h > PAGE_HEIGHT - 60) {
    const currentPage = doc.bufferedPageRange().count + 1;
    doc.addPage();
    addFooter(doc, currentPage, theme);
    y = MARGIN;
  }
  doc.text(text, MARGIN, y, opts);
  doc.restore();
  return y + h + 12;
}

/* ─── Helper: start a new content page, returning y and new pageNum ─── */
function newContentPage(doc: PDFKit.PDFDocument, pageNum: number, theme = THEMES.premium): { y: number; pageNum: number } {
  doc.addPage();
  const p = ++pageNum;
  addFooter(doc, p, theme);
  return { y: MARGIN, pageNum: p };
}

/* ─── Helper: generate QR code as data URL ─── */
async function generateQRDataURL(url: string, theme = THEMES.premium): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: { dark: theme.primary, light: "#FFFFFF" },
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
  theme = THEMES.premium,
) {
  // Dark header stripe
  doc.save();
  doc.rect(0, 0, PAGE_WIDTH, 280).fill(theme.headerBg);
  doc.restore();

  // Accent bar
  doc.save();
  doc.rect(0, 280, PAGE_WIDTH, 4).fill(theme.accent);
  doc.restore();

  // Company name
  doc.save();
  doc.fontSize(30).fillColor(BRAND.white).font("Helvetica-Bold");
  doc.text("STONDIA", MARGIN, 70, { width: CONTENT_WIDTH });

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
  doc.fontSize(24).fillColor(theme.primary).font("Helvetica-Bold");
  doc.text(data.title, MARGIN, titleY, { width: CONTENT_WIDTH, align: "center" });
  doc.restore();

  // Accent divider
  doc.save();
  doc.rect(PAGE_WIDTH / 2 - 25, titleY + 42, 50, 2).fill(theme.accent);
  doc.restore();

  // Subtitle
  if (data.subtitle) {
    doc.save();
    doc.fontSize(11).fillColor(theme.primary).font("Helvetica");
    doc.text(data.subtitle, MARGIN, titleY + 56, { width: CONTENT_WIDTH, align: "center" });
    doc.restore();
  }

  // Tagline at bottom
  if (data.tagline) {
    doc.save();
    doc.fontSize(9).fillColor(theme.textLight).font("Helvetica");
    doc.text(data.tagline, MARGIN, PAGE_HEIGHT - 70, { width: CONTENT_WIDTH, align: "center" });
    doc.restore();
  }

  // Bottom accent line
  doc.save();
  doc.rect(0, PAGE_HEIGHT - 4, PAGE_WIDTH, 4).fill(theme.accent);
  doc.restore();
}

/* ================================================================== */
/*  MASTER COMPANY CATALOG                                             */
/* ================================================================== */
export async function generateMasterCatalog(options?: {
  theme?: string;
  language?: string;
  templateId?: string;
}): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const theme = getTheme(options?.theme);
      const lang = getLang(options?.language);

      const doc = new PDFDocument({
        size: "A4",
        margin: MARGIN,
        info: { Title: "STONDIA – Company Profile", Author: "STONDIA" },
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

      const companyName = settings.site_name || "STONDIA";
      const companyDesc =
        settings.site_description || "Premium Natural Sandstone from Rajasthan, India";
      const contactEmail = settings.contact_email || "exports@stondia.com";
      const contactPhone = settings.contact_phone || "+91 98290 00000";
      const address = settings.address || "Jodhpur, Rajasthan, India";
      const socialFacebook = settings.social_facebook || "";
      const socialInstagram = settings.social_instagram || "";
      const socialLinkedin = settings.social_linkedin || "";
      const socialYoutube = settings.social_youtube || "";

      /* ── Cover (no page number) ── */
      await drawCoverPage(
        doc,
        {
          title: lang.company_profile,
          subtitle: companyDesc,
          tagline: lang.timeless_stone,
        },
        theme,
      );

      let pageNum = 0;

      /* ── About Us ── */
      let { y, pageNum: pn } = newContentPage(doc, pageNum, theme);
      pageNum = pn;
      y = addSectionHeading(doc, y, lang.about_us, theme);
      y = addParagraph(doc, y, companyDesc, 10, theme);
      y = addParagraph(
        doc,
        y,
        "Our state-of-the-art manufacturing facility spans over 100,000 sq ft and is equipped with modern gang-saws, CNC routers, and precision calibration lines. We combine traditional craftsmanship with cutting-edge technology to produce stone products that meet international quality standards.",
        10,
        theme,
      );

      /* ── Vision & Mission ── */
      y += 8;
      y = addSectionHeading(doc, y, lang.our_vision, theme);
      y = addParagraph(
        doc,
        y,
        "To be the global benchmark for Indian natural stone — recognized for uncompromising quality, sustainable quarrying practices, and exceptional customer partnerships.",
        10,
        theme,
      );
      y += 4;
      y = addSectionHeading(doc, y, lang.our_mission, theme);
      y = addParagraph(
        doc,
        y,
        "• Deliver consistent quality across every shipment\n• Innovate in stone processing and finishing techniques\n• Practice responsible quarrying with environmental stewardship\n• Build lasting relationships with architects, builders, and dealers worldwide\n• Empower local artisans and preserve traditional craftsmanship",
        10,
        theme,
      );

      /* ── Infrastructure ── */
      ({ y, pageNum } = newContentPage(doc, pageNum, theme));
      y = addSectionHeading(doc, y, lang.infrastructure, theme);
      y = addParagraph(
        doc,
        y,
        "• 100,000+ sq ft modern manufacturing facility in Jodhpur\n• Multiple quarry sites across Rajasthan with abundant reserves\n• Advanced gang-saw cutting lines with 20+ blades\n• CNC router machines for precision carving and profiling\n• Automatic calibration lines for accurate thickness\n• Computerized drying and stacking systems\n• In-house quality control laboratory\n• Dedicated packaging and export handling area",
        10,
        theme,
      );

      y += 4;
      y = addSectionHeading(doc, y, lang.manufacturing_process, theme);
      y = addParagraph(
        doc,
        y,
        "1. Quarry Extraction — Selective mining of premium sandstone blocks\n2. Block Cutting — Gang-saw cutting into slabs\n3. Calibration — Precision thickness calibration within ±1mm\n4. Finishing — Natural cleft, honed, brushed, sandblasted\n5. Edge Profiling — Custom edge details\n6. Quality Control — Dimensional, color, strength verification\n7. Packaging — Export-grade wooden crates with steel straps\n8. Loading — Container stuffing with documentation",
        10,
        theme,
      );

      /* ── Quality Control ── */
      ({ y, pageNum } = newContentPage(doc, pageNum, theme));
      y = addSectionHeading(doc, y, lang.quality_control, theme);
      y = addParagraph(
        doc,
        y,
        "Every batch undergoes rigorous quality checks before shipment:\n\n• Dimensional tolerance verification (±1mm)\n• Color consistency matching across production lots\n• Water absorption testing\n• Compressive strength testing\n• Flexural strength testing\n• Surface finish uniformity\n• Edge and chamfer precision\n• Packaging integrity inspection",
        10,
        theme,
      );

      y += 4;
      y = addSectionHeading(doc, y, lang.product_categories, theme);
      const cats =
        categories.length > 0
          ? categories.map((c) => `• ${c.name}`).join("\n")
          : "• Sandstone · Marble · Granite · Limestone\n• Slate · Quartzite · Wall Cladding · Jali\n• Carving · Landscape & Garden Products\n• Cobbles · Paving · Kerbstones · Pool Coping";
      y = addParagraph(doc, y, cats, 10, theme);

      /* ── Best Selling Products ── */
      if (products.length > 0) {
        ({ y, pageNum } = newContentPage(doc, pageNum, theme));
        y = addSectionHeading(doc, y, lang.best_selling_products, theme);
        for (const p of products) {
          const line = `• ${p.name}${p.category?.name ? ` — ${p.category.name}` : ""}${p.finish ? ` (${p.finish})` : ""}`;
          if (y > PAGE_HEIGHT - 80) {
            ({ y, pageNum } = newContentPage(doc, pageNum, theme));
          }
          y = addParagraph(doc, y, line, 11, theme);
        }
      }

      /* ── Major Projects ── */
      if (projects.length > 0) {
        ({ y, pageNum } = newContentPage(doc, pageNum, theme));
        y = addSectionHeading(doc, y, lang.major_projects, theme);
        for (const proj of projects) {
          if (y > PAGE_HEIGHT - 80) {
            ({ y, pageNum } = newContentPage(doc, pageNum, theme));
          }
          const line = `• ${proj.title}${proj.location ? ` — ${proj.location}` : ""}${proj.year ? ` (${proj.year})` : ""}`;
          y = addParagraph(doc, y, line, 11, theme);
        }
      }

      /* ── Global Presence ── */
      ({ y, pageNum } = newContentPage(doc, pageNum, theme));
      y = addSectionHeading(doc, y, lang.global_presence, theme);
      y = addParagraph(
        doc,
        y,
        "We export to 35+ countries across:\n\n• North America — USA, Canada, Mexico\n• Europe — UK, Germany, France, Italy, Netherlands, Belgium\n• Middle East — UAE, Saudi Arabia, Qatar, Kuwait, Oman, Bahrain\n• Asia Pacific — Australia, New Zealand, Singapore, Malaysia\n• Africa — South Africa, Nigeria, Kenya\n• South America — Brazil, Chile",
        10,
        theme,
      );

      y += 4;
      y = addSectionHeading(doc, y, lang.certifications, theme);
      y = addParagraph(
        doc,
        y,
        "• ASTM C616 / C503 compliant\n• ISO 9001:2015 Quality Management\n• CE Marking for European markets\n• Indian Stone Industry export certified\n• Environmental Management System compliant\n• Ethical quarrying practices certified",
        10,
        theme,
      );

      /* ── Contact & QR ── */
      ({ y, pageNum } = newContentPage(doc, pageNum, theme));
      y = addSectionHeading(doc, y, lang.contact_us, theme);
      let contactInfo = `${companyName}\n${address}\n\n${lang.contact_phone}: ${contactPhone}\n${lang.contact_email}: ${contactEmail}\n${lang.website}: ${CONFIG.FRONTEND_URL || "https://stondia.com"}`;
      const socialLinks = [socialFacebook, socialInstagram, socialLinkedin, socialYoutube].filter(
        Boolean,
      );
      if (socialLinks.length > 0) {
        contactInfo += `\n\n${lang.follow_us}:`;
        if (socialFacebook) contactInfo += `\nFacebook: ${socialFacebook}`;
        if (socialInstagram) contactInfo += `\nInstagram: ${socialInstagram}`;
        if (socialLinkedin) contactInfo += `\nLinkedIn: ${socialLinkedin}`;
        if (socialYoutube) contactInfo += `\nYouTube: ${socialYoutube}`;
      }
      y = addParagraph(doc, y, contactInfo, 10, theme);

      const qrUrl = CONFIG.FRONTEND_URL || "https://stondia.com";
      const qrData = await generateQRDataURL(qrUrl, theme);
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
export async function generateCategoryCatalog(
  categoryId: string,
  options?: {
    theme?: string;
    language?: string;
    templateId?: string;
  },
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const theme = getTheme(options?.theme);
      const lang = getLang(options?.language);

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { products: { orderBy: { name: "asc" } } },
      });
      if (!category) throw new Error("Category not found");

      const doc = new PDFDocument({
        size: "A4",
        margin: MARGIN,
        info: { Title: `${category.name} Catalog — STONDIA`, Author: "STONDIA" },
      });

      const buffers: Buffer[] = [];
      doc.on("data", (c: Buffer) => buffers.push(c));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      /* ── Cover ── */
      await drawCoverPage(
        doc,
        {
          title: category.name,
          subtitle: `Premium ${category.name} from Rajasthan, India`,
          coverImage: category.image || undefined,
          tagline: lang.timeless_stone,
        },
        theme,
      );

      let pageNum = 0;
      const products = category.products;

      if (products.length === 0) {
        const { y: yy } = newContentPage(doc, pageNum, theme);
        addSectionHeading(doc, yy, lang.product_categories, theme);
        addParagraph(doc, yy + 40, lang.no_products, 10, theme);
      } else {
        for (const product of products) {
          const { y, pageNum: pn } = newContentPage(doc, pageNum, theme);
          pageNum = pn;
          let curY = y;

          // Product name
          doc.save();
          doc.fontSize(20).fillColor(theme.primary).font("Helvetica-Bold");
          doc.text(product.name, MARGIN, curY, { width: CONTENT_WIDTH });
          curY += 28;

          if (product.productCode) {
            doc.fontSize(9).fillColor(theme.textLight).font("Helvetica");
            doc.text(`${lang.product_code}: ${product.productCode}`, MARGIN, curY);
            curY += 16;
          }

          doc.rect(MARGIN, curY, 40, 2).fill(theme.accent);
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
            curY = addParagraph(doc, curY, product.description.substring(0, 500), 10, theme);
          }

          // Specs
          const specs: string[] = [];
          if (product.size) specs.push(`${lang.available_sizes}: ${product.size}`);
          if (product.thickness) specs.push(`${lang.available_thickness}: ${product.thickness}`);
          if (product.finish) specs.push(`${lang.available_finish}: ${product.finish}`);
          if (product.origin) specs.push(`Origin: ${product.origin}`);
          if (specs.length > 0) {
            curY += 4;
            curY = addSectionHeading(doc, curY, lang.specifications, theme);
            curY = addParagraph(doc, curY, specs.join("\n"), 10, theme);
          }

          // Applications
          if (product.applications) {
            let { y: ny, pageNum: np } = newContentPage(doc, pageNum, theme);
            pageNum = np;
            ny = addSectionHeading(doc, ny, lang.applications, theme);
            addParagraph(doc, ny, product.applications, 10, theme);
            curY = ny + 200;
          }

          // Technical specs from JSON
          if (product.specs) {
            const sd = product.specs as Record<string, any>;
            if (Object.keys(sd).length > 0) {
              let { y: ny, pageNum: np } = newContentPage(doc, pageNum, theme);
              pageNum = np;
              ny = addSectionHeading(doc, ny, lang.technical_specifications, theme);
              const lines = Object.entries(sd)
                .map(([k, v]) => `• ${k}: ${v}`)
                .join("\n");
              addParagraph(doc, ny, lines, 10, theme);
            }
          }

          // Packing
          if (product.packingDetails) {
            let { y: ny, pageNum: np } = newContentPage(doc, pageNum, theme);
            pageNum = np;
            ny = addSectionHeading(doc, ny, lang.packing_details, theme);
            addParagraph(doc, ny, product.packingDetails, 10, theme);
          }
        }
      }

      // QR Code on last page
      const qrUrl = `${CONFIG.FRONTEND_URL || "https://stondia.com"}/products/${category.slug}`;
      const qrData = await generateQRDataURL(qrUrl, theme);
      if (qrData) {
        try {
          doc.image(qrData, PAGE_WIDTH / 2 - 40, PAGE_HEIGHT - 140, { width: 80, height: 80 });
          doc.save();
          doc.fontSize(7).fillColor(theme.textLight).font("Helvetica");
          doc.text(lang.scan_to_view, PAGE_WIDTH / 2 - 35, PAGE_HEIGHT - 55, {
            width: 80,
            align: "center",
          });
          doc.restore();
        } catch {
          /* skip */
        }
      }
      addFooter(doc, pageNum + 1, theme);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/* ================================================================== */
/*  PRODUCT CATALOG (single product) — PROFESSIONAL BRANDED PDF        */
/*  Structure: Cover → Company Intro → Product Details → Specs →      */
/*  Available Options → Applications → Gallery → Technical Data →     */
/*  Packing → QR Code → Contact                                       */
/* ================================================================== */
export async function generateProductCatalog(
  productId: string,
  options?: {
    theme?: string;
    language?: string;
    templateId?: string;
  },
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const theme = getTheme(options?.theme);
      const lang = getLang(options?.language);

      // Fetch product with category + structured images
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      });
      if (!product) throw new Error("Product not found");

      // Fetch structured images for gallery & application sections
      const structuredImages = await prisma.structuredImage.findMany({
        where: { productId: product.id },
        orderBy: { sortOrder: "asc" },
      });

      const galleryImages = structuredImages
        .filter((i) => i.imageType === "gallery")
        .map((i) => i.url);
      const applicationImages = structuredImages
        .filter((i) => i.imageType === "application")
        .map((i) => i.url);

      // Merge structured images into the main images array for legacy fallback
      const allImages = [
        ...(product.mainImage ? [product.mainImage] : []),
        ...(product.images || []),
        ...galleryImages,
        ...applicationImages,
      ];
      // Deduplicate
      const uniqueImages = [...new Set(allImages)];

      // Fetch settings for company info
      const settingsArr = await prisma.setting.findMany();
      const settings: Record<string, string> = {};
      settingsArr.forEach((s) => {
        settings[s.key] = s.value;
      });

      const companyName = settings.site_name || "STONDIA";
      const companyTagline = settings.site_description || "Premium Natural Sandstone from Rajasthan, India";
      const contactEmail = settings.contact_email || "exports@stondia.com";
      const contactPhone = settings.contact_phone || "+91 98290 00000";
      const siteUrl = CONFIG.FRONTEND_URL || "https://stondia.com";
      const address = settings.address || "Jodhpur, Rajasthan, India";
      const socialFacebook = settings.social_facebook || "";
      const socialInstagram = settings.social_instagram || "";
      const socialLinkedin = settings.social_linkedin || "";
      const socialYoutube = settings.social_youtube || "";

      const doc = new PDFDocument({
        size: "A4",
        margin: MARGIN,
        info: { Title: `${product.name} — ${companyName}`, Author: companyName },
      });

      const buffers: Buffer[] = [];
      doc.on("data", (c: Buffer) => buffers.push(c));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      let pageNum = 0;

      /* ══════════════════════════════════════════════════════════════ */
      /*  PAGE 1 — COVER PAGE                                         */
      /* ══════════════════════════════════════════════════════════════ */
      {
        // Full-bleed dark header
        doc.save();
        doc.rect(0, 0, PAGE_WIDTH, 320).fill(theme.primary);
        doc.restore();

        // Gold accent bar
        doc.save();
        doc.rect(0, 320, PAGE_WIDTH, 5).fill(theme.accent);
        doc.restore();

        // Company name 
        doc.save();
        doc.fontSize(32).fillColor("#FFFFFF").font("Helvetica-Bold");
        doc.text(companyName, MARGIN, 60, { width: CONTENT_WIDTH });
        doc.fontSize(8).fillColor("#FFFFFF").font("Helvetica");
        doc.text("PREMIUM NATURAL SANDSTONE", MARGIN, 150, {
          width: CONTENT_WIDTH,
          characterSpacing: 3,
        });
        doc.restore();

        // Cover image
        const coverSrc = product.mainImage || product.images?.[0] || "";
        if (coverSrc) {
          try {
            doc.image(coverSrc, 50, 220, {
              width: CONTENT_WIDTH,
              height: 240,
              fit: [CONTENT_WIDTH, 240],
              align: "center",
              valign: "center",
            });
          } catch {
            /* skip */
          }
        }

        const titleY = coverSrc ? 510 : 370;

        // Product name centered
        doc.save();
        doc.fontSize(26).fillColor(theme.primary).font("Helvetica-Bold");
        doc.text(product.name, MARGIN, titleY, {
          width: CONTENT_WIDTH,
          align: "center",
        });
        doc.restore();

        // Accent divider
        doc.save();
        doc.rect(PAGE_WIDTH / 2 - 30, titleY + 44, 60, 2.5).fill(theme.accent);
        doc.restore();

        // Category & product code subtitle
        const subtitleText = product.category?.name
          ? `${product.category.name}${product.productCode ? `  ·  ${lang.product_code}: ${product.productCode}` : ""}`
          : product.productCode
            ? `${lang.product_code}: ${product.productCode}`
            : "";
        if (subtitleText) {
          doc.save();
          doc.fontSize(11).fillColor(theme.text).font("Helvetica");
          doc.text(subtitleText, MARGIN, titleY + 58, {
            width: CONTENT_WIDTH,
            align: "center",
          });
          doc.restore();
        }

        // Tagline at bottom
        doc.save();
        doc.fontSize(9).fillColor(theme.textLight).font("Helvetica");
        doc.text(lang.timeless_stone, MARGIN, PAGE_HEIGHT - 70, {
          width: CONTENT_WIDTH,
          align: "center",
        });
        doc.restore();

        // Bottom accent
        doc.save();
        doc.rect(0, PAGE_HEIGHT - 4, PAGE_WIDTH, 4).fill(theme.accent);
        doc.restore();
      }

      /* ══════════════════════════════════════════════════════════════ */
      /*  PAGE 2 — COMPANY INTRODUCTION                               */
      /* ══════════════════════════════════════════════════════════════ */
      {
        let { y, pageNum: pn } = newContentPage(doc, pageNum, theme);
        pageNum = pn;

        // Section heading
        y = addSectionHeading(doc, y, lang.company_intro, theme);

        // Company name large
        doc.save();
        doc.fontSize(22).fillColor(theme.primary).font("Helvetica-Bold");
        doc.text(companyName, MARGIN, y, { width: CONTENT_WIDTH });
        y += 32;
        doc.restore();

        // Tagline
        doc.save();
        doc.fontSize(10).fillColor(theme.accent).font("Helvetica");
        doc.text(companyTagline, MARGIN, y, { width: CONTENT_WIDTH });
        y += 22;
        doc.restore();

        // Divider
        doc.save();
        doc.rect(MARGIN, y, CONTENT_WIDTH, 0.5).fill(theme.border);
        y += 14;
        doc.restore();

        // About content
        y = addParagraph(
          doc,
          y,
          `${companyName} is a premier manufacturer and exporter of premium natural sandstone from the heart of Rajasthan, India. With decades of expertise in quarrying, processing, and finishing natural stone, we serve architects, builders, and dealers across 35+ countries worldwide.`,
          10,
          theme,
        );

        y += 4;
        y = addSectionHeading(doc, y, lang.our_vision, theme);
        y = addParagraph(
          doc,
          y,
          "To be the global benchmark for Indian natural stone — recognized for uncompromising quality, sustainable quarrying practices, and exceptional customer partnerships.",
          10,
          theme,
        );

        y += 4;
        y = addSectionHeading(doc, y, lang.our_mission, theme);
        y = addParagraph(
          doc,
          y,
          "\u2022 Deliver consistent quality across every shipment\n\u2022 Innovate in stone processing and finishing techniques\n\u2022 Practice responsible quarrying with environmental stewardship\n\u2022 Build lasting relationships with architects and builders worldwide",
          10,
          theme,
        );

        // Infrastructure highlight box
        y += 8;
        if (y > PAGE_HEIGHT - 120) {
          ({ y, pageNum } = newContentPage(doc, pageNum, theme));
        }
        doc.save();
        doc.rect(MARGIN, y, CONTENT_WIDTH, 85).fill(theme.highlight);
        doc.restore();
        y += 10;
        doc.save();
        doc.fontSize(10).fillColor(theme.primary).font("Helvetica-Bold");
        doc.text(lang.infrastructure, MARGIN + 10, y);
        y += 16;
        doc.fontSize(9).fillColor(theme.text).font("Helvetica");
        doc.text(
          "\u2022 100,000+ sq ft modern manufacturing facility in Jodhpur\n\u2022 Multiple quarry sites with abundant sandstone reserves\n\u2022 Advanced gang-saw cutting lines and CNC routers\n\u2022 In-house quality control laboratory",
          MARGIN + 10,
          y,
          { width: CONTENT_WIDTH - 20 },
        );
        y += 70;
        doc.restore();
      }

      /* ══════════════════════════════════════════════════════════════ */
      /*  PAGE 3 — PRODUCT DETAILS                                    */
      /* ══════════════════════════════════════════════════════════════ */
      {
        let { y, pageNum: pn } = newContentPage(doc, pageNum, theme);
        pageNum = pn;

        y = addSectionHeading(doc, y, lang.product_details, theme);

        // Product hero image
        const heroSrc = product.mainImage || product.images?.[0] || "";
        if (heroSrc) {
          try {
            doc.image(heroSrc, MARGIN, y, {
              width: CONTENT_WIDTH,
              height: 200,
              fit: [CONTENT_WIDTH, 200],
              align: "center",
              valign: "center",
            });
            y += 212;
          } catch {
            /* skip */
          }
        }

        // Product name
        doc.save();
        doc.fontSize(20).fillColor(theme.primary).font("Helvetica-Bold");
        doc.text(product.name, MARGIN, y, { width: CONTENT_WIDTH });
        y += 28;
        doc.restore();

        // Product code badge
        if (product.productCode) {
          doc.save();
          doc.fontSize(9).fillColor(theme.accent).font("Helvetica-Bold");
          doc.text(`${lang.product_code}: ${product.productCode}`, MARGIN, y);
          y += 16;
          doc.restore();
        }

        // Category badge
        if (product.category?.name) {
          doc.save();
          doc.fontSize(9).fillColor(theme.textLight).font("Helvetica");
          doc.text(`Category: ${product.category.name}`, MARGIN, y);
          y += 16;
          doc.restore();
        }

        // Accent divider
        doc.save();
        doc.rect(MARGIN, y, 50, 2).fill(theme.accent);
        y += 14;
        doc.restore();

        // Description
        if (product.description) {
          y = addParagraph(doc, y, product.description, 10, theme);
        }

        // Stock status
        if (product.stock) {
          const stockColor = product.stock === "In Stock" ? "#2E7D32" : product.stock === "Made to Order" ? theme.accent : theme.textLight;
          doc.save();
          doc.fontSize(9).fillColor(stockColor).font("Helvetica");
          doc.text(`Status: ${product.stock}`, MARGIN, y);
          y += 14;
          doc.restore();
        }
      }

      /* ══════════════════════════════════════════════════════════════ */
      /*  PAGE 4 — SPECIFICATIONS & AVAILABLE OPTIONS                  */
      /* ══════════════════════════════════════════════════════════════ */
      {
        let { y, pageNum: pn } = newContentPage(doc, pageNum, theme);
        pageNum = pn;

        y = addSectionHeading(doc, y, lang.specifications, theme);

        // Build spec table as styled text blocks
        const specRows: { label: string; value: string }[] = [];
        if (product.size) specRows.push({ label: lang.available_sizes, value: product.size });
        if (product.thickness) specRows.push({ label: lang.available_thickness, value: product.thickness });
        if (product.finish) specRows.push({ label: lang.available_finish, value: product.finish });
        if (product.origin) specRows.push({ label: "Origin", value: product.origin });

        if (specRows.length > 0) {
          const rowHeight = 22;
          const tableTop = y;

          // Draw table header
          doc.save();
          doc.rect(MARGIN, tableTop, CONTENT_WIDTH, 20).fill(theme.primary);
          doc.fontSize(9).fillColor("#FFFFFF").font("Helvetica-Bold");
          doc.text("Parameter", MARGIN + 8, tableTop + 5, { width: CONTENT_WIDTH * 0.35 });
          doc.text("Specification", MARGIN + CONTENT_WIDTH * 0.35 + 8, tableTop + 5, {
            width: CONTENT_WIDTH * 0.6,
          });
          doc.restore();

          y = tableTop + 22;

          for (let i = 0; i < specRows.length; i++) {
            const bg = i % 2 === 0 ? theme.highlight : "#FFFFFF";
            doc.save();
            doc.rect(MARGIN, y, CONTENT_WIDTH, rowHeight).fill(bg);
            doc.fontSize(9).fillColor(theme.text).font("Helvetica-Bold");
            doc.text(specRows[i].label, MARGIN + 8, y + 5, { width: CONTENT_WIDTH * 0.35 });
            doc.font("Helvetica");
            doc.text(specRows[i].value, MARGIN + CONTENT_WIDTH * 0.35 + 8, y + 5, {
              width: CONTENT_WIDTH * 0.6,
            });
            doc.restore();
            y += rowHeight;
          }

          y += 12;
        } else {
          y = addParagraph(
            doc,
            y,
            "Contact us for detailed specifications, available sizes, thickness, and finish options.",
            10,
            theme,
          );
        }

        // Raw material / origin info
        if (product.origin) {
          y += 4;
          y = addSectionHeading(doc, y, "Material Information", theme);
          y = addParagraph(
            doc,
            y,
            `This product is sourced from our quarries in ${product.origin}, India, known for high-quality sandstone with consistent color and texture.`,
            10,
            theme,
          );
        }
      }

      /* ══════════════════════════════════════════════════════════════ */
      /*  PAGE 5 — APPLICATIONS (with application images)              */
      /* ══════════════════════════════════════════════════════════════ */
      if (product.applications || applicationImages.length > 0) {
        let { y, pageNum: pn } = newContentPage(doc, pageNum, theme);
        pageNum = pn;

        y = addSectionHeading(doc, y, lang.applications, theme);

        if (product.applications) {
          y = addParagraph(doc, y, product.applications, 10, theme);
        }

        // Application images in a 2-column grid
        if (applicationImages.length > 0) {
          y += 6;
          for (let i = 0; i < Math.min(applicationImages.length, 4); i++) {
            try {
              const col = i % 2;
              const row = Math.floor(i / 2);
              const ix = MARGIN + col * (CONTENT_WIDTH / 2 + 6);
              const iy = y + row * 140;

              // Image card background
              doc.save();
              doc.rect(ix - 2, iy - 2, CONTENT_WIDTH / 2 + 4, 130).fill(theme.highlight);
              doc.restore();

              doc.image(applicationImages[i], ix, iy, {
                width: CONTENT_WIDTH / 2,
                height: 126,
                fit: [CONTENT_WIDTH / 2, 126],
                align: "center",
                valign: "center",
              });
            } catch {
              /* skip */
            }
          }
        }
      }

      /* ══════════════════════════════════════════════════════════════ */
      /*  PAGE 6 — GALLERY (with structured images)                   */
      /* ══════════════════════════════════════════════════════════════ */
      const gallerySrcs = uniqueImages.slice(1, 7); // Skip main image, take next 6
      if (gallerySrcs.length > 0) {
        let { y, pageNum: pn } = newContentPage(doc, pageNum, theme);
        pageNum = pn;

        y = addSectionHeading(doc, y, lang.product_gallery, theme);

        // 2-column grid gallery
        y += 4;
        for (let i = 0; i < gallerySrcs.length; i++) {
          try {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const ix = MARGIN + col * (CONTENT_WIDTH / 2 + 6);
            const iy = y + row * 200;

            // Card background
            doc.save();
            doc.rect(ix - 2, iy - 2, CONTENT_WIDTH / 2 + 4, 190).fill(theme.footerBg);
            doc.restore();

            doc.image(gallerySrcs[i], ix, iy, {
              width: CONTENT_WIDTH / 2,
              height: 186,
              fit: [CONTENT_WIDTH / 2, 186],
              align: "center",
              valign: "center",
            });
          } catch {
            /* skip */
          }
        }
      }

      /* ══════════════════════════════════════════════════════════════ */
      /*  PAGE 7 — TECHNICAL DATA                                     */
      /* ══════════════════════════════════════════════════════════════ */
      {
        let { y, pageNum: pn } = newContentPage(doc, pageNum, theme);
        pageNum = pn;

        y = addSectionHeading(doc, y, lang.technical_specifications, theme);

        const specs = product.specs as Record<string, any> | null;
        const defaultSpecs: Record<string, string> = {
          "Density": "2,400 – 2,600 kg/m³",
          "Water Absorption": "< 3%",
          "Hardness": "6–7 Mohs Scale",
          "Compressive Strength": "80–120 MPa",
          "Flexural Strength": "8–15 MPa",
          "Abrasion Resistance": "High",
          "Weather Resistance": "Excellent",
          "Slip Resistance": "R11 — R13",
        };

        const specData = specs && Object.keys(specs).length > 0 ? specs : defaultSpecs;

        // Technical data table
        const rowHeight = 22;
        const tableTop = y;

        // Header
        doc.save();
        doc.rect(MARGIN, tableTop, CONTENT_WIDTH, 22).fill(theme.primary);
        doc.fontSize(9).fillColor("#FFFFFF").font("Helvetica-Bold");
        doc.text("Property", MARGIN + 8, tableTop + 6, { width: CONTENT_WIDTH * 0.45 });
        doc.text("Value / Specification", MARGIN + CONTENT_WIDTH * 0.45 + 8, tableTop + 6, {
          width: CONTENT_WIDTH * 0.5,
        });
        doc.restore();

        y = tableTop + 24;

        const entries = Object.entries(specData);
        for (let i = 0; i < entries.length; i++) {
          const [key, value] = entries[i];
          const bg = i % 2 === 0 ? theme.highlight : "#FFFFFF";

          if (y + rowHeight > PAGE_HEIGHT - 60) {
            ({ y, pageNum } = newContentPage(doc, pageNum, theme));
          }

          doc.save();
          doc.rect(MARGIN, y, CONTENT_WIDTH, rowHeight).fill(bg);
          doc.fontSize(9).fillColor(theme.text).font("Helvetica-Bold");
          doc.text(key, MARGIN + 8, y + 5, { width: CONTENT_WIDTH * 0.45 });
          doc.font("Helvetica");
          doc.text(String(value), MARGIN + CONTENT_WIDTH * 0.45 + 8, y + 5, {
            width: CONTENT_WIDTH * 0.5,
          });
          doc.restore();
          y += rowHeight;
        }

        // Compliance note
        y += 10;
        doc.save();
        doc.rect(MARGIN, y, CONTENT_WIDTH, 30).fill(theme.highlight);
        doc.fontSize(8).fillColor(theme.text).font("Helvetica");
        doc.text(
          "All technical specifications are indicative and may vary slightly between batches.\nTest certificates available on request.",
          MARGIN + 6,
          y + 5,
          { width: CONTENT_WIDTH - 12 },
        );
        doc.restore();
      }

      /* ══════════════════════════════════════════════════════════════ */
      /*  PAGE 8 — PACKING                                            */
      /* ══════════════════════════════════════════════════════════════ */
      {
        let { y, pageNum: pn } = newContentPage(doc, pageNum, theme);
        pageNum = pn;

        y = addSectionHeading(doc, y, lang.packing_details, theme);

        const packingText =
          product.packingDetails ||
          [
            "\u2022 Export-grade wooden crates with steel strapping",
            "\u2022 Protective foam interlayers between stone slabs",
            "\u2022 Shrink-wrapped bundles for moisture protection",
            "\u2022 Corner protectors and edge guards",
            "\u2022 Custom packing solutions available on request",
          ].join("\n");

        y = addParagraph(doc, y, packingText, 10, theme);

        y += 12;
        y = addSectionHeading(doc, y, lang.container_capacity, theme);

        // Container specs in a small table
        const containerRows = [
          { type: "20ft Container", capacity: "Approx. 22–26 tons" },
          { type: "40ft Container", capacity: "Approx. 26–28 tons" },
          { type: "FCL / LCL", capacity: "Full or shared container available" },
        ];

        const cRowH = 20;
        for (let i = 0; i < containerRows.length; i++) {
          const bg = i % 2 === 0 ? theme.highlight : "#FFFFFF";
          doc.save();
          doc.rect(MARGIN, y, CONTENT_WIDTH, cRowH).fill(bg);
          doc.fontSize(9).fillColor(theme.text).font("Helvetica-Bold");
          doc.text(containerRows[i].type, MARGIN + 8, y + 5, { width: CONTENT_WIDTH * 0.35 });
          doc.font("Helvetica");
          doc.text(containerRows[i].capacity, MARGIN + CONTENT_WIDTH * 0.35 + 8, y + 5, {
            width: CONTENT_WIDTH * 0.6,
          });
          doc.restore();
          y += cRowH;
        }

        y += 8;
        y = addSectionHeading(doc, y, lang.shipping, theme);
        y = addParagraph(
          doc,
          y,
          "We ship worldwide via major ports:\n\u2022 Mundra Port (Gujarat, India)\n\u2022 Nhava Sheva (Mumbai, India)\n\u2022 Jebel Ali (Dubai) for Middle East consolidation\n\nLead time: 2–4 weeks depending on order volume and finish.",
          10,
          theme,
        );
      }

      /* ══════════════════════════════════════════════════════════════ */
      /*  PAGE 9 — QR CODE & CONTACT                                  */
      /* ══════════════════════════════════════════════════════════════ */
      {
        let { y, pageNum: pn } = newContentPage(doc, pageNum, theme);
        pageNum = pn;

        y = addSectionHeading(doc, y, lang.contact_us, theme);

        // Left column: contact info
        const contactX = MARGIN;
        doc.save();
        doc.fontSize(14).fillColor(theme.primary).font("Helvetica-Bold");
        doc.text(companyName, contactX, y, { width: CONTENT_WIDTH * 0.55 });
        y += 22;

        doc.fontSize(10).fillColor(theme.text).font("Helvetica");
        const contactLines = [
          address,
          "",
          `${lang.contact_phone}: ${contactPhone}`,
          `${lang.contact_email}: ${contactEmail}`,
          `${lang.website}: ${siteUrl}`,
          "",
          `${lang.product_page}: ${siteUrl}/product/${product.slug}`,
        ];
        doc.text(contactLines.join("\n"), contactX, y, {
          width: CONTENT_WIDTH * 0.55,
          lineGap: 3,
        });
        doc.restore();

        // Social links
        const socialLinks = [socialFacebook, socialInstagram, socialLinkedin, socialYoutube].filter(
          Boolean,
        );
        if (socialLinks.length > 0) {
          const socialY = y + 140;
          doc.save();
          doc.fontSize(9).fillColor(theme.primary).font("Helvetica-Bold");
          doc.text(`${lang.follow_us}:`, contactX, socialY);
          doc.fontSize(8).fillColor(theme.textLight).font("Helvetica");
          let sy = socialY + 16;
          const socialLabels = ["Facebook", "Instagram", "LinkedIn", "YouTube"];
          for (let i = 0; i < socialLinks.length; i++) {
            if (socialLinks[i]) {
              doc.text(`${socialLabels[i]}: ${socialLinks[i]}`, contactX, sy, {
                width: CONTENT_WIDTH * 0.55,
              });
              sy += 14;
            }
          }
          doc.restore();
        }

        // Right column: QR Code
        const qrX = MARGIN + CONTENT_WIDTH * 0.55 + 20;
        const qrY = MARGIN + 40;
        const productUrl = `${siteUrl}/product/${product.slug}`;

        const qrData = await generateQRDataURL(productUrl, theme);
        if (qrData) {
          try {
            // QR card background
            doc.save();
            doc.rect(qrX - 10, qrY - 10, 140, 170).fill(theme.highlight);
            doc.restore();

            doc.image(qrData, qrX, qrY, { width: 120, height: 120 });
            doc.save();
            doc.fontSize(7).fillColor(theme.text).font("Helvetica");
            doc.text(lang.scan_to_view_product, qrX, qrY + 125, {
              width: 120,
              align: "center",
            });
            doc.restore();
          } catch {
            /* skip */
          }
        }

        // Bottom branding strip
        doc.save();
        doc.rect(MARGIN, PAGE_HEIGHT - 60, CONTENT_WIDTH, 0.5).fill(theme.accent);
        doc.fontSize(7).fillColor(theme.textLight).font("Helvetica");
        doc.text(
          `${companyName}  ·  ${address}  ·  ${lang.contact_phone}: ${contactPhone}  ·  ${lang.contact_email}: ${contactEmail}`,
          MARGIN,
          PAGE_HEIGHT - 52,
          { width: CONTENT_WIDTH, align: "center" },
        );
        doc.restore();
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
export type CatalogGenerationOptions = {
  theme?: string;
  language?: string;
  templateId?: string;
};

export async function generateAndSaveCatalog(
  type: "master" | "category" | "product",
  referenceId?: string,
  options?: CatalogGenerationOptions,
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
    buffer = await generateMasterCatalog(options);
    title = "STONDIA – Company Profile";
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
    buffer = await generateCategoryCatalog(referenceId, options);
    title = `${cat.name} Catalog`;
    slug = `${cat.slug}-catalog`;
    description = `Complete product catalog for ${cat.name}`;
    coverImage = cat.image || undefined;
    categoryId = cat.id;
  } else if (type === "product" && referenceId) {
    const prod = await prisma.product.findUnique({ where: { id: referenceId } });
    if (!prod) throw new Error("Product not found");
    buffer = await generateProductCatalog(referenceId, options);
    title = `${prod.name} – Product Specification`;
    slug = `${prod.slug}-catalog`;
    description = `Technical specification and product details for ${prod.name}`;
    coverImage = prod.images?.[0] || undefined;
    productId = prod.id;
  } else {
    throw new Error("Invalid catalog generation parameters");
  }

  // Store theme and language in metadata if provided
  const metadata = options?.theme || options?.language
    ? {
        theme: options?.theme || "premium",
        language: options?.language || "en",
        templateId: options?.templateId || null,
      }
    : undefined;

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
    const updateData: Record<string, unknown> = {
      pdfUrl,
      fileSize,
      version: nextVersion,
      status: "draft",
      updatedAt: new Date(),
    };
    if (metadata) updateData.metadata = metadata;
    if (options?.templateId) updateData.templateId = options.templateId;
    const updated = await prisma.generatedCatalog.update({
      where: { id: existing.id },
      data: updateData as any,
    });
    return { pdfUrl, catalogId: updated.id, version: nextVersion };
  }

  const createData: Record<string, unknown> = {
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
  };
  if (metadata) createData.metadata = metadata;
  if (options?.templateId) createData.templateId = options.templateId;

  const created = await prisma.generatedCatalog.create({
    data: createData as any,
  });
  return { pdfUrl, catalogId: created.id, version: nextVersion };
}
