import type { ComponentType, SVGProps } from "react";
import { ChecklistIcon, ClockIcon, PencilIcon, SmileIcon, WalletIcon } from "@/components/ui/icons";

type SectionTypeInfo = {
    value: string;
    label: string;
    description: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const SECTION_TYPES: SectionTypeInfo[] = [
    { value: "freetext", label: "Free text", description: "Write freely, in your own words.", Icon: PencilIcon },
    { value: "checklist", label: "Checklist", description: "Things to do, ticked off as you go.", Icon: ChecklistIcon },
    { value: "appointments", label: "Appointments", description: "Times and plans for the day.", Icon: ClockIcon },
    { value: "expenses", label: "Expenses", description: "What you spent, and on what.", Icon: WalletIcon },
    { value: "mood", label: "Mood", description: "How the day felt, from 1 to 5.", Icon: SmileIcon },
];

export function sectionInfo(type: string): SectionTypeInfo {
    return SECTION_TYPES.find((entry) => entry.value === type) ?? { value: type, label: type, description: "", Icon: PencilIcon };
}