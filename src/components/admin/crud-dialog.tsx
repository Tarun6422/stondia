/* ------------------------------------------------------------------ */
/*  CrudDialog — reusable create/edit form dialog                      */
/* ------------------------------------------------------------------ */
import { useCallback, type ReactNode } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageUploader, ImageUploaderMultiple } from "./image-uploader";

export type CrudDialogChildren = { children?: ReactNode };

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "textarea" | "switch" | "select" | "url" | "image" | "images";
  placeholder?: string;
  required?: boolean;
  className?: string;
  options?: { label: string; value: string }[];  // for select type
  render?: (value: any, onChange: (v: any) => void) => ReactNode;
};

type CrudDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FieldDef[];
  formData: Record<string, any>;
  onChange: (field: string, value: any) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
};

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-6xl",
};

export function CrudDialog({
  open, onOpenChange, title, description,
  fields, formData, onChange, onSubmit,
  isSubmitting, isEditing, size = "md",
  children,
}: CrudDialogProps & { children?: ReactNode }) {
  const handleChange = useCallback(
    (name: string, value: any) => onChange(name, value),
    [onChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-h-[85vh] overflow-y-auto", sizeClasses[size])}>
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {fields.length > 0 ? fields.map((field) => {
            const value = formData[field.name] ?? "";
            const setVal = (v: any) => handleChange(field.name, v);

            if (field.type === "image") {
              /* Map field names to Supabase storage folders */
              const folderMap: Record<string, string> = {
                cover: "blogs",
                thumbnail: "videos",
                photo: "testimonials",
                image: "categories",
                pdf: "downloads",
                avatar: "avatars",
              };
              const targetFolder = folderMap[field.name] || field.name;
              return (
                <div key={field.name} className={cn("space-y-2", field.className)}>
                  <ImageUploader
                    value={value}
                    onChange={setVal}
                    folder={targetFolder}
                    label={field.label}
                    required={field.required}
                  />
                </div>
              );
            }

            if (field.type === "images") {
              const folderMap: Record<string, string> = {
                images: "products",
                gallery: "projects",
              };
              const targetFolder = folderMap[field.name] || field.name;
              return (
                <div key={field.name} className={cn("space-y-2", field.className)}>
                  <ImageUploaderMultiple
                    values={Array.isArray(value) ? value : []}
                    onChange={setVal}
                    folder={targetFolder}
                    label={field.label}
                  />
                </div>
              );
            }

            if (field.render) {
              return <div key={field.name}>{field.render(value, setVal)}</div>;
            }

            if (field.type === "select") {
              return (
                <div key={field.name} className={cn("space-y-2", field.className)}>
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="ml-1 text-destructive">*</span>}
                  </Label>
                  <select
                    id={field.name}
                    value={value}
                    onChange={(e) => setVal(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              );
            }

            if (field.type === "textarea") {
              return (
                <div key={field.name} className={cn("space-y-2", field.className)}>
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="ml-1 text-destructive">*</span>}
                  </Label>
                  <textarea
                    id={field.name}
                    value={value}
                    onChange={(e) => setVal(e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground resize-y min-h-[80px]"
                  />
                </div>
              );
            }

            if (field.type === "switch") {
              return (
                <div key={field.name} className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!value}
                    onClick={() => setVal(!value)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      value ? "bg-gold" : "bg-input",
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform",
                      value ? "translate-x-4" : "translate-x-0",
                    )} />
                  </button>
                  <Label>{field.label}</Label>
                </div>
              );
            }

            return (
              <div key={field.name} className={cn("space-y-2", field.className)}>
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="ml-1 text-destructive">*</span>}
                </Label>
                <Input
                  id={field.name}
                  type={field.type || "text"}
                  value={value}
                  onChange={(e) => setVal(field.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
                  placeholder={field.placeholder}
                />
              </div>
            );
          }) : children || null}
        </div>

        <div className="flex justify-end gap-3 border-t border-border/60 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="gold" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
