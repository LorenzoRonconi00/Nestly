import type { ComponentType, SVGProps } from "react";
import { BookIcon, CalendarIcon, NotebookIcon } from "@/components/ui/icons";

export type AgendaTemplate = "notebook" | "standard" | "diary";

type TemplateInfo = {
    value: AgendaTemplate;
    label: string;
    description: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const AGENDA_TEMPLATES: TemplateInfo[] = [
    { value: "notebook", label: "Notebook", description: "Numbered pages, no dates.", Icon: NotebookIcon },
    {
        value: "standard",
        label: "Agenda",
        description: "A page for every day, with the sections you choose.",
        Icon: CalendarIcon,
    },
    { value: "diary", label: "Diary", description: "A page for every day, made for writing.", Icon: BookIcon },
];

export function templateFor(value: string): TemplateInfo {
    return AGENDA_TEMPLATES.find((template) => template.value === value) ?? AGENDA_TEMPLATES[1];
}