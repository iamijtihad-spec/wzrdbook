/**
 * 🎷 GRIT TREASURY PHYSICS (Client-Side)
 * 
 * Mirrors the logic in `grit-programs/programs/grit-treasury/src/lib.rs`.
 * Used for UI projections and state flags. 
 * 
 * "The map is not the territory, but it helps you walk."
 */

export const TREASURY_CONSTANTS = {
    // Ascesis
    BASE_CAP_SOL: 0.05,
    SCAR_MULTIPLIER_MAX: 5,

    // Heritage
    BASE_EFFICIENCY_SOL: 0.00001, // 1 SOL per 100k Tokens (Base)
    MAX_EFFICIENCY_MULTIPLIER: 2.5,
    MIN_HERITAGE_DAYS: 14,

    // Safety
    HARD_CAP_WALLET_SOL: 0.25,
    LUNG_MIN_SOL: 5.0,
};

export interface Scar {
    amount: number;
    timestamp: number;
    // ... potentially other fields
}

/**
 * Calculates the maximum SOL a user can withdraw based on burn discipline.
 * Formula: C_base * min(1 + log2(total / initial), 5)
 */
export function calculateAscesisCapacity(scars: Scar[]): number {
    if (!scars || scars.length === 0) return TREASURY_CONSTANTS.BASE_CAP_SOL;

    // Sort by timestamp to find initial
    const sorted = [...scars].sort((a, b) => a.timestamp - b.timestamp);
    const initialBurn = sorted[0].amount;
    const totalBurned = sorted.reduce((sum, s) => sum + s.amount, 0);

    if (initialBurn === 0) return TREASURY_CONSTANTS.BASE_CAP_SOL;

    const ratio = totalBurned / initialBurn;
    // Log2(1) = 0. We want 1 + log2.
    // Examples: 
    // Ratio 1 -> 1 + 0 = 1x
    // Ratio 2 -> 1 + 1 = 2x
    // Ratio 4 -> 1 + 2 = 3x
    const multiplier = Math.min(1 + Math.log2(ratio), TREASURY_CONSTANTS.SCAR_MULTIPLIER_MAX);

    // Ensure at least base cap even if math is weird (though log2(1) is 0)
    const finalMult = Math.max(1, multiplier);

    return TREASURY_CONSTANTS.BASE_CAP_SOL * finalMult;
}

/**
 * Calculates the cost efficiency (SOL per Dev Token) based on time.
 * Formula: E_base * min(1 + (days/30)*0.1, 2.5)
 */
export function calculateHeritageEfficiency(stakeStartTime: number | null): number {
    if (!stakeStartTime) return 1.0; // Base multiplier

    const now = Date.now();
    const msStaked = now - stakeStartTime;
    const daysStaked = msStaked / (1000 * 60 * 60 * 24);

    // 10% bonus per month
    const bonus = (daysStaked / 30) * 0.1;
    const multiplier = Math.min(1 + bonus, TREASURY_CONSTANTS.MAX_EFFICIENCY_MULTIPLIER);

    return multiplier;
}

/**
 * Checks if the user meets the minimum staking duration.
 */
export function checkEligibility(stakeStartTime: number | null): boolean {
    if (!stakeStartTime) return false;
    const now = Date.now();
    const daysStaked = (now - stakeStartTime) / (1000 * 60 * 60 * 24);
    return daysStaked >= TREASURY_CONSTANTS.MIN_HERITAGE_DAYS;
}

/**
 * Returns the effective SOL cost for a given token amount (or vice versa).
 * Use this for the UI "Cost" display.
 */
export function calculateDevTokensBurnRequired(requestedSOL: number, efficiencyMultiplier: number): number {
    const effectiveRate = TREASURY_CONSTANTS.BASE_EFFICIENCY_SOL * efficiencyMultiplier;
    if (effectiveRate === 0) return 0;
    return requestedSOL / effectiveRate;
}
