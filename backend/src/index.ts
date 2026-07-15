import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { CONFIG } from "./config.js";
import { prisma } from "./db.js";
import { AppError, ValidationError } from "./lib/errors.js";

// ── Routes ──
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import projectRoutes from "./routes/projects.js";
import blogRoutes from "./routes/blogs.js";
import videoRoutes from "./routes/videos.js";
import downloadRoutes from "./routes/downloads.js";
import testimonialRoutes from "./routes/testimonials.js";
import contactRoutes from "./routes/contact.js";
import rfqRoutes from "./routes/rfq.js";
import subscriberRoutes from "./routes/subscribers.js";
import uploadRoutes from "./routes/upload.js";
import adminRoutes from "./routes/admin.js";
import searchRoutes from "./routes/search.js";
import settingsRoutes from "./routes/settings.js";
import usersRoutes from "./routes/users.js";
import catalogRoutes from "./routes/catalog.js";
import catalogGeneratorRoutes from "./routes/catalog-generator.js";
import mediaRoutes from "./routes/media.js";
import catalogTemplateRoutes from "./routes/catalog-templates.js";
import mediaFolderRoutes from "./routes/media-folders.js";
import qrCodeRoutes from "./routes/qr-codes.js";
import structuredImagesRoutes from "./routes/structured-images.js";
import productMediaRoutes from "./routes/product-media.js";
import { ensureBucket } from "./lib/supabase-storage.js";
import { ensureLocalUploadDir } from "./lib/upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// ── Security & Performance ──
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(
  cors({
    origin: CONFIG.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Rate Limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
});
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use(
  "/api/contact",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many messages. Please try again later." },
  }),
);
app.use("/api", limiter);

// ── Body Parsing ──
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Cookie Parser (lightweight) ──
app.use((req: Request, _res: Response, next: NextFunction) => {
  const cookies = req.headers.cookie;
  if (cookies) {
    req.cookies = Object.fromEntries(
      cookies.split("; ").map((c) => {
        const [key, ...val] = c.split("=");
        return [key, decodeURIComponent(val.join("="))];
      }),
    );
  } else {
    req.cookies = {};
  }
  next();
});

// ── Static Files — serve local uploads (used when Supabase Storage is unavailable) ──
const uploadsPath = path.join(process.cwd(), "uploads");
ensureLocalUploadDir(); // create uploads/ if it doesn't exist
app.use("/uploads", express.static(uploadsPath));

// ── API Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/rfq", rfqRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/catalog-generator", catalogGeneratorRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/catalog-templates", catalogTemplateRoutes);
app.use("/api/media/folders", mediaFolderRoutes);
app.use("/api/qr-codes", qrCodeRoutes);
app.use("/api/structured-images", structuredImagesRoutes);
app.use("/api/products", productMediaRoutes); // product media management (must be after product routes)
app.use("/api/users", usersRoutes);

// ── Health Check ──
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), environment: CONFIG.NODE_ENV });
});

// ── 404 Handler ──
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Global Error Handler ──
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err instanceof ValidationError ? { errors: (err as any).errors } : {}),
    });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  if (err.name === "MulterError" || (err as any).code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large. Maximum size is 10MB" });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    message: CONFIG.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// ── Start Server ──
async function start() {
  try {
    await prisma.$connect();
    console.log("✓ Database connected");

    // Initialize Supabase Storage bucket (will warn if not configured)
    await ensureBucket();
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      console.log("✓ Supabase Storage ready");
    } else {
      console.log("ℹ Supabase Storage not configured — using local disk for uploads");
    }

    app.listen(CONFIG.PORT, () => {
      console.log(`✓ Server running on http://localhost:${CONFIG.PORT}`);
      console.log(`✓ Environment: ${CONFIG.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
