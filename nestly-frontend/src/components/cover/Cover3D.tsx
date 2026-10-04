"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { Group } from "three";
import type { CoverTheme } from "@/lib/coverTheme";

const WIDTH = 2;
const HEIGHT = 2.8;
const THICKNESS = 0.5;
const PLATE = 0.06;
const BASE_ROTATION_Y = -0.55;
const PAGES_COLOR = "#fbf3df";

function Book({ theme }: Readonly<{ theme: CoverTheme }>) {
    const groupRef = useRef<Group>(null);
    const reducedMotion = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

    useFrame(({ clock }) => {
        if (!groupRef.current || reducedMotion) return;
        groupRef.current.rotation.y = BASE_ROTATION_Y + Math.sin(clock.elapsedTime * 0.6) * 0.15;
    });

    return (
        <group ref={groupRef} rotation={[0.12, BASE_ROTATION_Y, 0]}>
            <RoundedBox
                args={[WIDTH, HEIGHT, PLATE]}
                radius={0.025}
                smoothness={4}
                position={[0, 0, THICKNESS / 2 - PLATE / 2]}
            >
                <meshStandardMaterial color={theme.color} roughness={0.7} />
            </RoundedBox>
            <RoundedBox
                args={[WIDTH, HEIGHT, PLATE]}
                radius={0.025}
                smoothness={4}
                position={[0, 0, -(THICKNESS / 2 - PLATE / 2)]}
            >
                <meshStandardMaterial color={theme.color} roughness={0.7} />
            </RoundedBox>
            <RoundedBox
                args={[0.08, HEIGHT, THICKNESS]}
                radius={0.03}
                smoothness={4}
                position={[-WIDTH / 2 + 0.04, 0, 0]}
            >
                <meshStandardMaterial color={theme.color} roughness={0.7} />
            </RoundedBox>
            <mesh position={[0.01, 0, 0]}>
                <boxGeometry args={[WIDTH - 0.14, HEIGHT - 0.1, THICKNESS - 2 * PLATE]} />
                <meshStandardMaterial color={PAGES_COLOR} roughness={1} />
            </mesh>
        </group>
    );
}

export function Cover3D({ theme }: Readonly<{ theme: CoverTheme }>) {
    return (
        <Canvas camera={{ position: [0, 0, 7], fov: 35 }} dpr={[1, 2]}>
            <ambientLight intensity={1.1} />
            <directionalLight position={[3, 4, 5]} intensity={1.6} />
            <Book theme={theme} />
        </Canvas>
    );
}