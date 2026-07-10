/* ------------------------------------------------------------------ */
/*  MediaPickerDialog — WordPress-style media picker modal             */
/*  Used by other admin modules to select images/videos from library   */
/* ------------------------------------------------------------------ */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Image as ImageIcon, Video, FileText, Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import * as hooks from "./admin-hooks";

type MediaPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  filterType?: "image" | "video" | "pdf";
  title?: string;
};

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  filterType,
  title = "Select Media",
}: MediaPickerDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const { data, isLoading } = hooks.useMediaLibrary({
    limit: 50,
    search,
    type: filterType || undefined,
  });

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      setSelectedUrl(null);
      setSearch("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setSelectedUrl(null);
          setSearch("");
        }
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
          <DialogDescription>
            Select media from the library. Use the search bar to filter.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media…"
            className="pl-9"
          />
        </div>

        {/* Media grid */}
        <div className="flex-1 overflow-y-auto min-h-[300px]">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : !data?.data?.length ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No media found in the library.</p>
              <p className="text-xs text-muted-foreground/60">
                Upload files in Media Library first.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {data.data.map((item) => {
                const isImage = item.mimeType.startsWith("image/");
                const isVideo = item.mimeType.startsWith("video/");
                const isSelected = selectedUrl === item.url;

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedUrl(item.url)}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-lg border-2 transition-all",
                      isSelected
                        ? "border-gold ring-1 ring-gold"
                        : "border-border/60 hover:border-gold/40 hover:shadow-sm",
                    )}
                  >
                    {/* Thumbnail */}
                    {isImage ? (
                      <img
                        src={item.url}
                        alt={item.originalName}
                        className="h-full w-full object-cover"
                      />
                    ) : isVideo ? (
                      <div className="flex h-full items-center justify-center bg-muted">
                        <Video className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted">
                        <FileText className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-gold/10 flex items-center justify-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-white">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}

                    {/* File name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[0.6rem] text-white truncate">{item.originalName}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-4">
          <p className="text-xs text-muted-foreground">
            {selectedUrl ? "1 file selected" : "No file selected"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUrl(null);
                onOpenChange(false);
                setSearch("");
              }}
            >
              Cancel
            </Button>
            <Button variant="gold" onClick={handleSelect} disabled={!selectedUrl}>
              <Check className="h-4 w-4 mr-1" /> Select
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
