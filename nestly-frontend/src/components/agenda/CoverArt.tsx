import { CrayonFrame } from "@/components/ui/CrayonFrame";

const COVER_PATH = "M4 5C30 3 66 5 94 4 97 40 96 100 95 136 66 138 30 136 5 137 2.5 100 4 40 4 5Z";
const SPINE_PATH = "M4 5C9 4.6 13 4.8 16 5 15 50 15.6 100 16 136 12 136.4 8 136.6 5 137 3 100 4 40 4 5Z";

type Props = { name: string; color: string; placeholder?: string };

export function CoverArt({ name, color, placeholder }: Readonly<Props>) {
    const written = name.trim();

    return (
        <span className="relative block aspect-[5/7]">
            <span aria-hidden="true" className="absolute -bottom-2 left-[8%] h-3 w-[84%] rounded-full bg-ink/10 blur-md" />
            <svg aria-hidden="true" focusable="false" className="absolute inset-0 size-full" viewBox="0 0 100 140" preserveAspectRatio="none" fill="none">
                <path d="M92 6C95 5 98 6 99 7L99.5 133C97 135 94 135.5 92 134Z" fill="#fbf3df" className="stroke-ink-soft" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
                <path
                    d={COVER_PATH}
                    style={{ fill: color }}
                    className="transition-[fill] duration-150 ease-out-strong motion-reduce:transition-none"
                    filter="url(#crayon-soft)"
                />
                <path d={SPINE_PATH} className="fill-ink" opacity=".14" filter="url(#crayon)" />
                <path d="M28 15C52 12.5 74 13.5 88 16" stroke="#fff" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" filter="url(#crayon-soft)" />
                <path d={COVER_PATH} className="stroke-ink-soft" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
            <span className="absolute inset-x-[19%] top-[30%] block px-2 py-4 text-center">
                <CrayonFrame filled />
                <span className={`relative line-clamp-3 font-hand text-xl leading-6 break-words ${written ? "text-ink" : "text-ink-soft"}`}>
                    {written || placeholder}
                </span>
            </span>
        </span>
    );
}