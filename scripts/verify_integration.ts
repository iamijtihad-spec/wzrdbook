import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import fs from "fs";
import os from "os";
import path from "path";

// Load IDLs
import gritBondingIdl from "../lib/idl/grit_bonding.json" with { type: "json" };
import gritGovIdl from "../lib/idl/grit_gov.json" with { type: "json" };
import bondingConfig from "../lib/bonding-config.json" with { type: "json" };

const BONDING_PROGRAM_ID = new PublicKey("8N8qeFRcxnwJKn2mWvhMahP2S3ChfPwynRtVKAvPepY1");
const GOV_PROGRAM_ID = new PublicKey("AotidXSUcQsaQHbkwwrrnCX9MiMYhu9JimPA2LJ2VSxj");

async function main() {
    process.env.ANCHOR_WALLET = path.join(os.homedir(), ".config/solana/id.json");
    process.env.ANCHOR_PROVIDER_URL = "http://localhost:8899";

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    console.log("--- Verifying Bonding Curve ---");
    const bondingProgram = new Program(gritBondingIdl as anchor.Idl, BONDING_PROGRAM_ID, provider);
    const curveConfigPubkey = new PublicKey(bondingConfig.curveConfig);

    try {
        const account = await bondingProgram.account.curveConfig.fetch(curveConfigPubkey) as any;
        console.log("✅ Curve Fetch Success!");
        console.log(`   Supply: ${account.totalSupply.toString()}`);
        console.log(`   Base Price: ${account.basePrice.toString()} lamports`);
        console.log(`   Slope: ${account.slope.toString()}`);
    } catch (e) {
        console.error("❌ Curve Fetch Failed:", e);
    }

    console.log("\n--- Verifying Governance ---");
    const govProgram = new Program(gritGovIdl as anchor.Idl, GOV_PROGRAM_ID, provider);

    try {
        const proposals = await govProgram.account.proposal.all();
        console.log(`✅ Governance Fetch Success! Found ${proposals.length} proposals.`);
        proposals.forEach((p, i) => {
            const data = p.account as any;
            console.log(`   [${i}] ${data.title}: ${data.description} (Votes: ${data.votesFor} Yes / ${data.votesAgainst} No)`);
        });
    } catch (e) {
        console.error("❌ Governance Fetch Failed:", e);
    }
}

main();
