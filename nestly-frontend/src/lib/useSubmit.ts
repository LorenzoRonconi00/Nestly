import { useCallback, useState } from "react";
import { SessionExpiredError } from "./api";

export const NETWORK_ERROR = "Could not reach the server. Check your connection and try again.";

export function useSubmit(onError: (message: string) => void) {
    const [pending, setPending] = useState(false);

    const submit = useCallback(
        async (action: () => Promise<boolean>) => {
            setPending(true);
            let leaving = false;
            try {
                leaving = await action();
            } catch (err) {
                if (!(err instanceof SessionExpiredError)) onError(NETWORK_ERROR);
            }
            // Once the page is navigating away it must stay disabled, or a second click would submit twice
            if (!leaving) setPending(false);
        },
        [onError],
    );

    return { pending, submit };
}