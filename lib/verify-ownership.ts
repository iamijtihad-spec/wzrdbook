import { Connection, PublicKey } from "@solana/web3.js";

// Use same RPC as other routes
const SOLANA_RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

const GRIT_MINT = process.env.GRIT_MINT || "CS8ZQMdJ5t5hNuM51LXJBU4zBysZWAkFj9oJ6MwtnHsS";

/**
 * Verifies if a wallet owns a specific token mint
 * @param walletAddress The user's wallet address
 * @param mintAddress The mint address of the NFT/Token
 * @returns boolean indicating ownership (balance > 0)
 */
export async function verifyOwnership(walletAddress: string, mintAddress: string): Promise<boolean> {
    try {
        if (!walletAddress || !mintAddress) return false;

        const connection = new Connection(SOLANA_RPC);
        const walletPubkey = new PublicKey(walletAddress);
        const mintPubkey = new PublicKey(mintAddress);

        // Fetch token accounts for this specific mint owned by the wallet
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
            mint: mintPubkey
        });

        // Check if any account has a balance > 0
        return tokenAccounts.value.some(account => {
            const amount = account.account.data.parsed.info.tokenAmount.uiAmount;
            return amount > 0;
        });

    } catch (error) {
        console.error(`Error verifying ownership for wallet ${walletAddress} and mint ${mintAddress}:`, error);
        return false;
    }
}

/**
 * Verifies if a wallet holds any GRIT tokens
 * @param walletAddress The user's wallet address
 * @returns boolean indicating valid access (balance > 0)
 */
export async function verifyGritHolder(walletAddress: string): Promise<boolean> {
    return verifyOwnership(walletAddress, GRIT_MINT);
}
