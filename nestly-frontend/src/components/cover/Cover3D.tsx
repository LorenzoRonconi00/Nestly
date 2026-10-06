"use client";

import { useEffect, useEffectEvent, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { gsap } from "gsap";
import type { Group } from "three";
import type { CoverTheme } from "@/lib/coverTheme";

const WIDTH = 2;
const HEIGHT = 2.8;
const THICKNESS = 0.5;
const PLATE = 0.06;
const BASE_ROTATION_Y = -0.55;
const PAGES_COLOR = "#fbf3df";
const OPEN_ANGLE = Math.PI * 0.97;
const OPEN_SECONDS = 2.4;
const DOLLY_SECONDS = 2.6;
const CAMERA_START_Z = 7;
const CAMERA_END_Z = 6.2;

export type CoverTimeline = gsap.core.Timeline;
export type CoverAnimationReady = (timeline: CoverTimeline | null) => void;

type BookProps = { theme: CoverTheme; onAnimationReady?: CoverAnimationReady };

function Book({ theme, onAnimationReady }: Readonly<BookProps>) {
    const groupRef = useRef<Group>(null);
    const pivotRef = useRef<Group>(null);
    const swayRef = useRef(true);
    const getState = useThree((state) => state.get);
    const reducedMotion = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
    const notifyReady = useEffectEvent((timeline: CoverTimeline | null) => onAnimationReady?.(timeline));

    useFrame(({ clock }) => {
        if (!groupRef.current || reducedMotion || !swayRef.current) return;
        groupRef.current.rotation.y = BASE_ROTATION_Y + Math.sin(clock.elapsedTime * 0.6) * 0.15;
    });

    useEffect(() => {
        const group = groupRef.current;
        const pivot = pivotRef.current;
        if (!group || !pivot) return;

        const camera = getState().camera;
        swayRef.current = true;
        const timeline = gsap.timeline({
            paused: true,
            onStart: () => {
                swayRef.current = false;
            },
        });
        timeline
            .to(pivot.rotation, { y: -OPEN_ANGLE, duration: OPEN_SECONDS, ease: "power2.inOut" }, 0)
            .to(group.rotation, { x: 0.04, y: 0, duration: OPEN_SECONDS, ease: "power2.inOut" }, 0)
            .to(group.position, { x: 1, duration: OPEN_SECONDS, ease: "power2.inOut" }, 0)
            .to(camera.position, { z: CAMERA_END_Z, duration: DOLLY_SECONDS, ease: "power1.inOut" }, 0);
        notifyReady(timeline);

        return () => {
            timeline.kill();
            notifyReady(null);
        };
    }, [getState]);

    return (
        <group ref={groupRef} rotation={[0.12, BASE_ROTATION_Y, 0]}>
            <group ref={pivotRef} position={[-WIDTH / 2, 0, THICKNESS / 2 - PLATE / 2]}>
                <RoundedBox args={[WIDTH, HEIGHT, PLATE]} radius={0.025} smoothness={4} position={[WIDTH / 2, 0, 0]}>
                    <meshStandardMaterial color={theme.color} roughness={0.7} />
                </RoundedBox>
                <mesh position={[(WIDTH - 0.07) / 2, 0, -PLATE / 2 - 0.002]} rotation={[0, Math.PI, 0]}>
                    <planeGeometry args={[WIDTH - 0.07, HEIGHT - 0.1]} />
                    <meshStandardMaterial color={PAGES_COLOR} roughness={1} />
                </mesh>
            </group>
            <RoundedBox
                args={[WIDTH, HEIGHT, PLATE]}
                radius={0.025}
                smoothness={4}
                position={[0, 0, -(THICKNESS / 2 - PLATE / 2)]}
            >
                <meshStandardMaterial color={theme.color} roughness={0.7} />
            </RoundedBox>
            <mesh position={[-WIDTH / 2 + 0.04, 0, 0]}>
                <boxGeometry args={[0.08, HEIGHT, THICKNESS - 0.06]} />
                <meshStandardMaterial attach="material-0" color={theme.color} roughness={0.7} />
                <meshStandardMaterial attach="material-1" color={theme.color} roughness={0.7} />
                <meshStandardMaterial attach="material-2" color={theme.color} roughness={0.7} />
                <meshStandardMaterial attach="material-3" color={theme.color} roughness={0.7} />
                <meshStandardMaterial attach="material-4" color={PAGES_COLOR} roughness={1} />
                <meshStandardMaterial attach="material-5" color={theme.color} roughness={0.7} />
            </mesh>
            <mesh position={[-0.0225, 0, 0]}>
                <boxGeometry args={[WIDTH - 0.205, HEIGHT - 0.26, THICKNESS - 2 * PLATE]} />
                <meshStandardMaterial color={PAGES_COLOR} roughness={1} />
            </mesh>
        </group>
    );
}

export function Cover3D({ theme, onAnimationReady }: Readonly<BookProps>) {
    return (
        <Canvas camera={{ position: [0, 0, CAMERA_START_Z], fov: 35 }} dpr={[1, 2]}>
            <ambientLight intensity={1.9} />
            <directionalLight position={[3, 4, 5]} intensity={1.4} />
            <Book theme={theme} onAnimationReady={onAnimationReady} />
        </Canvas>
    );
}