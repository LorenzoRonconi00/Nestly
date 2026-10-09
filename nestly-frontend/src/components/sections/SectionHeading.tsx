import { sectionInfo } from "@/components/structure/sectionTypes";

export function SectionHeading({ type }: Readonly<{ type: string }>) {
    const info = sectionInfo(type);

    return (
        <h3 className="flex items-center gap-2 font-hand text-xl leading-8 text-ink">
            <info.Icon className="size-5 shrink-0 text-ink-soft" />
            {info.label}
        </h3>
    );
}