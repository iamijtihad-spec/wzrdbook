export type WithdrawalState =
    | "PAUSED"
    | "CAP_REACHED"
    | "RATE_LIMITED"
    | "INSUFFICIENT_SCARS"
    | "INSUFFICIENT_TIME"
    | "READY"
    | "PROCESSING"
    | "SUCCESS"
    | "FAILED";

export type ToneMode = "poetic" | "neutral";

interface CopySet {
    title: string;
    description: string;
    action: string;
}

export const WITHDRAWAL_COPY: Record<WithdrawalState, Record<ToneMode, CopySet>> = {
    PAUSED: {
        poetic: {
            title: "The Valve is Sealed",
            description: "The current is still. Awaiting the regulator's turn.",
            action: "System Halted"
        },
        neutral: {
            title: "Withdrawals Paused",
            description: "Admins have temporarily paused withdrawals for maintenance.",
            action: "Unavailable"
        }
    },
    CAP_REACHED: {
        poetic: {
            title: "The Reservoir is Full",
            description: "The daily allocation has been claimed by the swarm.",
            action: "Return Tomorrow"
        },
        neutral: {
            title: "Global Cap Reached",
            description: "The daily withdrawal limit for the platform has been met.",
            action: "Try Later"
        }
    },
    RATE_LIMITED: {
        poetic: {
            title: "Patience, Initiate",
            description: "You have drawn too deeply, too quickly. Let the well replenish.",
            action: "Cooldown Active"
        },
        neutral: {
            title: "Rate Limited",
            description: "You have exceeded your withdrawal frequency limit.",
            action: "Wait"
        }
    },
    INSUFFICIENT_SCARS: {
        poetic: {
            title: "Unmarked Soul",
            description: "You lack the scars of ascendance. Burn to prove your worth.",
            action: "Go to Ascesis"
        },
        neutral: {
            title: "Requirements Not Met",
            description: "You do not have enough Scars (Burn History) to withdraw.",
            action: "View Requirements"
        }
    },
    INSUFFICIENT_TIME: {
        poetic: {
            title: "Not Yet Time",
            description: "The sands satisfy no one but the patient.",
            action: "Wait"
        },
        neutral: {
            title: "Vesting Period",
            description: "Your tokens are still unlocking.",
            action: "Locked"
        }
    },
    READY: {
        poetic: {
            title: "The Gate is Open",
            description: "Your breath is steady. The instrument detects your rhythm. Release when ready.",
            action: "Exhale (Release)"
        },
        neutral: {
            title: "Release Available",
            description: "Eligibility criteria met. You may release your position.",
            action: "Release"
        }
    },
    PROCESSING: {
        poetic: {
            title: "Transmuting...",
            description: "Energy shifts form. The Rehearsal acknowledges your departure.",
            action: "Hold..."
        },
        neutral: {
            title: "Processing",
            description: "Verifying logic and eligibility on-chain.",
            action: "Verifying..."
        }
    },
    SUCCESS: {
        poetic: {
            title: "Breath Released",
            description: "You have stepped out of the current. The Scars remain.",
            action: "Return to Silence"
        },
        neutral: {
            title: "Release Complete",
            description: "Tokens have been transferred to your wallet.",
            action: "Close"
        }
    },
    FAILED: {
        poetic: {
            title: "Entropy Strikes",
            description: "Chaos interrupted the flow. Try again.",
            action: "Retry"
        },
        neutral: {
            title: "Transaction Failed",
            description: "An error occurred during the transfer.",
            action: "Try Again"
        }
    }
};

export interface WithdrawalFlags {
    isPaused: boolean;
    isCapReached: boolean;
    isRateLimited: boolean;
    hasScars: boolean;
    isTimeReady: boolean;
}

export function resolveWithdrawalState(flags: WithdrawalFlags): WithdrawalState {
    if (flags.isPaused) return "PAUSED";
    if (flags.isCapReached) return "CAP_REACHED";
    if (flags.isRateLimited) return "RATE_LIMITED";
    if (!flags.hasScars) return "INSUFFICIENT_SCARS";
    if (!flags.isTimeReady) return "INSUFFICIENT_TIME";
    return "READY";
}

export function getWithdrawalCopy(state: WithdrawalState, tone: ToneMode = "poetic"): CopySet {
    return WITHDRAWAL_COPY[state][tone];
}
