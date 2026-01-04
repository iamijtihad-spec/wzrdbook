
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";

const RPC = "https://api.devnet.solana.com";
const connection = new Connection(RPC, "confirmed");

// Constants
const STAKING_PROGRAM_ID = new PublicKey("G9Xq99jdwuvQD1nGGhW1C3TYuc6iRz78faoscQqmX2D7");
const STAKE_MINT = new PublicKey("2FFhBNoCqsgXejrqQXk3gJXWyG9nuiE7qj4Sv2wrcnwq"); // MOXY
const USER_WALLET = new PublicKey("FycgQBYygUY6ZDk3QHPQi9t468VTfTDXTNRRpYkTj3Tr");

async function check() {
    console.log("--- Account Diagnosis ---");
    console.log("Wallet:", USER_WALLET.toBase58());
    console.log("Mint:", STAKE_MINT.toBase58());

    // 1. Check User ATA (the culprit)
    const userATA = await getAssociatedTokenAddress(STAKE_MINT, USER_WALLET);
    const ataInfo = await connection.getAccountInfo(userATA);

    if (ataInfo) {
        console.log(`\nUser ATA: ${userATA.toBase58()}`);
        console.log(`  - Exists: YES`);
        const tokenProgram = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
        console.log(`  - Owner: ${ataInfo.owner.toBase58()} (Expected: ${tokenProgram.toBase58()})`);
        console.log(`  - Data Length: ${ataInfo.data.length} (Expected: 165)`);
        console.log(`  - Match?: ${ataInfo.owner.equals(tokenProgram) && ataInfo.data.length === 165 ? "PASS" : "FAIL"}`);
    } else {
        console.log(`\nUser ATA: ${userATA.toBase58()}`);
        console.log(`  - Exists: NO (CRITICAL FAILURE)`);
    }

    // 2. Check User Stake PDA
    const [userStakePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("stake"), USER_WALLET.toBuffer()],
        STAKING_PROGRAM_ID
    );
    const userStakeInfo = await connection.getAccountInfo(userStakePDA);
    if (userStakeInfo) {
        console.log(`\nUser Stake PDA: ${userStakePDA.toBase58()}`);
        console.log(`  - Owner: ${userStakeInfo.owner.toBase58()} (Expected: ${STAKING_PROGRAM_ID.toBase58()})`);
    } else {
        console.log(`\nUser Stake PDA: ${userStakePDA.toBase58()}`);
        console.log(`  - Exists: NO (Could be normal if first time staking)`);
    }
}

check();
