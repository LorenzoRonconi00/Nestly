"use client";

import { PageSections } from "@/components/PageSections";
import { PageFace } from "@/components/spread/PageFace";
import { buildSampleSections } from "@/lib/sampleSections";

type Props = { sections: { type: string; order: number }[]; coverColor: string };

export function StructurePreview({ sections, coverColor }: Readonly<Props>) {
    return (
        <div className="rounded-[2rem] p-3 shadow-xl" style={{ backgroundColor: coverColor }}>
            <div inert aria-hidden="true">
                <PageFace title="Sample page" side="single">
                    {sections.length === 0 ? (
                        <p className="written text-ink-soft">Add a section to see it here.</p>
                    ) : (
                        <PageSections sections={buildSampleSections(sections)} onSaveSection={() => undefined} />
                    )}
                </PageFace>
            </div>
        </div>
    );
}