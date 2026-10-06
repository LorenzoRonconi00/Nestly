"use client";

import { useEffectEvent, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { PageSections } from "@/components/PageSections";
import { PageFace, type Side } from "@/components/spread/PageFace";
import { Spread } from "@/components/spread/Spread";
import type { PageData } from "@/lib/pages";
import type { FlipState, SpreadData } from "@/lib/spread";

const FLIP_SECONDS_DOUBLE = 1.1;
const FLIP_SECONDS_SINGLE = 0.65;
const PERSPECTIVE_PX = 1800;
const FRONT_SHADE_PEAK = 0.35;
const UNDER_SHADE_START = 0.3;

type SaveSection = (pageId: string, sectionId: string, data: Record<string, unknown>) => void;

const NOOP: SaveSection = () => undefined;

type FaceProps = {
    page: PageData;
    side: Side;
    title: string;
    onSaveSection: SaveSection;
    shadeRef?: React.Ref<HTMLDivElement>;
};

function Face({ page, side, title, onSaveSection, shadeRef }: Readonly<FaceProps>) {
    return (
        <PageFace title={title} side={side} shadeRef={shadeRef}>
            <PageSections
                sections={page.sections}
                onSaveSection={(sectionId, data) => onSaveSection(page.id, sectionId, data)}
            />
        </PageFace>
    );
}

function leafSlotFor(flip: FlipState | null, double: boolean): Side | null {
    if (!flip) return null;
    if (!double) return "single";
    return flip.direction === "next" ? "right" : "left";
}

function flipFaces(flip: FlipState, double: boolean) {
    const pages = flip.to.pages;
    if (!double) return { underlay: pages[0], back: undefined, backSide: "single" as Side };
    if (flip.direction === "next") return { underlay: pages[1], back: pages[0], backSide: "left" as Side };
    return { underlay: pages[0], back: pages[1], backSide: "right" as Side };
}

type Props = {
    coverColor: string;
    displayed: SpreadData;
    flip: FlipState | null;
    titleFor: (page: PageData) => string;
    onSaveSection: SaveSection;
    onFlipDone: () => void;
};

export function BookStage({ coverColor, displayed, flip, titleFor, onSaveSection, onFlipDone }: Readonly<Props>) {
    const double = displayed.pages.length === 2;
    const slots: Side[] = double ? ["left", "right"] : ["single"];
    const leafSlot = leafSlotFor(flip, double);
    const faces = flip ? flipFaces(flip, double) : null;

    const leafRef = useRef<HTMLDivElement>(null);
    const frontShadeRef = useRef<HTMLDivElement>(null);
    const backShadeRef = useRef<HTMLDivElement>(null);
    const underShadeRef = useRef<HTMLDivElement>(null);

    const finish = useEffectEvent(() => onFlipDone());

    useLayoutEffect(() => {
        const leaf = leafRef.current;
        if (!flip || !leaf) return;

        const forward = flip.direction === "next";
        const angle = (double ? 180 : 90) * (forward ? -1 : 1);
        const seconds = double ? FLIP_SECONDS_DOUBLE : FLIP_SECONDS_SINGLE;

        gsap.set(leaf, {
            transformOrigin: forward ? "left center" : "right center",
            transformPerspective: PERSPECTIVE_PX,
        });

        const timeline = gsap.timeline({
            onComplete: () => {
                finish();
                gsap.set(leaf, { clearProps: "transform,transformOrigin" });
            },
        });
        timeline.fromTo(leaf, { rotateY: 0 }, { rotateY: angle, duration: seconds, ease: "power2.inOut" }, 0);
        if (frontShadeRef.current) {
            timeline.fromTo(
                frontShadeRef.current,
                { opacity: 0 },
                { opacity: FRONT_SHADE_PEAK, duration: seconds / 2, ease: "sine.in" },
                0,
            );
        }
        if (backShadeRef.current) {
            timeline.fromTo(
                backShadeRef.current,
                { opacity: FRONT_SHADE_PEAK },
                { opacity: 0, duration: seconds / 2, ease: "sine.out" },
                seconds / 2,
            );
        }
        if (underShadeRef.current) {
            timeline.fromTo(
                underShadeRef.current,
                { opacity: UNDER_SHADE_START },
                { opacity: 0, duration: seconds, ease: "power1.out" },
                0,
            );
        }

        return () => {
            timeline.kill();
        };
    }, [flip, double]);

    return (
        <Spread coverColor={coverColor}>
            {slots.map((slot, index) => {
                const live = displayed.pages[index];
                const isLeaf = slot === leafSlot;

                return (
                    <div key={slot} className={`relative ${isLeaf ? "z-20" : "z-0"}`}>
                        {isLeaf && faces?.underlay && (
                            <div inert aria-hidden="true" className="absolute inset-0 overflow-hidden">
                                <Face
                                    page={faces.underlay}
                                    side={slot}
                                    title={titleFor(faces.underlay)}
                                    onSaveSection={NOOP}
                                    shadeRef={underShadeRef}
                                />
                            </div>
                        )}
                        <div ref={isLeaf ? leafRef : undefined} className="relative h-full transform-3d">
                            <div className="relative h-full backface-hidden">
                                <Face
                                    key={live.id}
                                    page={live}
                                    side={slot}
                                    title={titleFor(live)}
                                    onSaveSection={onSaveSection}
                                    shadeRef={isLeaf ? frontShadeRef : undefined}
                                />
                            </div>
                            {isLeaf && faces?.back && (
                                <div inert aria-hidden="true" className="absolute inset-0 rotate-y-180 backface-hidden">
                                    <Face
                                        page={faces.back}
                                        side={faces.backSide}
                                        title={titleFor(faces.back)}
                                        onSaveSection={NOOP}
                                        shadeRef={backShadeRef}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </Spread>
    );
}