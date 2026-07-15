/* ------------------------------------------------------------------ */
/*  Media Library Module — WordPress-style media management            */
/*  Features: upload, grid, search, filter, preview, replace, delete, */
/*  bulk actions, usage tracking, copy URL, stats                     */
/* ------------------------------------------------------------------ */
import { useState, useCallback, useRef, type DragEvent, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Search,
  Image as ImageIcon,
  Video,
  FileText,
  Package,
  Layout,
  Pen,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Copy,
  Download,
  ExternalLink,
  Filter,
  Grid3X3,
  List,
  SortAsc,
  ChevronLeft,
  ChevronRight,
  Clock,
  HardDrive,
  Tags,
  Edit3,
  FolderOpen,
  FolderClosed,
  Plus,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  compressImage,
  uploadFile,
  deleteFile,
  validateUploadFile,
  getFileHash,
  generateThumbnail,
} from "@/lib/storage-utils";
import { CrudDialog } from "./crud-dialog";
import * as hooks from "./admin-hooks";
import { cn } from "@/lib/utils";

/* ── Types ── */
type ViewMode = "grid" | "list";
type SortMode = "newest" | "oldest" | "name" | "size";
type FilterType = "" | "image" | "video" | "pdf";

/* ── Format file size ── */
function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/* ── Get file icon based on mime type ── */
function FileIcon({ mimeType, className }: { mimeType: string; className?: string }) {
  if (mimeType.startsWith("image/"))
    return <ImageIcon className={cn("text-emerald-500", className)} />;
  if (mimeType.startsWith("video/")) return <Video className="text-blue-500" />;
  return <FileText className="text-amber-500" />;
}

/* ── Stats Bar ── */
function MediaStatsBar() {
  const { data, isLoading } = hooks.useMediaStats();

  if (isLoading)
    return (
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-card border border-border/60 animate-pulse" />
        ))}
      </div>
    );

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Files</p>
        <p className="mt-1 font-serif text-xl text-foreground">{data?.totalFiles ?? 0}</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Storage Used</p>
        <p className="mt-1 font-serif text-xl text-foreground">
          {data?.totalSizeFormatted || "0 B"}
        </p>
      </div>
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Images</p>
        <p className="mt-1 font-serif text-xl text-foreground">{data?.images ?? 0}</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Videos</p>
        <p className="mt-1 font-serif text-xl text-foreground">{data?.videos ?? 0}</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">PDFs</p>
        <p className="mt-1 font-serif text-xl text-foreground">{data?.pdfs ?? 0}</p>
      </div>
    </div>
  );
}

/* ── Quick upload folders ── */
const UPLOAD_FOLDERS = [
  { id: "products", label: "Products", icon: Package },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "videos", label: "Videos", icon: Video },
  { id: "catalogues", label: "Catalogues", icon: FileText },
  { id: "banners", label: "Banners", icon: Layout },
  { id: "logos", label: "Logos", icon: Pen },
] as const;

/* ── Upload Dropzone ── */
function MediaUploader({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [state, setState] = useState<"idle" | "uploading" | "error" | "duplicate">("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [uploadFolder, setUploadFolder] = useState<string>("uploads");
  const [existingMedia, setExistingMedia] = useState<hooks.MediaItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const createMedia = hooks.useCreateMedia();
  const checkDuplicate = hooks.useCheckDuplicateMedia();

  const handleFile = useCallback(
    async (file: File) => {
      const validationError = validateUploadFile(file);
      if (validationError) {
        setErrorMsg(validationError);
        setState("error");
        return;
      }

      setFileName(file.name);
      setErrorMsg("");
      setExistingMedia(null);

      // ── Step 1: Compute file hash for duplicate detection ──
      setState("uploading");
      setProgress(5);

      let fileHash: string | null = null;
      try {
        fileHash = await getFileHash(file);
      } catch {
        // Hash generation failed — continue without duplicate check
      }

      if (fileHash) {
        setProgress(10);
        try {
          const result = await checkDuplicate.mutateAsync(fileHash);
          const data = result as unknown as { exists: boolean; media: hooks.MediaItem | null };
          if (data.exists && data.media) {
            setExistingMedia(data.media);
            setState("duplicate");
            setErrorMsg(
              `This file already exists in the library as "${data.media.originalName}"`,
            );
            setProgress(0);
            return;
          }
        } catch {
          // Duplicate check failed — continue with upload
        }
      }

      setState("uploading");
      setProgress(15);

      try {
        // ── Step 2: Generate thumbnail for images ──
        let thumbnailUrl: string | null = null;
        let isGeneratingThumb = file.type.startsWith("image/");

        if (isGeneratingThumb) {
          try {
            const thumbBlob = await generateThumbnail(file, { size: 200, quality: 0.7 });
            const thumbFile = new File([thumbBlob], `thumb_${file.name}`, {
              type: "image/webp",
            });
            const thumbResult = await uploadFile(thumbFile, {
              folder: uploadFolder,
              onProgress: (pct) => setProgress(15 + Math.round(pct * 0.15)),
            });
            thumbnailUrl = thumbResult.url;
          } catch {
            // Thumbnail generation failed — continue without thumbnail
          }
        }

        // ── Step 3: Upload the original file ──
        const result = await uploadFile(file, {
          folder: uploadFolder,
          onProgress: (pct) => setProgress(30 + Math.round(pct * 0.65)),
        });

        setProgress(95);

        // ── Step 4: Register in media library ──
        await createMedia.mutateAsync({
          filename: result.filename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          url: result.url,
          folder: uploadFolder,
          hash: fileHash,
          tags: fileHash ? [`hash:${fileHash}`] : [],
        });

        setProgress(100);
        toast.success(`"${file.name}" uploaded to ${uploadFolder}`);
        onUploadComplete();
        setState("idle");
        setProgress(0);
        setFileName("");
        if (inputRef.current) inputRef.current.value = "";
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Upload failed");
        setState("error");
      }
    },
    [createMedia, checkDuplicate, onUploadComplete, uploadFolder],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile],
  );

  return (
    <div className="mb-6">
      {/* Folder selector */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Upload to:
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setUploadFolder("uploads")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
              uploadFolder === "uploads"
                ? "bg-gold/15 text-gold ring-1 ring-gold/30"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Upload className="h-3 w-3" />
            All Files
          </button>
          {UPLOAD_FOLDERS.map((fld) => (
            <button
              key={fld.id}
              onClick={() => setUploadFolder(fld.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
                uploadFolder === fld.id
                  ? "bg-gold/15 text-gold ring-1 ring-gold/30"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <fld.icon className="h-3 w-3" />
              {fld.label}
            </button>
          ))}
        </div>
        {uploadFolder !== "uploads" && (
          <span className="text-[0.6rem] text-muted-foreground/60 ml-1">
            /{uploadFolder}/
          </span>
        )}
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onClick={() => !state.includes("upload") && inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed p-8 text-center transition-all",
          dragOver
            ? "border-gold bg-gold/5"
            : "border-border/60 hover:border-gold/40 hover:bg-muted/30",
          state === "error" && "border-destructive/50 bg-destructive/5",
          state === "duplicate" && "border-amber-500/50 bg-amber-500/5",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.avif,.pdf,.mp4,.mov,.webm,.avi,.mkv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          disabled={state === "uploading"}
        />

        {state === "uploading" ? (
          <div className="mx-auto max-w-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10">
                <Loader2 className="h-5 w-5 animate-spin text-gold" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {progress < 15
                    ? "Checking for duplicates…"
                    : progress < 30
                      ? "Generating thumbnail…"
                      : `Uploading to /${uploadFolder}/…`}
                </p>
              </div>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-gold to-amber-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-muted-foreground tabular-nums">{progress}%</p>
          </div>
        ) : state === "duplicate" && existingMedia ? (
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="h-8 w-8 text-amber-500" />
            <div className="text-center">
              <p className="text-sm font-medium text-amber-600">Duplicate file detected</p>
              <p className="text-xs text-muted-foreground mt-1">
                "{existingMedia.originalName}" already exists in the library.
              </p>
              <p className="text-xs text-muted-foreground">
                Folder: {existingMedia.folder} ·{' '}
                {new Date(existingMedia.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setState("idle");
                  setErrorMsg("");
                  setExistingMedia(null);
                }}
                className="text-xs text-gold hover:underline"
              >
                Upload anyway
              </button>
              <span className="text-xs text-muted-foreground">·</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setState("idle");
                  setErrorMsg("");
                  setExistingMedia(null);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : state === "error" ? (
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive">{errorMsg}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setState("idle");
                setErrorMsg("");
              }}
              className="text-xs text-gold hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
              <Upload className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-gold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Images, Videos, or PDFs up to 500 MB → <span className="font-medium text-foreground/60">/{uploadFolder}/</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Media Preview Dialog ── */
function MediaPreviewDialog({
  item,
  open,
  onOpenChange,
  onDelete,
  onReplace,
}: {
  item: hooks.MediaItem | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onDelete: (id: string) => void;
  onReplace: (id: string) => void;
}) {
  const { data: usage } = hooks.useMediaUsage(item?.id || "");
  const [showEdit, setShowEdit] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [alt, setAlt] = useState(item?.alt || "");
  const [caption, setCaption] = useState(item?.caption || "");
  const updateMedia = hooks.useUpdateMedia();
  const renameMedia = hooks.useRenameMedia();

  if (!item) return null;

  const isImage = item.mimeType.startsWith("image/");
  const isVideo = item.mimeType.startsWith("video/");

  const handleSaveMeta = () => {
    updateMedia.mutate({ id: item.id, alt, caption });
    setShowEdit(false);
    toast.success("Media metadata updated");
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(item.url);
    toast.success("URL copied to clipboard");
  };

  const handleRename = () => {
    if (!newFileName.trim()) {
      toast.error("File name is required");
      return;
    }
    renameMedia.mutate(
      { id: item.id, originalName: newFileName.trim() },
      {
        onSuccess: () => {
          setShowRename(false);
          setNewFileName("");
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elegant"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview area */}
            <div
              className="relative flex items-center justify-center bg-black/90"
              style={{ minHeight: 300 }}
            >
              {isImage ? (
                <img
                  src={item.url}
                  alt={item.alt || item.originalName}
                  className="max-h-[50vh] object-contain"
                />
              ) : isVideo ? (
                <video src={item.url} controls className="max-h-[50vh] w-full" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-white/80">
                  <FileText className="h-16 w-16" />
                  <p className="text-sm">{item.originalName}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(item.url, "_blank")}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> View File
                  </Button>
                </div>
              )}

              {/* Close button */}
              <button
                onClick={() => onOpenChange(false)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Details */}
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {/* Rename inline */}
                  {showRename ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="Enter new file name…"
                        className="flex-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename();
                          if (e.key === "Escape") setShowRename(false);
                        }}
                      />
                      <button
                        onClick={handleRename}
                        className="rounded-md bg-gold px-2.5 py-1 text-xs font-medium text-white hover:brightness-105"
                        disabled={renameMedia.isPending}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setShowRename(false)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <h3 className="font-medium text-foreground truncate max-w-[300px]">
                      {item.originalName}
                    </h3>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.filename} · {formatSize(item.size)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant="outline" className="text-[0.6rem]">
                    {item.mimeType}
                  </Badge>
                  {item.tags?.some((t: string) => t.startsWith("hash:")) && (
                    <Badge variant="outline" className="text-[0.6rem] text-emerald-600 border-emerald-300">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Date:</span>{" "}
                  <span className="text-foreground">
                    {format(new Date(item.createdAt), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Folder:</span>{" "}
                  <span className="text-foreground">{item.folder}</span>
                </div>
                {item.width && (
                  <div>
                    <span className="text-muted-foreground">Dimensions:</span>{" "}
                    <span className="text-foreground">
                      {item.width} × {item.height}px
                    </span>
                  </div>
                )}
                {item.duration && (
                  <div>
                    <span className="text-muted-foreground">Duration:</span>{" "}
                    <span className="text-foreground">{item.duration.toFixed(1)}s</span>
                  </div>
                )}
              </div>

              {/* Edit metadata */}
              {showEdit ? (
                <div className="space-y-3 border-t border-border/40 pt-3">
                  <input
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    placeholder="Alt text"
                    className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm"
                  />
                  <input
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Caption"
                    className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="gold" onClick={handleSaveMeta}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowEdit(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}

              {/* Usage info */}
              {usage && usage.usage.length > 0 && (
                <div className="border-t border-border/40 pt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Used in {usage.usage.length} location(s):
                  </p>
                  <ul className="space-y-1">
                    {usage.usage.map((u, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-foreground/70">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
                        {u.model} — {u.title} ({u.field})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
                <Button size="sm" variant="outline" onClick={handleCopyUrl}>
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy URL
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowEdit(!showEdit);
                    setShowRename(false);
                  }}
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Info
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowRename(!showRename);
                    setShowEdit(false);
                    if (!showRename) setNewFileName(item.originalName);
                  }}
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1" /> Rename
                </Button>
                <Button size="sm" variant="outline" onClick={() => onReplace(item.id)}>
                  <Upload className="h-3.5 w-3.5 mr-1" /> Replace
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.open(item.url, "_blank")}>
                  <Download className="h-3.5 w-3.5 mr-1" /> Download
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="ml-auto"
                  onClick={() => {
                    onOpenChange(false);
                    onDelete(item.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Media Folder Tree ── */
function MediaFolderTree({
  selectedFolder,
  onSelectFolder,
  onCreateFolder,
}: {
  selectedFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (parentId?: string) => void;
}) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const { data: rootFolders } = hooks.useMediaFolders();

  const toggleExpanded = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  }, []);

  const renderFolderTree = useCallback(
    (folders: hooks.MediaFolder[], depth = 0) => {
      return folders.map((folder) => {
        const isExpanded = expandedFolders.has(folder.id);
        const isSelected = selectedFolder === folder.id;
        const hasChildren = (folder._count?.children ?? 0) > 0;
        return (
          <div key={folder.id}>
            <div
              className={`group flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                isSelected
                  ? "bg-gold/10 text-gold font-medium"
                  : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
              }`}
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
              onClick={() => onSelectFolder(folder.id)}
            >
              {hasChildren ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(folder.id);
                  }}
                  className="p-0.5 text-muted-foreground/60 hover:text-foreground"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              ) : (
                <span className="w-4" />
              )}
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 shrink-0 text-gold/60" />
              ) : (
                <FolderClosed className="h-4 w-4 shrink-0 text-muted-foreground/60" />
              )}
              <span className="truncate">{folder.name}</span>
              {folder._count?.media ? (
                <span className="ml-auto text-[0.6rem] text-muted-foreground/50">
                  {folder._count.media}
                </span>
              ) : null}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateFolder(folder.id);
                }}
                className="ml-1 hidden group-hover:flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                title="New subfolder"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            {isExpanded && hasChildren && (
              <FolderSubTree
                parentId={folder.id}
                depth={depth + 1}
                selectedFolder={selectedFolder}
                onSelectFolder={onSelectFolder}
                onCreateFolder={onCreateFolder}
              />
            )}
          </div>
        );
      });
    },
    [expandedFolders, selectedFolder, onSelectFolder, toggleExpanded, onCreateFolder],
  );

  return (
    <div className="space-y-1">
      {/* Root (All Files) */}
      <div
        onClick={() => onSelectFolder(null)}
        className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
          selectedFolder === null
            ? "bg-gold/10 text-gold font-medium"
            : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
        }`}
      >
        <FolderClosed className="h-4 w-4" />
        <span>All Files</span>
      </div>
      {rootFolders?.data && renderFolderTree(rootFolders.data)}
    </div>
  );
}

/* ── Recursive subfolder fetcher ── */
function FolderSubTree({
  parentId,
  depth,
  selectedFolder,
  onSelectFolder,
  onCreateFolder,
}: {
  parentId: string;
  depth: number;
  selectedFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (parentId?: string) => void;
}) {
  const { data: children } = hooks.useMediaFolders(parentId);

  if (!children?.data || children.data.length === 0) return null;

  return (
    <>
      {children.data.map((folder) => {
        const isSelected = selectedFolder === folder.id;
        const hasChildren = (folder._count?.children ?? 0) > 0;
        return (
          <div key={folder.id}>
            <div
              onClick={() => onSelectFolder(folder.id)}
              className={`group flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                isSelected
                  ? "bg-gold/10 text-gold font-medium"
                  : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
              }`}
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
            >
              <FolderClosed className="h-4 w-4 shrink-0 text-muted-foreground/60" />
              <span className="truncate">{folder.name}</span>
              {folder._count?.media ? (
                <span className="ml-auto text-[0.6rem] text-muted-foreground/50">
                  {folder._count.media}
                </span>
              ) : null}
            </div>
            {hasChildren && (
              <FolderSubTree
                parentId={folder.id}
                depth={depth + 1}
                selectedFolder={selectedFolder}
                onSelectFolder={onSelectFolder}
                onCreateFolder={onCreateFolder}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

/* ── Main Media Library Module ── */
export function MediaLibraryModule() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folderSidebarOpen, setFolderSidebarOpen] = useState(true);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderParent, setNewFolderParent] = useState<string | undefined>(undefined);
  const createFolderMut = hooks.useCreateMediaFolder();
  const [typeFilter, setTypeFilter] = useState<FilterType>("");
  const [sort, setSort] = useState<SortMode>("newest");
  const [view, setView] = useState<ViewMode>("grid");
  const [previewItem, setPreviewItem] = useState<hooks.MediaItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [uploadRefresh, setUploadRefresh] = useState(0);
  const [replaceId, setReplaceId] = useState<string | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const bulkDelete = hooks.useBulkDeleteMedia();
  const deleteMedia = hooks.useDeleteMedia();
  const replaceMedia = hooks.useReplaceMedia();

  const { data, isLoading, isError } = hooks.useMediaLibrary({
    page,
    limit: 48,
    search,
    type: typeFilter || undefined,
    sort,
    folder: selectedFolder || undefined,
  });

  const handleCreateFolder = useCallback(
    (parentId?: string) => {
      setNewFolderParent(parentId);
      setNewFolderName("");
      setNewFolderOpen(true);
    },
    [],
  );

  const handleSubmitNewFolder = useCallback(() => {
    if (!newFolderName.trim()) {
      toast.error("Folder name is required");
      return;
    }
    createFolderMut.mutate(
      { name: newFolderName.trim(), parentId: newFolderParent },
      {
        onSuccess: () => {
          setNewFolderOpen(false);
          setNewFolderName("");
          setNewFolderParent(undefined);
        },
      },
    );
  }, [newFolderName, newFolderParent, createFolderMut]);

  const handleRefresh = useCallback(() => {
    setUploadRefresh((n) => n + 1);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteMedia.mutate(id, {
        onSuccess: () => {
          setPreviewItem(null);
        },
      });
    },
    [deleteMedia],
  );

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected file(s)?`)) return;
    bulkDelete.mutate(Array.from(selectedIds), {
      onSuccess: () => setSelectedIds(new Set()),
    });
  }, [selectedIds, bulkDelete]);

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!data?.data) return;
    if (selectedIds.size === data.data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.data.map((m) => m.id)));
    }
  }, [data, selectedIds]);

  const handleReplace = useCallback((id: string) => {
    setReplaceId(id);
    setTimeout(() => replaceInputRef.current?.click(), 50);
  }, []);

  const handleReplaceFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validationError = validateUploadFile(file);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      try {
        const result = await uploadFile(file, { folder: "uploads" });
        replaceMedia.mutate({
          id,
          url: result.url,
          filename: result.filename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Replace failed");
      }

      setReplaceId(null);
      if (e.target) e.target.value = "";
    },
    [replaceMedia],
  );

  return (
    <div>
      {/* Hidden file input for replace */}
      <input
        ref={replaceInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4,.mov,.webm"
        className="hidden"
        onChange={(e) => replaceId && handleReplaceFile(e, replaceId)}
      />

      {/* Stats */}
      <MediaStatsBar />

      {/* Upload */}
      <MediaUploader onUploadComplete={handleRefresh} />

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 min-w-0">
          {/* Folder toggle */}
          <button
            onClick={() => setFolderSidebarOpen(!folderSidebarOpen)}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              folderSidebarOpen
                ? "bg-gold/10 text-gold"
                : "text-muted-foreground hover:text-foreground",
            )}
            title="Toggle folder tree"
          >
            <FolderClosed className="h-4 w-4" />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search media…"
              className="h-9 w-full rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as FilterType);
              setPage(1);
            }}
            className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
          >
            <option value="">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="pdf">PDFs</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <button
            onClick={() => setView("grid")}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              view === "grid"
                ? "bg-gold/10 text-gold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              view === "list"
                ? "bg-gold/10 text-gold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="h-4 w-4" />
          </button>

          {/* Bulk delete */}
          {selectedIds.size > 0 && (
            <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete {selectedIds.size}
            </Button>
          )}
        </div>
      </div>

      {/* Main content area with folder sidebar */}
      <div className="flex gap-4">
        {/* Folder Sidebar */}
        {folderSidebarOpen && (
          <div className="w-56 shrink-0">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Folders
              </span>
              <button
                onClick={() => handleCreateFolder()}
                className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="New folder"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 360px)" }}>
              <MediaFolderTree
                selectedFolder={selectedFolder}
                onSelectFolder={(folderId) => {
                  setSelectedFolder(folderId);
                  setPage(1);
                }}
                onCreateFolder={handleCreateFolder}
              />
            </div>
          </div>
        )}

        {/* Media content */}
        <div className="flex-1 min-w-0">
          {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-card border border-border/60 overflow-hidden"
            >
              <Skeleton className="h-full w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <AlertCircle className="h-12 w-12 text-destructive/50" />
          <p className="font-medium text-foreground">Failed to load media</p>
          <p className="text-sm text-muted-foreground">Could not connect to the server.</p>
        </div>
      ) : !data?.data?.length ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
          <p className="font-medium text-foreground">No media found</p>
          <p className="text-sm text-muted-foreground">Upload files using the dropzone above.</p>
        </div>
      ) : view === "grid" ? (
        <>
          {/* Select all */}
          <div className="mb-2 flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={data.data.length > 0 && selectedIds.size === data.data.length}
                onChange={handleSelectAll}
                className="rounded"
              />
              Select all ({data.data.length})
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {data.data.map((item) => {
              const isImage = item.mimeType.startsWith("image/");
              const isVideo = item.mimeType.startsWith("video/");
              const isSelected = selectedIds.has(item.id);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border cursor-pointer transition-all hover:shadow-md",
                    isSelected ? "border-gold ring-1 ring-gold" : "border-border/60",
                  )}
                >
                  {/* Thumbnail */}
                  <div
                    className="aspect-square overflow-hidden bg-muted"
                    onClick={() => setPreviewItem(item)}
                  >
                    {isImage ? (
                      <img
                        src={item.url}
                        alt={item.alt || item.originalName}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : isVideo ? (
                      <div className="relative h-full w-full">
                        <img
                          src={item.url + "#t=0.1"}
                          alt={item.originalName}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement!.classList.add(
                              "flex",
                              "items-center",
                              "justify-center",
                            );
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50">
                            <Video className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted/30">
                        <FileText className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  {/* Select checkbox */}
                  <div className="absolute left-2 top-2 z-10" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelect(item.id)}
                      className="rounded border-white/60 bg-white/80"
                    />
                  </div>

                  {/* File info */}
                  <div className="p-2" onClick={() => setPreviewItem(item)}>
                    <p className="text-xs text-foreground truncate">{item.originalName}</p>
                    <p className="text-[0.6rem] text-muted-foreground">{formatSize(item.size)}</p>
                  </div>

                  {/* Quick copy button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(item.url);
                      toast.success("URL copied");
                    }}
                    className="absolute right-2 top-2 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-black/70"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        /* List view */
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={data.data.length > 0 && selectedIds.size === data.data.length}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  File
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                  Type
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  Size
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                  Date
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border/40 hover:bg-muted/10 cursor-pointer"
                  onClick={() => setPreviewItem(item)}
                >
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => handleSelect(item.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                        {item.mimeType.startsWith("image/") ? (
                          <img src={item.url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <FileIcon mimeType={item.mimeType} className="h-5 w-5" />
                        )}
                      </div>
                      <span className="font-medium text-foreground truncate max-w-[200px]">
                        {item.originalName}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground hidden sm:table-cell">
                    {item.mimeType}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground hidden md:table-cell">
                    {formatSize(item.size)}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground hidden lg:table-cell text-xs">
                    {format(new Date(item.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.url);
                        toast.success("URL copied");
                      }}
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                      title="Copy URL"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total}{" "}
            files)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:bg-muted disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs text-muted-foreground">{page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= data.pagination.totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:bg-muted disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

        </div>
      </div>

      {/* Preview Dialog */}
      <MediaPreviewDialog
        item={previewItem}
        open={!!previewItem}
        onOpenChange={() => setPreviewItem(null)}
        onDelete={handleDelete}
        onReplace={handleReplace}
      />

      {/* New Folder Dialog */}
      <CrudDialog
        open={newFolderOpen}
        onOpenChange={setNewFolderOpen}
        title="Create Folder"
        description="Add a new folder to organize your media files."
        fields={[
          { name: "folderName", label: "Folder Name", required: true },
        ]}
        formData={{ folderName: newFolderName }}
        onChange={(n, v) => setNewFolderName(v)}
        onSubmit={handleSubmitNewFolder}
        isSubmitting={createFolderMut.isPending}
        isEditing
        size="sm"
      />
    </div>
  );
}
