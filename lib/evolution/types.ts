export type CreatureStage = "Egg" | "Baby" | "Teen" | "Adult" | "Elder";
export type ElementType = "Fire" | "Water" | "Earth" | "Air";
export type ZodiacSign = "Aries" | "Taurus" | "Gemini" | "Cancer" | "Leo" | "Virgo" | "Libra" | "Scorpio" | "Sagittarius" | "Capricorn" | "Aquarius" | "Pisces";

export interface CreatureStats {
    attack: number;
    defense: number;
    speed: number;
    wisdom: number;
}

export interface CreatureState {
    stage: CreatureStage;
    level: number;
    xp: number;
    xpToNextLevel: number;
    hunger: number; // 0-100 (100 is full)
    stamina: number; // 0-100 (100 is full energy for activities)
    happiness: number; // 0-100
    energy: number; // 0-100 (Actions cost energy) - DEPRECATED, use stamina
    sleepState: "awake" | "sleeping";
    sleepiness: number; // 0-100 (increases when awake)
    lastInteraction: number; // Timestamp
    lastFed: number; // Timestamp for hunger tracking
    lastSlept: number; // Timestamp for sleep tracking
    totalPlaytime: number; // Minutes spent in play activities
    musicLibrary: string[]; // Mint addresses of owned music NFTs
    currentSong?: string; // Currently playing song mint
}

export interface CosmicCreature {
    mint: string;
    name: string;
    image: string;
    element: ElementType;
    zodiac: ZodiacSign; // New field
    stats: CreatureStats;
    state: CreatureState;
    // Ancestry (for breeding)
    parents?: string[];
    genes?: string[]; // Trait IDs
}

// Default State Generator
export function createDefaultCreatureState(): CreatureState {
    return {
        stage: "Egg",
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        hunger: 50,
        stamina: 100,
        happiness: 50,
        energy: 100, // Deprecated
        sleepState: "awake",
        sleepiness: 0,
        lastInteraction: Date.now(),
        lastFed: Date.now(),
        lastSlept: Date.now(),
        totalPlaytime: 0,
        musicLibrary: [],
    };
}
