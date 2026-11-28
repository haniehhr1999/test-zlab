"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useGLTF } from "@react-three/drei";
import type { Mesh, MeshStandardMaterial, Object3D } from "three";
import { Box3, Color, Vector3 } from "three";
import type { ExplodeTarget, ProductPartInfo } from "@/lib/products";

export type GenericHandles = {
  setExplode: (value: number) => void;
};

type Props = {
  url: string;
  explodeTargets: ExplodeTarget[];
  parts: ProductPartInfo[];
  onHoverChange: (info: ProductPartInfo | null) => void;
};

const HIGHLIGHT = new Color("#7dd3fc");

function resolvePart(
  object: Object3D,
  parts: ProductPartInfo[],
): ProductPartInfo | null {
  const sorted = [...parts].sort((a, b) => b.id.length - a.id.length);
  let current: Object3D | null = object;
  while (current) {
    const name = current.name;
    if (name) {
      for (const part of sorted) {
        if (name === part.id || name.startsWith(part.id)) return part;
      }
    }
    current = current.parent;
  }
  return null;
}

function findHighlightRoot(object: Object3D, partId: string): Object3D {
  let current: Object3D | null = object;
  let fallback = object;
  while (current) {
    if (current.name === partId) return current;
    if (current.name?.startsWith(partId)) fallback = current;
    current = current.parent;
  }
  return fallback;
}

export const GenericProductModel = forwardRef<GenericHandles, Props>(
  function GenericProductModel(
    { url, explodeTargets, parts, onHoverChange },
    ref,
  ) {
    const { scene } = useGLTF(url);
    const root = useMemo(() => scene.clone(true), [scene]);
    const targets = useRef<
      { object: Object3D; axis: "x" | "y" | "z"; distance: number; base: Vector3 }[]
    >([]);
    const hoveredMats = useRef<
      { mat: MeshStandardMaterial; emissive: Color; intensity: number }[]
    >([]);
    const activeId = useRef<string | null>(null);
    useEffect(() => {
      root.traverse((obj) => {
        const mesh = obj as Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => m.clone());
        } else if (mesh.material) {
          mesh.material = mesh.material.clone();
        }
      });

      // Normalize size and center once so camera framing stays consistent.
      const box = new Box3().setFromObject(root);
      const size = new Vector3();
      const center = new Vector3();
      box.getSize(size);
      box.getCenter(center);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const scale = 2.2 / maxDim;
      root.scale.setScalar(scale);
      root.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

      const found: typeof targets.current = [];
      for (const target of explodeTargets) {
        const object = root.getObjectByName(target.name);
        if (!object) continue;
        found.push({
          object,
          axis: target.axis,
          distance: target.distance,
          base: object.position.clone(),
        });
      }
      targets.current = found;

      return () => {
        root.traverse((obj) => {
          const mesh = obj as Mesh;
          if (!mesh.isMesh) return;
          if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
          else mesh.material?.dispose();
        });
      };
    }, [root, explodeTargets]);

    useImperativeHandle(ref, () => ({
      setExplode(value: number) {
        const e = value * value * (3 - 2 * value);
        for (const item of targets.current) {
          item.object.position.copy(item.base);
          // Local-space offsets; parent scale maps them into the normalized scene.
          item.object.position[item.axis] += item.distance * e;
        }
      },
    }));

    const clearHighlight = () => {
      for (const entry of hoveredMats.current) {
        entry.mat.emissive.copy(entry.emissive);
        entry.mat.emissiveIntensity = entry.intensity;
      }
      hoveredMats.current = [];
      activeId.current = null;
    };

    const applyHighlight = (target: Object3D) => {
      clearHighlight();
      target.traverse((obj) => {
        const mesh = obj as Mesh;
        if (!mesh.isMesh) return;
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        for (const material of materials) {
          const mat = material as MeshStandardMaterial;
          if (!mat?.isMeshStandardMaterial) continue;
          hoveredMats.current.push({
            mat,
            emissive: mat.emissive.clone(),
            intensity: mat.emissiveIntensity,
          });
          mat.emissive.copy(HIGHLIGHT);
          mat.emissiveIntensity = Math.max(mat.emissiveIntensity, 0.25) + 0.4;
        }
      });
    };

    return (
      <group
        onPointerMissed={() => {
          clearHighlight();
          onHoverChange(null);
        }}
      >
        <primitive
          object={root}
          onPointerOver={(event: {
            stopPropagation: () => void;
            object: Object3D;
          }) => {
            event.stopPropagation();
            const info = resolvePart(event.object, parts);
            if (!info) return;
            document.body.style.cursor = "pointer";
            if (activeId.current !== info.id) {
              applyHighlight(findHighlightRoot(event.object, info.id));
              activeId.current = info.id;
            }
            onHoverChange(info);
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
            clearHighlight();
            onHoverChange(null);
          }}
        />
      </group>
    );
  },
);
