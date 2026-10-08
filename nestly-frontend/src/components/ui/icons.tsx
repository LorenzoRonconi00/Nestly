import type { SVGProps } from "react";

function Icon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            {...props}
        />
    );
}

export function MailIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M3.8 6.6c5.4-.5 11.2-.3 16.5-.2.3 3.6.2 7.2-.1 10.9-5.5.4-10.9.3-16.2.1-.3-3.6-.4-7.2-.2-10.8Z" />
            <path d="M4.3 7.4c2.6 2.2 5.2 4.1 7.8 5.8 2.6-1.8 5.3-3.7 7.6-5.9" />
        </Icon>
    );
}

export function KeyIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M8.3 10.6c2.2.1 3.9 1.8 3.8 3.9-.1 2.1-1.9 3.8-4 3.7-2.1-.1-3.8-1.9-3.6-4 .1-2.1 1.8-3.6 3.8-3.6Z" />
            <path d="M11.4 12.4 19.6 4.3" />
            <path d="m16.8 7.2 2.3 2.3" />
            <path d="m14.4 9.7 1.8 1.8" />
        </Icon>
    );
}

export function EyeIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M2.8 12.2C5 8 8.4 5.9 12 6c3.7.1 7 2.3 9.3 6.1-2.3 3.9-5.6 6-9.3 5.9-3.6-.1-7-2.1-9.2-5.8Z" />
            <path d="M12 9.6c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5Z" />
        </Icon>
    );
}

export function EyeOffIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M2.8 12.2C5 8 8.4 5.9 12 6c3.7.1 7 2.3 9.3 6.1-2.3 3.9-5.6 6-9.3 5.9-3.6-.1-7-2.1-9.2-5.8Z" />
            <path d="M12 9.6c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5Z" />
            <path d="M4.4 4.3c5 5.1 10.2 10.2 15.3 15.4" />
        </Icon>
    );
}

export function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M19.5 12.2c-4.6.3-9.2.1-14.2 0" />
            <path d="M10.6 6.3 4.8 12l5.7 5.8" />
        </Icon>
    );
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M4.5 12c4.7-.3 9.3-.1 14.2.1" />
            <path d="M13.5 6.2 19.3 12l-5.8 5.7" />
        </Icon>
    );
}

export function AlertIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M12 3.4c4.8-.1 8.5 3.6 8.6 8.4.1 4.8-3.7 8.7-8.5 8.7-4.9 0-8.6-3.7-8.6-8.5 0-4.8 3.7-8.6 8.5-8.6Z" />
            <path d="M12 7.9v4.9" />
            <path d="M12 16.2v.1" />
        </Icon>
    );
}

export function SpinnerIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M12 3.6c4.7 0 8.4 3.7 8.4 8.4" />
            <path d="M20.2 14.4c-1.1 3.6-4.4 6-8.2 6-4.7 0-8.4-3.7-8.4-8.4 0-3.7 2.4-7 6-8.1" opacity=".35" />
        </Icon>
    );
}