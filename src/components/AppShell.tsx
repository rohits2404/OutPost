"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isFullScreenRoute =
        pathname?.startsWith("/workspace/") || pathname?.startsWith("/shared/");

    if (isFullScreenRoute) {
        return <>{children}</>;
    }

    return (
        <>
            <Header />
            <div className="flex flex-1 flex-col pt-18">{children}</div>
        </>
    );
}
