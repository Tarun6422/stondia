/* ------------------------------------------------------------------ */
/*  ProductMediaManager — per-product media management                */
/*  Tabbed interface: Main, Gallery, Video, 360, Project, Application */
/*  Features: Add, Delete, Replace, Drag-to-reorder, Set as Main      */
/*  Each product manages its own media — no cross-product effects     */
/* ------------------------------------------------------------------ */
import { useState, useCallback, useRef, type DragEvent } from "react";
import { motion, Reorder } from "framer-motion";
import {
  Upload,
  X,
  Image as ImageIcon,
  Video,
  Loader2,
  Trash2,
  Star,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  Camera,
  Grid3X3,
  Globe,
  Layers,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { compressImage, uploadFile, validateUploadFile } from "@/lib/storage-utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import * as hooks from "./admin-hooks";

/* ── Tab configuration ── */
const MEDIA_TABS = [
  { id: "main", label: "Main Image", icon: Camera },
  { id: "gallery", label: "Gallery", icon: Grid3X3 },
  { id: "video", label: "Videos", icon: Video },
  { id: "360", label: "360° View", icon: Globe },
  { id: "project", label: "Project Images", icon: Layers },
  { id: "application", label: "Application", icon: FileText },
] as const;

type MediaTab = (typeof MEDIA_TABS)[number]["id"];

/* ── Single image preview card ── */
function ImageCard({
  image,
  isMain,
  onSetMain,
  onDelete,
  onReplace,
  isDraggable,
}: {
  image: hooks.ProductImage;
  isMain: boolean;
  onSetMain: () => void;
  onDelete: () => void;
  onReplace: () => void;
  isDraggable?: boolean;
}) {
  const isVideo = image.url.match(/\.(mp4|webm|mov)$/i);
  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-card">
      {/* Thumbnail */}
      {isVideo ? (
        <video
          src={image.url}
          className="h-full w-full object-cover"
          muted
          preload="metadata"
        />
      ) : (
        <img
          src={image.url}
          alt={image.altText || image.displayName || "Product image"}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      )}

      {/* Drag handle */}
      {isDraggable && (
        <div className="absolute left-1 top-1 z-10 cursor-grab rounded bg-black/40 p-1 text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      )}

      {/* Main badge */}
      {isMain && (
        <div className="absolute left-1 top-1 z-10">
          <Badge className="bg-gold text-[var(--gold-foreground)] border-0 text-[0.55rem] px-1.5 py-0.5">
            <Star className="h-2.5 w-2.5 mr-0.5" /> Main
          </Badge>
        </div>
      )}

      {/* Set as main button */}
      {!isMain && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSetMain();
          }}
          className="absolute left-1 bottom-1 z-10 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-gold hover:text-white transition-colors"
          title="Set as main image"
        >
          <Star className="h-3 w-3" />
        </button>
      )}

      {/* Replace button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onReplace();
        }}
        className="absolute right-1 bottom-1 z-10 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-black/70 transition-colors"
        title="Replace"
      >
        <Upload className="h-3 w-3" />
      </button>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute right-1 top-1 z-10 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-red-500 transition-colors"
        title="Delete"
      >
        <X className="h-3 w-3" />
      </button>

      {/* Sort order label */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-[0.55rem] text-white/90 truncate">
          {image.displayName || image.fileName}
        </p>
      </div>
    </div>
  );
}

/* ── Main component ── */
export function ProductMediaManager({
  productId,
  productCode,
}: {
  productId: string;
  productCode?: string | null;
}) {
  const [activeTab, setActiveTab] = useState<MediaTab>("main");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingImageId, setReplacingImageId] = useState<string | null>(null);

  const { data: mediaData, isLoading } = hooks.useProductMedia(productId);
  const addImage = hooks.useAddProductImage();
  const deleteImage = hooks.useDeleteProductImage();
  const setMainImage = hooks.useSetMainProductImage();
  const reorderImages = hooks.useReorderProductImages();

  const currentImages: hooks.ProductImage[] = mediaData?.structured?.[activeTab] || [];
  const mainImageUrl = mediaData?.mainImage || null;

  const handleUpload = useCallback(
    async (file: File, targetType?: MediaTab) => {
      const validationError = validateUploadFile(file);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      try {
        // Upload to storage
        const result = await uploadFile(file, {
          folder: "products",
          onProgress: (pct) => setUploadProgress(pct),
        });

        setUploadProgress(100);

        // Register as structured image for this product
        await addImage.mutateAsync({
          productId,
          url: result.url,
          imageType: targetType || activeTab,
        });

        toast.success(`Image added to ${activeTab}`);
        setUploading(false);
        setUploadProgress(0);
        if (inputRef.current) inputRef.current.value = "";
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
        setUploading(false);
      }
    },
    [productId, activeTab, addImage],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload],
  );

  const handleReplace = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, mediaId: string) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validationError = validateUploadFile(file);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      setUploading(true);
      try {
        // Upload new file first (safe — old image preserved if upload fails)
        const result = await uploadFile(file, { folder: "products" });
        // Register new image
        await addImage.mutateAsync({
          productId,
          url: result.url,
          imageType: activeTab,
        });
        // Only then delete the old image
        await deleteImage.mutateAsync({ productId, mediaId });
        toast.success("Image replaced");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Replace failed");
      }
      setUploading(false);
      setReplacingImageId(null);
      if (e.target) e.target.value = "";
    },
    [productId, activeTab, deleteImage, addImage],
  );

  const handleReorder = useCallback(
    (reordered: hooks.ProductImage[]) => {
      const order = reordered.map((img) => img.id);
      reorderImages.mutate({ productId, imageType: activeTab, order });
    },
    [productId, activeTab, reorderImages],
  );

  const handleDelete = useCallback(
    (mediaId: string) => {
      if (!confirm("Delete this image? This cannot be undone.")) return;
      deleteImage.mutate({ productId, mediaId });
    },
    [productId, deleteImage],
  );

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-border/40 pb-2">
        {MEDIA_TABS.map((tab) => {
          const count = mediaData?.structured?.[tab.id]?.length || 0;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                activeTab === tab.id
                  ? "bg-gold/10 text-gold"
                  : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {count > 0 && (
                <span
                  className={cn(
                    "ml-0.5 rounded-full px-1.5 py-0.5 text-[0.55rem]",
                    activeTab === tab.id
                      ? "bg-gold/20 text-gold"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="min-h-[200px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : (
          <>
            {/* Main Image tab — single image with upload/replace/delete */}
            {activeTab === "main" && (
              <div className="space-y-3">
                {mainImageUrl ? (
                  <div className="relative mx-auto max-w-xs overflow-hidden rounded-lg border border-border/60">
                    <img
                      src={mainImageUrl}
                      alt="Main product image"
                      className="aspect-square w-full object-cover"
                    />
                    <button
                      onClick={() => {
                        const mainStructured = currentImages[0];
                        if (mainStructured) {
                          handleDelete(mainStructured.id);
                        }
                      }}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors"
                      title="Remove main image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border/60 p-8 text-center transition-colors hover:border-gold/40 hover:bg-muted/30"
                    onClick={() => inputRef.current?.click()}
                  >
                    <Camera className="h-8 w-8 text-muted-foreground/40" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-gold">Click to upload</span> or drag and
                        drop
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Main product image
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Gallery, 360, Project, Application — reorderable grids */}
            {(activeTab === "gallery" ||
              activeTab === "360" ||
              activeTab === "project" ||
              activeTab === "application") && (
              <div className="space-y-3">
                {currentImages.length > 0 ? (
                  <Reorder.Group
                    axis="y"
                    values={currentImages}
                    onReorder={handleReorder}
                    className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5"
                  >
                    {currentImages.map((img) => (
                      <Reorder.Item key={img.id} value={img}>
                        <ImageCard
                          image={img}
                          isMain={mainImageUrl === img.url}
                          onSetMain={() =>
                            setMainImage.mutate({ productId, mediaId: img.id })
                          }
                          onDelete={() => handleDelete(img.id)}
                          onReplace={() => {
                            setReplacingImageId(img.id);
                            setTimeout(() => replaceInputRef.current?.click(), 50);
                          }}
                          isDraggable
                        />
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      No {activeTab} images yet
                    </p>
                  </div>
                )}

                {/* Add button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1" />
                    Add {activeTab === "gallery" ? "Gallery Image" : `${activeTab} Image`}
                  </Button>
                </div>
              </div>
            )}

            {/* Video tab */}
            {activeTab === "video" && (
              <div className="space-y-3">
                {currentImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {currentImages.map((img) => (
                      <div
                        key={img.id}
                        className="group relative aspect-video overflow-hidden rounded-lg border border-border/60 bg-card"
                      >
                        <video
                          src={img.url}
                          className="h-full w-full object-cover"
                          controls
                          preload="metadata"
                        />
                        <button
                          onClick={() => handleDelete(img.id)}
                          className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-red-500 transition-colors"
                          title="Delete video"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                          <p className="text-[0.55rem] text-white/90 truncate">
                            {img.displayName || img.fileName}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <Video className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No videos yet</p>
                  </div>
                )}

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1" />
                    Add Video
                  </Button>
                </div>
              </div>
            )}

            {/* Upload progress */}
            {uploading && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-gold" />
                  <span>Uploading to {activeTab}…</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-gold to-amber-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.avif,.pdf,.mp4,.mov,.webm,.avi,.mkv"
        className="hidden"
        onChange={handleFileInput}
        disabled={uploading}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.avif,.mp4,.mov,.webm"
        className="hidden"
        onChange={(e) => replacingImageId && handleReplace(e, replacingImageId)}
      />
    </div>
  );
}
