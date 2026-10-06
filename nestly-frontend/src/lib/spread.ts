import type { PageData } from "@/lib/pages";

export type Direction = "next" | "prev";

export type SpreadData = { key: string; start: string; pages: PageData[] };

export type FlipState = { direction: Direction; to: SpreadData };