import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { FileText, ArrowUp } from "lucide-react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gold"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}

export function FloatingQuote() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[55] flex flex-col items-end gap-3 transition-all duration-500 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        className="grid h-11 w-11 place-items-center rounded-full border border-border bg-background/90 text-foreground shadow-soft backdrop-blur transition-colors hover:border-gold hover:text-gold"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
      <Link
        to="/quote"
        className="group inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-[var(--gold-foreground)] shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5"
      >
        <FileText className="h-4 w-4" />
        Request Quote
      </Link>
    </div>
  );
}
