import { DOMAINS } from "@/components/GritStateProvider";

export interface Proposal {
    id: string;
    title: string;
    description: string;
    deadline: number; // Timestamp
    resonance: {
        amplify: number; // Yes votes (weighted)
        dampen: number;  // No votes (weighted)
    };
    status: "Active" | "Passed" | "Rejected" | "Executed";
    domain: keyof typeof DOMAINS;
}

export interface Vote {
    proposalId: string;
    wallet: string;
    choice: "amplify" | "dampen";
    power: number;
    timestamp: number;
}

export const MOCK_PROPOSALS: Proposal[] = [];

/**
 * Calculates Voting Power ("Resonance") based on Staked Amount and Time Multiplier.
 * Formula: Power = StakedAmount * (Multiplier ^ 2)
 * We square the time multiplier to heavily favor long-term alignment.
 */
export function calculateVotingPower(stakedAmount: number, multiplier: number): number {
    if (stakedAmount <= 0) return 0;
    // Base power is the raw GRIT amount
    // Resonance is amplified by the square of the time multiplier
    // e.g. 1000 GRIT * (1.5x time)^2 = 1000 * 2.25 = 2250 Power
    return Math.floor(stakedAmount * Math.pow(multiplier, 2));
}

export function getProposalStatus(proposal: Proposal): string {
    if (Date.now() > proposal.deadline) {
        return proposal.resonance.amplify > proposal.resonance.dampen ? "Passed" : "Rejected";
    }
    return "Active";
}
