import { createElement, useEffect, useRef, type ElementType } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { prefersReducedMotion, logMotionDecision } from "@/lib/motion";

let registered = false;
function ensureScrollTrigger() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  // Smoother batching: one rAF flush per frame, ignore mobile resize jitter.
  ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });
  gsap.ticker.lagSmoothing(500, 33);
  registered = true;
}

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** When true, animate on mount instead of on scroll into view. */
  immediate?: boolean;
};

/**
 * GSAP word-by-word cinematic reveal. Respects prefers-reduced-motion
 * (renders static text) and uses ScrollTrigger.batch + rAF for cheap reveals.
 * Works for any heading tag (H1/H2/H3) and stays responsive — words wrap
 * naturally without breaking mid-word.
 */
export function CinematicHeading({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
  immediate = false,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(/(\s+)/);

  useEffect(() => {
    if (!ref.current) return;
    if (prefersReducedMotion()) {
      logMotionDecision("CinematicHeading");
      // Reveal statically so words don't stay hidden under overflow.
      ref.current.querySelectorAll<HTMLElement>("[data-word]").forEach((el) => {
        el.style.transform = "none";
        el.style.opacity = "1";
      });
      return;
    }
    ensureScrollTrigger();
    const targets = ref.current.querySelectorAll<HTMLElement>("[data-word]");
    if (!targets.length) return;
    let rafId = 0;
    const ctx = gsap.context(() => {
      const play = (els: Element[]) => {
        rafId = requestAnimationFrame(() => {
          gsap.from(els, {
            yPercent: 110,
            opacity: 0,
            duration: 1.05,
            ease: "expo.out",
            stagger: 0.07,
            delay,
            overwrite: "auto",
          });
        });
      };
      if (immediate) {
        play(Array.from(targets));
      } else {
        ScrollTrigger.batch(Array.from(targets), {
          start: "top 85%",
          once: true,
          onEnter: (batch) => play(batch),
        });
      }
    }, ref);
    return () => {
      cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, [text, delay, immediate]);

  const content = words.map((w, i) =>
    /\s+/.test(w) ? (
      <span key={i}>{w}</span>
    ) : (
      <span key={i} className="inline-block overflow-hidden align-bottom">
        <span data-word className="inline-block">
          {w}
        </span>
      </span>
    ),
  );
  return createElement(
    Tag,
    { ref, className: cn("[text-wrap:balance] break-words", className) },
    content,
  );
}

export default CinematicHeading;