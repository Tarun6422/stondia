/* ------------------------------------------------------------------ */
/*  Catalog Generator Module — Admin UI for PDF Catalog Generation    */
/* ------------------------------------------------------------------ */
import { useState, useCallback, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "./data-table";
import { CrudDialog } from "./crud-dialog";
import * as hooks from "./admin-hooks";
import { format } from "date-fns";
import { toast } from "sonner";

/* ── Status badge ── */
function StatusBadge({ status }: { status: string }) {
  if (status === "published") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-600 border-0 flex items-center gap-1">
        <Globe className="h-3 w-3" /> Published
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

/* ── View Catalog Dialog ── */
function ViewCatalogDialog({
  open,
  onOpenChange,
  catalog,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  catalog: any;
}) {
  const { data: detail } = hooks.useGeneratedCatalog(catalog?.id || "");
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
        {detail?.versions && detail.versions.length > 0 && (
          <div className="border-t border-border/40 pt-3">
            <h4 className="text-sm font-medium text-foreground mb-2">Version History</h4>
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
                        className="text-gold hover:text-gold/80"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    )}
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

/* ── Select Category/Product Dialog ── */
function SelectTargetDialog({
  open,
  onOpenChange,
  mode,
  onGenerate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: "category" | "product";
  onGenerate: (id: string) => void;
}) {
  const [selected, setSelected] = useState("");
  const { data: categories } = hooks.useCategories();
  const { data: products } = hooks.useProducts({ page: 1, limit: 100 });

  const options = useMemo(() => {
    if (mode === "category") {
      return (categories?.data || []).map((c) => ({ label: c.name, value: c.id }));
    }
    return (products?.data || []).map((p) => ({
      label: `${p.name} (${p.category?.name || "No category"})`,
      value: p.id,
    }));
  }, [mode, categories, products]);

  const handleSubmit = () => {
    if (!selected) {
      toast.error("Please select an item");
      return;
    }
    onGenerate(selected);
    onOpenChange(false);
    setSelected("");
  };

  return (
    <CrudDialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setSelected("");
      }}
      title={mode === "category" ? "Generate Category Catalog" : "Generate Product Catalog"}
      description={`Select a ${mode} to generate a PDF catalog for.`}
      fields={[
        {
          name: "targetId",
          label: mode === "category" ? "Select Category" : "Select Product",
          type: "select",
          options: [{ label: `Choose a ${mode}...`, value: "" }, ...options],
        },
      ]}
      formData={{ targetId: selected }}
      onChange={(n, v) => setSelected(v)}
      onSubmit={handleSubmit}
      isEditing
      size="md"
    />
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
  const [selectOpen, setSelectOpen] = useState(false);
  const [selectMode, setSelectMode] = useState<"category" | "product">("category");
  const [selected, setSelected] = useState<any>(null);

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
  const deleteMut = hooks.useDeleteGeneratedCatalog();

  const handleGenerateCategory = useCallback(
    (id: string) => generateCategoryMut.mutate(id),
    [generateCategoryMut],
  );
  const handleGenerateProduct = useCallback(
    (id: string) => generateProductMut.mutate(id),
    [generateProductMut],
  );

  const columns: Column<any>[] = useMemo(
    () => [
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
              onClick={() => regenerateMut.mutate(c.id)}
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
    [regenerateMut, publishMut],
  );

  return (
    <>
      <AnalyticsCard />

      {/* Generate Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Button
          variant="gold"
          size="sm"
          onClick={() => generateMasterMut.mutate()}
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
            setSelectMode("category");
            setSelectOpen(true);
          }}
        >
          <FolderTree className="h-4 w-4" /> Generate Category Catalog
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectMode("product");
            setSelectOpen(true);
          }}
        >
          <Package className="h-4 w-4" /> Generate Product Catalog
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

      <ViewCatalogDialog open={viewOpen} onOpenChange={setViewOpen} catalog={selected} />
      <ConfirmDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteMut.mutate(selected?.id)}
        title={`Delete "${selected?.title}"? This will remove the PDF and version history.`}
      />
      <SelectTargetDialog
        open={selectOpen}
        onOpenChange={setSelectOpen}
        mode={selectMode}
        onGenerate={selectMode === "category" ? handleGenerateCategory : handleGenerateProduct}
      />
    </>
  );
}
