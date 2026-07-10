import { Children, cloneElement, isValidElement, useEffect, useRef, type ReactNode } from "react";

/**
 * Premium cursor glow ring.
 * Renders a large radial gradient ring that follows the mouse
 * and brightens when hovering over interactive elements.
 *
 * Add to the root layout:
 *   <CursorGlow />
 */
export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -200, y: -200 });
  const isInteractiveRef = useRef(false);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    // Track mouse position
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    // Check what's under the cursor using elementFromPoint on a throttle
    let lastCheck = 0;
    const checkTarget = () => {
      const now = Date.now();
      if (now - lastCheck < 50) return; // throttle to 20fps
      lastCheck = now;
      const { x, y } = mouseRef.current;
      const el = document.elementFromPoint(x, y);
      const interactive = el?.closest(
        "a, button, input, textarea, select, [role=button], [tabindex]:not([tabindex='-1'])",
      );
      isInteractiveRef.current = !!interactive;
    };

    const animate = () => {
      checkTarget();
      const { x, y } = mouseRef.current;
      if (glow) {
        const size = isInteractiveRef.current ? 320 : 250;
        glow.style.width = `${size}px`;
        glow.style.height = `${size}px`;
        glow.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;
        glow.style.opacity = String(isInteractiveRef.current ? 0.15 : 0.06);
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Only show on devices with fine pointers (not mobile)
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed left-0 top-0 z-[9998] hidden rounded-full will-change-transform lg:block"
      style={{
        background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)",
        opacity: 0.06,
        transform: "translate(-200px, -200px)",
        transition: "opacity 0.2s ease, width 0.3s ease, height 0.3s ease",
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Button magnet effect wrapper.
 * Subtly pulls the wrapped element toward the cursor when hovered.
 *
 * Usage:
 *   <ButtonMagnet>
 *     <button>Click me</button>
 *   </ButtonMagnet>
 */
export function ButtonMagnet({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const strength = Math.max(0, 1 - dist * 0.8);
      el.style.setProperty("--magnet-x", `${dx * 6 * strength}px`);
      el.style.setProperty("--magnet-y", `${dy * 6 * strength}px`);
    };

    const onLeave = () => {
      el.style.setProperty("--magnet-x", "0px");
      el.style.setProperty("--magnet-y", "0px");
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="magnet-target inline-block"
      style={{
        transform: "translate(var(--magnet-x, 0px), var(--magnet-y, 0px))",
        transition: "transform 0.15s ease-out",
      }}
    >
      {children}
    </div>
  );
}

/**
 * Ripple effect on click.
 * Clones the child element and adds the `data-ripple` attribute
 * so the CSS ripple animation activates on click.
 *
 * Usage:
 *   <ButtonRipple>
 *     <button>Click me</button>
 *   </ButtonRipple>
 */
export function ButtonRipple({ children }: { children: ReactNode }) {
  const child = Children.only(children);
  if (!isValidElement(child)) return <>{children}</>;
  return cloneElement(child as React.ReactElement<{ "data-ripple"?: string }>, {
    "data-ripple": "",
  });
}
