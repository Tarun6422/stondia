/* ------------------------------------------------------------------ */
/*  Storage Utils — frontend file upload helper with progress          */
/*  Uploads directly to Supabase Storage via the backend proxy         */
/*  so the service role key stays server-side.                         */
/* ------------------------------------------------------------------ */

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export type UploadOptions = {
  /** Upload folder (products, projects, blogs, etc.) */
  folder?: string;
  /** Called with 0–100 progress percentage */
  onProgress?: (pct: number) => void;
};

export type UploadResult = {
  url: string;
  filename: string;
  folder: string;
};

/**
 * Upload a file to Supabase Storage via the backend proxy.
 * Tracks upload progress using XMLHttpRequest.
 * Set `public: true` for public-form uploads (no auth required).
 */
export function uploadFile(
  file: File,
  options: UploadOptions & { isPublic?: boolean } = {},
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const prefix = options.isPublic ? "/public" : "";
    const folderPath = options.folder ? `/${options.folder}` : "";
    const path = `${API_BASE}/api/upload${prefix}${folderPath}`;

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options.onProgress) {
        const pct = Math.round((event.loaded / event.total) * 100);
        options.onProgress(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch {
          reject(new Error("Invalid response from server"));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.message || "Upload failed"));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));

    xhr.open("POST", path);
    xhr.withCredentials = !options.isPublic;
    xhr.send(formData);
  });
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(url: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Delete failed");
  }
}

/**
 * Client-side image compression using Canvas API.
 * Compresses to JPEG at specified quality.
 */
export function compressImage(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {},
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const { maxWidth = 1920, maxHeight = 1920, quality = 0.82 } = options;

    // Only compress images (not PDFs)
    if (file.type === "application/pdf") {
      return resolve(file);
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Resize if needed
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not available"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Compression failed"));
        },
        file.type === "image/png" ? "image/png" : "image/jpeg",
        file.type === "image/png" ? 0.9 : quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = url;
  });
}

/**
 * Generate a SHA-256 hash of a file's contents using the browser's
 * SubtleCrypto API. Used for duplicate detection.
 */
export async function getFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate a small thumbnail from an image file using Canvas.
 * Returns a Blob suitable for upload.
 */
export function generateThumbnail(
  file: File,
  options: { size?: number; quality?: number } = {},
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const { size = 200, quality = 0.7 } = options;

    if (!file.type.startsWith("image/")) {
      return reject(new Error("Thumbnails only supported for images"));
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Fit within a square of `size` while maintaining aspect ratio
      if (width > height) {
        if (width > size) {
          height = Math.round(height * (size / width));
          width = size;
        }
      } else {
        if (height > size) {
          width = Math.round(width * (size / height));
          height = size;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not available"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Thumbnail generation failed"));
        },
        "image/webp",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for thumbnail generation"));
    };

    img.src = url;
  });
}

/**
 * Validate a file before upload.
 * Returns error message or null if valid.
 */
export function validateUploadFile(file: File): string | null {
  const allowedTypes = [
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
  const isVideo = file.type.startsWith("video/");
  const maxSize = isVideo ? 500 * 1024 * 1024 : 10 * 1024 * 1024; // 500 MB for video, 10 MB for others

  if (!allowedTypes.includes(file.type)) {
    return "Only JPG, PNG, WebP images, PDF documents, and MP4/MOV/WebM videos are allowed";
  }

  if (file.size > maxSize) {
    const sizeLimit = isVideo ? "500 MB" : "10 MB";
    return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${sizeLimit}.`;
  }

  return null;
}
