/* ------------------------------------------------------------------ */
/*  Inline PDF Viewer — Zoom, fullscreen, print, download, thumbs     */
/*  Uses browser-native iframe with fallback for maximum compatibility */
/* ------------------------------------------------------------------ */
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  Printer,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ── Props ── */
export type PDFViewerProps = {
  url: string;
  title?: string;
  onClose?: () => void;
  /** Show in full-page overlay mode vs. inline */
  overlay?: boolean;
  /** Initial zoom level (1 = 100%) */
  defaultZoom?: number;
};

/* ── Zoom presets ── */
const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

/* ── PDF Viewer ── */
export function PDFViewer({
  url,
  title,
  onClose,
  overlay = false,
  defaultZoom = 1,
}: PDFViewerProps) {
  const [zoom, setZoom] = useState(defaultZoom);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageNum, setPageNum] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset loading when URL changes; add timeout fallback
  useEffect(() => {
    setLoading(true);
    setZoom(defaultZoom);
    const timer = setTimeout(() => setLoading(false), 10000);
    return () => clearTimeout(timer);
  }, [url, defaultZoom]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Only handle when viewer is focused
      if (e.key === "Escape" && onClose && fullscreen) {
        toggleFullscreen();
      }
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      }
      if (e.key === "-") {
        e.preventDefault();
        zoomOut();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, fullscreen]);

  const zoomIn = useCallback(() => {
    setZoom((z) => {
      const next = ZOOM_STEPS.find((s) => s > z);
      return next ?? MAX_ZOOM;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => {
      const next = [...ZOOM_STEPS].reverse().find((s) => s < z);
      return next ?? MIN_ZOOM;
    });
  }, []);

  const zoomReset = useCallback(() => {
    setZoom(1);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const handlePrint = useCallback(() => {
    // Use iframe's print when available
    try {
      iframeRef.current?.contentWindow?.print();
    } catch {
      // Fallback: open PDF in new window for printing
      window.open(url, "_blank");
    }
  }, [url]);

  const handleDownload = useCallback(() => {
    const a = document.createElement("a");
    a.href = url;
    a.download = title ? `${title.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf` : "document.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [url, title]);

  const zoomPercent = Math.round(zoom * 100);

  const viewerContent = (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col bg-muted/30 rounded-xl border border-border/60 overflow-hidden",
        overlay ? "" : "min-h-[500px]",
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-border/40 bg-card px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <button
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={zoomReset}
            className="min-w-[3.5rem] rounded-md px-2 py-1 text-xs font-medium tabular-nums text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Reset zoom"
          >
            {zoomPercent}%
          </button>
          <button
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <span className="mx-2 h-5 w-px bg-border/60" />
        </div>

        <div className="flex items-center gap-1">
          {/* Print */}
          <button
            onClick={handlePrint}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Print"
          >
            <Printer className="h-4 w-4" />
          </button>
          {/* Download */}
          <button
            onClick={handleDownload}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {fullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
          {/* Close overlay */}
          {overlay && onClose && (
            <>
              <span className="mx-1 h-5 w-px bg-border/60" />
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* PDF Content */}
      <div
        className="relative flex-1 overflow-auto bg-checkerboard"
        style={
          {
            minHeight: overlay ? "70vh" : "500px",
            maxHeight: fullscreen ? "100vh" : "80vh",
            "--checker-color-1": "oklch(0.95 0 0)",
            "--checker-color-2": "oklch(0.9 0 0)",
          } as React.CSSProperties
        }
      >
        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
              <span className="text-sm text-muted-foreground">
                Loading PDF…
              </span>
            </div>
          </div>
        )}

        {/* PDF Iframe */}
        <iframe
          ref={iframeRef}
          src={`${url}#zoom=${zoom}`}
          className="h-full w-full border-0"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            width: zoom > 1 ? `${(1 / zoom) * 100}%` : "100%",
            height: zoom > 1 ? `${(1 / zoom) * 100}%` : "100%",
          }}
          title={title || "PDF Viewer"}
          onLoad={() => setLoading(false)}
          allow="fullscreen"
        />
      </div>

      {/* Bottom bar with title */}
      {title && (
        <div className="flex items-center gap-2 border-t border-border/40 bg-card px-4 py-1.5">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="truncate text-xs text-muted-foreground">{title}</span>
        </div>
      )}
    </div>
  );

  // Overlay mode
  if (overlay) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && onClose) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-5xl"
          >
            {viewerContent}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Inline mode
  return viewerContent;
}

/* ── Thumbnail Strip ── */
export function PDFThumbnailStrip({
  url,
  title,
}: {
  url: string;
  title?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="gold"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        View Catalogue
      </Button>

      <AnimatePresence>
        {open && (
          <PDFViewer
            url={url}
            title={title}
            overlay
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Overlay PDF viewer trigger ── */
export function usePDFViewer() {
  const [viewerProps, setViewerProps] = useState<PDFViewerProps | null>(null);

  const open = useCallback((props: PDFViewerProps) => {
    setViewerProps(props);
  }, []);

  const close = useCallback(() => {
    setViewerProps(null);
  }, []);

  const viewer = viewerProps ? (
    <PDFViewer {...viewerProps} overlay onClose={close} />
  ) : null;

  return { viewer, open, close, isOpen: !!viewerProps };
}
