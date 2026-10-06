import type { Section } from "@/components/PageSections";

const SAMPLES: Record<string, Record<string, unknown>> = {
    freetext: {
        text: "Today was a slow, good day. I walked by the lake and wrote down a few thoughts.",
        confirmed: true,
    },
    checklist: {
        items: [
            { id: "sample-checklist-1", text: "Buy fresh bread", done: true },
            { id: "sample-checklist-2", text: "Call Anna", done: false },
            { id: "sample-checklist-3", text: "Water the plants", done: false },
        ],
        confirmed: true,
    },
    expenses: {
        items: [
            { id: "sample-expenses-1", label: "Coffee", amount: 2.5, category: "Food" },
            { id: "sample-expenses-2", label: "Notebook", amount: 6, category: "Shop" },
        ],
        confirmed: true,
    },
    appointments: {
        items: [
            { id: "sample-appointments-1", time: "09:30", description: "Dentist" },
            { id: "sample-appointments-2", time: "18:00", description: "Dinner with friends" },
        ],
        confirmed: true,
    },
    mood: { value: 4 },
};

export function buildSampleSections(sections: { type: string; order: number }[]): Section[] {
    return sections.map((section) => ({
        id: `sample-${section.type}`,
        type: section.type,
        order: section.order,
        data: SAMPLES[section.type] ?? {},
    }));
}