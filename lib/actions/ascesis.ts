import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createBurnInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";

import { TOKEN_MINTS } from "@/constants/tokens";

export async function initiateAscesisRingAdvance(
    wallet: WalletContextState,
    connection: Connection,
    ringId: string,
    tokenType: "CHI" | "GRIT" | "MOXY",
    amount: number
) {
    if (!wallet.publicKey || !wallet.signTransaction) throw new Error("Wallet not connected");

    const mintAddress = new PublicKey(TOKEN_MINTS[tokenType]);
    const userATA = await getAssociatedTokenAddress(mintAddress, wallet.publicKey);

    // Burn Instruction
    // Note: Amount needs to be adjusted for decimals (assuming 9 for now, should check mint)
    const amountBigInt = BigInt(amount * 1_000_000_000);

    const burnIx = createBurnInstruction(
        userATA,
        mintAddress,
        wallet.publicKey,
        amountBigInt
    );

    const tx = new Transaction().add(burnIx);
    tx.feePayer = wallet.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    try {
        const signature = await wallet.sendTransaction(tx, connection);
        await connection.confirmTransaction(signature, "confirmed");

        // Record Scar
        await fetch('/api/record-scar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                wallet: wallet.publicKey.toString(),
                ringId,
                burnAmount: amount,
                burnSignature: signature,
                tokenMint: TOKEN_MINTS[tokenType]
            })
        });

        return { success: true, signature };

    } catch (error) {
        console.error("Ascesis Sacrifice Failed:", error);
        throw error;
    }
}
