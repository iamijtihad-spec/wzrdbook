
import { Connection, PublicKey } from "@solana/web3.js";

const BONDING_ID = "8N8qeFRcxnwJKn2mWvhMahP2S3ChfPwynRtVKAvPepY1";
const STAKING_ID = "G9Xq99jdwuvQD1nGGhW1C3TYuc6iRz78faoscQqmX2D7";
const GOV_ID = "AotidXSUcQsaQHbkwwrrnCX9MiMYhu9JimPA2LJ2VSxj";

// Standard Devnet
const connection = new Connection("https://api.devnet.solana.com");

async function check() {
    console.log("Checking programs on Devnet...");

    const checkProg = async (name: string, id: string) => {
        const info = await connection.getAccountInfo(new PublicKey(id));
        if (info) {
            console.log(`[OK] ${name}: Found. Executable: ${info.executable}`);
        } else {
            console.log(`[MISSING] ${name}: Account not found at ${id}`);
        }
    };

    await checkProg("Bonding", BONDING_ID);
    await checkProg("Staking", STAKING_ID);
    await checkProg("Governance", GOV_ID);
}

check();
