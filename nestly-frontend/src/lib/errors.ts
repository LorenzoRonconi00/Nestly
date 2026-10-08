export type Violation = { field: string; message: string };

type ValidationBody = { errors?: { field?: string; message?: string }[] };

export async function firstViolation(res: Response): Promise<Violation | null> {
    try {
        const body: ValidationBody = await res.json();
        const first = body.errors?.[0];
        return first?.message ? { field: first.field ?? "", message: first.message } : null;
    } catch {
        return null;
    }
}