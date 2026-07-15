/* ------------------------------------------------------------------ */
/*  Catalog Generator Module — Admin UI for PDF Catalog Generation    */
/* ------------------------------------------------------------------ */
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  FileText,
  BookOpen,
  Package,
  FolderTree,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  Globe,
  Lock,
  Loader2,
  Star,
  Archive,
  Copy,
  CheckSquare,
  QrCode,
  History,
  Palette,
  Languages,
  LayoutTemplate,
  Wand2,
  Upload,
  Tags,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "./data-table";
import { CrudDialog, type FieldDef } from "./crud-dialog";
import * as hooks from "./admin-hooks";
import { format } from "date-fns";
import { toast } from "sonner";
import { ImageUploader } from "./image-uploader";
import { cn } from "@/lib/utils";

/* ── QR Code dialog state type ── */
type QrDialogState = {
  open: boolean;
  catalogId: string;
  catalogTitle: string;
};

/* ── Status badge ── */
function StatusBadge({ status }: { status: string }) {
  if (status === "published") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-600 border-0 flex items-center gap-1">
        <Globe className="h-3 w-3" /> Published
      </Badge>
    );
  }
  if (status === "archived") {
    return (
      <Badge variant="outline" className="flex items-center gap-1 text-amber-600 border-amber-300/40">
        <Archive className="h-3 w-3" /> Archived
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <Lock className="h-3 w-3" /> Draft
    </Badge>
  );
}

/* ── Type badge ── */
function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; color: string }> = {
    master: { label: "Company", color: "bg-purple-500/15 text-purple-600" },
    category: { label: "Category", color: "bg-blue-500/15 text-blue-600" },
    product: { label: "Product", color: "bg-gold/20 text-gold" },
  };
  const c = config[type] || { label: type, color: "bg-muted text-muted-foreground" };
  return <Badge className={`${c.color} border-0`}>{c.label}</Badge>;
}

/* ── Analytics Card ── */
function AnalyticsCard() {
  const { data, isLoading } = hooks.useCatalogGeneratorAnalytics();
  if (isLoading) {
    return (
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-5">
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="mt-2 h-8 w-16 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Catalogs</p>
        <p className="mt-1 font-serif text-2xl text-foreground">{data?.totalCatalogs ?? 0}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {data?.publishedCatalogs ?? 0} published
        </p>
      </div>
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Downloads</p>
        <p className="mt-1 font-serif text-2xl text-foreground">{data?.totalDownloads ?? 0}</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">By Type</p>
        <p className="mt-1 text-sm text-foreground">
          <span className="text-purple-600">{data?.masterCount ?? 0}</span> Company ·
          <span className="text-blue-600"> {data?.categoryCount ?? 0}</span> Categories ·
          <span className="text-gold"> {data?.productCount ?? 0}</span> Products
        </p>
      </div>
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Most Downloaded</p>
        <p className="mt-1 font-serif text-lg text-foreground truncate">
          {data?.mostDownloaded?.title || "—"}
        </p>
        {data?.mostDownloaded && (
          <p className="text-xs text-muted-foreground">
            {data.mostDownloaded.downloadCount} downloads
          </p>
        )}
      </div>
    </div>
  );
}

/* ── View Catalog Dialog (enhanced with tags, assignments, cover) ── */
function ViewCatalogDialog({
  open,
  onOpenChange,
  catalog,
  onQrOpen,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  catalog: any;
  onQrOpen: (catalog: any) => void;
}) {
  const { data: detail } = hooks.useGeneratedCatalog(catalog?.id || "");
  const restoreMut = hooks.useRestoreCatalogVersion();
  const { data: qrData } = hooks.useCatalogQRCodes(catalog?.id || "");
  const { categoryName, productName, productCode, isLoading: assignmentsLoading } =
    hooks.useCatalogAssignments(catalog);

  return (
    <CrudDialog
      open={open}
      onOpenChange={onOpenChange}
      title={catalog?.title || "Catalog Details"}
      fields={[]}
      formData={{}}
      onChange={() => {}}
      onSubmit={() => {}}
      size="lg"
    >
      <div className="space-y-4 text-sm">
        {catalog?.coverImage && (
          <img
            src={catalog.coverImage}
            alt={catalog.title}
            className="w-full h-40 object-cover rounded-lg"
          />
        )}

        {/* Main info grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-muted-foreground">Type:</span>
            <div className="mt-1">
              <TypeBadge type={catalog?.type || ""} />
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <div className="mt-1">
              <StatusBadge status={catalog?.status || ""} />
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Version:</span>{" "}
            <span className="text-foreground">v{catalog?.version ?? 1}</span>
          </div>
          <div>
            <span className="text-muted-foreground">File Size:</span>{" "}
            <span className="text-foreground">{catalog?.fileSize || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Downloads:</span>{" "}
            <span className="text-foreground">{catalog?.downloadCount ?? 0}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Created:</span>{" "}
            <span className="text-foreground">
              {catalog?.createdAt ? format(new Date(catalog.createdAt), "MMM d, yyyy") : "—"}
            </span>
          </div>
        </div>

        {/* Assigned Product/Category */}
        {(catalog?.categoryId || catalog?.productId) && (
          <div className="border-t border-border/40 pt-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5" />
              Assigned To
            </h4>
            <div className="space-y-2">
              {catalog?.categoryId && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200/30">Category</Badge>
                  <span className="text-foreground">
                    {assignmentsLoading ? "Loading…" : categoryName || (catalog.categoryId === "null" ? "—" : catalog.categoryId)}
                  </span>
                </div>
              )}
              {catalog?.productId && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30">Product</Badge>
                  <span className="text-foreground">
                    {assignmentsLoading ? "Loading…" : productName || catalog.productId}
                  </span>
                  {productCode && (
                    <span className="text-xs text-muted-foreground">({productCode})</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {catalog?.tags && catalog.tags.length > 0 && (
          <div className="border-t border-border/40 pt-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Tags className="h-3.5 w-3.5" />
              Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {catalog.tags.map((tag: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-[0.6rem]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {catalog?.description && (
          <div>
            <span className="text-muted-foreground">Description:</span>
            <p className="text-foreground mt-1">{catalog.description}</p>
          </div>
        )}

        {catalog?.pdfUrl && (
          <div className="border-t border-border/40 pt-3">
            <a
              href={catalog.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
            >
              <Download className="h-4 w-4" /> Download PDF
            </a>
          </div>
        )}

        {/* QR Code Section */}
        {(qrData?.data && qrData.data.length > 0) || catalog?.id ? (
          <div className="border-t border-border/40 pt-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-foreground">QR Codes</h4>
              <button
                onClick={() => onQrOpen(catalog)}
                className="inline-flex items-center gap-1 text-xs text-gold hover:text-gold/80 transition-colors"
              >
                <QrCode className="h-3.5 w-3.5" />
                {qrData?.data?.length ? 'Manage QR' : 'Generate QR'}
              </button>
            </div>
            {qrData?.data && qrData.data.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {qrData.data.slice(0, 3).map((qr: any) => (
                  <div key={qr.id} className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 p-2">
                    {qr.imageUrl && (
                      <img src={qr.imageUrl} alt="QR" className="h-12 w-12 rounded" />
                    )}
                    <div className="text-xs">
                      {qr.label && <p className="text-foreground font-medium truncate max-w-[100px]">{qr.label}</p>}
                      <p className="text-muted-foreground">{qr.scanCount} scans</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Version History with Restore */}
        {detail?.versions && detail.versions.length > 0 && (
          <div className="border-t border-border/40 pt-3">
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-muted-foreground" />
              Version History
            </h4>
            <div className="divide-y divide-border/30">
              {detail.versions.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-foreground font-medium">v{v.version}</span>
                    <span className="text-muted-foreground text-xs ml-2">
                      {format(new Date(v.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {v.fileSize && (
                      <span className="text-xs text-muted-foreground">{v.fileSize}</span>
                    )}
                    {v.pdfUrl && (
                      <a
                        href={v.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-1 text-gold hover:text-gold/80 transition-colors"
                        title="Download this version"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => restoreMut.mutate({ catalogId: catalog.id, versionId: v.id })}
                      disabled={restoreMut.isPending}
                      className="rounded-md p-1 text-muted-foreground hover:text-amber-500 transition-colors"
                      title="Restore this version"
                    >
                      <History className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CrudDialog>
  );
}

/* ── Upload PDF Dialog ── */
function UploadCatalogDialog({
  open,
  onOpenChange,
  onUpload,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onUpload: (data: {
    title: string;
    type: string;
    pdfUrl: string;
    coverImage?: string;
    tags?: string[];
    description?: string;
    categoryId?: string;
    productId?: string;
    fileSize?: string;
    featured?: boolean;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("master");
  const [pdfUrl, setPdfUrl] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productId, setProductId] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [featured, setFeatured] = useState(false);

  const { data: categories } = hooks.useCategories();
  const { data: products } = hooks.useProducts({ page: 1, limit: 100 });

  useEffect(() => {
    if (open) {
      setTitle("");
      setType("master");
      setPdfUrl("");
      setCoverImage("");
      setTagsInput("");
      setDescription("");
      setCategoryId("");
      setProductId("");
      setFileSize("");
      setFeatured(false);
    }
  }, [open]);

  const handleSubmit = useCallback(() => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!pdfUrl.trim()) {
      toast.error("PDF URL is required");
      return;
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onUpload({
      title: title.trim(),
      type,
      pdfUrl: pdfUrl.trim(),
      coverImage: coverImage.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      description: description.trim() || undefined,
      categoryId: categoryId || undefined,
      productId: productId || undefined,
      fileSize: fileSize.trim() || undefined,
      featured: featured || undefined,
    });
    onOpenChange(false);
  }, [title, type, pdfUrl, coverImage, tagsInput, description, categoryId, productId, fileSize, featured, onUpload, onOpenChange]);

  const categoryOptions = useMemo(
    () => (categories?.data || []).map((c) => ({ label: c.name, value: c.id })),
    [categories],
  );
  const productOptions = useMemo(
    () =>
      (products?.data || []).map((p) => ({
        label: `${p.productCode ? p.productCode + " — " : ""}${p.name}`,
        value: p.id,
      })),
    [products],
  );

  return (
    <CrudDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Upload PDF Catalog"
      description="Manually upload an existing PDF and assign it to a product or category."
      fields={[
        { name: "title", label: "Catalog Title", required: true },
        {
          name: "type",
          label: "Catalog Type",
          type: "select",
          options: [
            { label: "Company", value: "master" },
            { label: "Category", value: "category" },
            { label: "Product", value: "product" },
          ],
          required: true,
        },
        { name: "description", label: "Description", type: "textarea" },
      ]}
      formData={{ title, type, description }}
      onChange={(n, v) => {
        if (n === "title") setTitle(v);
        if (n === "type") setType(v);
        if (n === "description") setDescription(v);
      }}
      onSubmit={handleSubmit}
      isEditing
      size="lg"
    >
      {/* Extra fields not covered by CrudDialog */}
      <div className="space-y-4">
        {/* PDF URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            PDF URL <span className="text-destructive">*</span>
          </label>
          <ImageUploader
            value={pdfUrl}
            onChange={setPdfUrl}
            folder="catalogues"
            label="Upload PDF"
            required
          />
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Cover Image</label>
          <ImageUploader
            value={coverImage}
            onChange={setCoverImage}
            folder="catalogues"
            label="Cover Image"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Tags className="h-3.5 w-3.5 text-muted-foreground" />
            Tags (comma-separated)
          </label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. sandstone, premium, architectural"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Separate tags with commas
          </p>
          {tagsInput && (
            <div className="flex flex-wrap gap-1.5">
              {tagsInput.split(",").map((t, i) => {
                const tag = t.trim();
                if (!tag) return null;
                return (
                  <Badge key={i} variant="secondary" className="text-[0.6rem]">
                    {tag}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Assign Category/Product */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <FolderTree className="h-3.5 w-3.5 text-muted-foreground" />
              Assign Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                if (e.target.value) setProductId("");
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">No category</option>
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
              Assign Product
            </label>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                if (e.target.value) setCategoryId("");
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">No product</option>
              {productOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* File Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">File Size (e.g. 2.4 MB)</label>
          <input
            value={fileSize}
            onChange={(e) => setFileSize(e.target.value)}
            placeholder="e.g. 2.4 MB"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          />
        </div>

        {/* Featured toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={featured}
            onClick={() => setFeatured(!featured)}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
              featured ? "bg-gold" : "bg-input",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform",
                featured ? "translate-x-4" : "translate-x-0",
              )}
            />
          </button>
          <label className="text-sm text-foreground">Featured Catalog</label>
        </div>
      </div>
    </CrudDialog>
  );
}

/* ── Confirm Delete Dialog ── */
function ConfirmDelete({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete this catalog?",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: () => void;
  title?: string;
}) {
  return (
    <CrudDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Confirm Delete"
      description={title}
      fields={[]}
      formData={{}}
      onChange={() => {}}
      onSubmit={() => {
        onConfirm();
        onOpenChange(false);
      }}
      size="sm"
    />
  );
}

/* ── Theme options ── */
const THEME_OPTIONS = [
  { value: "corporate", label: "Corporate", color: "#1A3A5C", accent: "#2E6EA6" },
  { value: "premium", label: "Premium", color: "#1A1A2E", accent: "#C5A55A" },
  { value: "luxury", label: "Luxury", color: "#0D0D0D", accent: "#D4AF37" },
  { value: "construction", label: "Construction", color: "#2D5016", accent: "#E8751A" },
  { value: "architecture", label: "Architecture", color: "#2C2C2C", accent: "#8B8B8B" },
  { value: "export", label: "Export", color: "#0B3D60", accent: "#D84315" },
  { value: "modern", label: "Modern", color: "#1A1A2E", accent: "#E94560" },
  { value: "minimal", label: "Minimal", color: "#333333", accent: "#666666" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "ar", label: "Arabic" },
];

/* ── Generate With Options Dialog ── */
function GenerateWithOptionsDialog({
  open,
  onOpenChange,
  mode,
  onGenerate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: "master" | "category" | "product";
  onGenerate: (options: {
    theme: string;
    language: string;
    templateId?: string;
    targetId?: string;
  }) => void;
}) {
  const [theme, setTheme] = useState("premium");
  const [language, setLanguage] = useState("en");
  const [templateId, setTemplateId] = useState("");
  const [targetId, setTargetId] = useState("");

  const { data: templates } = hooks.useCatalogTemplates();
  const { data: categories } = hooks.useCategories();
  const { data: products } = hooks.useProducts({ page: 1, limit: 100 });

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setTheme("premium");
      setLanguage("en");
      setTemplateId("");
      setTargetId("");
    }
  }, [open]);

  const handleSubmit = useCallback(() => {
    if ((mode === "category" || mode === "product") && !targetId) {
      toast.error("Please select a target");
      return;
    }
    onGenerate({ theme, language, templateId: templateId || undefined, targetId: targetId || undefined });
    onOpenChange(false);
  }, [mode, theme, language, templateId, targetId, onGenerate, onOpenChange]);

  const filteredTemplates = useMemo(
    () =>
      templates?.data?.filter(
        (t) => t.type === mode || t.type === "brochure",
      ) || [],
    [templates, mode],
  );

  const categoryOptions = useMemo(
    () => (categories?.data || []).map((c) => ({ label: c.name, value: c.id })),
    [categories],
  );

  const productOptions = useMemo(
    () =>
      (products?.data || []).map((p) => ({
        label: `${p.name} (${p.category?.name || "No category"})`,
        value: p.id,
      })),
    [products],
  );

  const title =
    mode === "master"
      ? "Generate Company Catalog"
      : mode === "category"
        ? "Generate Category Catalog"
        : "Generate Product Catalog";

  return (
    <CrudDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Choose template, theme, and language for the new catalog."
      fields={[
        ...(mode !== "master"
          ? [
              {
                name: "targetId",
                label: mode === "category" ? "Select Category" : "Select Product",
                type: "select" as const,
                options: [
                  { label: `Choose a ${mode}...`, value: "" },
                  ...(mode === "category" ? categoryOptions : productOptions),
                ],
                required: true,
              },
            ]
          : []),
      ]}
      formData={{ targetId }}
      onChange={(n, v) => setTargetId(v)}
      onSubmit={handleSubmit}
      isEditing
      size="lg"
    >
      <div className="space-y-5">
        {/* Template Selection */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <LayoutTemplate className="h-4 w-4 text-gold" />
            Template
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTemplateId("")}
              className={`rounded-lg border px-3 py-2.5 text-left text-xs transition-all ${
                !templateId
                  ? "border-gold bg-gold/5 text-foreground ring-1 ring-gold/30"
                  : "border-border/60 text-muted-foreground hover:border-border"
              }`}
            >
              <span className="font-medium">Default</span>
              <span className="block text-[10px] text-muted-foreground mt-0.5">
                Standard layout
              </span>
            </button>
            {filteredTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={`rounded-lg border px-3 py-2.5 text-left text-xs transition-all ${
                  templateId === t.id
                    ? "border-gold bg-gold/5 text-foreground ring-1 ring-gold/30"
                    : "border-border/60 text-muted-foreground hover:border-border"
                }`}
              >
                <span className="font-medium">{t.name}</span>
                {t.description && (
                  <span className="block text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                    {t.description}
                  </span>
                )}
              </button>
            ))}
            {filteredTemplates.length === 0 && (
              <p className="col-span-2 text-xs text-muted-foreground italic py-1">
                No custom templates available. Use Default or create templates in Catalog Templates.
              </p>
            )}
          </div>
        </div>

        {/* Theme Selection */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Palette className="h-4 w-4 text-gold" />
            Theme
          </label>
          <div className="grid grid-cols-4 gap-2">
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`rounded-lg border p-2 text-center text-xs transition-all ${
                  theme === t.value
                    ? "border-gold bg-gold/5 ring-1 ring-gold/30"
                    : "border-border/60 hover:border-border"
                }`}
              >
                <div className="flex gap-1 justify-center mb-1.5">
                  <div
                    className="h-5 w-5 rounded"
                    style={{ backgroundColor: t.color }}
                  />
                  <div
                    className="h-5 w-5 rounded"
                    style={{ backgroundColor: t.accent }}
                  />
                </div>
                <span
                  className={theme === t.value ? "text-foreground font-medium" : "text-muted-foreground"}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Languages className="h-4 w-4 text-gold" />
            Language
          </label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLanguage(l.value)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                  language === l.value
                    ? "border-gold bg-gold text-[var(--gold-foreground)]"
                    : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview hint */}
        <div className="rounded-lg border border-border/40 bg-muted/20 p-3 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <Wand2 className="h-3.5 w-3.5 text-gold" />
            The catalog will be generated with the {THEME_OPTIONS.find((t) => t.value === theme)?.label} theme
            in {LANGUAGE_OPTIONS.find((l) => l.value === language)?.label}.
          </p>
        </div>
      </div>
    </CrudDialog>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                    */
/* ================================================================== */
export function CatalogGeneratorModule() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionsMode, setOptionsMode] = useState<"master" | "category" | "product">("master");
  const [selected, setSelected] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [qrDialog, setQrDialog] = useState<QrDialogState>({ open: false, catalogId: "", catalogTitle: "" });
  const [qrLabel, setQrLabel] = useState("");
  const generateQrMut = hooks.useGenerateQRCode();
  const deleteQrMut = hooks.useDeleteQRCode();
  const uploadMut = hooks.useUploadCatalogPdf();

  const { data, isLoading, isError } = hooks.useGeneratedCatalogs({
    page,
    limit: 10,
    search: search || undefined,
    type: typeFilter || undefined,
  });

  const generateMasterMut = hooks.useGenerateMasterCatalog();
  const generateCategoryMut = hooks.useGenerateCategoryCatalog();
  const generateProductMut = hooks.useGenerateProductCatalog();
  const regenerateMut = hooks.useRegenerateCatalog();
  const publishMut = hooks.usePublishGeneratedCatalog();
  const featureMut = hooks.useFeatureGeneratedCatalog();
  const archiveMut = hooks.useArchiveGeneratedCatalog();
  const duplicateMut = hooks.useDuplicateGeneratedCatalog();
  const deleteMut = hooks.useDeleteGeneratedCatalog();
  const bulkDeleteMut = hooks.useBulkDeleteCatalogs();

  const handleGenerateWithOptions = useCallback(
    (opts: { theme: string; language: string; templateId?: string; targetId?: string }) => {
      if (optionsMode === "master") {
        generateMasterMut.mutate(opts);
      } else if (optionsMode === "category" && opts.targetId) {
        generateCategoryMut.mutate({ categoryId: opts.targetId, ...opts });
      } else if (optionsMode === "product" && opts.targetId) {
        generateProductMut.mutate({ productId: opts.targetId, ...opts });
      }
    },
    [optionsMode, generateMasterMut, generateCategoryMut, generateProductMut],
  );

  const columns: Column<any>[] = useMemo(
    () => [
      {
        key: "select",
        label: (
          <input
            type="checkbox"
            checked={(data?.data?.length ?? 0) > 0 && selectedIds.size === data?.data?.length}
            onChange={handleSelectAll}
            className="rounded border-muted-foreground/30"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        render: (c: any) => (
          <input
            type="checkbox"
            checked={selectedIds.has(c.id)}
            onChange={() => {
              setSelectedIds((prev) => {
                const next = new Set(prev);
                if (next.has(c.id)) next.delete(c.id);
                else next.add(c.id);
                return next;
              });
            }}
            onClick={(e) => e.stopPropagation()}
            className="rounded border-muted-foreground/30"
          />
        ),
        className: "w-10",
      },
      {
        key: "title",
        label: "Title",
        render: (c: any) => (
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <span className="font-medium text-foreground truncate block max-w-[200px]">
                {c.title}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <TypeBadge type={c.type} />
                <span className="text-xs text-muted-foreground">v{c.version}</span>
              </div>
            </div>
          </div>
        ),
      },
      { key: "status", label: "Status", render: (c: any) => <StatusBadge status={c.status} /> },
      {
        key: "fileSize",
        label: "Size",
        render: (c: any) => (
          <span className="text-muted-foreground text-xs">{c.fileSize || "—"}</span>
        ),
        hideOnMobile: true,
      },
      {
        key: "downloadCount",
        label: "DLs",
        render: (c: any) => (
          <span className="text-muted-foreground text-xs">{c.downloadCount ?? 0}</span>
        ),
        hideOnMobile: true,
      },
      {
        key: "updatedAt",
        label: "Updated",
        render: (c: any) => (
          <span className="text-muted-foreground text-xs">
            {format(new Date(c.updatedAt), "MMM d")}
          </span>
        ),
        hideOnMobile: true,
      },
      {
        key: "actions",
        label: "",
        className: "text-right",
        render: (c: any) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setSelected(c);
                setViewOpen(true);
              }}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="View"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            {c.pdfUrl && (
              <button
                onClick={() => window.open(c.pdfUrl, "_blank")}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Download PDF"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => regenerateMut.mutate({ id: c.id, theme: c.metadata?.theme, language: c.metadata?.language })}
              disabled={regenerateMut.isPending}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-blue-500"
              title="Regenerate"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => publishMut.mutate(c.id)}
              disabled={publishMut.isPending}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-emerald-500"
              title="Toggle Publish"
            >
              <Globe className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => featureMut.mutate(c.id)}
              disabled={featureMut.isPending}
              className={`rounded-md p-1.5 transition-colors hover:bg-muted ${c.featured ? 'text-gold' : 'text-muted-foreground hover:text-gold'}`}
              title="Toggle Featured"
            >
              <Star className={`h-3.5 w-3.5 ${c.featured ? 'fill-gold' : ''}`} />
            </button>
            <button
              onClick={() => archiveMut.mutate(c.id)}
              disabled={archiveMut.isPending}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-amber-500"
              title="Toggle Archive"
            >
              <Archive className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => duplicateMut.mutate(c.id)}
              disabled={duplicateMut.isPending}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-purple-500"
              title="Duplicate"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setSelected(c);
                setDeleteOpen(true);
              }}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-red-500"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [regenerateMut, publishMut, featureMut, archiveMut, duplicateMut],
  );

  const handleSelectAll = useCallback(() => {
    if (!data?.data) return;
    if (selectedIds.size === data.data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.data.map((c: any) => c.id)));
    }
  }, [data, selectedIds]);

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected catalog(s)?`)) return;
    bulkDeleteMut.mutate(Array.from(selectedIds), {
      onSuccess: () => setSelectedIds(new Set()),
    });
  }, [selectedIds, bulkDeleteMut]);

  const handleUpload = useCallback(
    (data: {
      title: string;
      type: string;
      pdfUrl: string;
      coverImage?: string;
      tags?: string[];
      description?: string;
      categoryId?: string;
      productId?: string;
      fileSize?: string;
      featured?: boolean;
    }) => {
      uploadMut.mutate(data);
    },
    [uploadMut],
  );

  const handleGenerateQr = useCallback(() => {
    if (!qrDialog.catalogId) return;
    generateQrMut.mutate(
      { catalogId: qrDialog.catalogId, label: qrLabel || undefined },
      { onSuccess: () => setQrDialog({ ...qrDialog, open: false }) },
    );
  }, [qrDialog, qrLabel, generateQrMut]);

  // Clear selection when data changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [data?.data]);

  return (
    <>
      <AnalyticsCard />

      {/* Generate Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Button
          variant="gold"
          size="sm"
          onClick={() => {
            setOptionsMode("master");
            setOptionsOpen(true);
          }}
          disabled={generateMasterMut.isPending}
        >
          {generateMasterMut.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <BookOpen className="h-4 w-4" />
          )}
          Generate Company Catalog
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setOptionsMode("category");
            setOptionsOpen(true);
          }}
        >
          <FolderTree className="h-4 w-4" /> Generate Category Catalog
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setOptionsMode("product");
            setOptionsOpen(true);
          }}
        >
          <Package className="h-4 w-4" /> Generate Product Catalog
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setUploadOpen(true)}
        >
          <Upload className="h-4 w-4" /> Upload PDF
        </Button>
      </div>

      {/* Type Filter */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Filter:</span>
        {["", "master", "category", "product"].map((t) => (
          <button
            key={t}
            onClick={() => {
              setTypeFilter(t);
              setPage(1);
            }}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${typeFilter === t ? "border-gold bg-gold text-[var(--gold-foreground)]" : "border-border/60 bg-card text-muted-foreground hover:text-foreground"}`}
          >
            {t
              ? t === "master"
                ? "Company"
                : t.charAt(0).toUpperCase() + t.slice(1) + "s"
              : "All"}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        keyExtractor={(c) => c.id}
        pagination={data?.pagination}
        isLoading={isLoading}
        isError={isError}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search catalogs…"
        onPageChange={setPage}
      />

      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-border/60 bg-card px-4 py-2.5">
          <CheckSquare className="h-4 w-4 text-gold" />
          <span className="text-sm text-foreground">{selectedIds.size} selected</span>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
            <Button size="sm" variant="outline" onClick={handleBulkDelete}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Selected
            </Button>
          </div>
        </div>
      )}

      <GenerateWithOptionsDialog
        open={optionsOpen}
        onOpenChange={setOptionsOpen}
        mode={optionsMode}
        onGenerate={handleGenerateWithOptions}
      />

      <UploadCatalogDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={handleUpload}
      />

      <ViewCatalogDialog open={viewOpen} onOpenChange={setViewOpen} catalog={selected} onQrOpen={(c) => setQrDialog({ open: true, catalogId: c.id, catalogTitle: c.title })} />

      {/* QR Code Generation Dialog */}
      <CrudDialog
        open={qrDialog.open}
        onOpenChange={(o) => setQrDialog({ ...qrDialog, open: o })}
        title={`QR Code for "${qrDialog.catalogTitle}"`}
        description="Generate a scannable QR code that links to this catalog."
        fields={[
          { name: "qrLabel", label: "Label (optional)", placeholder: "e.g. Product brochure QR" },
        ]}
        formData={{ qrLabel }}
        onChange={(n, v) => setQrLabel(v)}
        onSubmit={handleGenerateQr}
        isSubmitting={generateQrMut.isPending}
        isEditing
        size="sm"
      />

      <ConfirmDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteMut.mutate(selected?.id)}
        title={`Delete "${selected?.title}"? This will remove the PDF and version history.`}
      />
    </>
  );
}
