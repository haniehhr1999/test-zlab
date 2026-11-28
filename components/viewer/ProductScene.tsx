"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
} from "@react-three/drei";
import type { Group } from "three";
import type { Product, ProductPartInfo } from "@/lib/products";
import {
  MiniUpsModel,
  type MiniUpsHandles,
} from "@/components/mini-ups/MiniUpsModel";
import {
  GenericProductModel,
  type GenericHandles,
} from "@/components/viewer/GenericProductModel";
import { resolvePartFromObject } from "@/components/mini-ups/partInfo";

type HoverInfo = {
  title: string;
  description: string;
};

function AnimatedRoot({
  product,
  onHoverChange,
  paused,
}: {
  product: Product;
  onHoverChange: (info: HoverInfo | null) => void;
  paused: boolean;
}) {
  const root = useRef<Group>(null);
  const miniRef = useRef<MiniUpsHandles>(null);
  const genericRef = useRef<GenericHandles>(null);
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

    if (product.viewer === "mini-ups") miniRef.current?.setExplode(smooth);
    else genericRef.current?.setExplode(smooth);

    if (root.current && !pauseRef.current) {
      root.current.rotation.y = t * 0.18;
      root.current.position.y = Math.sin(t * 0.9) * 0.01;
    }
  });

  const onMiniHover = useCallback(
    (info: ReturnType<typeof resolvePartFromObject>) => {
      onHoverChange(
        info ? { title: info.title, description: info.description } : null,
      );
    },
    [onHoverChange],
  );

  const onGenericHover = useCallback(
    (info: ProductPartInfo | null) => {
      onHoverChange(
        info ? { title: info.title, description: info.description } : null,
      );
    },
    [onHoverChange],
  );

  return (
    <group ref={root}>
      {product.viewer === "mini-ups" ? (
        <MiniUpsModel ref={miniRef} onHoverChange={onMiniHover} />
      ) : (
        <GenericProductModel
          key={product.id}
          ref={genericRef}
          url={product.modelUrl}
          explodeTargets={product.explode ?? []}
          parts={product.parts ?? []}
          onHoverChange={onGenericHover}
        />
      )}
    </group>
  );
}

function SceneContent({
  product,
  onHoverChange,
  paused,
}: {
  product: Product;
  onHoverChange: (info: HoverInfo | null) => void;
  paused: boolean;
}) {
  return (
    <>
      <color attach="background" args={["#0c1118"]} />
      <fog
        attach="fog"
        args={
          product.viewer === "mini-ups"
            ? ["#0c1118", 0.6, 1.7]
            : ["#0c1118", 5, 20]
        }
      />

      <ambientLight intensity={0.42} />
      <directionalLight position={[2.2, 3.2, 1.8]} intensity={1.4} />
      <directionalLight position={[-2, 1.2, -1.6]} intensity={0.4} />
      <spotLight
        position={[1.2, 3.5, 2]}
        angle={0.5}
        penumbra={0.55}
        intensity={1.05}
        color="#c9e7ff"
      />

      <Suspense fallback={null}>
        <AnimatedRoot
          product={product}
          onHoverChange={onHoverChange}
          paused={paused}
        />
        <Environment preset="city" environmentIntensity={0.48} />
      </Suspense>

      <ContactShadows
        position={[0, product.viewer === "mini-ups" ? -0.028 : -0.9, 0]}
        opacity={0.45}
        scale={product.viewer === "mini-ups" ? 0.5 : 8}
        blur={2.6}
        far={product.viewer === "mini-ups" ? 0.22 : 3}
      />

      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        enablePan={false}
        minDistance={0.15}
        maxDistance={14}
        maxPolarAngle={Math.PI * 0.66}
        minPolarAngle={Math.PI * 0.12}
      />
    </>
  );
}

export function ProductScene({ product }: { product: Product }) {
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);

  const onHoverChange = useCallback((info: HoverInfo | null) => {
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

  // Mini-ups uses denser local fog/camera; generic uses normalized scale.
  const camera =
    product.viewer === "mini-ups"
      ? { position: product.camera.position, fov: product.camera.fov ?? 34 }
      : { position: [1.55, 1.05, 1.85] as [number, number, number], fov: 38 };

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      <Canvas
        key={product.id}
        camera={{ ...camera, near: 0.01, far: 80 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
      >
        <SceneContent
          product={product}
          onHoverChange={onHoverChange}
          paused={Boolean(hover)}
        />
      </Canvas>

      {hover ? (
        <div
          className="pointer-events-none absolute z-20 max-w-[230px] rounded-lg border border-white/10 bg-[#121820]/92 px-3 py-2 shadow-xl backdrop-blur-md"
          style={{
            left: Math.min(
              cursor.x + 16,
              (wrapRef.current?.clientWidth ?? 320) - 246,
            ),
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
    </div>
  );
}
