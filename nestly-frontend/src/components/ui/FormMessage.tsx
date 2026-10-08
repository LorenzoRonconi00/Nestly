import { AlertIcon } from "@/components/ui/icons";

export function FormMessage({ message }: Readonly<{ message: string | null }>) {
    return (
        <p aria-live="polite" className="flex min-h-10 items-start gap-1.5 text-sm text-danger">
            {message && (
                <>
                    <AlertIcon className="mt-0.5 size-4 shrink-0" />
                    {message}
                </>
            )}
        </p>
    );
}