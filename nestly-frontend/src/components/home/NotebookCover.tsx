import Link from "next/link";
import { CoverArt } from "@/components/agenda/CoverArt";
import { templateFor } from "@/components/agenda/templates";

type Props = { id: string; name: string; baseTemplate: string; color: string };

export function NotebookCover({ id, name, baseTemplate, color }: Readonly<Props>) {
    const template = templateFor(baseTemplate);

    return (
        <Link href={`/agendas/${id}`} title={name} className="group flex flex-col rounded-2xl focus-visible:outline-offset-4">
            <span className="block transition-transform duration-150 ease-out-strong group-hover:-translate-y-1 group-hover:-rotate-1 group-active:scale-[0.97] motion-reduce:transition-none">
                <CoverArt name={name} color={color} />
            </span>
            <span className="mt-4 flex min-h-7 items-center gap-1.5 text-sm text-ink-soft">
                <template.Icon className="size-5 shrink-0" />
                {template.label}
            </span>
        </Link>
    );
}