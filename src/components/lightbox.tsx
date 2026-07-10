import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Loader2 } from "lucide-react";

export type LightboxImage = { src: string; label?: string };

export function Lightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const open = index !== null;
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const go = useCallback(
    (dir: number) => {
      if (index === null) return;
      setLoading(true);
      const next = (index + dir + images.length) % images.length;
      onIndexChange(next);
    },
    [index, images.length, onIndexChange],
  );

  /* ── Keyboard navigation ── */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        setFullscreen(false);
      }
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "f" || e.key === "F") setFullscreen((p) => !p);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go, onClose]);

  /* ── Touch / Swipe support ── */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    const threshold = 50;

    // Only trigger horizontal swipe if horizontal movement is greater than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
      if (diffX > 0) go(1);
      else go(-1);
    }
  };

  /* ── Fullscreen toggle ── */
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setFullscreen(true);
      } catch {
        /* not supported */
      }
    } else {
      try {
        await document.exitFullscreen();
        setFullscreen(false);
      } catch {
        /* not supported */
      }
    }
  };

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const current = index !== null ? images[index] : null;

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* ── Top bar ── */}
          <div className="flex items-center justify-between px-5 py-4 text-white/80">
            <span className="text-sm">
              {(index ?? 0) + 1} / {images.length}
              {current.label ? <span className="ml-3 text-white/60">{current.label}</span> : null}
            </span>
            <div className="flex items-center gap-2">
              {/* Fullscreen toggle */}
              <button
                onClick={toggleFullscreen}
                aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                className="grid h-10 w-10 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {fullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
              {/* Close button */}
              <button
                onClick={() => {
                  onClose();
                  setFullscreen(false);
                }}
                aria-label="Close gallery"
                className="grid h-10 w-10 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ── Main image area ── */}
          <div className="relative flex flex-1 items-center justify-center px-4">
            {/* Previous button */}
            <button
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/5 text-white/80 backdrop-blur-sm transition-all hover:bg-white/15 hover:text-white hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Loading skeleton */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-white/40" />
                  <span className="text-xs text-white/30">Loading image…</span>
                </div>
              </div>
            )}

            {/* Image */}
            <AnimatePresence mode="wait">
              <motion.img
                ref={imgRef}
                key={index}
                src={current.src}
                alt={current.label ?? ""}
                className={`rounded-lg object-contain shadow-2xl transition-opacity duration-300 ${
                  loading ? "opacity-0" : "opacity-100"
                } ${fullscreen ? "max-h-[80vh] max-w-[92vw]" : "max-h-[70vh] max-w-[86vw]"}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: loading ? 0 : 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
                draggable={false}
              />
            </AnimatePresence>

            {/* Next button */}
            <button
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/5 text-white/80 backdrop-blur-sm transition-all hover:bg-white/15 hover:text-white hover:scale-105 active:scale-95"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* ── Thumbnail strip ── */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto px-4 py-5">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  setLoading(true);
                  onIndexChange(i);
                }}
                aria-label={`View image ${i + 1}`}
                className={`h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                  i === index
                    ? "border-gold opacity-100 ring-1 ring-gold/30"
                    : "border-transparent opacity-50 hover:opacity-90"
                }`}
              >
                <img src={img.src} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>

          {/* Swipe hint for mobile */}
          <div className="pb-2 text-center text-[0.55rem] uppercase tracking-widest text-white/30">
            Swipe to navigate · Press F for fullscreen
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
