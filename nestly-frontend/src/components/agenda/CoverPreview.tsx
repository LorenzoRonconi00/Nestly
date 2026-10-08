import { CoverArt } from "@/components/agenda/CoverArt";
import { templateFor } from "@/components/agenda/templates";

type Props = { name: string; color: string; baseTemplate: string; className: string };

export function CoverPreview({ name, color, baseTemplate, className }: Readonly<Props>) {
    const template = templateFor(baseTemplate);

    return (
        <div aria-hidden="true" className={`flex flex-col items-center ${className}`}>
            <div className="w-full -rotate-2">
                <CoverArt name={name} color={color} placeholder="Your agenda" />
            </div>
            <p className="mt-5 flex items-center gap-1.5 text-sm text-ink-soft">
                <template.Icon className="size-5 shrink-0" />
                {template.label}
            </p>
        </div>
    );
}