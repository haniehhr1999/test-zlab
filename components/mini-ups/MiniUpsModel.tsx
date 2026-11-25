"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import type { Group, MeshStandardMaterial } from "three";
import { colors } from "./materials";

export type MiniUpsHandles = {
  setExplode: (value: number) => void;
};

function Plastic({ color = colors.plastic }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.4} metalness={0} />;
}

function Metal({ color = colors.metal }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.3} metalness={0.75} />;
}

function PortFrame({
  width,
  height,
  thickness = 0.0011,
  depth = 0.009,
}: {
  width: number;
  height: number;
  thickness?: number;
  depth?: number;
}) {
  const innerW = width - 2 * thickness;
  const innerH = height - 2 * thickness;
  return (
    <group>
      <mesh position={[0, height / 2 - thickness / 2, 0]}>
        <boxGeometry args={[width, thickness, depth]} />
        <Metal />
      </mesh>
      <mesh position={[0, -height / 2 + thickness / 2, 0]}>
        <boxGeometry args={[width, thickness, depth]} />
        <Metal />
      </mesh>
      <mesh position={[-width / 2 + thickness / 2, 0, 0]}>
        <boxGeometry args={[thickness, innerH, depth]} />
        <Metal />
      </mesh>
      <mesh position={[width / 2 - thickness / 2, 0, 0]}>
        <boxGeometry args={[thickness, innerH, depth]} />
        <Metal />
      </mesh>
      <mesh position={[0, 0, -0.005]}>
        <boxGeometry args={[innerW, innerH, 0.001]} />
        <Plastic color={colors.black} />
      </mesh>
    </group>
  );
}

function Cell({ index }: { index: number }) {
  return (
    <group position={[(index - 3.5) * 0.0195, -0.004, -0.004]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.0615, 24]} />
        <meshStandardMaterial color={colors.cell} roughness={0.4} metalness={0} />
      </mesh>
      {([-1, 1] as const).map((side) => (
        <mesh key={side} position={[0, 0, side * 0.0313]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.0087, 0.0087, 0.0014, 20]} />
          <Metal color={colors.cellEnd} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.0325]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.0038, 0.0038, 0.001, 16]} />
        <Metal color={colors.cellEnd} />
      </mesh>
    </group>
  );
}

function Board({
  z,
  depth,
  name,
}: {
  z: number;
  depth: number;
  name: string;
}) {
  const xs = useMemo(() => {
    const values: number[] = [];
    for (let i = 0; i < 7; i++) values.push(-0.061 + (i * 0.122) / 6);
    return values;
  }, []);

  return (
    <group name={name}>
      <RoundedBox
        args={[0.153, 0.0017, depth]}
        radius={0.0004}
        position={[0, -0.014, z]}
      >
        <meshStandardMaterial color={colors.board} roughness={0.52} metalness={0} />
      </RoundedBox>
      {xs.map((x, j) => {
        if (j % 3 === 0) {
          return (
            <group key={`${name}-ic-${j}`}>
              <RoundedBox
                args={[0.012, 0.003, 0.008]}
                radius={0.0003}
                position={[x, -0.0115, z]}
              >
                <Plastic color={colors.chip} />
              </RoundedBox>
              {([-1, 1] as const).map((side) =>
                Array.from({ length: 5 }, (_, k) => (
                  <mesh
                    key={`${side}-${k}`}
                    position={[x - 0.004 + k * 0.002, -0.0125, z + side * 0.0047]}
                  >
                    <boxGeometry args={[0.001, 0.0005, 0.0018]} />
                    <Metal />
                  </mesh>
                )),
              )}
            </group>
          );
        }
        if (j % 3 === 1) {
          return (
            <group key={`${name}-cap-${j}`}>
              <mesh position={[x, -0.01, z]}>
                <cylinderGeometry args={[0.0038, 0.0038, 0.006, 20]} />
                <Plastic color={colors.chip} />
              </mesh>
              <mesh position={[x, -0.0068, z]}>
                <cylinderGeometry args={[0.0035, 0.0035, 0.0006, 20]} />
                <Metal />
              </mesh>
            </group>
          );
        }
        return (
          <group key={`${name}-ind-${j}`}>
            <RoundedBox
              args={[0.01, 0.005, 0.009]}
              radius={0.0007}
              position={[x, -0.01, z]}
            >
              <Plastic color={colors.edge} />
            </RoundedBox>
            <RoundedBox
              args={[0.006, 0.0006, 0.005]}
              radius={0.0002}
              position={[x, -0.0072, z]}
            >
              <meshStandardMaterial
                color={colors.copper}
                roughness={0.4}
                metalness={0.55}
              />
            </RoundedBox>
          </group>
        );
      })}
    </group>
  );
}

function StatusLeds() {
  const mats = useRef<(MeshStandardMaterial | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    mats.current.forEach((mat, j) => {
      if (!mat) return;
      mat.emissiveIntensity =
        0.45 + (0.55 + Math.sin(t * 2.4 - j * 0.7) * 0.45) * 0.9;
    });
  });

  return (
    <group name="Status_LED">
      {Array.from({ length: 4 }, (_, j) => (
        <mesh key={j} position={[0.032 + j * 0.009, 0.02165, 0.036]}>
          <cylinderGeometry args={[0.0014, 0.0014, 0.0007, 16]} />
          <meshStandardMaterial
            ref={(el) => {
              mats.current[j] = el;
            }}
            color={colors.led}
            emissive={colors.led}
            emissiveIntensity={0.8}
            roughness={0.25}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  );
}

export const MiniUpsModel = forwardRef<MiniUpsHandles>(function MiniUpsModel(
  _,
  ref,
) {
  const lid = useRef<Group>(null);
  const battery = useRef<Group>(null);
  const charger = useRef<Group>(null);
  const output = useRef<Group>(null);
  const ports = useRef<Group>(null);

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

  return (
    <group name="Mini_DC_UPS">
      <group name="Case_Bottom">
        <RoundedBox
          args={[0.18, 0.005, 0.115]}
          radius={0.0023}
          position={[0, -0.019, 0]}
        >
          <Plastic />
        </RoundedBox>

        <mesh position={[0, -0.00275, -0.056]}>
          <boxGeometry args={[0.18, 0.0285, 0.003]} />
          <Plastic />
        </mesh>
        <mesh position={[-0.0885, -0.00275, 0]}>
          <boxGeometry args={[0.003, 0.0285, 0.115]} />
          <Plastic />
        </mesh>
        <mesh position={[0.0885, -0.00275, 0]}>
          <boxGeometry args={[0.003, 0.0285, 0.115]} />
          <Plastic />
        </mesh>
        <mesh position={[0, -0.00275, 0.056]}>
          <boxGeometry args={[0.18, 0.0285, 0.003]} />
          <Plastic />
        </mesh>

        {(
          [
            [-0.073, -0.043],
            [0.073, -0.043],
            [-0.073, 0.043],
            [0.073, 0.043],
          ] as const
        ).map(([x, z], i) => (
          <mesh key={i} position={[x, -0.022, z]}>
            <cylinderGeometry args={[0.004, 0.004, 0.0015, 16]} />
            <Plastic color={colors.black} />
          </mesh>
        ))}

        {(
          [
            [0.008, 0.003, "5V"],
            [0.016, 0.003, "9V"],
            [0.024, 0.003, "12V"],
            [0.041, -0.0127, "OUT"],
            [0.065, -0.0127, "IN"],
          ] as const
        ).map(([x, y, label]) => (
          <Text
            key={label}
            position={[x, y, 0.0582]}
            fontSize={0.0045}
            color="#e6e6e6"
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>
        ))}
      </group>

      <group ref={lid} name="Case_Top">
        <RoundedBox
          args={[0.18, 0.01, 0.115]}
          radius={0.004}
          position={[0, 0.0165, 0]}
        >
          <Plastic color={colors.lid} />
        </RoundedBox>
        <StatusLeds />
      </group>

      <group ref={battery} name="Battery_Pack">
        {Array.from({ length: 8 }, (_, j) => (
          <Cell key={j} index={j} />
        ))}
        {([-0.032, 0.024] as const).map((z, j) => (
          <RoundedBox
            key={j}
            args={[0.159, 0.0013, 0.005]}
            radius={0.0005}
            position={[0, 0.0055, z]}
          >
            <Plastic color={colors.edge} />
          </RoundedBox>
        ))}
      </group>

      <group ref={charger}>
        <Board z={-0.046} depth={0.014} name="PCB_Charger" />
      </group>
      <group ref={output}>
        <Board z={0.04} depth={0.019} name="PCB_Output" />
      </group>

      <group ref={ports} name="Ports">
        {([-0.061, -0.037] as const).map((x, j) => (
          <group key={`poe-${j}`} position={[x, -0.002, 0.054]}>
            <PortFrame width={0.0175} height={0.0145} />
            {Array.from({ length: 8 }, (_, k) => (
              <mesh key={k} position={[(k - 3.5) * 0.00125, -0.004, -0.0016]}>
                <boxGeometry args={[0.00065, 0.00055, 0.005]} />
                <meshStandardMaterial
                  color={colors.gold}
                  roughness={0.28}
                  metalness={0.65}
                />
              </mesh>
            ))}
            {([-1, 1] as const).map((s, k) => (
              <RoundedBox
                key={k}
                args={[0.0027, 0.002, 0.001]}
                radius={0.00025}
                position={[s * 0.0055, 0.0057, 0.0045]}
              >
                <meshStandardMaterial
                  color={colors.linkLed}
                  emissive={colors.linkLed}
                  emissiveIntensity={0.85}
                  roughness={0.4}
                />
              </RoundedBox>
            ))}
          </group>
        ))}

        <group position={[-0.01, -0.005, 0.054]}>
          <PortFrame width={0.0145} height={0.0085} thickness={0.00085} />
          <mesh position={[0, -0.001, -0.001]}>
            <boxGeometry args={[0.01, 0.0013, 0.006]} />
            <Plastic color={colors.edge} />
          </mesh>
          {Array.from({ length: 4 }, (_, j) => (
            <mesh key={j} position={[(j - 1.5) * 0.002, -0.0002, -0.001]}>
              <boxGeometry args={[0.001, 0.0004, 0.004]} />
              <meshStandardMaterial
                color={colors.gold}
                roughness={0.28}
                metalness={0.65}
              />
            </mesh>
          ))}
        </group>

        <group position={[0.016, -0.005, 0.054]}>
          <PortFrame width={0.0155} height={0.0075} thickness={0.001} />
          <RoundedBox
            args={[0.0045, 0.0048, 0.0035]}
            radius={0.0006}
            position={[-0.003, 0, 0.003]}
          >
            <Plastic />
          </RoundedBox>
        </group>

        {(
          [
            ["Port_DC_OUT", 0.041],
            ["Port_DC_IN", 0.065],
          ] as const
        ).map(([name, x]) => (
          <group key={name} position={[x, -0.004, 0.053]}>
            <RoundedBox args={[0.0117, 0.0117, 0.007]} radius={0.0007}>
              <Plastic color={colors.edge} />
            </RoundedBox>
            <mesh position={[0, 0, 0.004]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.0047, 0.0047, 0.0025, 24]} />
              <Plastic color={colors.black} />
            </mesh>
            <mesh position={[0, 0, 0.002]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.0032, 0.0032, 0.001, 20]} />
              <Plastic color={colors.black} />
            </mesh>
            <mesh position={[0, 0, 0.002]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.0008, 0.0008, 0.003, 12]} />
              <Metal />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
});
