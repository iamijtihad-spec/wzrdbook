export type CopyTone = 'austere' | 'poetic';
export type ArtistTheme = 'grit' | 'minimal' | 'avant' | 'corporate';

export const COPY_TONE: CopyTone = 'poetic'; // Default source of truth

export interface CopyVariant {
    austere: string;
    poetic: string;
}

export interface TreasuryFlags {
    paused: boolean;
    capReached: boolean;
    rateLimited: boolean;
    insufficientScars: boolean;
    insufficientTime: boolean;
}
