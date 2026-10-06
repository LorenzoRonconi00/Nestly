import { useCallback, useState } from "react";
import { patchSection } from "./sections";

export type SaveProblem = "stale" | "failed";

export function useSectionSaver(agendaId: string) {
    const [problem, setProblem] = useState<SaveProblem | null>(null);

    const save = useCallback(
        async (pageId: string, sectionId: string, data: Record<string, unknown>) => {
            const result = await patchSection(agendaId, pageId, sectionId, data);
            if (result === "saved") {
                setProblem((current) => (current === "stale" ? current : null));
            } else if (result === "stale" || result === "failed") {
                setProblem(result);
            }
        },
        [agendaId],
    );

    return { save, problem };
}