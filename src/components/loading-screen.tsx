
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Luxury initial loading screen.
 * Shows an animated "S H" monogram with a gold underline draw,
 * then fades out to reveal the page content.
 *
 * Add to the root layout (__root.tsx) inside the body:
 *   <LoadingScreen />
 */
export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<"enter" | "exit">("enter");

  useEffect(() => {
    // Show for at least 1.4s, then fade out
    const t1 = setTimeout(() => setPhase("exit"), 1400);
    const t2 = setTimeout(() => setVisible(false), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "exit" ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        >
          {/* Animated S H monogram */}
          <div className="flex items-center gap-5">
            <motion.span
              className="font-serif text-7xl tracking-tight text-foreground md:text-8xl"
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              S
            </motion.span>
            <motion.span
              className="font-serif text-7xl tracking-tight text-foreground md:text-8xl"
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              H
            </motion.span>
          </div>

          {/* Gold underline */}
          <motion.div
            className="mt-2 h-0.5 bg-gold"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 80, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Tagline */}
          <motion.p
            className="mt-5 text-xs uppercase tracking-[0.35em] text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Stone India Heritage
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
