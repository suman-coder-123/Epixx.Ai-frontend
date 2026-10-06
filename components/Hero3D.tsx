"use client";

import { Suspense, lazy, useEffect, useState } from "react";

// Lazy 3D hero accent: low-poly rotating shape in brand blue, mouse parallax.
// Code-split so react-three-fiber never enters the initial bundle.
const Scene = lazy(() => import("./HeroScene"));

export function Hero3D() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!coarse && !reduced) setEnabled(true);
  }, []);

  // Static fallback for mobile / low-end / reduced-motion.
  if (!enabled) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl bg-tint" role="img" aria-label="Students learning job-ready skills">
        <p className="font-heading text-5xl font-bold text-primary">✦</p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={<div className="h-64 rounded-3xl bg-tint" aria-hidden />}
    >
      <Scene />
    </Suspense>
  );
}
