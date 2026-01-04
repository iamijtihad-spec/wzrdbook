"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Script from "next/script";
import artistConfig from "@/config/artist.json";

const SERVER_ID = "1449490560640614461";
const DEFAULT_CHANNEL_ID = "1449490561089409045";

// TODO: User to fill in specific Channel IDs for each page
// Right click Channel -> Copy ID
const CHANNEL_MAP: Record<string, string> = {
    "/": "1449494223366783119",           // Nucleus -> Portal
    "/bonding": "1449495580106555435",    // Bonding -> Bonding Curve
    "/bounties": "1449495584963690731",   // Earn -> Bounty Board
    "/admin": "1449494229662437547",      // Admin -> Inner Sanctum
    "/guide": "1449495578269585408",      // Guide -> Lobby
    "/universe": "1449494223366783119",   // Universe -> Portal (Shared with Home)
    "/museum": "1449501383358414908",     // Museum -> Gallery
    "/vote": "1449494228836286665",       // Vote -> Council Hall
    "/live": "1449494223782019113",       // Live -> Announcements
    "/merch": "1449495580933099571",      // Merch -> Merch Flex
};

export default function DiscordComms() {
    const pathname = usePathname();

    useEffect(() => {
        // Update channel on navigation if Crate is loaded
        // @ts-ignore
        if (typeof window !== 'undefined' && window.crate) {
            const key = pathname || "/";
            const targetChannel = CHANNEL_MAP[key] || DEFAULT_CHANNEL_ID;
            // @ts-ignore
            window.crate.navigate(targetChannel);
            // @ts-ignore
            // window.crate.notify(`Welcome to ${pathname}`); // Optional cute interaction
        }
    }, [pathname]);

    return (
        <Script
            src="https://cdn.jsdelivr.net/npm/@widgetbot/crate@3"
            strategy="lazyOnload"
            onLoad={() => {
                // @ts-ignore
                new Crate({
                    server: SERVER_ID,
                    channel: DEFAULT_CHANNEL_ID,
                    glyph: ['/images/discord-logo.png', '100%'],
                    color: '#5865F2',
                    location: ['bottom', 'right'],
                    notifications: true,
                });
            }}
        />
    );
}
