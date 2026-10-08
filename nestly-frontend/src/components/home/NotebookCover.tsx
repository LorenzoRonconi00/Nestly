import Link from "next/link";
import { CrayonFrame } from "@/components/ui/CrayonFrame";
import { BookIcon, CalendarIcon, NotebookIcon } from "@/components/ui/icons";

const TEMPLATES = {
    notebook: { label: "Notebook", Icon: NotebookIcon },
    standard: { label: "Agenda", Icon: CalendarIcon },
    diary: { label: "Diary", Icon: BookIcon },
} as const;

const COVER_PATH = "M4 5C30 3 66 5 94 4 97 40 96 100 95 136 66 138 30 136 5 137 2.5 100 4 40 4 5Z";
const SPINE_PATH = "M4 5C9 4.6 13 4.8 16 5 15 50 15.6 100 16 136 12 136.4 8 136.6 5 137 3 100 4 40 4 5Z";

type Props = { id: string; name: string; baseTemplate: string; color: string };

export function NotebookCover({ id, name, baseTemplate, color }: Readonly<Props>) {
    const template = TEMPLATES[baseTemplate as keyof typeof TEMPLATES] ?? TEMPLATES.standard;

    return (
        <Link href={`/agendas/${id}`} title={name} className="group flex flex-col rounded-2xl focus-visible:outline-offset-4">
            <span className="relative block aspect-[5/7] transition-transform duration-150 ease-out-strong group-hover:-translate-y-1 group-hover:-rotate-1 group-active:scale-[0.97] motion-reduce:transition-none">
                <span aria-hidden="true" className="absolute -bottom-2 left-[8%] h-3 w-[84%] rounded-full bg-ink/10 blur-md" />
                <svg aria-hidden="true" focusable="false" className="absolute inset-0 size-full" viewBox="0 0 100 140" preserveAspectRatio="none" fill="none">
                    <path d="M92 6C95 5 98 6 99 7L99.5 133C97 135 94 135.5 92 134Z" fill="#fbf3df" className="stroke-ink-soft" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
                    <path d={COVER_PATH} fill={color} filter="url(#crayon-soft)" />
                    <path d={SPINE_PATH} className="fill-ink" opacity=".14" filter="url(#crayon)" />
                    <path d="M28 15C52 12.5 74 13.5 88 16" stroke="#fff" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" filter="url(#crayon-soft)" />
                    <path d={COVER_PATH} className="stroke-ink-soft" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                </svg>
                <span className="absolute inset-x-[19%] top-[30%] block px-2 py-4 text-center">
                    <CrayonFrame filled />
                    <span className="relative line-clamp-3 font-hand text-xl leading-6 break-words text-ink">{name}</span>
                </span>
            </span>
            <span className="mt-4 flex min-h-7 items-center gap-1.5 text-sm text-ink-soft">
                <template.Icon className="size-5 shrink-0" />
                {template.label}
            </span>
        </Link>
    );
}