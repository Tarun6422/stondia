import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Quote } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/* ---------------------------------------------------------------------------
 * 3D tilt card — tracks pointer and rotates on X/Y with a gold glow
 * ------------------------------------------------------------------------- */
export function TiltCard({
  children,
  className,
  max = 8,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), {
    stiffness: 200,
    damping: 20,
  });

  function handleMove(e: React.PointerEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }
  function reset() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------------------------
 * Animated global export map — pulsing dots + drawn connection lines
 * ------------------------------------------------------------------------- */
type Node = { name: string; x: number; y: number };

const ORIGIN: Node = { name: "Rajasthan, India", x: 690, y: 235 };
const NODES: Node[] = [
  { name: "United Kingdom", x: 470, y: 150 },
  { name: "United States", x: 205, y: 195 },
  { name: "UAE", x: 615, y: 250 },
  { name: "Australia", x: 855, y: 375 },
  { name: "Germany", x: 505, y: 155 },
  { name: "Singapore", x: 790, y: 300 },
  { name: "Canada", x: 235, y: 130 },
  { name: "South Africa", x: 545, y: 400 },
];

export function ExportMap() {
  return (
    <div className="relative mx-auto mt-12 max-w-4xl">
      <svg viewBox="0 0 1000 500" className="w-full">
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* connection lines */}
        {NODES.map((n, i) => {
          const mx = (ORIGIN.x + n.x) / 2;
          const my = Math.min(ORIGIN.y, n.y) - 60;
          const d = `M ${ORIGIN.x} ${ORIGIN.y} Q ${mx} ${my} ${n.x} ${n.y}`;
          return (
            <g key={n.name}>
              <motion.path
                d={d}
                fill="none"
                stroke="var(--gold)"
                strokeWidth={1.2}
                strokeOpacity={0.5}
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, delay: i * 0.15, ease: "easeInOut" }}
              />
              {/* travelling pulse along the line */}
              <motion.circle
                r={3}
                fill="var(--gold)"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: [0, 1, 0] }}
                viewport={{ once: true }}
                transition={{
                  duration: 2.4,
                  delay: 1.2 + i * 0.15,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                }}
              >
                <animateMotion dur="2.4s" repeatCount="indefinite" path={d} />
              </motion.circle>
            </g>
          );
        })}

        {/* destination dots */}
        {NODES.map((n, i) => (
          <motion.g
            key={`${n.name}-dot`}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + i * 0.12, type: "spring", stiffness: 260 }}
          >
            <circle cx={n.x} cy={n.y} r={14} fill="url(#mapGlow)" />
            <circle
              cx={n.x}
              cy={n.y}
              r={4}
              fill="var(--gold)"
              className="ping-dot"
              style={{ transformOrigin: `${n.x}px ${n.y}px` }}
            />
            <circle cx={n.x} cy={n.y} r={3} fill="var(--gold)" />
          </motion.g>
        ))}

        {/* origin (India) */}
        <circle cx={ORIGIN.x} cy={ORIGIN.y} r={22} fill="url(#mapGlow)" />
        <motion.circle
          cx={ORIGIN.x}
          cy={ORIGIN.y}
          r={6}
          fill="var(--gold)"
          className="ping-dot"
          style={{ transformOrigin: `${ORIGIN.x}px ${ORIGIN.y}px` }}
        />
        <circle cx={ORIGIN.x} cy={ORIGIN.y} r={5} fill="var(--gold)" />
      </svg>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Shipping from Rajasthan to 35+ countries across 6 continents.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Auto-sliding testimonial carousel
 * ------------------------------------------------------------------------- */
type Testimonial = { name: string; role: string; quote: string };

export function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [paused, items.length]);

  return (
    <div
      className="relative mx-auto mt-14 max-w-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-[240px]">
        <AnimatePresence mode="wait">
          <motion.figure
            key={index}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="glass rounded-lg p-10 text-center"
          >
            <Quote className="mx-auto h-8 w-8 text-gold" />
            <blockquote className="mt-5 text-lg leading-relaxed text-white/90">
              "{items[index].quote}"
            </blockquote>
            <figcaption className="mt-7">
              <p className="font-serif text-xl text-white">{items[index].name}</p>
              <p className="text-sm text-white/60">{items[index].role}</p>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
      <div className="mt-8 flex justify-center gap-2.5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to testimonial ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-8 bg-gold" : "w-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Animated success checkmark (SVG stroke draw)
 * ------------------------------------------------------------------------- */
export function SuccessCheck({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 52 52"
      className={className ?? "mx-auto h-16 w-16"}
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="2"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 },
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      <motion.path
        d="M16 27 l7 7 l14 -15"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0 },
          visible: { pathLength: 1 },
        }}
        transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
      />
    </motion.svg>
  );
}
