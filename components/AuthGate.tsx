"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

export function AuthGate({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { connected } = useWallet();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const publicPaths = ["/register", "/login", "/admin/initiate-admin"];
        const isPublicPath = publicPaths.includes(pathname || "");

        // Simple check for now: exists in localStorage or is connecting
        const hasHandle = typeof window !== "undefined" && localStorage.getItem("wzrd_handle");

        if (!isPublicPath && !hasHandle && !connected) {
            router.push("/register");
        } else {
            setIsLoaded(true);
        }
    }, [pathname, router, connected]);

    if (!isLoaded && !["/register", "/login", "/admin/initiate-admin"].includes(pathname || "")) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-[#444] font-mono animate-pulse uppercase tracking-[0.3em] text-[10px]">
                    Verifying Signal Sequence...
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
