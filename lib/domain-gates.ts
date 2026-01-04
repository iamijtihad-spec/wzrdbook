import { GritState } from "@/components/GritStateProvider";

export enum Domain {
    SOVEREIGN = "SOVEREIGN",
    ASCESIS = "ASCESIS",
    HERITAGE = "HERITAGE",
    MARKET = "MARKET"
}

export type AccessResult = {
    isOpen: boolean;
    reason?: string;
    requiredAction?: string;
    requirementLabel?: string;
};

export function checkDomainAccess(domain: Domain, state: Partial<GritState> | null): AccessResult {
    // 1. Sovereign: Always Open (Identity)
    if (domain === Domain.SOVEREIGN) {
        return { isOpen: true };
    }

    // Fail-safe for loading state
    if (!state) {
        return { isOpen: false, reason: "Initializing consciousness..." };
    }

    const { gritBalance = 0, scars = [], stakedAmount = 0, stakeStartTime = 0, resonance = 0 } = state;

    // 2. Ascesis: Requires RESONANCE (Proof of Listening) or GRIT (The Instrument)
    // Narrative: You must be attuned to the frequency before you can burn.
    // Logic: Resonance > 1000 (approx 1 week of listening) OR holding significant equity.
    if (domain === Domain.ASCESIS) {
        // STRICT: Access is EARNED, not bought.
        // [DEV] Bypass for Testing per request
        return { isOpen: true };

        /* 
        if (resonance >= 1000) {
            return { isOpen: true };
        }
        return {
            isOpen: false,
            reason: "The signal is too weak. You must listen to attune.",
            requiredAction: "Listen to music to build Resonance.",
            requirementLabel: `${Math.floor(resonance)} / 1000 RES`
        };
        */
    }

    // 3. Heritage: Requires Scars (The Sacrifice)
    // Narrative: You cannot leave a legacy without proof of commitment.
    // Logic: Must have at least one scar (burn record).
    // 3. Heritage: Requires Scars (The Sacrifice)
    // Narrative: You cannot leave a legacy without proof of commitment.
    // Logic: Must have at least one scar (burn record).
    // [DEV] Bypass for Testing
    if (domain === Domain.HERITAGE) {
        return { isOpen: true };
        /*
       if (scars.length > 0) {
           return { isOpen: true };
       }
       return {
           isOpen: false,
           reason: "Legacy is built on sacrifice.",
           requiredAction: "Burn tokens in Ascesis to earn a Scar.",
           requirementLabel: "1+ Scars"
       };
       */
    }

    // 4. Market: Requires Time (The Epochs)
    // Narrative: You cannot trade the flow until you have withstood the current.
    // Logic: Must have staked for at least 7 days (Mocked as > 0 for now for testing, or check timestamp)
    if (domain === Domain.MARKET) {
        // [DEV] Bypass
        return { isOpen: true };
        /*
        const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
        const hasTime = stakeStartTime && (Date.now() - stakeStartTime > ONE_WEEK_MS);

        if (stakedAmount > 0 && hasTime) {
            return { isOpen: true };
        }
        return {
            isOpen: false,
            reason: "The Market opens only to the patient.",
            requiredAction: "Maintain your stake for 7 cycles.",
            requirementLabel: hasTime ? "Staking Active" : "Staking < 7d"
        };
        */
    }

    return { isOpen: false, reason: "Domain sealed by the Council." };
}
