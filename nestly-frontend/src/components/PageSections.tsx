"use client";

import { MoodSection } from "@/components/sections/MoodSection";
import { SoundToggle } from "@/components/handwriting/SoundToggle";
import { FreetextSection } from "@/components/sections/FreetextSection";
import { ExpensesSection } from "@/components/sections/ExpensesSection";
import { ChecklistSection } from "@/components/sections/ChecklistSection";
import { AppointmentsSection } from "@/components/sections/AppointmentsSection";

export type Section = { id: string; type: string; order: number; data: Record<string, unknown> };

type Props = {
    sections: Section[];
    onSaveSection: (sectionId: string, data: Record<string, unknown>) => void;
};

export function PageSections({ sections, onSaveSection }: Props) {
    return (
        <div className="flex w-full flex-col gap-2">
            <SoundToggle />
            <div className="sheet-lines flex flex-col gap-8 rounded-2xl border border-border bg-sheet p-8 shadow-md">
                {sections
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                        <SectionRenderer
                            key={section.id}
                            section={section}
                            onSave={(data) => onSaveSection(section.id, data)}
                        />
                    ))}
            </div>
        </div>
    );
}

function SectionRenderer({ section, onSave }: { section: Section; onSave: (data: Record<string, unknown>) => void }) {
    switch (section.type) {
        case "freetext":
            return <FreetextSection initialData={section.data} onSave={onSave} />;
        case "expenses":
            return <ExpensesSection initialData={section.data} onSave={onSave} />;
        case "checklist":
            return <ChecklistSection initialData={section.data} onSave={onSave} />;
        case "mood":
            return <MoodSection initialData={section.data} onSave={onSave} />;
        case "appointments":
            return <AppointmentsSection initialData={section.data} onSave={onSave} />;
        default:
            return <p className="rounded-xl border bg-paper p-3 text-sm text-ink-soft">Unknown section type: {section.type}</p>;
    }
}