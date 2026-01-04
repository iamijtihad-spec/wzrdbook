
import { PublicKey } from '@solana/web3.js';
import { TREASURY_VAULT } from '@/constants/tokens';
import { GritState } from '@/components/GritStateProvider'; // Assuming definition is accessible, or we define a partial

export const REVERSE_BRIDGE_CONFIG = {
    // In a real scenario, this would be a mainnet RPC. For simulation/devnet, we might use the same or a placeholder.
    MAINNET_RPC: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
    TREASURY_WALLET: new PublicKey(TREASURY_VAULT),
    BASE_EXCHANGE_RATE: 0.00001, // 100k GRIT per 1 SOL (Example rate)
};

export interface ExhaleValidationResult {
    isEligible: boolean;
    tokenBurnRequired: number;
    mainnetReleaseAmount: number;
    error?: string;
}

export function validateExhale(
    userPubkey: string,
    requestedSOL: number,
    gritState: Pick<GritState, 'exitCapacity' | 'efficiencyMultiplier' | 'gritBalance'>
): ExhaleValidationResult {

    // 0. Basic Validation
    if (requestedSOL <= 0) {
        return { isEligible: false, tokenBurnRequired: 0, mainnetReleaseAmount: 0, error: "Invalid amount." };
    }

    // 1. Check Capacity (Ascesis Scar Check)
    // The user's "Lung Capacity" must be >= the amount they are trying to exhale.
    if (requestedSOL > gritState.exitCapacity) {
        return {
            isEligible: false,
            tokenBurnRequired: 0,
            mainnetReleaseAmount: 0,
            error: `Lungs insufficient. Capacity: ${gritState.exitCapacity.toFixed(4)} SOL. Sacrifice more to increase.`
        };
    }

    // 2. Calculate Burn Cost (Heritage Multiplier Check)
    // Efficiency Multiplier (Heritage) reduces the cost.
    // Base Cost = Requested SOL / Exchange Rate
    // Actual Cost = Base Cost / Heritage Multiplier (Higher multiplier = Cheaper burn)

    const baseCostGRIT = requestedSOL / REVERSE_BRIDGE_CONFIG.BASE_EXCHANGE_RATE;
    const actualCostGRIT = baseCostGRIT / gritState.efficiencyMultiplier;

    // 3. Check Balance
    if (actualCostGRIT > gritState.gritBalance) {
        return {
            isEligible: false,
            tokenBurnRequired: actualCostGRIT,
            mainnetReleaseAmount: 0,
            error: `Insufficient GRIT. Need ${actualCostGRIT.toFixed(2)} GRIT.`
        };
    }

    return {
        isEligible: true,
        tokenBurnRequired: actualCostGRIT,
        mainnetReleaseAmount: requestedSOL
    };
}
