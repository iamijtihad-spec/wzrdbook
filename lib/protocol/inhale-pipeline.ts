
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_MINTS, TREASURY_VAULT } from '@/constants/tokens';

export const INHALE_CONFIG = {
    EXCHANGE_RATE: 100_000, // 100k Tokens per 1 SOL
    TREASURY: new PublicKey(TREASURY_VAULT),
};

export const RITUAL_TOKEN_MAP = {
    GRIT: {
        mint: TOKEN_MINTS.GRIT,
        focus: "Resilience",
        color: "cyan"
    },
    MOXY: {
        mint: TOKEN_MINTS.MOXY,
        focus: "Style",
        color: "violet"
    },
    CHI: {
        mint: TOKEN_MINTS.CHI,
        focus: "Balance",
        color: "emerald"
    }
};

export type RitualTokenType = keyof typeof RITUAL_TOKEN_MAP;

export async function initiateInhale(
    userPubkey: PublicKey,
    amountSOL: number,
    tokenType: RitualTokenType
) {
    if (amountSOL <= 0) throw new Error("Amount must be positive");

    const amountToMint = amountSOL * INHALE_CONFIG.EXCHANGE_RATE;

    // Construct Mainnet Deposit Transaction
    // Simple SystemProgram transfer to Treasury
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: userPubkey,
            toPubkey: INHALE_CONFIG.TREASURY,
            lamports: amountSOL * LAMPORTS_PER_SOL
        })
    );

    return {
        transaction,
        expectedTokens: amountToMint,
        tokenType,
        recipientMint: RITUAL_TOKEN_MAP[tokenType].mint
    };
}
