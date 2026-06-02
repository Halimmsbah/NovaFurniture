import { Canvas, useFrame } from "@react-three/fiber";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  Float,
  MeshDistortMaterial,
  PerformanceMonitor,
} from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import type { Mesh } from "three";
import { deviceTier, prefersReducedMotion } from "@/lib/motion";

function Orb({ detail, animate }: { detail: number; animate: boolean }) {
  const mesh = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current || !animate) return;
    const t = clock.getElapsedTime();
    mesh.current.rotation.x = t * 0.12;
    mesh.current.rotation.y = t * 0.18;
  });
  return (
    <Float speed={animate ? 1.1 : 0} rotationIntensity={animate ? 0.4 : 0} floatIntensity={animate ? 1.2 : 0}>
      <mesh ref={mesh} scale={2.4}>
        <icosahedronGeometry args={[1, detail]} />
        <MeshDistortMaterial
          color="#B06CFF"
          emissive="#C38AFF"
          emissiveIntensity={0.2}
          metalness={0.7}
          roughness={0.18}
          distort={animate ? 0.42 : 0.25}
          speed={animate ? 1.3 : 0}
        />
      </mesh>
    </Float>
  );
}

/**
 * Decorative 3D orb rendered behind the hero. Mounted only on the client
 * because three.js touches WebGL APIs that don't exist during SSR.
 */
export function HeroOrb() {
  const tier = deviceTier();
  const reduced = prefersReducedMotion();

  // Adaptive baseline. Low-end devices and reduced-motion users get a static,
  // low-poly orb rendered on-demand (no continuous frame loop).
  const detail = tier === "low" ? 6 : tier === "mid" ? 14 : 24;
  const animate = !reduced && tier !== "low";
  const maxDpr = tier === "low" ? 1 : tier === "mid" ? 1.25 : 1.6;
  const [dpr, setDpr] = useState<[number, number]>([1, maxDpr]);

  return (
    <Canvas
      dpr={dpr}
      frameloop={animate ? "always" : "demand"}
      camera={{ position: [0, 0, 6], fov: 38 }}
      gl={{
        antialias: tier !== "low",
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr([1, Math.max(0.75, maxDpr - 0.5)])}
        onIncline={() => setDpr([1, maxDpr])}
        flipflops={2}
        onFallback={() => setDpr([1, 1])}
      />
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={0.8} color="#C38AFF" />
      <pointLight position={[-4, -2, -2]} intensity={1.2} color="#B06CFF" />
      <Suspense fallback={null}>
        {tier === "high" && <Environment preset="city" />}
        <Orb detail={detail} animate={animate} />
      </Suspense>
    </Canvas>
  );
}

export default HeroOrb;