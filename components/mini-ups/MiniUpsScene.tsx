"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
} from "@react-three/drei";
import type { Group } from "three";
import { MiniUpsModel, type MiniUpsHandles } from "./MiniUpsModel";
import type { PartInfo } from "./partInfo";

function AnimatedUps({
  onHoverChange,
  paused,
}: {
  onHoverChange: (info: PartInfo | null) => void;
  paused: boolean;
}) {
  const root = useRef<Group>(null);
  const model = useRef<MiniUpsHandles>(null);
  const pauseRef = useRef(paused);
  pauseRef.current = paused;

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    const cycle = 12;
    const phase = (t % cycle) / cycle;
    let e = 0;
    if (phase < 0.16) e = 0;
    else if (phase < 0.4) e = (phase - 0.16) / 0.24;
    else if (phase < 0.62) e = 1;
    else if (phase < 0.86) e = 1 - (phase - 0.62) / 0.24;
    else e = 0;

    const smooth = e * e * (3 - 2 * e);
    model.current?.setExplode(smooth);

    if (root.current && !pauseRef.current) {
      root.current.rotation.y = t * 0.18;
      root.current.position.y = Math.sin(t * 0.9) * 0.003;
    }
  });

  return (
    <group ref={root}>
      <MiniUpsModel ref={model} onHoverChange={onHoverChange} />
    </group>
  );
}

function SceneContent({
  onHoverChange,
  paused,
}: {
  onHoverChange: (info: PartInfo | null) => void;
  paused: boolean;
}) {
  return (
    <>
      <color attach="background" args={["#0c1118"]} />
      <fog attach="fog" args={["#0c1118", 0.6, 1.7]} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[0.45, 0.65, 0.4]} intensity={1.45} />
      <directionalLight position={[-0.4, 0.3, -0.35]} intensity={0.4} />
      <spotLight
        position={[0.12, 0.5, 0.28]}
        angle={0.48}
        penumbra={0.55}
        intensity={1.15}
        color="#c9e7ff"
      />

      <Suspense fallback={null}>
        <AnimatedUps onHoverChange={onHoverChange} paused={paused} />
        <Environment preset="city" environmentIntensity={0.5} />
      </Suspense>

      <ContactShadows
        position={[0, -0.028, 0]}
        opacity={0.55}
        scale={0.5}
        blur={2.4}
        far={0.22}
      />

      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        enablePan={false}
        minDistance={0.16}
        maxDistance={0.6}
        maxPolarAngle={Math.PI * 0.64}
        minPolarAngle={Math.PI * 0.18}
      />
    </>
  );
}

export function MiniUpsScene() {
  const [hover, setHover] = useState<PartInfo | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);

  const onHoverChange = useCallback((info: PartInfo | null) => {
    setHover(info);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      setCursor({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    };

    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      <Canvas
        camera={{ position: [0.24, 0.16, 0.3], fov: 34, near: 0.01, far: 10 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <SceneContent onHoverChange={onHoverChange} paused={Boolean(hover)} />
      </Canvas>

      {hover ? (
        <div
          className="pointer-events-none absolute z-20 max-w-[220px] rounded-lg border border-white/10 bg-[#121820]/92 px-3 py-2 shadow-xl backdrop-blur-md"
          style={{
            left: Math.min(cursor.x + 16, (wrapRef.current?.clientWidth ?? 320) - 236),
            top: Math.max(12, cursor.y - 56),
          }}
          dir="rtl"
        >
          <p className="text-[13px] font-medium text-slate-50">{hover.title}</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-300">
            {hover.description}
          </p>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0c1118] via-[#0c1118]/70 to-transparent px-6 pb-8 pt-20">
        <p className="text-center text-[11px] uppercase tracking-[0.28em] text-slate-400">
          Mini DC UPS
        </p>
        <p className="mt-2 text-center text-sm text-slate-300/90">
          روی قطعات هاور کنید · درگ برای چرخش
        </p>
      </div>
    </div>
  );
}
