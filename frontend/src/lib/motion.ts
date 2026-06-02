import { useEffect, useState } from "react";

/** Sync the <html data-motion> attribute to the effective preference. */
export function applyMotionAttribute() {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-motion", prefersReducedMotion() ? "off" : "on");
}

/** SSR-safe read of the user's reduced-motion preference. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Reactive hook — re-renders if the user toggles the OS-level preference. */
export function useReducedMotionPref(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => prefersReducedMotion());
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(prefersReducedMotion());
    mq.addEventListener?.("change", onChange);
    return () => {
      mq.removeEventListener?.("change", onChange);
    };
  }, []);
  return reduced;
}

/** Detect WebGL availability without throwing during SSR. */
export function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/** Coarse device-tier heuristic for adaptive 3D quality. */
export function deviceTier(): "low" | "mid" | "high" {
  if (typeof navigator === "undefined") return "mid";
  const mem = (navigator as any).deviceMemory as number | undefined;
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse =
    typeof window !== "undefined" &&
    window.matchMedia?.("(pointer: coarse)").matches;
  if ((mem && mem <= 2) || cores <= 4) return "low";
  if (coarse && cores <= 6) return "mid";
  return "high";
}

/** Dev-only diagnostic log explaining why a reduced/fallback path was chosen. */
export function logMotionDecision(component: string) {
  if (typeof window === "undefined") return;
  if (!import.meta.env.DEV) return;
  const reasons: string[] = [];
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) reasons.push("prefers-reduced-motion");
  if (!hasWebGL()) reasons.push("no-webgl");
  const tier = deviceTier();
  if (tier === "low") reasons.push("low-tier-device");
  // eslint-disable-next-line no-console
  console.info(
    `%c[nova/motion] ${component}`,
    "color:#a855f7;font-weight:600",
    reasons.length ? reasons.join(", ") : "full-motion",
  );
}