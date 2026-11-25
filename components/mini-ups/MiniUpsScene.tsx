"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
} from "@react-three/drei";
import type { Group } from "three";
import { MiniUpsModel, type MiniUpsHandles } from "./MiniUpsModel";

function AnimatedUps() {
  const root = useRef<Group>(null);
  const model = useRef<MiniUpsHandles>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    const cycle = 10;
    const phase = (t % cycle) / cycle;
    let e = 0;
    if (phase < 0.18) e = 0;
    else if (phase < 0.42) e = (phase - 0.18) / 0.24;
    else if (phase < 0.62) e = 1;
    else if (phase < 0.86) e = 1 - (phase - 0.62) / 0.24;
    else e = 0;

    const smooth = e * e * (3 - 2 * e);
    model.current?.setExplode(smooth);

    if (root.current) {
      root.current.rotation.y = t * 0.22;
      root.current.position.y = Math.sin(t * 0.9) * 0.004;
    }
  });

  return (
    <group ref={root}>
      <MiniUpsModel ref={model} />
    </group>
  );
}

function SceneContent() {
  return (
    <>
      <color attach="background" args={["#0c1118"]} />
      <fog attach="fog" args={["#0c1118", 0.55, 1.6]} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[0.4, 0.6, 0.35]} intensity={1.35} />
      <directionalLight position={[-0.35, 0.25, -0.3]} intensity={0.35} />
      <spotLight
        position={[0.1, 0.45, 0.25]}
        angle={0.45}
        penumbra={0.6}
        intensity={1.1}
        color="#c9e7ff"
      />

      <Suspense fallback={null}>
        <AnimatedUps />
        <Environment preset="city" environmentIntensity={0.45} />
      </Suspense>

      <ContactShadows
        position={[0, -0.028, 0]}
        opacity={0.55}
        scale={0.45}
        blur={2.4}
        far={0.2}
      />

      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        enablePan={false}
        minDistance={0.18}
        maxDistance={0.55}
        maxPolarAngle={Math.PI * 0.62}
        minPolarAngle={Math.PI * 0.22}
      />
    </>
  );
}

export function MiniUpsScene() {
  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0.22, 0.14, 0.28], fov: 35, near: 0.01, far: 10 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <SceneContent />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0c1118] via-[#0c1118]/70 to-transparent px-6 pb-8 pt-20">
        <p className="text-center text-[11px] uppercase tracking-[0.28em] text-slate-400">
          Mini DC UPS
        </p>
        <p className="mt-2 text-center text-sm text-slate-300/90">
          Exploded assembly · drag to orbit
        </p>
      </div>
    </div>
  );
}
