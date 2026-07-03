import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

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

  const go = useCallback(
    (dir: number) => {
      if (index === null) return;
      const next = (index + dir + images.length) % images.length;
      onIndexChange(next);
    },
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go, onClose]);

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
        >
          <div className="flex items-center justify-between px-5 py-4 text-white/80">
            <span className="text-sm">
              {(index ?? 0) + 1} / {images.length}
              {current.label ? <span className="ml-3 text-white/60">{current.label}</span> : null}
            </span>
            <button
              onClick={onClose}
              aria-label="Close gallery"
              className="grid h-10 w-10 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4">
            <button
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-4 grid h-12 w-12 place-items-center rounded-full bg-white/5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <AnimatePresence mode="wait">
              <motion.img
                key={index}
                src={current.src}
                alt={current.label ?? ""}
                className="max-h-[70vh] max-w-[86vw] rounded-lg object-contain shadow-2xl"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
            </AnimatePresence>
            <button
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-4 grid h-12 w-12 place-items-center rounded-full bg-white/5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 overflow-x-auto px-4 py-5">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => onIndexChange(i)}
                aria-label={`View image ${i + 1}`}
                className={`h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                  i === index ? "border-gold opacity-100" : "border-transparent opacity-50 hover:opacity-90"
                }`}
              >
                <img src={img.src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
