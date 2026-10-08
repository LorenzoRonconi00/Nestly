import type { ReactNode } from "react";
import { AuthSpread } from "@/components/auth/AuthSpread";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
    return <AuthSpread>{children}</AuthSpread>;
}