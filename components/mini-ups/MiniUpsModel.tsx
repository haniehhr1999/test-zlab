"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { Mesh, MeshStandardMaterial, Object3D } from "three";
import { Color } from "three";
import { resolvePartFromObject, type PartInfo } from "./partInfo";

export type MiniUpsHandles = {
  setExplode: (value: number) => void;
};

type MiniUpsModelProps = {
  onHoverChange: (info: PartInfo | null) => void;
};

const HIGHLIGHT = new Color("#7dd3fc");

function findHighlightRoot(object: Object3D, partId: string): Object3D {
  let current: Object3D | null = object;
  let fallback = object;

  while (current) {
    const name = current.name;
    if (!name) {
      current = current.parent;
      continue;
    }

    if (/^Cell_\d{2}$/.test(name) && partId.startsWith("Cell_")) return current;
    if (name === partId) return current;
    if (name.startsWith(partId)) fallback = current;

    current = current.parent;
  }

  return fallback;
}

export const MiniUpsModel = forwardRef<MiniUpsHandles, MiniUpsModelProps>(
  function MiniUpsModel({ onHoverChange }, ref) {
    const { scene } = useGLTF("/mini-ups.glb");
    const root = useMemo(() => scene.clone(true), [scene]);

    const lid = useRef<Object3D | null>(null);
    const battery = useRef<Object3D | null>(null);
    const charger = useRef<Object3D | null>(null);
    const output = useRef<Object3D | null>(null);
    const ports = useRef<Object3D | null>(null);
    const ledMats = useRef<MeshStandardMaterial[]>([]);
    const hoveredMats = useRef<
      { mat: MeshStandardMaterial; emissive: Color; intensity: number }[]
    >([]);
    const activeId = useRef<string | null>(null);

    useEffect(() => {
      lid.current = root.getObjectByName("Case_Top") ?? null;
      battery.current = root.getObjectByName("Battery_Pack") ?? null;
      charger.current = root.getObjectByName("PCB_Charger") ?? null;
      output.current = root.getObjectByName("PCB_Output") ?? null;
      ports.current = root.getObjectByName("Ports") ?? null;

      const leds: MeshStandardMaterial[] = [];
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

        if (/^Status_LED_\d{2}$/.test(mesh.name)) {
          const mat = mesh.material as MeshStandardMaterial;
          if (mat?.isMeshStandardMaterial) {
            mat.emissive = new Color("#e1f2ed");
            mat.emissiveIntensity = 0.7;
            leds.push(mat);
          }
        }
      });
      ledMats.current = leds;

      return () => {
        root.traverse((obj) => {
          const mesh = obj as Mesh;
          if (!mesh.isMesh) return;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        });
      };
    }, [root]);

    useImperativeHandle(ref, () => ({
      setExplode(value: number) {
        const e = value;
        if (lid.current) lid.current.position.y = e * 0.055;
        if (battery.current) battery.current.position.y = e * 0.028;
        if (charger.current) charger.current.position.x = -e * 0.045;
        if (output.current) output.current.position.x = e * 0.045;
        if (ports.current) ports.current.position.z = e * 0.038;
      },
    }));

    useFrame((state) => {
      const t = state.clock.elapsedTime;
      ledMats.current.forEach((mat, j) => {
        mat.emissiveIntensity =
          0.4 + (0.55 + Math.sin(t * 2.4 - j * 0.7) * 0.45) * 0.95;
      });
    });

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
          mat.emissiveIntensity = Math.max(mat.emissiveIntensity, 0.35) + 0.45;
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
            const info = resolvePartFromObject(event.object);
            if (!info) return;
            document.body.style.cursor = "pointer";
            if (activeId.current !== info.id) {
              applyHighlight(findHighlightRoot(event.object, info.id));
              activeId.current = info.id;
            }
            onHoverChange(info);
          }}
          onPointerMove={(event: { stopPropagation: () => void }) => {
            event.stopPropagation();
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

useGLTF.preload("/mini-ups.glb");
