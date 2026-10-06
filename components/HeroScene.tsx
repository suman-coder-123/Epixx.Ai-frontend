"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

function Shape() {
  const ref = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    // Capped gentle rotation + mouse parallax.
    ref.current.rotation.y += delta * 0.25;
    ref.current.rotation.x += delta * 0.1;
    ref.current.position.x += (state.pointer.x * 0.4 - ref.current.position.x) * 0.05;
    ref.current.position.y += (state.pointer.y * 0.3 - ref.current.position.y) * 0.05;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.4, 1]} />
      <meshStandardMaterial color="#1B4F9C" roughness={0.9} metalness={0} flatShading />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <div className="h-64 overflow-hidden rounded-3xl bg-tint md:h-80">
      <Canvas dpr={[1, 1.5]} frameloop="always" camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 4, 4]} intensity={1.1} />
        <Shape />
      </Canvas>
    </div>
  );
}
