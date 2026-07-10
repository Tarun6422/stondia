/* ------------------------------------------------------------------ */
/*  Media Library Module — WordPress-style media management            */
/*  Features: upload, grid, search, filter, preview, replace, delete, */
/*  bulk actions, usage tracking, copy URL, stats                     */
/* ------------------------------------------------------------------ */
import { useState, useCallback, useRef, type DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Search,
  Image as ImageIcon,
  Video,
  FileText,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import { compressImage, uploadFile, deleteFile, validateUploadFile } from "@/lib/storage-utils";
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

/* ── Upload Dropzone ── */
function MediaUploader({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [state, setState] = useState<"idle" | "uploading" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const createMedia = hooks.useCreateMedia();

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
      setState("uploading");
      setProgress(0);

      try {
        // Upload to storage
        const result = await uploadFile(file, {
          folder: "uploads",
          onProgress: (pct) => setProgress(pct),
        });

        setProgress(100);

        // Register in media library
        await createMedia.mutateAsync({
          filename: result.filename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          url: result.url,
          folder: "uploads",
        });

        toast.success(`"${file.name}" uploaded`);
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
    [createMedia, onUploadComplete],
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
                <p className="text-xs text-muted-foreground">Uploading to Media Library…</p>
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
                Images, Videos, or PDFs up to 500 MB
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
  const [alt, setAlt] = useState(item?.alt || "");
  const [caption, setCaption] = useState(item?.caption || "");
  const updateMedia = hooks.useUpdateMedia();

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
                  <h3 className="font-medium text-foreground truncate">{item.originalName}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.filename} · {formatSize(item.size)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant="outline" className="text-[0.6rem]">
                    {item.mimeType}
                  </Badge>
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
                  }}
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Info
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

/* ── Main Media Library Module ── */
export function MediaLibraryModule() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
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
  });

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

      {/* Preview Dialog */}
      <MediaPreviewDialog
        item={previewItem}
        open={!!previewItem}
        onOpenChange={() => setPreviewItem(null)}
        onDelete={handleDelete}
        onReplace={handleReplace}
      />
    </div>
  );
}
