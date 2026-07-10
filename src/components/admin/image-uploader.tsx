/* ------------------------------------------------------------------ */
/*  ImageUploader — drag & drop file upload with preview, compression, */
/*  upload progress, and Supabase Storage integration                  */
/* ------------------------------------------------------------------ */
import { useState, useRef, useCallback, type DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { compressImage, uploadFile, deleteFile, validateUploadFile } from "@/lib/storage-utils";

type UploadState = "idle" | "compressing" | "uploading" | "done" | "error";

export type ImageUploaderProps = {
  /** Current image URL value */
  value?: string;
  /** Called when a new URL is available after upload */
  onChange: (url: string) => void;
  /** Storage folder under stone-india-assets bucket */
  folder?: string;
  /** Optional label */
  label?: string;
  /** Optional description */
  description?: string;
  /** Whether this is required */
  required?: boolean;
  /** Called when the image is removed/cleared */
  onClear?: () => void;
};

export function ImageUploader({
  value,
  onChange,
  folder = "products",
  label = "Upload File",
  description = "Images, PDFs, or videos up to 500 MB",
  required,
  onClear,
}: ImageUploaderProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setState("idle");
    setProgress(0);
    setErrorMsg("");
    setPreview(null);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      // Validate
      const validationError = validateUploadFile(file);
      if (validationError) {
        setErrorMsg(validationError);
        setState("error");
        return;
      }

      setFileName(file.name);
      setErrorMsg("");

      // Preview for images
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }

      // Compress images (not PDFs or videos)
      let uploadFileBlob: Blob | File = file;
      if (file.type.startsWith("video/")) {
        // Skip compression for videos — go straight to upload
        setState("uploading");
      } else if (file.type.startsWith("image/")) {
        setState("compressing");
        // Small delay for animation
        await new Promise((r) => setTimeout(r, 200));
        try {
          uploadFileBlob = await compressImage(file);
        } catch {
          // If compression fails, upload original
          uploadFileBlob = file;
        }
      }

      // Upload
      setState("uploading");
      setProgress(0);

      try {
        // Convert blob to File for the XHR upload
        const finalFile =
          uploadFileBlob instanceof File
            ? uploadFileBlob
            : new File([uploadFileBlob], file.name, { type: uploadFileBlob.type || file.type });

        const result = await uploadFile(finalFile, {
          folder,
          onProgress: (pct) => setProgress(pct),
        });

        setProgress(100);
        onChange(result.url);
        setState("done");
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Upload failed");
        setState("error");
      }
    },
    [folder, onChange],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) handleFile(files[0]);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) handleFile(files[0]);
    },
    [handleFile],
  );

  const handleRemove = useCallback(() => {
    // Delete the old file from Supabase Storage
    if (value) {
      deleteFile(value).catch(() => {}); // fire-and-forget
    }
    reset();
    onChange("");
    onClear?.();
  }, [reset, onChange, onClear, value]);

  // If we already have a URL, show the uploaded image
  if (value && state === "idle") {
    const isPdf = value.endsWith(".pdf");
    return (
      <div className="space-y-2">
        {label && (
          <p className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </p>
        )}
        <div className="group relative overflow-hidden rounded-lg border border-border/60 bg-card">
          {isPdf ? (
            <div className="flex h-32 items-center justify-center gap-3 bg-muted/20">
              <FileText className="h-8 w-8 text-gold" />
              <div>
                <p className="text-sm font-medium text-foreground">File uploaded</p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {value.split("/").pop()}
                </p>
              </div>
            </div>
          ) : (
            <img src={value} alt="Uploaded" className="h-32 w-full object-cover" />
          )}
          <button
            onClick={handleRemove}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
            title="Remove"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </p>
      )}

      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !state.includes("ing") && inputRef.current?.click()}
        className={`relative cursor-pointer overflow-hidden rounded-lg border-2 border-dashed p-6 transition-all ${
          dragOver
            ? "border-gold bg-gold/5"
            : state === "error"
              ? "border-destructive/50 bg-destructive/5"
              : state === "done"
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-border/60 hover:border-gold/40 hover:bg-muted/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.avif,.pdf,.mp4,.mov,.webm,.avi,.mkv"
          className="hidden"
          onChange={handleInputChange}
          disabled={state === "uploading" || state === "compressing"}
        />

        <div className="flex flex-col items-center justify-center gap-2 text-center">
          {state === "compressing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
              <p className="text-sm text-muted-foreground">Compressing image…</p>
            </motion.div>
          )}

          {state === "uploading" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-xs space-y-2"
            >
              <div className="flex items-center gap-2">
                {preview ? (
                  <img src={preview} alt="" className="h-8 w-8 rounded object-cover" />
                ) : (
                  <FileText className="h-8 w-8 text-gold" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {folder}/{fileName}
                  </p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-gold to-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-muted-foreground tabular-nums">Uploading… {progress}%</p>
            </motion.div>
          )}

          {state === "error" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-destructive font-medium">{errorMsg}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="text-xs text-gold hover:underline"
              >
                Try again
              </button>
            </motion.div>
          )}

          {state === "done" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <p className="text-sm font-medium text-foreground">Upload complete!</p>
              <p className="text-xs text-muted-foreground">{fileName}</p>
            </motion.div>
          )}

          {state === "idle" && (
            <>
              {preview ? (
                <img src={preview} alt="Preview" className="h-24 w-24 rounded-lg object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                  <Upload className="h-5 w-5 text-gold" />
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-gold">Click to upload</span> or drag and drop
                </p>
                <p className="text-[0.6rem] text-muted-foreground/60 mt-0.5">{description}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Multiple image uploader ── */
export type ImageUploaderMultipleProps = {
  values?: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
  maxFiles?: number;
};

export function ImageUploaderMultiple({
  values = [],
  onChange,
  folder = "products",
  label = "Upload Images",
  maxFiles = 10,
}: ImageUploaderMultipleProps) {
  const addUrl = useCallback(
    (url: string) => {
      if (values.length < maxFiles) {
        onChange([...values, url]);
      }
    },
    [values, onChange, maxFiles],
  );

  const removeUrl = useCallback(
    (index: number) => {
      onChange(values.filter((_, i) => i !== index));
    },
    [values, onChange],
  );

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-sm font-medium text-foreground">
          {label} ({values.length}/{maxFiles})
        </p>
      )}

      {values.length < maxFiles && (
        <ImageUploader
          value=""
          onChange={addUrl}
          onClear={() => {}}
          folder={folder}
          description={`Images, PDFs, or videos up to 500 MB (${maxFiles - values.length} slots left)`}
        />
      )}

      {/* Thumbnail grid */}
      {values.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
          {values.map((url, i) => (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-card"
            >
              {url.endsWith(".pdf") ? (
                <div className="flex h-full items-center justify-center bg-muted/20">
                  <FileText className="h-6 w-6 text-gold" />
                </div>
              ) : (
                <img src={url} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
              )}
              <button
                onClick={() => {
                  // Delete from storage
                  deleteFile(url).catch(() => {});
                  removeUrl(i);
                }}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                title="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
