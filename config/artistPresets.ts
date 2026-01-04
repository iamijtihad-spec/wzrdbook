export type ArtistTheme = "minimal" | "street" | "avant" | "corporate";

export interface ThemeConfig {
    name: string;
    colors: {
        background: string;
        accent: string;
        text: string;
        muted: string;
    };
    fonts: {
        heading: string;
        body: string;
    };
    motion: {
        stiffness: number;
        damping: number;
    };
}

export const ARTIST_PRESETS: Record<ArtistTheme, ThemeConfig> = {
    minimal: {
        name: "Minimalist",
        colors: {
            background: "#000000",
            accent: "#ffffff",
            text: "#e5e5e5",
            muted: "#404040"
        },
        fonts: {
            heading: "Inter",
            body: "Inter"
        },
        motion: { stiffness: 100, damping: 20 }
    },
    street: {
        name: "Street",
        colors: {
            background: "#121212",
            accent: "#ff4d00", // Safety Orange
            text: "#ffffff",
            muted: "#333333"
        },
        fonts: {
            heading: "Impact, sans-serif",
            body: "Roboto Mono, monospace"
        },
        motion: { stiffness: 200, damping: 15 } // Snappy
    },
    avant: {
        name: "Avant Garde",
        colors: {
            background: "#0a0a0a",
            accent: "#7c3aed", // Violet
            text: "#f3f4f6",
            muted: "#1f2937"
        },
        fonts: {
            heading: "Playfair Display, serif",
            body: "Space Grotesk, sans-serif"
        },
        motion: { stiffness: 50, damping: 10 } // Fluid/Slow
    },
    corporate: {
        name: "Enterprise",
        colors: {
            background: "#ffffff",
            accent: "#0ea5e9", // Sky Blue
            text: "#0f172a",
            muted: "#94a3b8"
        },
        fonts: {
            heading: "Arial, sans-serif",
            body: "Arial, sans-serif"
        },
        motion: { stiffness: 150, damping: 25 } // Standard
    }
};

// Default fallback
export const DEFAULT_THEME: ThemeConfig = ARTIST_PRESETS.street;

export function getArtistTheme(artistThemeId?: string): ThemeConfig {
    if (!artistThemeId) return DEFAULT_THEME;
    return ARTIST_PRESETS[artistThemeId as ArtistTheme] || DEFAULT_THEME;
}
