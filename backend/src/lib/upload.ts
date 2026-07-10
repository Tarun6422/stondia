/* ------------------------------------------------------------------ */
/*  Upload — Hybrid storage handler (Supabase + local disk fallback)    */
/*  When Supabase Storage is unavailable, saves files to local disk.    */
/* ------------------------------------------------------------------ */
import { Request } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  uploadFile as supabaseUploadFile,
  deleteFileByUrl as supabaseDeleteFileByUrl,
  deleteFilesByUrls as supabaseDeleteFilesByUrls,
  getStoragePath,
  validateFile,
  generateFilename,
  ensureBucket,
  getStorageUsage,
  formatStorageBytes,
  isSupabaseConfigured,
  type StorageFolder,
  STORAGE_FOLDERS,
} from "./supabase-storage.js";
import { CONFIG } from "../config.js";

/* ── Determine local upload directory ── */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_UPLOAD_DIR = path.resolve(__dirname, "..", "..", "uploads");

/* ── Ensure local upload directory and subfolders exist ── */
export function ensureLocalUploadDir(subfolder?: string): string {
  const target = subfolder
    ? path.join(LOCAL_UPLOAD_DIR, subfolder)
    : LOCAL_UPLOAD_DIR;
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  return target;
}

/* ── Check whether Supabase is actually usable ── */
function useSupabase(): boolean {
  return isSupabaseConfigured();
}

/* ── Build absolute URL for a local file ── */
function localFileUrl(folder: string, filename: string): string {
  const base = CONFIG.BACKEND_URL.replace(/\/+$/, "");
  return `${base}/uploads/${folder}/${filename}`;
}

/* ── Upload file to local disk ── */
async function localUploadFile(
  buffer: Buffer,
  folder: string,
  filename: string,
  _mime: string,
): Promise<string> {
  const dir = ensureLocalUploadDir(folder);
  const filePath = path.join(dir, filename);
  await fs.promises.writeFile(filePath, buffer);
  return localFileUrl(folder, filename);
}

/* ── Delete a local file by its URL ── */
async function localDeleteFile(publicUrl: string): Promise<void> {
  const base = CONFIG.BACKEND_URL.replace(/\/+$/, "");
  const prefix = `${base}/uploads/`;
  if (!publicUrl.startsWith(prefix)) return;
  const relativePath = publicUrl.slice(prefix.length);
  const filePath = path.join(LOCAL_UPLOAD_DIR, relativePath);
  try {
    await fs.promises.unlink(filePath);
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      console.warn(`[Local Storage] Delete warning: ${err.message}`);
    }
  }
}

/* ── Multer in-memory storage (files stay in RAM until written) ── */
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB (supports video uploads)
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "application/pdf",
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "video/x-msvideo",
      "video/x-matroska",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, PNG, WebP, AVIF images, PDF files, and MP4/MOV/WebM videos are allowed",
        ),
      );
    }
  },
});

/* ── Validate a subfolder exists in the allowed list ── */
function resolveFolder(folder?: string): StorageFolder {
  if (folder && STORAGE_FOLDERS.includes(folder as StorageFolder)) {
    return folder as StorageFolder;
  }
  return "uploads"; // default folder
}

/* ── Handle single file upload (Supabase → local fallback) ── */
export async function handleUpload(file: Express.Multer.File, folder?: string): Promise<string> {
  const storageFolder = resolveFolder(folder);
  const filename = generateFilename(file.originalname);

  if (useSupabase()) {
    try {
      const url = await supabaseUploadFile(file.buffer, storageFolder, filename, file.mimetype);
      return url;
    } catch (err) {
      console.warn("[Upload] Supabase upload failed, falling back to local storage:", err);
    }
  }

  // Fallback to local disk
  return localUploadFile(file.buffer, storageFolder, filename, file.mimetype);
}

/* ── Handle multiple file uploads ── */
export async function handleMultipleUploads(
  files: Express.Multer.File[],
  folder?: string,
): Promise<string[]> {
  return Promise.all(files.map((f) => handleUpload(f, folder)));
}

/* ── Delete a file by its public URL (handles both Supabase & local) ── */
export async function deleteFileByUrl(url: string): Promise<void> {
  if (!url) return;

  // Try Supabase first
  if (useSupabase() && getStoragePath(url)) {
    return supabaseDeleteFileByUrl(url);
  }

  // Fallback to local delete
  return localDeleteFile(url);
}

/* ── Batch delete files ── */
export async function deleteFilesByUrls(urls: string[]): Promise<void> {
  await Promise.all(urls.map(deleteFileByUrl));
}

/* ── Initialize bucket (call once on startup) ── */
export { ensureBucket };

/* ── Storage usage tracking ── */
export { getStorageUsage, formatStorageBytes };

/* ── Helper to extract filenames from uploaded arrays ── */
export function extractImageUrls(body: Record<string, any>): string[] {
  const urls: string[] = [];
  const images = body.images;
  if (Array.isArray(images)) {
    urls.push(...images.filter(Boolean));
  } else if (typeof images === "string" && images) {
    urls.push(images);
  }
  return urls;
}
