/* ------------------------------------------------------------------ */
/*  Upload — Supabase Storage based file upload handler                */
/*  Replaces local disk + Cloudinary with direct Supabase Storage      */
/* ------------------------------------------------------------------ */
import { Request } from "express";
import multer from "multer";
import path from "path";
import {
  uploadFile,
  deleteFileByUrl,
  deleteFilesByUrls,
  validateFile,
  generateFilename,
  ensureBucket,
  type StorageFolder,
  STORAGE_FOLDERS,
} from "./supabase-storage.js";

/* ── Multer in-memory storage (files stay in RAM, written to Supabase) ── */
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WebP images and PDF files are allowed"));
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

/* ── Handle single file upload ── */
export async function handleUpload(
  file: Express.Multer.File,
  folder?: string,
): Promise<string> {
  const storageFolder = resolveFolder(folder);
  const filename = generateFilename(file.originalname);

  const url = await uploadFile(
    file.buffer,
    storageFolder,
    filename,
    file.mimetype,
  );

  return url;
}

/* ── Handle multiple file uploads ── */
export async function handleMultipleUploads(
  files: Express.Multer.File[],
  folder?: string,
): Promise<string[]> {
  return Promise.all(files.map((f) => handleUpload(f, folder)));
}

/* ── Delete a file by its Supabase public URL ── */
export { deleteFileByUrl, deleteFilesByUrls };

/* ── Initialize bucket (call once on startup) ── */
export { ensureBucket };

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
