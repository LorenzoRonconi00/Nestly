type ValidationBody = { errors?: { message?: string }[] };

export async function firstValidationMessage(res: Response): Promise<string | null> {
    try {
        const body: ValidationBody = await res.json();
        return body.errors?.[0]?.message ?? null;
    } catch {
        return null;
    }
}