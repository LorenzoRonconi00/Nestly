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


export function PlusIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M12 4.6c.1 5 .1 9.8 0 14.8" />
            <path d="M4.7 12.1c5-.2 9.9-.1 14.7 0" />
        </Icon>
    );
}

export function LogOutIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M10 4.4c-2.1-.2-4.2-.1-5.9.1-.2 5.1-.2 10.1 0 15.2 1.8.2 3.8.2 5.9 0" />
            <path d="M10.4 12.1c3.3-.2 6.6-.1 9.6 0" />
            <path d="m16.4 8.2 3.8 3.8-3.8 3.9" />
        </Icon>
    );
}

export function NotebookIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M6.4 3.8c4.1-.4 8.2-.3 11.6 0 .3 5.3.3 10.7 0 16.2-3.4.3-7.5.3-11.6 0-.3-5.4-.3-10.8 0-16.2Z" />
            <path d="M3.9 7.6h3.2" />
            <path d="M3.9 12h3.2" />
            <path d="M3.9 16.4h3.2" />
            <path d="M10.4 8.2h4.4" />
            <path d="M10.4 12h4.4" />
        </Icon>
    );
}

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M4.4 6.3c5.1-.5 10.2-.4 15.2 0 .4 4.3.4 8.8 0 13.2-5 .4-10.1.4-15.2 0-.4-4.4-.4-8.9 0-13.2Z" />
            <path d="M4.6 10.4c5-.3 10.1-.3 14.8 0" />
            <path d="M8.4 3.8v4.1" />
            <path d="M15.6 3.8v4.1" />
        </Icon>
    );
}

export function BookIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M5.6 4c4.2-.3 8.4-.2 12.3.1.3 5.2.3 10.6 0 15.8-3.9.4-8.1.4-12.3 0-.4-5.3-.4-10.6 0-15.9Z" />
            <path d="M8.4 4.2c.1 5.2.1 10.4 0 15.6" />
            <path d="M14.2 4.1v6.2l1.6-1.5 1.7 1.5V4.2" />
        </Icon>
    );
}


export function CheckIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M4.6 12.4c2.2 2.4 3.9 4.2 5.4 6.1C13.2 13.2 16.6 8.6 19.6 5.2" />
        </Icon>
    );
}

export function PencilIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M4.4 19.6l.9-4.3L16.2 4.4c.9-.8 2.2-.7 3 .2.9.8.9 2.1.1 3L8.5 18.7l-4.1.9Z" />
            <path d="M14.2 6.4l3.4 3.4" />
        </Icon>
    );
}


export function ArrowUpIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M12 19.4c.1-4.6.1-9.1 0-13.8" />
            <path d="M6.4 10.6 12 4.8l5.6 5.8" />
        </Icon>
    );
}

export function ArrowDownIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M12 4.6c-.1 4.6-.1 9.1 0 13.8" />
            <path d="M6.4 13.4 12 19.2l5.6-5.8" />
        </Icon>
    );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M5.4 5.6c4.6 4.2 8.8 8.4 13.2 12.8" />
            <path d="M18.6 5.4C14.4 10 10 14.2 5.4 18.6" />
        </Icon>
    );
}

export function ChecklistIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="m4.4 6.6 1.7 1.8 2.9-3.4" />
            <path d="M11.8 6.8c2.5-.2 5.1-.2 7.8 0" />
            <path d="M4.8 12.6c1.2-.2 2.4-.2 3.6 0 .1 1.2.1 2.3 0 3.5-1.2.2-2.4.2-3.6 0-.2-1.2-.2-2.3 0-3.5Z" />
            <path d="M11.8 14.4c2.5-.2 5.1-.2 7.8 0" />
            <path d="M11.8 19.4c2.5-.2 5.1-.2 7.8 0" />
        </Icon>
    );
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M12 3.8c4.6-.1 8.3 3.6 8.4 8.2.1 4.6-3.6 8.4-8.2 8.4-4.6.1-8.4-3.6-8.5-8.2C3.6 7.6 7.4 3.9 12 3.8Z" />
            <path d="M12 7.8v4.6l3 1.8" />
        </Icon>
    );
}

export function WalletIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M4.4 7.8c5.2-.6 10.3-.6 15.2 0 .3 3.8.3 7.6 0 11.4-5 .5-10.1.5-15.2 0-.3-3.8-.3-7.6 0-11.4Z" />
            <path d="M5.6 7.6 14.4 4.8" />
            <path d="M15.2 12.2c1.6-.2 3.2-.2 4.6 0 .1 1 .1 2 0 3-1.4.2-3 .2-4.6 0-.1-1-.1-2 0-3Z" />
        </Icon>
    );
}

export function SmileIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M12 3.4c4.8-.1 8.5 3.6 8.6 8.4.1 4.8-3.7 8.7-8.5 8.7-4.9 0-8.6-3.7-8.6-8.5 0-4.8 3.7-8.6 8.5-8.6Z" />
            <path d="M9 9.6v.2" />
            <path d="M15 9.6v.2" />
            <path d="M8.4 14c1.9 2.4 5.4 2.5 7.3.1" />
        </Icon>
    );
}