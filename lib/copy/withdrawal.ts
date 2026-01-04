import { CopyVariant } from "@/config/copy";

export const WITHDRAWAL_COPY = {
    screenHeader: {
        title: {
            poetic: "Release Breath",
            austere: "Request Withdrawal"
        },
        subtitle: {
            poetic: "Leaving is possible when discipline and time agree.",
            austere: "Withdrawals are limited by participation."
        }
    },
    statusPanel: {
        body: {
            poetic: "You are not exiting the system.\nYou are releasing a portion of the breath you earned inside it.",
            austere: "This request converts in-system balance to external value."
        },
        indicators: {
            eligible: {
                poetic: "Breath is aligned.",
                austere: "Eligible for withdrawal."
            },
            limited: {
                poetic: "Breath is narrow right now.",
                austere: "Withdrawal limited."
            },
            locked: {
                poetic: "The instrument is still forming.",
                austere: "Withdrawal unavailable."
            }
        }
    },
    eligibility: {
        sectionTitle: {
            poetic: "Why This Is Available",
            austere: "Eligibility Factors"
        },
        ascesis: {
            label: {
                poetic: "Scars (Discipline)",
                austere: "Burn History"
            },
            explanation: {
                poetic: "Scars widen what may leave. They do not decide when.",
                austere: "Burns increase maximum withdrawal capacity."
            },
            state: {
                notEnough: {
                    poetic: "More release is required to widen breath.",
                    austere: "Insufficient burn history."
                },
                sufficient: {
                    poetic: "Your capacity is open.",
                    austere: "Capacity threshold met."
                }
            }
        },
        heritage: {
            label: {
                poetic: "Time Held",
                austere: "Staking Duration"
            },
            explanation: {
                poetic: "Time smooths the exit. Rushing collapses it.",
                austere: "Time affects withdrawal rate."
            },
            state: {
                early: {
                    poetic: "The rhythm is still forming.",
                    austere: "Minimum duration not met."
                },
                mature: {
                    poetic: "Time is in your favor.",
                    austere: "Time requirement satisfied."
                }
            }
        }
    },
    amountSelection: {
        sectionTitle: {
            poetic: "How Much Breath to Release",
            austere: "Withdrawal Amount"
        },
        helperText: {
            poetic: "You may only release what the instrument can support right now.",
            austere: "Requests exceeding limits will be rejected."
        },
        slider: {
            min: { poetic: "Gentle release", austere: "Minimum" },
            max: { poetic: "Full allowed breath", austere: "Maximum allowed" }
        },
        limitWarning: {
            poetic: "This is the widest release available at this time.",
            austere: "Maximum withdrawal reached."
        }
    },
    confirmation: {
        summary: {
            poetic: "This release does not undo your work.\nScars remain.\nTime remains.\nOnly breath changes hands.",
            austere: "This action does not reset participation history."
        },
        confirmButton: {
            poetic: "Release Breath",
            austere: "Confirm Withdrawal"
        },
        cancelButton: {
            poetic: "Continue Playing",
            austere: "Cancel"
        }
    },
    success: {
        title: { poetic: "Breath Released", austere: "Withdrawal Complete" },
        body: {
            poetic: "The system remains. What you built stays. You may return at any time.",
            austere: "Transaction confirmed."
        },
        cta: { poetic: "Return to the Instrument", austere: "Back to Dashboard" }
    },
    failureStates: {
        treasuryPaused: {
            poetic: "The instrument is resting. Play continues. Release will resume.",
            austere: "Withdrawals are temporarily paused."
        },
        rateLimited: {
            poetic: "One breath per cycle. Try again later.",
            austere: "Rate limit reached."
        },
        insufficientScars: {
            poetic: "Capacity is earned by letting go.",
            austere: "Burn requirement not met."
        },
        insufficientTime: {
            poetic: "Staying a little longer will change everything.",
            austere: "Minimum time not met."
        }
    },
    footer: {
        poetic: "This system rewards patience, restraint, and creation.",
        austere: "This system enforces participation-based access."
    }
};

export const GLOBAL_MICRO_COPY = {
    wallet: {
        connect: {
            label: { austere: "Enter Rehearsal", poetic: "Enter Rehearsal" },
            tooltip: { austere: "This environment is for practice, not extraction.", poetic: "Bring breath into the room. Nothing leaves unchanged." }
        },
        loadBreath: {
            label: { austere: "Load Breath", poetic: "Load Breath" },
            tooltip: { austere: "Adds time inside the system.", poetic: "This opens time inside the system, not value outside it." }
        }
    },
    ascesis: {
        sacrifice: {
            label: { austere: "Sacrifice", poetic: "Sacrifice" },
            tooltip: { austere: "Burns are permanent.", poetic: "What you release here will not return." }
        },
        scarModal: {
            title: { austere: "Permanent Action", poetic: "This Scar Will Remain" },
            body: {
                austere: "This action increases withdrawal capacity but does not improve speed.",
                poetic: "You are about to let something go. This strengthens capacity, not speed."
            },
            confirm: { austere: "Confirm Burn", poetic: "Accept the Scar" },
            cancel: { austere: "Cancel", poetic: "Step Back" }
        }
    },
    heritage: {
        commit: {
            label: { austere: "Commit Time", poetic: "Commit Time" },
            tooltip: { austere: "Time increases efficiency.", poetic: "Staying changes how effort feels." }
        },
        earlyExit: {
            title: { austere: "Early Exit", poetic: "Rhythm Break" },
            body: {
                austere: "Time-based efficiency will reset.",
                poetic: "Leaving now erases accumulated timing. Nothing else is lost."
            },
            confirm: { austere: "Exit Early", poetic: "Break the Rhythm" },
            cancel: { austere: "Continue", poetic: "Continue Holding" }
        }
    },
    sovereign: {
        listen: {
            label: { austere: "Listen Fully", poetic: "Listen Fully" },
            tooltip: { austere: "Partial playback is not counted.", poetic: "Partial attention leaves no trace." }
        },
        upload: {
            label: { austere: "Upload Track", poetic: "Release Sound" },
            tooltip: { austere: "Creation does not affect withdrawals.", poetic: "Creation gives meaning to staying, not exit." }
        }
    },
    governance: {
        vote: {
            label: { austere: "Cast Vote", poetic: "Cast Voice" },
            tooltip: { austere: "Voting adjusts parameters only.", poetic: "This sets tempo, not outcome." }
        }
    }
};
