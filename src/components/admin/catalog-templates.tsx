/* ------------------------------------------------------------------ */
/*  Catalog Templates Module — Manage catalog template definitions    */
/* ------------------------------------------------------------------ */
import { useState, useCallback, useMemo } from "react";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Package,
  FolderTree,
  FileCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "./data-table";
import { CrudDialog, type FieldDef } from "./crud-dialog";
import * as hooks from "./admin-hooks";
import { format } from "date-fns";

const TEMPLATE_TYPES: { label: string; value: string }[] = [
  { label: "Master", value: "master" },
  { label: "Category", value: "category" },
  { label: "Product", value: "product" },
  { label: "Brochure", value: "brochure" },
  { label: "Technical", value: "technical" },
  { label: "Datasheet", value: "datasheet" },
  { label: "Guide", value: "guide" },
  { label: "Certificate", value: "certificate" },
];

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    master: "bg-purple-500/15 text-purple-600",
    category: "bg-blue-500/15 text-blue-600",
    product: "bg-gold/20 text-gold",
    brochure: "bg-emerald-500/15 text-emerald-600",
    technical: "bg-cyan-500/15 text-cyan-600",
    datasheet: "bg-amber-500/15 text-amber-600",
    guide: "bg-rose-500/15 text-rose-600",
    certificate: "bg-indigo-500/15 text-indigo-600",
  };
  return (
    <Badge className={`${colors[type] || "bg-muted text-muted-foreground"} border-0`}>
      {type}
    </Badge>
  );
}

export function CatalogTemplatesModule() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const { data, isLoading, isError } = hooks.useCatalogTemplates();
  const createMut = hooks.useCreateCatalogTemplate();
  const updateMut = hooks.useUpdateCatalogTemplate();
  const deleteMut = hooks.useDeleteCatalogTemplate();

  const openCreate = useCallback(() => {
    setSelected(null);
    setForm({ name: "", description: "", type: "brochure", icon: "FileText" });
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((item: any) => {
    setSelected(item);
    setForm({
      name: item.name,
      description: item.description || "",
      type: item.type,
      icon: item.icon || "FileText",
    });
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selected) updateMut.mutate({ id: selected.id, ...form });
    else createMut.mutate(form);
    setDialogOpen(false);
  }, [selected, form, createMut, updateMut]);

  const columns: Column<any>[] = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        render: (t: any) => (
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <FileText className="h-4 w-4" />
            </span>
            <span className="font-medium text-foreground">{t.name}</span>
          </div>
        ),
      },
      { key: "type", label: "Type", render: (t: any) => <TypeBadge type={t.type} /> },
      {
        key: "description",
        label: "Description",
        render: (t: any) => (
          <span className="text-muted-foreground text-xs line-clamp-1">
            {t.description || "—"}
          </span>
        ),
        hideOnMobile: true,
      },
      {
        key: "catalogs",
        label: "In Use",
        render: (t: any) => (
          <span className="text-muted-foreground">{t._count?.catalogs ?? 0}</span>
        ),
        hideOnMobile: true,
      },
      {
        key: "createdAt",
        label: "Created",
        render: (t: any) => (
          <span className="text-muted-foreground text-xs">
            {format(new Date(t.createdAt), "MMM d, yyyy")}
          </span>
        ),
        hideOnMobile: true,
      },
      {
        key: "actions",
        label: "",
        className: "text-right",
        render: (t: any) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => openEdit(t)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setSelected(t);
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
    [openEdit],
  );

  const fields: FieldDef[] = [
    { name: "name", label: "Template Name", required: true },
    {
      name: "type",
      label: "Catalog Type",
      type: "select",
      options: TEMPLATE_TYPES,
      required: true,
    },
    { name: "description", label: "Description", type: "textarea" },
    { name: "icon", label: "Icon Name (lucide-react)" },
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
            <Plus className="h-4 w-4" /> Add Template
          </Button>
        }
      />

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selected ? "Edit Template" : "Create Template"}
        description={
          selected
            ? `Editing "${selected.name}"`
            : "Define a new catalog template type"
        }
        fields={fields}
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
        title={`Delete template "${selected?.name}"?`}
      />
    </>
  );
}

/* ── Simple Confirm Delete Dialog ── */
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
