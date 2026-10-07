export const MAX_SECTION_ITEMS = 100;
export const MAX_ITEM_TEXT_LENGTH = 500;
export const MAX_FREETEXT_LENGTH = 50_000;
export const MAX_AMOUNT = 1_000_000_000_000;

export function clampAmount(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.min(MAX_AMOUNT, Math.max(-MAX_AMOUNT, value));
}