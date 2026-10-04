import type { CoverTheme } from "@/lib/coverTheme";

export function Cover2D({ theme }: Readonly<{ theme: CoverTheme }>) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="relative aspect-5/7 h-4/5">
                <div className="absolute inset-y-[2%] -right-1.5 w-3 rounded-r-sm bg-[#fbf3df]" />
                <div
                    className="absolute inset-0 overflow-hidden rounded-l-sm rounded-r-md shadow-lg"
                    style={{ backgroundColor: theme.color }}
                >
                    <div className="absolute inset-y-0 left-0 w-[8%] bg-black/10" />
                    <div
                        className="absolute inset-0"
                        style={{ backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.25), transparent 60%)" }}
                    />
                </div>
            </div>
        </div>
    );
}