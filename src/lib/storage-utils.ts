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
 * Validate a file before upload.
 * Returns error message or null if valid.
 */
export function validateUploadFile(
  file: File,
): string | null {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  const maxSize = 10 * 1024 * 1024; // 10 MB

  if (!allowedTypes.includes(file.type)) {
    return "Only JPG, PNG, WebP images and PDF files are allowed";
  }

  if (file.size > maxSize) {
    return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`;
  }

  return null;
}
