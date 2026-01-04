"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSyncExternalStore } from "react";

// Subscribe to nothing, just return mounted state
const subscribe = () => () => { };
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function WalletButton() {
    const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    if (!mounted) {
        return (
            <div className="h-10 w-40 bg-zinc-800 rounded-md animate-pulse" />
        );
    }

    return (
        <WalletMultiButton className="!bg-orange-700 hover:!bg-orange-600 !transition-colors !rounded-md !font-bold" />
    );
}
