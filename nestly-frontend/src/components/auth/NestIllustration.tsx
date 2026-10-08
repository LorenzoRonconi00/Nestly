type Props = { className?: string };

export function NestIllustration({ className }: Readonly<Props>) {
    return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 360 300" fill="none" className={className}>
            <ellipse cx="180" cy="270" rx="136" ry="12" className="fill-ink" opacity=".07" />

            <g filter="url(#crayon)" strokeLinecap="round" strokeLinejoin="round" className="stroke-twig" strokeWidth="7">
                <path d="M46 188C66 238 126 266 182 266c52 0 112-26 134-82" />
                <path d="M40 204c36 52 98 68 142 68 50 0 108-20 140-78" />
                <path d="M58 176c46 38 92 50 138 46 44-4 84-20 112-48" />
                <path d="M54 202 124 170" />
                <path d="M88 236l86-50" />
                <path d="M250 238l68-44" />
            </g>

            <g filter="url(#crayon)" strokeLinecap="round" strokeLinejoin="round">
                <path
                    d="M180 98c36 0 58 42 58 80 0 36-24 62-58 62s-58-26-58-62c0-38 22-80 58-80Z"
                    className="fill-crayon-yellow stroke-ink-soft"
                    strokeWidth="3"
                />
                <path d="M150 140c3 6 9 7 14 3" className="stroke-crayon-pink" strokeWidth="7" />
                <path d="M196 124c4 4 10 4 14 0" className="stroke-crayon-lilac" strokeWidth="7" />
                <path d="M170 186c4 6 11 6 16 1" className="stroke-crayon-blue" strokeWidth="7" />
                <path d="M205 170c3 5 8 6 12 3" className="stroke-crayon-pink" strokeWidth="6" />
                <path d="M146 176c2 4 6 5 10 3" className="stroke-crayon-green" strokeWidth="6" />
            </g>

            <g filter="url(#crayon)" strokeLinecap="round" strokeLinejoin="round" className="stroke-twig" strokeWidth="7">
                <path d="M62 196c38 34 86 48 124 48 44 0 92-16 122-48" />
                <path d="M96 222c26 14 52 22 84 22" />
                <path d="M226 244c28-6 54-20 74-40" />
            </g>

            <g filter="url(#crayon)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
                <path d="M34 92c18-24 48-26 66-18-4 24-30 40-58 32-4-4-8-8-8-14Z" className="fill-crayon-green stroke-ink-soft" />
                <path d="M40 104c14-8 30-18 44-26" className="stroke-ink-soft" strokeWidth="2.5" />
                <path d="M300 62l7 17 17 7-17 7-7 17-7-17-17-7 17-7 7-17Z" className="fill-crayon-lilac stroke-ink-soft" />
                <path d="M318 142c3-6 10-6 12 0s-3 11-9 11-8-6-3-11Z" className="fill-crayon-pink stroke-ink-soft" strokeWidth="2.5" />
                <path d="M64 142c4-5 10-4 11 2s-4 10-9 9-5-6-2-11Z" className="fill-crayon-blue stroke-ink-soft" strokeWidth="2.5" />
            </g>
        </svg>
    );
}