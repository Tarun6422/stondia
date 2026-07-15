/* ------------------------------------------------------------------ */
/*  Admin Modules — all CRUD modules for the admin dashboard           */
/* ------------------------------------------------------------------ */
import { useState, useCallback, useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Package,
  FolderTree,
  Building2,
  Newspaper,
  Video,
  Download,
  MessageSquare,
  FileText,
  Users,
  Mail,
  Settings,
  Star,
  Plus,
  Pencil,
  Trash2,
  Eye,
  ExternalLink,
  LogOut,
  Send,
  Paperclip,
  Download as DownloadIcon,
  Reply,
  Images,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column, type PaginationMeta } from "./data-table";
import { CrudDialog, type FieldDef } from "./crud-dialog";
import { ProductMediaManager } from "./product-media-manager";
import * as hooks from "./admin-hooks";
import { useAuth } from "@/lib/auth-context";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

/* ── Helper: action buttons ── */
function ActionButtons({
  onView,
  onEdit,
  onDelete,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {onView && (
        <button
          onClick={onView}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="View"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-red-500"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/* ── Confirm Delete Dialog ── */
function ConfirmDelete({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete this item?",
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

/* ── View Detail Dialog ── */
function ViewDialog({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <CrudDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      fields={[]}
      formData={{}}
      onChange={() => {}}
      onSubmit={() => {}}
      size="lg"
    >
      {children}
    </CrudDialog>
  );
}

/* ── Status badge color map ── */
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Unread: "bg-amber-500/15 text-amber-600 border-0",
    Read: "bg-blue-500/15 text-blue-600 border-0",
    Archived: "bg-muted text-muted-foreground border-0",
    Pending: "bg-amber-500/15 text-amber-600 border-0",
    Quoted: "bg-blue-500/15 text-blue-600 border-0",
    Negotiation: "bg-purple-500/15 text-purple-600 border-0",
    Completed: "bg-emerald-500/15 text-emerald-600 border-0",
    Cancelled: "bg-red-500/10 text-red-500 border-0",
  };
  return <Badge className={colors[status] || ""}>{status}</Badge>;
}

/* ══════════════════════════════════════════════════════════════════ */
/*  PRODUCTS MODULE                                                   */
/* ══════════════════════════════════════════════════════════════════ */
export function ProductsModule() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<string>("newest");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const { data, isLoading, isError } = hooks.useProducts({ page, limit: 10, search, sort });
  const createMut = hooks.useCreateProduct();
  const updateMut = hooks.useUpdateProduct();
  const deleteMut = hooks.useDeleteProduct();
  const { data: categories } = hooks.useCategories();

  const openCreate = useCallback(() => {
    setSelected(null);
    setForm({
      name: "",
      description: "",
      categoryId: "",
      productCode: "",
      mainImage: "",
      thumbnailImage: "",
      featured: false,
      stock: "In Stock",
      images: [],
    });
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((item: any) => {
    setSelected(item);
    setForm({
      name: item.name,
      description: item.description,
      categoryId: item.categoryId,
      productCode: item.productCode || "",
      mainImage: item.mainImage || "",
      thumbnailImage: item.thumbnailImage || "",
      featured: item.featured,
      stock: item.stock,
      subCategory: item.subCategory || "",
      finish: item.finish || "",
      size: item.size || "",
      origin: item.origin || "",
    });
    setDialogOpen(true);
  }, []);

  const openMedia = useCallback((item: any) => {
    setSelected(item);
    setMediaOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selected) {
      updateMut.mutate({ id: selected.id, ...form });
    } else {
      createMut.mutate(form);
    }
    setDialogOpen(false);
  }, [selected, form, createMut, updateMut]);

  const columns: Column<any>[] = useMemo(
    () => [
      {
        key: "productCode",
        label: "Code",
        render: (p) => (                    <span className="font-mono text-xs font-medium text-gold/80">
            {p.productCode || "—"}
          </span>
        ),
      },
      {
        key: "image",
        label: "",
        render: (p) => (
          <div className="flex items-center">
            {p.mainImage || p.images?.[0] ? (
              <img
                src={p.mainImage || p.images[0]}
                alt={p.name}
                className="h-9 w-9 rounded-md object-cover shrink-0"
              />
            ) : (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted text-xs text-muted-foreground">
                —
              </span>
            )}
          </div>
        ),
      },
      {
        key: "name",
        label: "Name",
        sortable: true,
        render: (p) => <span className="font-medium text-foreground">{p.name}</span>,
      },
      {
        key: "category",
        label: "Category",
        render: (p) => <span className="text-muted-foreground">{p.category?.name || "—"}</span>,
        hideOnMobile: true,
      },
      {
        key: "images",
        label: "Images",
        render: (p) => (
          <span className="text-xs text-muted-foreground">
            {p.images?.length || 0} Images
          </span>
        ),
      },
      {
        key: "stock",
        label: "Stock",
        render: (p) => (
          <Badge variant={p.stock === "In Stock" ? "default" : "outline"}>{p.stock}</Badge>
        ),
      },
      {
        key: "featured",
        label: "Featured",
        render: (p) =>
          p.featured ? <Badge className="bg-gold/20 text-gold border-0">Featured</Badge> : "—",
        hideOnMobile: true,
      },
      {
        key: "createdAt",
        label: "Created",
        sortable: true,
        render: (p) => (
          <span className="text-muted-foreground text-xs">
            {format(new Date(p.createdAt), "MMM d, yyyy")}
          </span>
        ),
        hideOnMobile: true,
      },
      {
        key: "actions",
        label: "",
        render: (p) => (
          <ActionButtons
            onView={() => {
              setSelected(p);
              setViewOpen(true);
            }}
            onEdit={() => openEdit(p)}
            onDelete={() => {
              setSelected(p);
              setDeleteOpen(true);
            }}
          />
        ),
        className: "text-right",
      },
    ],
    [openEdit],
  );

  const catOptions = useMemo(
    () => (categories?.data || []).map((c) => ({ label: c.name, value: c.id })),
    [categories],
  );

  const fields: FieldDef[] = [
    { name: "name", label: "Name", required: true },
    { name: "productCode", label: "Product Code (leave blank to auto-generate from category)" },
    { name: "slug", label: "Slug (leave blank to auto-generate)" },
    { name: "categoryId", label: "Category", type: "select", options: catOptions, required: true },
    { name: "mainImage", label: "Main Image", type: "image" },
    { name: "thumbnailImage", label: "Thumbnail Image", type: "image" },
    { name: "images", label: "Gallery Images", type: "images" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "subCategory", label: "Sub Category" },
    { name: "finish", label: "Finish" },
    { name: "size", label: "Size" },
    { name: "origin", label: "Origin" },
    {
      name: "stock",
      label: "Stock",
      type: "select",
      options: [
        { label: "In Stock", value: "In Stock" },
        { label: "Made to Order", value: "Made to Order" },
      ],
    },
    { name: "featured", label: "Featured Product", type: "switch" },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        keyExtractor={(p) => p.id}
        pagination={data?.pagination}
        isLoading={isLoading}
        isError={isError}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search products…"
        onPageChange={setPage}
        actions={
          <Button variant="gold" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        }
      />

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selected ? "Edit Product" : "Create Product"}
        description={selected ? `Editing "${selected.name}"` : "Add a new product to the catalog"}
        fields={fields}
        formData={form}
        onChange={(n, v) => setForm((f) => ({ ...f, [n]: v }))}
        onSubmit={handleSubmit}
        isSubmitting={createMut.isPending || updateMut.isPending}
        isEditing={!!selected}
        size="lg"
      />

      {viewOpen && selected && (
        <ViewDialog open={viewOpen} onOpenChange={setViewOpen} title={selected.name}>
          <div className="space-y-3 text-sm">              {(selected.mainImage || selected.images?.[0]) && (
              <img
                src={selected.mainImage || selected.images[0]}
                alt={selected.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground">Category:</span>{" "}
                <span className="text-foreground font-medium">{selected.category?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Stock:</span>{" "}
                <span className="text-foreground">{selected.stock}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Origin:</span>{" "}
                <span className="text-foreground">{selected.origin || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Finish:</span>{" "}
                <span className="text-foreground">{selected.finish || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Size:</span>{" "}
                <span className="text-foreground">{selected.size || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>{" "}
                <span className="text-foreground">
                  {format(new Date(selected.createdAt), "MMM d, yyyy")}
                </span>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Description:</span>
              <p className="text-foreground mt-1">{selected.description}</p>
            </div>
            {/* Media management */}
            <div className="border-t border-border/40 pt-3">
              <Button
                variant="gold"
                size="sm"
                onClick={() => {
                  setViewOpen(false);
                  setMediaOpen(true);
                }}
              >
                <Images className="h-4 w-4 mr-1" />
                Manage Media
              </Button>
            </div>
          </div>
        </ViewDialog>
      )}

      {/* Product Media Manager Dialog */}
      <CrudDialog
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        title={`Media — ${selected?.name || ""}`}
        description={`Manage images for ${selected?.productCode ? selected.productCode + " — " : ""}${selected?.name || ""}`}
        fields={[]}
        formData={{}}
        onChange={() => {}}
        onSubmit={() => {}}
        size="full"
      >
        {selected && (
          <ProductMediaManager
            productId={selected.id}
            productCode={selected.productCode}
          />
        )}
      </CrudDialog>

      <ConfirmDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteMut.mutate(selected?.id)}
        title={`Delete "${selected?.name}"? This cannot be undone.`}
      />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  CATEGORIES MODULE                                                 */
/* ══════════════════════════════════════════════════════════════════ */
export function CategoriesModule() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const { data, isLoading, isError } = hooks.useCategories();
  const createMut = hooks.useCreateCategory();
  const updateMut = hooks.useUpdateCategory();
  const deleteMut = hooks.useDeleteCategory();

  const openCreate = useCallback(() => {
    setSelected(null);
    setForm({ name: "", featured: false, order: 0 });
    setDialogOpen(true);
  }, []);
  const openEdit = useCallback((item: any) => {
    setSelected(item);
    setForm({
      name: item.name,
      featured: item.featured,
      order: item.order,
      image: item.image || "",
    });
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selected) updateMut.mutate({ id: selected.id, ...form });
    else createMut.mutate(form);
    setDialogOpen(false);
  }, [selected, form, createMut, updateMut]);

  const columns: Column<any>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (c: any) => <span className="font-medium text-foreground">{c.name}</span>,
    },
    {
      key: "slug",
      label: "Slug",
      render: (c: any) => <span className="text-muted-foreground text-xs">{c.slug}</span>,
      hideOnMobile: true,
    },
    {
      key: "products",
      label: "Products",
      render: (c: any) => <span className="text-muted-foreground">{c._count?.products ?? 0}</span>,
    },
    {
      key: "featured",
      label: "Featured",
      render: (c: any) =>
        c.featured ? <Badge className="bg-gold/20 text-gold border-0">Featured</Badge> : "—",
      hideOnMobile: true,
    },
    {
      key: "order",
      label: "Order",
      render: (c: any) => <span className="text-muted-foreground">{c.order}</span>,
      hideOnMobile: true,
    },
    {
      key: "actions",
      label: "",
      render: (c: any) => (
        <ActionButtons
          onView={() => {
            setSelected(c);
            setViewOpen(true);
          }}
          onEdit={() => openEdit(c)}
          onDelete={() => {
            setSelected(c);
            setDeleteOpen(true);
          }}
        />
      ),
      className: "text-right",
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        isError={isError}
        actions={
          <Button variant="gold" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        }
      />
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selected ? "Edit Category" : "Create Category"}
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "image", label: "Category Image", type: "image" },
          { name: "order", label: "Display Order", type: "number" },
          { name: "featured", label: "Featured Category", type: "switch" },
        ]}
        formData={form}
        onChange={(n, v) => setForm((f) => ({ ...f, [n]: v }))}
        onSubmit={handleSubmit}
        isSubmitting={createMut.isPending || updateMut.isPending}
        isEditing={!!selected}
      />
      {viewOpen && selected && (
        <ViewDialog open={viewOpen} onOpenChange={setViewOpen} title={selected.name}>
          <div className="space-y-3 text-sm">
            {selected.image && (
              <img
                src={selected.image}
                alt={selected.name}
                className="w-full h-40 object-cover rounded-lg"
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground">Slug:</span>{" "}
                <span className="text-foreground">{selected.slug}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Order:</span>{" "}
                <span className="text-foreground">{selected.order}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Featured:</span>{" "}
                <span className="text-foreground">{selected.featured ? "Yes" : "No"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Products:</span>{" "}
                <span className="text-foreground">{selected._count?.products ?? 0}</span>
              </div>
            </div>
          </div>
        </ViewDialog>
      )}
      <ConfirmDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteMut.mutate(selected?.id)}
        title={`Delete category "${selected?.name}"?`}
      />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  PROJECTS MODULE                                                   */
/* ══════════════════════════════════════════════════════════════════ */
export function ProjectsModule() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const { data, isLoading, isError } = hooks.useProjects({ page, limit: 10, search });
  const createMut = hooks.useCreateProject();
  const updateMut = hooks.useUpdateProject();
  const deleteMut = hooks.useDeleteProject();

  const openCreate = useCallback(() => {
    setSelected(null);
    setForm({
      title: "",
      description: "",
      location: "",
      year: "",
      architect: "",
      stoneUsed: "",
      status: "Completed",
      featured: false,
    });
    setDialogOpen(true);
  }, []);
  const openEdit = useCallback((item: any) => {
    setSelected(item);
    setForm({
      title: item.title,
      description: item.description,
      location: item.location || "",
      year: item.year || "",
      architect: item.architect || "",
      stoneUsed: item.stoneUsed || "",
      status: item.status,
      featured: item.featured,
    });
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selected) updateMut.mutate({ id: selected.id, ...form });
    else createMut.mutate(form);
    setDialogOpen(false);
  }, [selected, form, createMut, updateMut]);

  const columns: Column<any>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (p: any) => <span className="font-medium text-foreground">{p.title}</span>,
    },
    {
      key: "location",
      label: "Location",
      render: (p: any) => <span className="text-muted-foreground">{p.location || "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "year",
      label: "Year",
      render: (p: any) => <span className="text-muted-foreground">{p.year || "—"}</span>,
    },
    { key: "status", label: "Status", render: (p: any) => <StatusBadge status={p.status} /> },
    {
      key: "featured",
      label: "Featured",
      render: (p: any) =>
        p.featured ? <Badge className="bg-gold/20 text-gold border-0">Featured</Badge> : "—",
      hideOnMobile: true,
    },
    {
      key: "actions",
      label: "",
      render: (p: any) => (
        <ActionButtons
          onView={() => {
            setSelected(p);
            setViewOpen(true);
          }}
          onEdit={() => openEdit(p)}
          onDelete={() => {
            setSelected(p);
            setDeleteOpen(true);
          }}
        />
      ),
      className: "text-right",
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        keyExtractor={(p) => p.id}
        pagination={data?.pagination}
        isLoading={isLoading}
        isError={isError}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search projects…"
        onPageChange={setPage}
        actions={
          <Button variant="gold" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Project
          </Button>
        }
      />
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selected ? "Edit Project" : "Create Project"}
        fields={[
          { name: "title", label: "Title", required: true },
          { name: "gallery", label: "Project Gallery", type: "images" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "location", label: "Location" },
          { name: "year", label: "Year" },
          { name: "architect", label: "Architect" },
          { name: "stoneUsed", label: "Stone Used" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Completed", value: "Completed" },
              { label: "Ongoing", value: "Ongoing" },
              { label: "Planned", value: "Planned" },
            ],
          },
          { name: "featured", label: "Featured Project", type: "switch" },
        ]}
        formData={form}
        onChange={(n, v) => setForm((f) => ({ ...f, [n]: v }))}
        onSubmit={handleSubmit}
        isSubmitting={createMut.isPending || updateMut.isPending}
        isEditing={!!selected}
        size="lg"
      />
      {viewOpen && selected && (
        <ViewDialog open={viewOpen} onOpenChange={setViewOpen} title={selected.title}>
          <div className="space-y-3 text-sm">
            {selected.gallery?.[0] && (
              <img
                src={selected.gallery[0]}
                alt={selected.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground">Location:</span>{" "}
                <span className="text-foreground">{selected.location || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Year:</span>{" "}
                <span className="text-foreground">{selected.year || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Architect:</span>{" "}
                <span className="text-foreground">{selected.architect || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Stone Used:</span>{" "}
                <span className="text-foreground">{selected.stoneUsed || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                <span className="text-foreground">
                  <StatusBadge status={selected.status} />
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>{" "}
                <span className="text-foreground">
                  {format(new Date(selected.createdAt), "MMM d, yyyy")}
                </span>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Description:</span>
              <p className="text-foreground mt-1">{selected.description}</p>
            </div>
          </div>
        </ViewDialog>
      )}
      <ConfirmDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteMut.mutate(selected?.id)}
        title={`Delete project "${selected?.title}"?`}
      />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  BLOGS MODULE                                                      */
/* ══════════════════════════════════════════════════════════════════ */
export function BlogsModule() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const { data, isLoading, isError } = hooks.useBlogs({ page, limit: 10, search });
  const createMut = hooks.useCreateBlog();
  const updateMut = hooks.useUpdateBlog();
  const deleteMut = hooks.useDeleteBlog();

  const openCreate = useCallback(() => {
    setSelected(null);
    setForm({
      title: "",
      excerpt: "",
      content: "",
      cover: "",
      category: "",
      tags: [],
      published: false,
    });
    setDialogOpen(true);
  }, []);
  const openEdit = useCallback((item: any) => {
    setSelected(item);
    setForm({
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      cover: item.cover || "",
      category: item.category || "",
      published: item.published,
    });
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selected) updateMut.mutate({ id: selected.id, ...form });
    else createMut.mutate(form);
    setDialogOpen(false);
  }, [selected, form, createMut, updateMut]);

  const columns: Column<any>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (b: any) => <span className="font-medium text-foreground">{b.title}</span>,
    },
    {
      key: "category",
      label: "Category",
      render: (b: any) => <span className="text-muted-foreground">{b.category || "—"}</span>,
    },
    {
      key: "author",
      label: "Author",
      render: (b: any) => <span className="text-muted-foreground">{b.author?.name || "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "published",
      label: "Status",
      render: (b: any) =>
        b.published ? (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-0">Published</Badge>
        ) : (
          <Badge variant="outline">Draft</Badge>
        ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (b: any) => (
        <span className="text-muted-foreground text-xs">
          {format(new Date(b.createdAt), "MMM d, yyyy")}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      label: "",
      render: (b: any) => (
        <ActionButtons
          onView={() => {
            setSelected(b);
            setViewOpen(true);
          }}
          onEdit={() => openEdit(b)}
          onDelete={() => {
            setSelected(b);
            setDeleteOpen(true);
          }}
        />
      ),
      className: "text-right",
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        keyExtractor={(b) => b.id}
        pagination={data?.pagination}
        isLoading={isLoading}
        isError={isError}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search blogs…"
        onPageChange={setPage}
        actions={
          <Button variant="gold" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Blog
          </Button>
        }
      />
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selected ? "Edit Blog" : "Create Blog"}
        fields={[
          { name: "title", label: "Title", required: true },
          { name: "excerpt", label: "Excerpt", type: "textarea" },
          { name: "content", label: "Content (HTML)", type: "textarea" },
          { name: "cover", label: "Cover Image", type: "image" },
          { name: "category", label: "Category" },
          { name: "published", label: "Published", type: "switch" },
        ]}
        formData={form}
        onChange={(n, v) => setForm((f) => ({ ...f, [n]: v }))}
        onSubmit={handleSubmit}
        isSubmitting={createMut.isPending || updateMut.isPending}
        isEditing={!!selected}
        size="lg"
      />
      <ConfirmDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteMut.mutate(selected?.id)}
        title={`Delete blog "${selected?.title}"?`}
      />
      {viewOpen && selected && (
        <ViewDialog open={viewOpen} onOpenChange={setViewOpen} title={selected.title}>
          <div className="space-y-3 text-sm">
            {selected.cover && (
              <img
                src={selected.cover}
                alt={selected.title}
                className="w-full h-40 object-cover rounded-lg"
              />
            )}
            <p className="text-foreground">{selected.excerpt}</p>
            <div className="flex gap-3 text-muted-foreground">
              <span>Category: {selected.category || "—"}</span>
              <span>Author: {selected.author?.name || "—"}</span>
              <span>{format(new Date(selected.createdAt), "MMM d, yyyy")}</span>
            </div>
          </div>
        </ViewDialog>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  VIDEOS MODULE                                                     */
/* ══════════════════════════════════════════════════════════════════ */
export function VideosModule() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const { data, isLoading, isError } = hooks.useVideos();
  const createMut = hooks.useCreateVideo();
  const updateMut = hooks.useUpdateVideo();
  const deleteMut = hooks.useDeleteVideo();

  const openCreate = useCallback(() => {
    setSelected(null);
    setForm({
      title: "",
      videoUrl: "",
      youtubeUrl: "",
      description: "",
      category: "",
      duration: "",
      featured: false,
      thumbnail: "",
    });
    setDialogOpen(true);
  }, []);
  const openEdit = useCallback((item: any) => {
    setSelected(item);
    setForm({
      title: item.title,
      videoUrl: item.videoUrl || "",
      youtubeUrl: item.youtubeUrl || "",
      description: item.description || "",
      category: item.category || "",
      duration: item.duration || "",
      featured: item.featured,
      thumbnail: item.thumbnail || "",
    });
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selected) updateMut.mutate({ id: selected.id, ...form });
    else createMut.mutate(form);
    setDialogOpen(false);
  }, [selected, form, createMut, updateMut]);

  const columns: Column<any>[] = [
    {
      key: "title",
      label: "Title",
      render: (v: any) => <span className="font-medium text-foreground">{v.title}</span>,
    },
    {
      key: "category",
      label: "Category",
      render: (v: any) => <span className="text-muted-foreground">{v.category || "—"}</span>,
    },
    {
      key: "duration",
      label: "Duration",
      render: (v: any) => <span className="text-muted-foreground">{v.duration || "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "featured",
      label: "Featured",
      render: (v: any) =>
        v.featured ? <Badge className="bg-gold/20 text-gold border-0">Featured</Badge> : "—",
      hideOnMobile: true,
    },
    {
      key: "actions",
      label: "",
      render: (v: any) => (
        <ActionButtons
          onView={() => {
            setSelected(v);
            setViewOpen(true);
          }}
          onEdit={() => openEdit(v)}
          onDelete={() => {
            setSelected(v);
            setDeleteOpen(true);
          }}
        />
      ),
      className: "text-right",
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        keyExtractor={(v) => v.id}
        isLoading={isLoading}
        isError={isError}
        actions={
          <Button variant="gold" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Video
          </Button>
        }
      />
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selected ? "Edit Video" : "Create Video"}
        fields={[
          { name: "title", label: "Title", required: true },
          { name: "videoUrl", label: "Video File (MP4, MOV, WebM)", type: "image" },
          { name: "youtubeUrl", label: "YouTube URL (optional backup)", type: "url" },
          { name: "thumbnail", label: "Thumbnail Image", type: "image" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "category", label: "Category" },
          { name: "duration", label: "Duration (e.g. 3:45)" },
          { name: "featured", label: "Featured Video", type: "switch" },
        ]}
        formData={form}
        onChange={(n, v) => setForm((f) => ({ ...f, [n]: v }))}
        onSubmit={handleSubmit}
        isSubmitting={createMut.isPending || updateMut.isPending}
        isEditing={!!selected}
      />
      <ConfirmDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteMut.mutate(selected?.id)}
        title={`Delete video "${selected?.title}"?`}
      />
      {viewOpen && selected && (
        <ViewDialog open={viewOpen} onOpenChange={setViewOpen} title={selected.title}>
          <div className="space-y-3 text-sm">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {selected.videoUrl ? (
                <video
                  src={selected.videoUrl}
                  poster={selected.thumbnail}
                  controls
                  className="w-full h-full"
                />
              ) : selected.youtubeUrl ? (
                <iframe
                  src={selected.youtubeUrl?.replace("watch?v=", "embed/")}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              ) : (
                <span className="text-muted-foreground text-xs">No video source</span>
              )}
            </div>
            <p className="text-muted-foreground">{selected.description}</p>
            <p>
              Category: {selected.category || "—"} · Duration: {selected.duration || "—"}
            </p>
          </div>
        </ViewDialog>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  DOWNLOADS MODULE                                                  */
/* ══════════════════════════════════════════════════════════════════ */
/* ── Catalog Analytics Card ── */
function CatalogAnalyticsCard() {
  const { data, isLoading } = hooks.useCatalogAnalytics();

  if (isLoading) {
    return (
      <>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card p-5">
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div className="mt-2 h-8 w-16 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="h-5 w-32 rounded bg-muted animate-pulse" />
          <div className="mt-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Catalogs</p>
          <p className="mt-1 font-serif text-2xl text-foreground">{data?.totalCatalogs ?? 0}</p>
          {data?.featuredCatalogs !== undefined && (
            <p className="mt-0.5 text-xs text-gold">{data.featuredCatalogs} featured</p>
          )}
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Downloads</p>
          <p className="mt-1 font-serif text-2xl text-foreground">{data?.totalDownloads ?? 0}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {data?.todayDownloads ?? 0} today · {data?.monthlyDownloads ?? 0} this month
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
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Latest Upload</p>
          <p className="mt-1 font-serif text-lg text-foreground truncate">
            {data?.latestUpload?.title || "—"}
          </p>
          {data?.latestUpload && (
            <p className="text-xs text-muted-foreground">
              {format(new Date(data.latestUpload.createdAt), "MMM d, yyyy")}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Storage Used</p>
          <p className="mt-1 font-serif text-2xl text-foreground">
            {data?.totalStorageFormatted || "0 B"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Supabase Storage</p>
        </div>
      </div>

      {/* Recent Downloads */}
      {data?.recentDownloads && data.recentDownloads.length > 0 && (
        <div className="mb-6 rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-serif text-base text-foreground">Recent Downloads</h4>
            {data.lastDownloadTime && (
              <span className="text-xs text-muted-foreground">
                Last: {format(new Date(data.lastDownloadTime), "MMM d, h:mm a")}
              </span>
            )}
          </div>
          <div className="divide-y divide-border/30">
            {data.recentDownloads.slice(0, 10).map((log, idx) => (
              <div key={log.id} className="flex items-center justify-between py-2.5 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/10 text-[10px] font-medium text-gold">
                    {idx + 1}
                  </span>
                  <span className="text-foreground truncate">{log.download.title}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-3">
                  {format(new Date(log.createdAt), "MMM d, h:mm a")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export function DownloadsModule() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = hooks.useAdminCatalog({ page, limit: 10, search });
  const createMut = hooks.useCreateCatalog();
  const updateMut = hooks.useUpdateCatalog();
  const deleteMut = hooks.useDeleteCatalog();
  const togglePublishMut = hooks.useTogglePublishCatalog();
  const toggleFeatureMut = hooks.useToggleFeatureCatalog();

  const openCreate = useCallback(() => {
    setSelected(null);
    setForm({
      title: "",
      pdf: "",
      coverImage: "",
      description: "",
      category: "",
      fileSize: "",
      featured: false,
      published: false,
    });
    setDialogOpen(true);
  }, []);
  const openEdit = useCallback((item: any) => {
    setSelected(item);
    setForm({
      title: item.title,
      pdf: item.pdf,
      coverImage: item.coverImage || "",
      description: item.description || "",
      category: item.category || "",
      fileSize: item.fileSize || "",
      featured: item.featured,
      published: item.published,
    });
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selected) updateMut.mutate({ id: selected.id, ...form });
    else createMut.mutate(form);
    setDialogOpen(false);
  }, [selected, form, createMut, updateMut]);

  const columns: Column<any>[] = [
    {
      key: "title",
      label: "Title",
      render: (d: any) => (
        <div className="flex items-center gap-3">
          {d.coverImage ? (
            <img
              src={d.coverImage}
              alt={d.title}
              className="h-10 w-10 rounded-md object-cover shrink-0"
            />
          ) : (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-gold/10 text-gold text-xs font-medium">
              {d.title?.charAt(0)?.toUpperCase() || "D"}
            </span>
          )}
          <div className="min-w-0">
            <span className="font-medium text-foreground truncate block max-w-[200px]">
              {d.title}
            </span>
            {d.fileSize && <span className="text-xs text-muted-foreground">{d.fileSize}</span>}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (d: any) => <span className="text-muted-foreground">{d.category || "—"}</span>,
    },
    {
      key: "published",
      label: "Status",
      render: (d: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePublishMut.mutate(d.id);
          }}
          disabled={togglePublishMut.isPending}
          className="inline-flex items-center gap-1.5"
        >
          {d.published ? (
            <Badge className="bg-emerald-500/15 text-emerald-600 border-0 cursor-pointer hover:bg-emerald-500/25">
              Published
            </Badge>
          ) : (
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Draft
            </Badge>
          )}
        </button>
      ),
    },
    {
      key: "featured",
      label: "Featured",
      render: (d: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFeatureMut.mutate(d.id);
          }}
          disabled={toggleFeatureMut.isPending}
        >
          {d.featured ? (
            <Badge className="bg-gold/20 text-gold border-0 cursor-pointer hover:bg-gold/30">
              Featured
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
              Set Featured
            </span>
          )}
        </button>
      ),
      hideOnMobile: true,
    },
    {
      key: "downloadCount",
      label: "Downloads",
      render: (d: any) => (
        <span className="text-muted-foreground text-xs">{d.downloadCount ?? 0}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "createdAt",
      label: "Created",
      render: (d: any) => (
        <span className="text-muted-foreground text-xs">
          {format(new Date(d.createdAt), "MMM d, yyyy")}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      label: "",
      render: (d: any) => (
        <ActionButtons
          onView={() => {
            setSelected(d);
            setViewOpen(true);
          }}
          onEdit={() => openEdit(d)}
          onDelete={() => {
            setSelected(d);
            setDeleteOpen(true);
          }}
        />
      ),
      className: "text-right",
    },
  ];

  return (
    <>
      <CatalogAnalyticsCard />

      <DataTable
        columns={columns}
        data={data?.data || []}
        keyExtractor={(d) => d.id}
        isLoading={isLoading}
        isError={isError}
        pagination={data?.pagination}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search catalogs…"
        actions={
          <Button variant="gold" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Catalog
          </Button>
        }
      />

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selected ? "Edit Catalog" : "Create Catalog"}
        fields={[
          { name: "title", label: "Title", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "category", label: "Category" },
          { name: "coverImage", label: "Cover Image", type: "image" },
          { name: "pdf", label: "PDF File", type: "image" },
          { name: "fileSize", label: "File Size (e.g. 2.4 MB)" },
          { name: "published", label: "Published", type: "switch" },
          { name: "featured", label: "Featured", type: "switch" },
        ]}
        formData={form}
        onChange={(n, v) => setForm((f) => ({ ...f, [n]: v }))}
        onSubmit={handleSubmit}
        isSubmitting={createMut.isPending || updateMut.isPending}
        isEditing={!!selected}
        size="lg"
      />

      <ConfirmDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteMut.mutate(selected?.id)}
        title={`Delete catalog "${selected?.title}"? This will also remove the PDF file.`}
      />

      {/* View Dialog */}
      {viewOpen && selected && (
        <ViewDialog open={viewOpen} onOpenChange={setViewOpen} title={selected.title}>
          <div className="space-y-4 text-sm">
            {selected.coverImage && (
              <img
                src={selected.coverImage}
                alt={selected.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground">Category:</span>{" "}
                <span className="text-foreground">{selected.category || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">File Size:</span>{" "}
                <span className="text-foreground">{selected.fileSize || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Downloads:</span>{" "}
                <span className="text-foreground">{selected.downloadCount ?? 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Download Logs:</span>{" "}
                <span className="text-foreground">{selected._count?.logs ?? 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Published:</span>{" "}
                <span className="text-foreground">{selected.published ? "Yes" : "No"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>{" "}
                <span className="text-foreground">
                  {format(new Date(selected.createdAt), "MMM d, yyyy")}
                </span>
              </div>
            </div>
            {selected.description && (
              <div>
                <p className="text-muted-foreground mb-1">Description:</p>
                <p className="text-foreground">{selected.description}</p>
              </div>
            )}
            {selected.pdf && (
              <div className="border-t border-border/40 pt-3">
                <a
                  href={selected.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
                >
                  <DownloadIcon className="h-4 w-4" />
                  View PDF
                </a>
              </div>
            )}
          </div>
        </ViewDialog>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  TESTIMONIALS MODULE                                               */
/* ══════════════════════════════════════════════════════════════════ */
export function TestimonialsModule() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const { data, isLoading, isError } = hooks.useTestimonials();
  const createMut = hooks.useCreateTestimonial();
  const updateMut = hooks.useUpdateTestimonial();
  const deleteMut = hooks.useDeleteTestimonial();

  const openCreate = useCallback(() => {
    setSelected(null);
    setForm({ client: "", review: "", rating: 5, company: "", designation: "", featured: false });
    setDialogOpen(true);
  }, []);
  const openEdit = useCallback((item: any) => {
    setSelected(item);
    setForm({
      client: item.client,
      review: item.review,
      rating: item.rating,
      company: item.company || "",
      designation: item.designation || "",
      featured: item.featured,
    });
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selected) updateMut.mutate({ id: selected.id, ...form });
    else createMut.mutate(form);
    setDialogOpen(false);
  }, [selected, form, createMut, updateMut]);

  const columns: Column<any>[] = [
    {
      key: "client",
      label: "Client",
      render: (t: any) => <span className="font-medium text-foreground">{t.client}</span>,
    },
    {
      key: "company",
      label: "Company",
      render: (t: any) => <span className="text-muted-foreground">{t.company || "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "rating",
      label: "Rating",
      render: (t: any) => (
        <span className="text-gold">
          {"★".repeat(t.rating)}
          {"☆".repeat(5 - t.rating)}
        </span>
      ),
    },
    {
      key: "featured",
      label: "Featured",
      render: (t: any) =>
        t.featured ? <Badge className="bg-gold/20 text-gold border-0">Featured</Badge> : "—",
      hideOnMobile: true,
    },
    {
      key: "actions",
      label: "",
      render: (t: any) => (
        <ActionButtons
          onView={() => {
            setSelected(t);
            setViewOpen(true);
          }}
          onEdit={() => openEdit(t)}
          onDelete={() => {
            setSelected(t);
            setDeleteOpen(true);
          }}
        />
      ),
      className: "text-right",
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        keyExtractor={(t) => t.id}
        isLoading={isLoading}
        isError={isError}
        actions={
          <Button variant="gold" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Testimonial
          </Button>
        }
      />
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selected ? "Edit Testimonial" : "Create Testimonial"}
        fields={[
          { name: "client", label: "Client Name", required: true },
          { name: "designation", label: "Designation" },
          { name: "company", label: "Company" },
          { name: "photo", label: "Client Photo", type: "image" },
          { name: "review", label: "Review", type: "textarea", required: true },
          { name: "rating", label: "Rating (1-5)", type: "number" },
          { name: "featured", label: "Featured Testimonial", type: "switch" },
        ]}
        formData={form}
        onChange={(n, v) => setForm((f) => ({ ...f, [n]: v }))}
        onSubmit={handleSubmit}
        isSubmitting={createMut.isPending || updateMut.isPending}
        isEditing={!!selected}
      />
      <ConfirmDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteMut.mutate(selected?.id)}
        title={`Delete testimonial from "${selected?.client}"?`}
      />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  CONTACT MESSAGES MODULE — New / Read / Archived                   */
/* ══════════════════════════════════════════════════════════════════ */
export function ContactModule() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const { data, isLoading, isError } = hooks.useContacts(statusFilter || undefined, page);
  const updateMut = hooks.useUpdateContactStatus();
  const deleteMut = hooks.useDeleteContact();

  const columns: Column<any>[] = [
    {
      key: "name",
      label: "Name",
      render: (c: any) => (
        <div className="flex items-center gap-2">
          {c.status === "Unread" && <span className="h-2 w-2 rounded-full bg-gold shrink-0" />}
          <span
            className={`font-medium ${c.status === "Unread" ? "text-foreground" : "text-foreground/70"}`}
          >
            {c.name}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (c: any) => <span className="text-muted-foreground text-xs">{c.email}</span>,
    },
    {
      key: "company",
      label: "Company",
      render: (c: any) => <span className="text-muted-foreground">{c.company || "—"}</span>,
      hideOnMobile: true,
    },
    { key: "status", label: "Status", render: (c: any) => <StatusBadge status={c.status} /> },
    {
      key: "createdAt",
      label: "Date",
      render: (c: any) => (
        <span className="text-muted-foreground text-xs">
          {format(new Date(c.createdAt), "MMM d, yyyy")}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      label: "",
      render: (c: any) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setSelected(c);
              setViewOpen(true);
              if (c.status === "Unread") updateMut.mutate({ id: c.id, status: "Read" });
            }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="View"
          >
            <Eye className="h-3.5 w-3.5" />
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
      className: "text-right",
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        isError={isError}
        pagination={data?.pagination}
        onPageChange={setPage}
        filters={
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">All Messages</option>
            <option value="Unread">Unread ({data?.meta?.unread ?? 0})</option>
            <option value="Read">Read</option>
            <option value="Archived">Archived ({data?.meta?.archived ?? 0})</option>
          </select>
        }
      />
      <ConfirmDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteMut.mutate(selected?.id)}
      />
      {viewOpen && selected && (
        <ViewDialog
          open={viewOpen}
          onOpenChange={setViewOpen}
          title={`Message from ${selected.name}`}
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground">Name:</span>{" "}
                <span className="text-foreground">{selected.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                <span className="text-foreground">{selected.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>{" "}
                <span className="text-foreground">{selected.phone || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Company:</span>{" "}
                <span className="text-foreground">{selected.company || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                <StatusBadge status={selected.status} />
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>{" "}
                <span className="text-foreground">
                  {format(new Date(selected.createdAt), "MMM d, yyyy h:mm a")}
                </span>
              </div>
            </div>
            <div className="border-t border-border/40 pt-3">
              <p className="text-muted-foreground mb-2">Message:</p>
              <p className="text-foreground whitespace-pre-wrap">{selected.message}</p>
            </div>
            {/* Quick actions */}
            <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateMut.mutate({ id: selected.id, status: "Archived" })}
              >
                Archive
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateMut.mutate({ id: selected.id, status: "Unread" })}
              >
                Mark as Unread
              </Button>
            </div>
          </div>
        </ViewDialog>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  RFQs MODULE — Pending / Quoted / Negotiation / Completed / Cancelled */
/* ══════════════════════════════════════════════════════════════════ */
export function RFQModule() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewOpen, setViewOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("Quoted");

  const { data, isLoading, isError } = hooks.useRFQs(statusFilter || undefined, page);
  const updateMut = hooks.useUpdateRFQStatus();
  const replyMut = hooks.useReplyRFQ();
  const deleteMut = hooks.useDeleteRFQ();

  const openReply = useCallback((item: any) => {
    setSelected(item);
    setReplyText(item.adminReply || "");
    setReplyStatus(item.status === "Pending" ? "Quoted" : item.status);
    setReplyOpen(true);
  }, []);

  const handleSendReply = useCallback(() => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply message");
      return;
    }
    replyMut.mutate({ id: selected.id, adminReply: replyText.trim(), status: replyStatus });
    setReplyOpen(false);
  }, [selected, replyText, replyStatus, replyMut]);

  const columns: Column<any>[] = [
    {
      key: "customer",
      label: "Customer",
      render: (r: any) => (
        <div>
          <span className="font-medium text-foreground">{r.user?.name || r.email}</span>
          {r.company && <span className="text-muted-foreground text-xs ml-2">({r.company})</span>}
        </div>
      ),
    },
    {
      key: "country",
      label: "Country",
      render: (r: any) => <span className="text-muted-foreground">{r.country || "—"}</span>,
    },
    {
      key: "products",
      label: "Products",
      render: (r: any) => (
        <span className="text-muted-foreground text-xs">{(r.products || []).length} item(s)</span>
      ),
      hideOnMobile: true,
    },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
    {
      key: "reply",
      label: "Reply",
      render: (r: any) =>
        r.adminReply ? (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-0">Replied</Badge>
        ) : (
          <Badge variant="outline">—</Badge>
        ),
      hideOnMobile: true,
    },
    {
      key: "createdAt",
      label: "Date",
      render: (r: any) => (
        <span className="text-muted-foreground text-xs">
          {format(new Date(r.createdAt), "MMM d, yyyy")}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      label: "",
      render: (r: any) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setSelected(r);
              setViewOpen(true);
            }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="View"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => openReply(r)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Reply"
          >
            <Reply className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setSelected(r);
              setDeleteOpen(true);
            }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-red-500"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        pagination={data?.pagination}
        onPageChange={setPage}
        filters={
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending ({data?.meta?.pending ?? 0})</option>
            <option value="Quoted">Quoted</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        }
      />

      {/* View Dialog */}
      {viewOpen && selected && (
        <ViewDialog
          open={viewOpen}
          onOpenChange={setViewOpen}
          title={`RFQ from ${selected.user?.name || selected.email}`}
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground">Contact:</span>{" "}
                <span className="text-foreground">{selected.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>{" "}
                <span className="text-foreground">{selected.phone || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Company:</span>{" "}
                <span className="text-foreground">{selected.company || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Country:</span>{" "}
                <span className="text-foreground">{selected.country || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                <StatusBadge status={selected.status} />
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>{" "}
                <span className="text-foreground">
                  {format(new Date(selected.createdAt), "MMM d, yyyy")}
                </span>
              </div>
            </div>

            {selected.products?.length > 0 && (
              <div className="border-t border-border/40 pt-3">
                <p className="text-muted-foreground mb-2">Products of Interest:</p>
                <ul className="list-disc list-inside text-foreground space-y-1">
                  {selected.products.map((p: string, i: number) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* File Attachments */}
            {selected.attachments?.length > 0 && (
              <div className="border-t border-border/40 pt-3">
                <p className="text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5" /> Attachments ({selected.attachments.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selected.attachments.map((url: string, i: number) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-gold/30"
                    >
                      <DownloadIcon className="h-3 w-3" />
                      {url.split("/").pop()?.slice(0, 30) || `File ${i + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-border/40 pt-3">
              <p className="text-muted-foreground mb-2">Message:</p>
              <p className="text-foreground whitespace-pre-wrap">{selected.message}</p>
            </div>

            {/* Admin Reply */}
            {selected.adminReply && (
              <div className="border-t border-border/40 pt-3">
                <p className="text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5" /> Admin Reply
                  {selected.repliedAt && (
                    <span className="text-xs">
                      · {format(new Date(selected.repliedAt), "MMM d, yyyy h:mm a")}
                    </span>
                  )}
                </p>
                <div className="rounded-lg border-l-2 border-gold bg-muted/30 px-4 py-3 text-foreground whitespace-pre-wrap">
                  {selected.adminReply}
                </div>
              </div>
            )}
          </div>
        </ViewDialog>
      )}

      {/* Reply Dialog */}
      <CrudDialog
        open={replyOpen}
        onOpenChange={setReplyOpen}
        title={`Reply to ${selected?.user?.name || selected?.email || "RFQ"}`}
        description="Send a quotation or message to the customer. They will receive an email notification."
        fields={[
          {
            name: "replyStatus",
            label: "Update Status",
            type: "select",
            options: [
              { label: "Pending", value: "Pending" },
              { label: "Quoted", value: "Quoted" },
              { label: "Negotiation", value: "Negotiation" },
              { label: "Completed", value: "Completed" },
              { label: "Cancelled", value: "Cancelled" },
            ],
          },
          { name: "replyMessage", label: "Reply / Quotation", type: "textarea", required: true },
        ]}
        formData={{ replyStatus, replyMessage: replyText }}
        onChange={(n, v) => {
          if (n === "replyStatus") setReplyStatus(v);
          if (n === "replyMessage") setReplyText(v);
        }}
        onSubmit={handleSendReply}
        isSubmitting={replyMut.isPending}
        isEditing
        size="lg"
      />

      <ConfirmDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteMut.mutate(selected?.id)}
      />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  SUBSCRIBERS MODULE                                                */
/* ══════════════════════════════════════════════════════════════════ */
export function SubscribersModule() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const { data, isLoading, isError } = hooks.useSubscribers();
  const deleteMut = hooks.useDeleteSubscriber();

  const columns: Column<any>[] = [
    {
      key: "email",
      label: "Email",
      render: (s: any) => <span className="font-medium text-foreground">{s.email}</span>,
    },
    {
      key: "active",
      label: "Status",
      render: (s: any) =>
        s.active ? (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-0">Active</Badge>
        ) : (
          <Badge variant="outline">Inactive</Badge>
        ),
    },
    {
      key: "createdAt",
      label: "Subscribed",
      render: (s: any) => (
        <span className="text-muted-foreground text-xs">
          {format(new Date(s.createdAt), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (s: any) => (
        <ActionButtons
          onDelete={() => {
            setSelected(s);
            setDeleteOpen(true);
          }}
        />
      ),
      className: "text-right",
    },
  ];

  return (
    <>
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Mail className="h-4 w-4" />
        <span>
          Total active subscribers: <strong className="text-foreground">{data?.total ?? 0}</strong>
        </span>
      </div>
      <DataTable
        columns={columns}
        data={data?.data || []}
        keyExtractor={(s) => s.id}
        isLoading={isLoading}
        isError={isError}
      />
      <ConfirmDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteMut.mutate(selected?.id)}
        title={`Remove subscriber "${selected?.email}"?`}
      />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  USERS MODULE                                                      */
/* ══════════════════════════════════════════════════════════════════ */
export function UsersModule() {
  const [page, setPage] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const { data, isLoading, isError } = hooks.useAdminUsers({ page, limit: 15 });
  const updateMut = hooks.useUpdateUserRole();
  const deleteMut = hooks.useDeleteUser();
  const { user: currentUser } = useAuth();

  const openEdit = useCallback((item: any) => {
    setSelected(item);
    setForm({ role: item.role });
    setEditOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    updateMut.mutate({ id: selected.id, role: form.role });
    setEditOpen(false);
  }, [selected, form, updateMut]);

  const columns: Column<any>[] = [
    {
      key: "name",
      label: "Name",
      render: (u: any) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-xs font-semibold text-gold">
            {u.name.charAt(0)}
          </div>
          <span className="font-medium text-foreground">{u.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (u: any) => <span className="text-muted-foreground text-xs">{u.email}</span>,
    },
    {
      key: "role",
      label: "Role",
      render: (u: any) => (
        <Badge className={u.role === "ADMIN" ? "bg-gold/20 text-gold border-0" : ""}>
          {u.role}
        </Badge>
      ),
    },
    {
      key: "verified",
      label: "Verified",
      render: (u: any) =>
        u.isVerified ? (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-0">Yes</Badge>
        ) : (
          <Badge variant="outline">No</Badge>
        ),
      hideOnMobile: true,
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (u: any) => (
        <span className="text-muted-foreground text-xs">
          {format(new Date(u.createdAt), "MMM d, yyyy")}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      label: "",
      render: (u: any) =>
        currentUser?.id !== u.id ? (
          <ActionButtons
            onEdit={() => openEdit(u)}
            onDelete={() => {
              setSelected(u);
              setDeleteOpen(true);
            }}
          />
        ) : (
          <span className="text-xs text-muted-foreground italic">You</span>
        ),
      className: "text-right",
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        keyExtractor={(u) => u.id}
        pagination={data?.pagination}
        isLoading={isLoading}
        isError={isError}
        onPageChange={setPage}
      />
      <CrudDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit User Role"
        description={`Change role for ${selected?.name}`}
        fields={[
          {
            name: "role",
            label: "Role",
            type: "select",
            options: [
              { label: "Admin", value: "ADMIN" },
              { label: "Dealer", value: "DEALER" },
              { label: "Architect", value: "ARCHITECT" },
              { label: "Customer", value: "CUSTOMER" },
            ],
          },
        ]}
        formData={form}
        onChange={(n, v) => setForm((f) => ({ ...f, [n]: v }))}
        onSubmit={handleSubmit}
        isSubmitting={updateMut.isPending}
        isEditing
      />
      <ConfirmDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteMut.mutate(selected?.id)}
        title={`Delete user "${selected?.name}"? Cannot delete admin users.`}
      />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  SETTINGS MODULE                                                   */
/* ══════════════════════════════════════════════════════════════════ */
/* ── Media Library ── */
export { MediaLibraryModule } from "./media-library";

/* ══════════════════════════════════════════════════════════════════ */
/*  CATALOG GENERATOR MODULE                                         */
/* ══════════════════════════════════════════════════════════════════ */
export { CatalogGeneratorModule } from "./catalog-generator";

/* ══════════════════════════════════════════════════════════════════ */
/*  CATALOG TEMPLATES MODULE                                         */
/* ══════════════════════════════════════════════════════════════════ */
export { CatalogTemplatesModule } from "./catalog-templates";

export function SettingsModule() {
  const { data, isLoading, isError } = hooks.useSettings();
  const updateMut = hooks.useUpdateSettings();
  const [form, setForm] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  if (data && !initialized) {
    setForm(data);
    setInitialized(true);
  }

  const handleSave = useCallback(() => {
    updateMut.mutate(form);
  }, [form, updateMut]);

  const fields: FieldDef[] = [
    { name: "site_name", label: "Site Name" },
    { name: "site_description", label: "Site Description", type: "textarea" },
    { name: "contact_email", label: "Contact Email", type: "email" },
    { name: "contact_phone", label: "Contact Phone" },
    { name: "address", label: "Address", type: "textarea" },
    { name: "social_facebook", label: "Facebook URL", type: "url" },
    { name: "social_instagram", label: "Instagram URL", type: "url" },
    { name: "social_linkedin", label: "LinkedIn URL", type: "url" },
    { name: "social_youtube", label: "YouTube URL", type: "url" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading settings…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <Settings className="h-8 w-8" />
        </div>
        <div>
          <h3 className="font-serif text-xl text-foreground">Failed to load settings</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">Could not connect to the backend.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl border border-border/60 bg-card p-6 space-y-5">
        <h3 className="font-serif text-lg text-foreground">Site Settings</h3>
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label className="text-sm font-medium text-foreground">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea
                value={form[field.name] || ""}
                onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground resize-y min-h-[60px]"
                rows={3}
              />
            ) : (
              <input
                type={field.type || "text"}
                value={form[field.name] || ""}
                onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            )}
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <Button variant="gold" onClick={handleSave} disabled={updateMut.isPending}>
            {updateMut.isPending ? "Saving…" : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
