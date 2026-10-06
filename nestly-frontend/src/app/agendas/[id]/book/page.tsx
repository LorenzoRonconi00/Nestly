"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { AgendaBook } from "@/components/spread/AgendaBook";

function BookRoute() {
    const params = useParams<{ id: string }>();
    return <AgendaBook agendaId={params.id} />;
}

export default function BookPage() {
    return (
        <Suspense fallback={null}>
            <BookRoute />
        </Suspense>
    );
}