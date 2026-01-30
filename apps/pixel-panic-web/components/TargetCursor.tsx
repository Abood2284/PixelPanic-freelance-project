"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SEL =
  'a, button, [role="button"], input, textarea, select, label, summary, [data-clickable], .clickable';

export default function TargetCursor() {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const xy = useRef({ x: -100, y: -100 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    try {
      // Create a top-level, transform-proof overlay node
      const el = document.createElement("div");
      el.id = "target-cursor";
      el.setAttribute("aria-hidden", "true");
      document.body.appendChild(el);
      nodeRef.current = el;
    } catch (error) {
      console.warn('TargetCursor initialization failed:', error);
      return;
    }

    const schedule = () => {
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };

    const tick = () => {
      try {
        const n = nodeRef.current;
        if (!n) {
          raf.current = null;
          return;
        }

        // keep it nailed to viewport coordinates
        n.style.setProperty("--x", xy.current.x + "px");
        n.style.setProperty("--y", xy.current.y + "px");

        // update clickable state even when only scrolling
        const under = document.elementFromPoint(xy.current.x, xy.current.y);
        n.classList.toggle("is-clickable", !!under?.closest?.(INTERACTIVE_SEL));
      } catch (error) {
        // Silently fail to avoid breaking other functionality
        console.warn('TargetCursor tick failed:', error);
      } finally {
        raf.current = null;
      }
    };

    const onMove = (e: PointerEvent) => {
      xy.current.x = e.clientX;
      xy.current.y = e.clientY;
      schedule();
    };

    // When the page moves under a stationary pointer, re-sync
    const onScrollLike = () => schedule();

    const onDown = () => {
      const n = nodeRef.current;
      if (!n) return;

      try {
        // Get current position from CSS custom properties
        const currentX = xy.current.x;
        const currentY = xy.current.y;

        // Create animation that maintains position while scaling
        n.animate([
          {
            transform: `translate(-50%, -50%) translate3d(${currentX}px, ${currentY}px, 0) scale(0.95)`
          },
          {
            transform: `translate(-50%, -50%) translate3d(${currentX}px, ${currentY}px, 0) scale(1)`
          }
        ], {
          duration: 120,
        });
      } catch (error) {
        // Silently fail if animation doesn't work
        console.warn('TargetCursor animation failed:', error);
      }
    };

    const onLeave = () => {
      if (nodeRef.current) {
        nodeRef.current.style.opacity = "0";
      }
    };

    const onEnter = () => {
      if (nodeRef.current) {
        nodeRef.current.style.opacity = "1";
      }
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    // Use passive listeners without aggressive capture to avoid interfering with normal interactions
    window.addEventListener("scroll", onScrollLike, { passive: true });
    window.addEventListener("wheel", onScrollLike, { passive: true });
    window.addEventListener("resize", onScrollLike, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave, { passive: true });
    document.addEventListener("pointerenter", onEnter, { passive: true });

    // Prime once
    schedule();

    return () => {
      document.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScrollLike);
      window.removeEventListener("wheel", onScrollLike);
      window.removeEventListener("resize", onScrollLike);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      if (raf.current) cancelAnimationFrame(raf.current);
      if (nodeRef.current && document.body.contains(nodeRef.current)) {
        try {
          document.body.removeChild(nodeRef.current);
        } catch (error) {
          console.warn('TargetCursor cleanup failed:', error);
        }
      }
    };
  }, []);

  // We append the DOM node manually; nothing to render here.
  return null;
}
