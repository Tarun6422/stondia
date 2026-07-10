/* ------------------------------------------------------------------ */
/*  Upload Routes — Supabase Storage backed                            */
/*  Express 5 compatible — no optional route params                    */
/* ------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { handleUpload, handleMultipleUploads, deleteFileByUrl, upload } from "../lib/upload.js";
import { validateFile, STORAGE_FOLDERS, type StorageFolder } from "../lib/supabase-storage.js";
import { AppError } from "../lib/errors.js";

const router = Router();

/* ── Validate folder param ── */
function resolveFolderParam(folder: string): StorageFolder | null {
  const f = folder.replace(/[^a-z]/g, "");
  if (STORAGE_FOLDERS.includes(f as StorageFolder)) return f as StorageFolder;
  return null;
}

/**
 * POST /api/upload — single file (default folder: uploads)
 */
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) throw new AppError("No file provided", 400);
    const validationError = validateFile(req.file.mimetype, req.file.size);
    if (validationError) throw new AppError(validationError, 400);
    const url = await handleUpload(req.file, "uploads");
    res.json({ url, filename: req.file.originalname, folder: "uploads" });
  },
);

/**
 * POST /api/upload/:folder — single file to specific folder
 */
router.post(
  "/:folder",
  authenticate,
  authorize("ADMIN"),
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) throw new AppError("No file provided", 400);
    const folder = resolveFolderParam(req.params.folder as string) || "uploads";
    const validationError = validateFile(req.file.mimetype, req.file.size);
    if (validationError) throw new AppError(validationError, 400);
    const url = await handleUpload(req.file, folder);
    res.json({ url, filename: req.file.originalname, folder });
  },
);

/**
 * POST /api/upload/multiple — multiple files (default folder: uploads)
 */
router.post(
  "/multiple",
  authenticate,
  authorize("ADMIN"),
  upload.array("files", 10),
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) throw new AppError("No files provided", 400);
    for (const f of files) {
      const err = validateFile(f.mimetype, f.size);
      if (err) throw new AppError(err, 400);
    }
    const urls = await handleMultipleUploads(files, "uploads");
    res.json({ urls, count: urls.length, folder: "uploads" });
  },
);

/**
 * POST /api/upload/multiple/:folder — multiple files to specific folder
 */
router.post(
  "/multiple/:folder",
  authenticate,
  authorize("ADMIN"),
  upload.array("files", 10),
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) throw new AppError("No files provided", 400);
    for (const f of files) {
      const err = validateFile(f.mimetype, f.size);
      if (err) throw new AppError(err, 400);
    }
    const folder = resolveFolderParam(req.params.folder as string) || "uploads";
    const urls = await handleMultipleUploads(files, folder);
    res.json({ urls, count: urls.length, folder });
  },
);

/**
 * POST /api/upload/public — public upload (no auth)
 */
router.post("/public", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) throw new AppError("No file provided", 400);
  const validationError = validateFile(req.file.mimetype, req.file.size);
  if (validationError) throw new AppError(validationError, 400);
  const url = await handleUpload(req.file, "uploads");
  res.json({ url, filename: req.file.originalname, folder: "uploads" });
});

/**
 * POST /api/upload/public/:folder — public upload to specific folder
 */
router.post("/public/:folder", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) throw new AppError("No file provided", 400);
  const validationError = validateFile(req.file.mimetype, req.file.size);
  if (validationError) throw new AppError(validationError, 400);
  const folder = resolveFolderParam(req.params.folder as string) || "uploads";
  const url = await handleUpload(req.file, folder);
  res.json({ url, filename: req.file.originalname, folder });
});

/**
 * DELETE /api/upload — admin delete a file by URL
 */
router.delete("/", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) throw new AppError("url is required", 400);
  await deleteFileByUrl(url);
  res.json({ message: "File deleted" });
});

/**
 * DELETE /api/upload/batch — admin batch delete files
 */
router.delete("/batch", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const { urls } = req.body;
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new AppError("urls array is required", 400);
  }
  await Promise.all(urls.map(deleteFileByUrl));
  res.json({ message: `${urls.length} file(s) deleted` });
});

export default router;
