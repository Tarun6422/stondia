/* ------------------------------------------------------------------ */
/*  Supabase Storage — REST API client (zero npm deps)                */
/*  Uses fetch directly against the Supabase Storage REST API         */
/* ------------------------------------------------------------------ */
import { CONFIG } from "../config.js";

const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SERVICE_KEY = CONFIG.SUPABASE_SERVICE_KEY;
const BUCKET = CONFIG.SUPABASE_STORAGE_BUCKET;

/* ── Allowed storage folders ── */
export const STORAGE_FOLDERS = [
  "products",
  "projects",
  "blogs",
  "videos",
  "downloads",
  "testimonials",
  "avatars",
  "uploads", // public form uploads
  "catalogs", // generated PDF catalogs
  "categories", // category-specific images
  "gallery",   // gallery / lifestyle images
  "catalogues", // brochure / catalogue PDFs
  "banners",   // hero / banner images
  "logos",     // brand / partner logos
] as const;
export type StorageFolder = (typeof STORAGE_FOLDERS)[number];

/* ── Allowed MIME types ── */
const ALLOWED_MIMES = new Set([
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
]);

const MAX_SIZE = 500 * 1024 * 1024; // 500 MB

/* ── Check if Supabase Storage is configured and usable ── */
export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SERVICE_KEY);
}

/* ── Auth headers for service-role calls ── */
function headers(extra: Record<string, string> = {}): Record<string, string> {
  return {
    Authorization: `Bearer ${SERVICE_KEY}`,
    ...extra,
  };
}

/* ── Ensure bucket exists and is public (called once on startup) ── */
export async function ensureBucket(): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.warn(
      "[Supabase Storage] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY — storage disabled",
    );
    return;
  }

  try {
    // Check if bucket exists
    const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`, {
      headers: headers(),
    });

    if (!res.ok && res.status === 404) {
      // Create bucket
      const createRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
        method: "POST",
        headers: headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          id: BUCKET,
          name: BUCKET,
          public: true,
          file_size_limit: MAX_SIZE,
          allowed_mime_types: Array.from(ALLOWED_MIMES),
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        console.warn(`[Supabase Storage] Failed to create bucket: ${JSON.stringify(err)}`);
      } else {
        console.log(`[Supabase Storage] Bucket "${BUCKET}" created`);
      }
    } else if (res.ok) {
      // Ensure bucket is public
      await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`, {
        method: "PUT",
        headers: headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({ public: true }),
      });
      console.log(`[Supabase Storage] Bucket "${BUCKET}" ready`);
    }
  } catch (err) {
    console.error("[Supabase Storage] Error ensuring bucket:", err);
  }
}

/* ── Validate file ── */
export function validateFile(mime: string, size: number): string | null {
  if (!ALLOWED_MIMES.has(mime)) {
    return "Only JPG, PNG, WebP, AVIF images, PDF documents, and MP4/MOV/WebM videos are allowed";
  }
  if (size > MAX_SIZE) {
    const limitMB = MAX_SIZE / 1024 / 1024;
    return `File too large. Maximum size is ${limitMB} MB (got ${(size / 1024 / 1024).toFixed(1)} MB)`;
  }
  return null;
}

/* ── Generate a unique filename ── */
export function generateFilename(original: string): string {
  const ext = original.split(".").pop()?.toLowerCase() || "jpg";
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}.${ext}`;
}

/* ── Upload file to Supabase Storage ── */
export async function uploadFile(
  buffer: Buffer,
  folder: StorageFolder,
  filename: string,
  mime: string,
): Promise<string> {
  const path = `${folder}/${filename}`;

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: headers({
      "Content-Type": mime,
      "x-upsert": "true",
      "cache-control": "public, max-age=31536000",
    }),
    body: buffer,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Supabase upload failed: ${JSON.stringify(err)}`);
  }

  return getPublicUrl(path);
}

/* ── Get public URL from storage path ── */
export function getPublicUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

/* ── Extract storage path from a public URL ── */
export function getStoragePath(publicUrl: string): string | null {
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
  if (!publicUrl.startsWith(prefix)) return null;
  return publicUrl.slice(prefix.length);
}

/* ── Delete a file by its public URL ── */
export async function deleteFileByUrl(publicUrl: string): Promise<void> {
  const path = getStoragePath(publicUrl);
  if (!path) return; // not a supabase URL, skip

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "DELETE",
    headers: headers(),
  });

  if (!res.ok && res.status !== 404) {
    const err = await res.json().catch(() => ({}));
    console.warn(`[Supabase Storage] Delete warning: ${JSON.stringify(err)}`);
  }
}

/* ── Batch delete multiple files ── */
export async function deleteFilesByUrls(urls: string[]): Promise<void> {
  const paths = urls.map(getStoragePath).filter(Boolean) as string[];
  if (paths.length === 0) return;

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prefixes: paths }),
  });

  if (!res.ok && res.status !== 404) {
    const err = await res.json().catch(() => ({}));
    console.warn(`[Supabase Storage] Batch delete warning: ${JSON.stringify(err)}`);
  }
}

/* ── List files in a folder ── */
export async function listFiles(folder: string): Promise<string[]> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      prefix: folder,
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    }),
  });

  if (!res.ok) return [];
  const data = await res.json();
  return (data as any[]).map((item: any) => item.name || "");
}

/* ── Get total storage usage (bytes) across all catalog files ── */
export async function getStorageUsage(): Promise<number> {
  if (!SUPABASE_URL || !SERVICE_KEY) return 0;

  let totalBytes = 0;
  const folder = "downloads";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
      method: "POST",
      headers: headers({ "Content-Type": "application/json" }),
      signal: controller.signal,
      body: JSON.stringify({
        prefix: folder,
        limit: 1000,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      }),
    });

    clearTimeout(timeoutId);
    if (!res.ok) return 0;
    const data = await res.json();
    const files = Array.isArray(data) ? data : [];

    for (const file of files) {
      if (file.metadata?.size) {
        totalBytes += file.metadata.size;
      }
    }
  } catch (err) {
    console.warn("[Supabase Storage] Failed to calculate storage usage:", err);
  }

  return totalBytes;
}

/* ── Format bytes into human-readable string ── */
export function formatStorageBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
