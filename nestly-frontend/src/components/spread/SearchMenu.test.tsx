import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchAgenda, type SearchHit } from "@/lib/search";
import { SearchMenu } from "./SearchMenu";

vi.mock("@/lib/search", () => ({ searchAgenda: vi.fn() }));

const dentistHit: SearchHit = {
    pageId: "page-1",
    date: "2026-10-04",
    pageNumber: null,
    snippets: [
        {
            section: "freetext",
            segments: [
                { text: "Visited the ", match: false },
                { text: "dentist", match: true },
                { text: " this morning", match: false },
            ],
        },
    ],
};

function openSearch() {
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    return screen.getByRole("searchbox", { name: "Search this agenda" });
}

async function typeAndWait(input: HTMLElement, value: string) {
    fireEvent.change(input, { target: { value } });
    await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
    });
}

describe("SearchMenu", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.mocked(searchAgenda).mockReset();
    });

    it("is closed until the button is pressed", () => {
        render(<SearchMenu agendaId="agenda-1" onSelect={vi.fn()} />);

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

        openSearch();

        expect(screen.getByRole("dialog", { name: "Search" })).toBeInTheDocument();
        expect(screen.getByRole("status")).toHaveTextContent("Type at least 2 letters");
    });

    it("does not search for queries that are too short", async () => {
        render(<SearchMenu agendaId="agenda-1" onSelect={vi.fn()} />);
        const input = openSearch();

        await typeAndWait(input, "d");

        expect(searchAgenda).not.toHaveBeenCalled();
    });

    it("searches once after the user stops typing and shows highlighted results", async () => {
        vi.mocked(searchAgenda).mockResolvedValue({ hits: [dentistHit], error: null });
        render(<SearchMenu agendaId="agenda-1" onSelect={vi.fn()} />);
        const input = openSearch();

        fireEvent.change(input, { target: { value: "de" } });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(100);
        });
        fireEvent.change(input, { target: { value: "dent" } });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(300);
        });

        expect(searchAgenda).toHaveBeenCalledTimes(1);
        expect(vi.mocked(searchAgenda).mock.calls[0].slice(0, 2)).toEqual(["agenda-1", "dent"]);
        expect(screen.getByText("dentist").tagName).toBe("MARK");
        expect(screen.getByText("Free text")).toBeInTheDocument();
        expect(screen.getByText(/Sunday,? 4 October 2026/)).toBeInTheDocument();
    });

    it("selects a result on click and closes", async () => {
        vi.mocked(searchAgenda).mockResolvedValue({ hits: [dentistHit], error: null });
        const onSelect = vi.fn();
        render(<SearchMenu agendaId="agenda-1" onSelect={onSelect} />);
        const input = openSearch();
        await typeAndWait(input, "dentist");

        fireEvent.click(screen.getByText(/Sunday,? 4 October 2026/));

        expect(onSelect).toHaveBeenCalledWith(dentistHit);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("selects the first result with Enter", async () => {
        vi.mocked(searchAgenda).mockResolvedValue({ hits: [dentistHit], error: null });
        const onSelect = vi.fn();
        render(<SearchMenu agendaId="agenda-1" onSelect={onSelect} />);
        const input = openSearch();
        await typeAndWait(input, "dentist");

        fireEvent.keyDown(input, { key: "Enter" });

        expect(onSelect).toHaveBeenCalledWith(dentistHit);
    });

    it("tells the user when nothing matches", async () => {
        vi.mocked(searchAgenda).mockResolvedValue({ hits: [], error: null });
        render(<SearchMenu agendaId="agenda-1" onSelect={vi.fn()} />);
        const input = openSearch();

        await typeAndWait(input, "zzzz");

        expect(screen.getByRole("status")).toHaveTextContent("No results for “zzzz”.");
    });

    it("shows an error returned by the search", async () => {
        vi.mocked(searchAgenda).mockResolvedValue({ hits: [], error: "Search is temporarily unavailable" });
        render(<SearchMenu agendaId="agenda-1" onSelect={vi.fn()} />);
        const input = openSearch();

        await typeAndWait(input, "dentist");

        expect(screen.getByRole("status")).toHaveTextContent("Search is temporarily unavailable");
    });

    it("closes with Escape", () => {
        render(<SearchMenu agendaId="agenda-1" onSelect={vi.fn()} />);
        openSearch();

        fireEvent.keyDown(document, { key: "Escape" });

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});