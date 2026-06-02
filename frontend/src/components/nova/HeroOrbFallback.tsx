import { Component, type ReactNode } from "react";

/**
 * Pure-CSS luxurious fallback used when WebGL is unavailable, when the user
 * has reduced-motion enabled, or when the 3D bundle fails to load.
 */
export function HeroOrbFallback() {
  return (
    <div className="relative h-full w-full">
      <div
        aria-hidden
        className="absolute inset-0 rounded-full opacity-80"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #C38AFF 0%, #B06CFF 35%, #1a0a2e 70%, transparent 78%)",
          filter: "blur(2px)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-6 rounded-full mix-blend-screen opacity-40"
        style={{
          background:
            "radial-gradient(circle at 65% 70%, #D8B37A 0%, transparent 55%)",
          filter: "blur(14px)",
        }}
      />
      <div aria-hidden className="absolute inset-0 rounded-full ring-1 ring-primary/20" />
    </div>
  );
}

export default HeroOrbFallback;

/** Error boundary for the WebGL hero ornament. */
export class HeroOrbBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    if (typeof console !== "undefined") console.warn("HeroOrb fallback:", err);
  }
  render() {
    if (this.state.failed) return <HeroOrbFallback />;
    return this.props.children;
  }
}